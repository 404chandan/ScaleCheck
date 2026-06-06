import { GoogleGenAI } from '@google/genai';
import { config } from '../../config.js';

/**
 * Generates system design recommendations using Gemini API,
 * with a fallback mock system design reviewer if no API key is set.
 */
export async function getAIRecommendations(analysisData) {
  const {
    name,
    backend,
    database,
    traffic,
    endpoints,
    infrastructure,
    results
  } = analysisData;

  const hasApiKey = config.geminiApiKey && config.geminiApiKey.trim() !== '';

  if (!hasApiKey) {
    console.log('Gemini API Key missing. Generating simulated SRE review...');
    return getMockRecommendations(backend, database, traffic.rps, infrastructure);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
    const prompt = `
You are a Principal SRE and System Design Engineer at a FAANG company.
Analyze this backend architecture under high load and recommend upgrades.

System Profile:
- Application Name: ${name}
- Backend Framework: ${backend}
- Database: ${database}
- Expected Peak Traffic: ${traffic.rps} requests/second
- Expected Concurrent Users: ${traffic.users}
- Endpoints: ${JSON.stringify(endpoints)}
- Current Infrastructure Checklist:
  * Load Balancer: ${infrastructure.loadBalancer ? 'Yes' : 'No'}
  * In-Memory Cache (Redis): ${infrastructure.cache ? 'Yes' : 'No'}
  * Database Replicas: ${infrastructure.replicas ? 'Yes' : 'No'}
  * Database Sharding: ${infrastructure.sharding ? 'Yes' : 'No'}
  * Message Queue (RabbitMQ/Kafka): ${infrastructure.queue ? 'Yes' : 'No'}
- Rule-based Bottlenecks Detected: ${JSON.stringify(results.bottlenecks)}

Provide concrete system design recommendations.
You MUST respond ONLY with a JSON object. Do not include markdown formatting or blocks. The JSON must follow this exact format:
{
  "summary": "Short 2-3 sentence overview of the system's scaling capability and principal weakness.",
  "recommendations": [
    {
      "component": "Database | Backend | Cache | Network | Queue",
      "action": "Clear, specific implementation action (e.g. 'Deploy Redis cluster with replication')",
      "difficulty": "Easy | Medium | Hard",
      "priority": "High | Medium | Low",
      "impact": "Expected SRE impact and performance improvements."
    }
  ],
  "topology": {
    "nodes": [
      {"id": "string", "type": "users | loadBalancer | api | cache | queue | database", "label": "Display Name"}
    ],
    "edges": [
      {"from": "node-id", "to": "node-id", "label": "description of flow"}
    ]
  }
}

Ensure the suggested topology nodes represent the RECOMMENDED architecture (i.e. with the required load balancers, caching nodes, message queues, replica databases, etc.) that will handle the expected ${traffic.rps} RPS.
`;

    console.log('Calling Gemini API for system design evaluation...');
    // We call gemini-2.5-flash which is fast and supports JSON output
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text;
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error('Gemini API generation failed. Falling back to mock recommendations:', error.message);
    return getMockRecommendations(backend, database, traffic.rps, infrastructure);
  }
}

function getMockRecommendations(backend, database, rps, infra) {
  const isMongo = database.toLowerCase().includes('mongo');
  const dbName = isMongo ? 'MongoDB' : database;
  
  const recommendations = [];
  const nodes = [
    { id: 'users', type: 'users', label: 'Client Traffic' }
  ];
  const edges = [];

  let summary = '';
  
  if (rps > 800) {
    summary = `The ${backend} backend using ${dbName} will struggle to support ${rps} RPS. High risk of threadpool exhaustion on the servers and connection saturation on the database.`;
  } else if (rps > 200) {
    summary = `The system can support moderate loads but will hit latency spikes during peak periods. Adding a caching layer and database replica node will stabilize the response times.`;
  } else {
    summary = `The current setup is sufficient for your target of ${rps} RPS, but adding key optimizations will ensure future growth can be handled seamlessly.`;
  }

  // Determine needed components
  const needLB = !infra.loadBalancer;
  const needCache = !infra.cache && rps > 150;
  const needQueue = !infra.queue && rps > 200;
  const needDbRepl = !infra.replicas && rps > 100;
  const needDbShard = !infra.sharding && rps > 500;

  // Add recommendations
  if (needLB) {
    recommendations.push({
      component: 'Backend',
      action: `Deploy Nginx or AWS ALB Load Balancer with 3x horizontal ${backend} nodes`,
      difficulty: 'Medium',
      priority: 'High',
      impact: 'Distributes traffic evenly and prevents single point of failure (SPOF).'
    });
  }

  if (needCache) {
    recommendations.push({
      component: 'Cache',
      action: 'Deploy a Redis Cache cluster',
      difficulty: 'Easy',
      priority: 'High',
      impact: 'Absorbs read-heavy traffic (GET requests), dropping DB query loads by up to 80%.'
    });
  }

  if (needQueue) {
    recommendations.push({
      component: 'Queue',
      action: 'Integrate a RabbitMQ or BullMQ queue for transactional writes',
      difficulty: 'Medium',
      priority: 'Medium',
      impact: 'Converts synchronous database write operations to asynchronous workers, smoothing out traffic spikes.'
    });
  }

  if (needDbRepl) {
    recommendations.push({
      component: 'Database',
      action: `Configure a Primary-Secondary replica topology for ${dbName}`,
      difficulty: 'Medium',
      priority: 'High',
      impact: 'Ensures data durability, read scaling, and auto-failover during VM crashes.'
    });
  }

  if (needDbShard && isMongo) {
    recommendations.push({
      component: 'Database',
      action: 'Partition collection data across a MongoDB Sharded Cluster',
      difficulty: 'Hard',
      priority: 'Medium',
      impact: 'Distributes write load horizontally across multiple disks, removing CPU bottlenecks.'
    });
  }

  // Construct target node topology
  let lastNode = 'users';

  if (!needLB && !infra.loadBalancer) {
    // Single server setup
    nodes.push({ id: 'api-1', type: 'api', label: `${backend} Server` });
    edges.push({ from: 'users', to: 'api-1', label: 'HTTP requests' });
    lastNode = 'api-1';
  } else {
    // Load balancer setup
    nodes.push({ id: 'lb', type: 'loadBalancer', label: 'Nginx Load Balancer' });
    nodes.push({ id: 'api-1', type: 'api', label: `${backend} Instance 1` });
    nodes.push({ id: 'api-2', type: 'api', label: `${backend} Instance 2` });
    edges.push({ from: 'users', to: 'lb', label: 'HTTPS' });
    edges.push({ from: 'lb', to: 'api-1' });
    edges.push({ from: 'lb', to: 'api-2' });
  }

  // Caching node
  if (infra.cache || !needCache) {
    nodes.push({ id: 'redis', type: 'cache', label: 'Redis' });
    if (infra.loadBalancer || !needLB) {
      edges.push({ from: 'api-1', to: 'redis', label: 'Cache Lookup' });
      edges.push({ from: 'api-2', to: 'redis', label: 'Cache Lookup' });
    } else {
      edges.push({ from: 'api-1', to: 'redis', label: 'Cache Lookup' });
    }
  } else {
    // We recommended cache
    nodes.push({ id: 'redis', type: 'cache', label: 'Redis (Recommended)' });
    edges.push({ from: 'api-1', to: 'redis', label: 'Query Cache' });
    edges.push({ from: 'api-2', to: 'redis', label: 'Query Cache' });
  }

  // Queue node
  let queueNodeId = null;
  if (!needQueue) {
    if (infra.queue) {
      nodes.push({ id: 'queue', type: 'queue', label: 'Message Queue' });
      edges.push({ from: 'api-1', to: 'queue', label: 'Publish Job' });
      edges.push({ from: 'api-2', to: 'queue', label: 'Publish Job' });
      queueNodeId = 'queue';
    }
  } else {
    nodes.push({ id: 'queue', type: 'queue', label: 'Queue (Recommended)' });
    edges.push({ from: 'api-1', to: 'queue', label: 'Push Event' });
    edges.push({ from: 'api-2', to: 'queue', label: 'Push Event' });
    queueNodeId = 'queue';
  }

  // DB Nodes
  if (!needDbRepl && !infra.replicas) {
    // Single DB
    nodes.push({ id: 'db-primary', type: 'database', label: `${dbName} Primary` });
    edges.push({ from: 'api-1', to: 'db-primary', label: 'SQL/Query' });
    if (nodes.find(n => n.id === 'api-2')) {
      edges.push({ from: 'api-2', to: 'db-primary', label: 'SQL/Query' });
    }
    if (queueNodeId) {
      edges.push({ from: queueNodeId, to: 'db-primary', label: 'Process Write' });
    }
  } else {
    // Replica set DB
    nodes.push({ id: 'db-primary', type: 'database', label: `${dbName} Primary` });
    nodes.push({ id: 'db-sec-1', type: 'database', label: `${dbName} Secondary 1` });
    nodes.push({ id: 'db-sec-2', type: 'database', label: `${dbName} Secondary 2` });

    edges.push({ from: 'api-1', to: 'db-primary', label: 'Writes' });
    edges.push({ from: 'api-1', to: 'db-sec-1', label: 'Reads' });
    if (nodes.find(n => n.id === 'api-2')) {
      edges.push({ from: 'api-2', to: 'db-primary', label: 'Writes' });
      edges.push({ from: 'api-2', to: 'db-sec-2', label: 'Reads' });
    }
    
    if (queueNodeId) {
      edges.push({ from: queueNodeId, to: 'db-primary', label: 'Worker Write' });
    }

    edges.push({ from: 'db-primary', to: 'db-sec-1', label: 'Replication' });
    edges.push({ from: 'db-primary', to: 'db-sec-2', label: 'Replication' });
  }

  return {
    summary,
    recommendations,
    topology: {
      nodes,
      edges
    }
  };
}
