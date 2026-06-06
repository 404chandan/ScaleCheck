/**
 * ScaleCheck SRE Analysis Rule Engine
 * Deterministic rules based on SRE best practices to identify bottlenecks
 * and compute system design scores.
 */

export function runRuleEngine(input) {
  const {
    name = 'Backend API',
    backend = 'Node',
    database = 'Mongo',
    traffic = { users: 10000, rps: 100, growth: 10 },
    endpoints = [],
    infrastructure = { loadBalancer: false, cache: false, replicas: false, sharding: false, queue: false }
  } = input;

  const rps = Number(traffic.rps) || 100;
  const users = Number(traffic.users) || 10000;
  const growth = Number(traffic.growth) || 0;

  // Estimate future RPS based on growth percentage (e.g. 1 year growth)
  const futureRps = Math.round(rps * (1 + growth / 100));

  let scalabilityDeductions = 0;
  let reliabilityDeductions = 0;
  let availabilityDeductions = 0;
  
  const bottlenecks = [];

  // 1. Calculate Read/Write weights across endpoints
  let totalReadRatio = 0;
  let totalWriteRatio = 0;
  let maxPayloadSize = 0;
  let dbOpsCount = 0;
  let hasWriteHeavyEndpoint = false;

  if (endpoints && endpoints.length > 0) {
    endpoints.forEach(ep => {
      totalReadRatio += Number(ep.readRatio || 50);
      totalWriteRatio += Number(ep.writeRatio || 50);
      if (Number(ep.payloadSize) > maxPayloadSize) {
        maxPayloadSize = Number(ep.payloadSize);
      }
      if (ep.dbOps) dbOpsCount++;
      if (ep.method !== 'GET' && Number(ep.writeRatio) > 60) {
        hasWriteHeavyEndpoint = true;
      }
    });

    const totalEps = endpoints.length;
    totalReadRatio = totalReadRatio / totalEps;
    totalWriteRatio = totalWriteRatio / totalEps;
  } else {
    // Default fallback ratios
    totalReadRatio = 70;
    totalWriteRatio = 30;
    dbOpsCount = 1;
  }

  const readRps = Math.round(rps * (totalReadRatio / 100));
  const writeRps = Math.round(rps * (totalWriteRatio / 100));

  // --- RULE 1: Load Balancer & Horizontal Scaling ---
  if (!infrastructure.loadBalancer) {
    if (rps > 300) {
      scalabilityDeductions += 25;
      availabilityDeductions += 20;
      bottlenecks.push({
        id: 'missing_load_balancer_critical',
        component: 'Backend',
        severity: 'CRITICAL',
        title: 'Single Node Saturation & Single Point of Failure',
        description: `Your application expects ${rps} req/sec but has no Load Balancer. A single instance of ${backend} will experience CPU saturation and memory pressure under peak loads. Additionally, if this single instance crashes, the entire application goes offline.`,
        mitigation: 'Introduce a Load Balancer (e.g., NGINX, HAProxy, or AWS ALB) and scale to at least 3 backend instances horizontally.'
      });
    } else if (rps > 100) {
      scalabilityDeductions += 15;
      availabilityDeductions += 10;
      bottlenecks.push({
        id: 'missing_load_balancer_warning',
        component: 'Backend',
        severity: 'WARNING',
        title: 'Horizontal Scaling Recommended',
        description: `Running at ${rps} RPS near peak might lead to queueing delay and increased latency on a single ${backend} process.`,
        mitigation: 'Add a load balancer and run at least 2 backend instances in active-active configuration.'
      });
    }
  }

  // --- RULE 2: Caching Layer ---
  if (!infrastructure.cache && totalReadRatio > 70) {
    if (readRps > 500) {
      scalabilityDeductions += 20;
      reliabilityDeductions += 15;
      bottlenecks.push({
        id: 'missing_cache_critical',
        component: 'Cache',
        severity: 'CRITICAL',
        title: 'Database Read Exhaustion',
        description: `Your workload is read-heavy (${Math.round(totalReadRatio)}% reads) with a high read volume of ${readRps} req/sec. Directly querying ${database} for every read will saturate database connection pools and slow down average response times.`,
        mitigation: `Deploy an in-memory cache like Redis or Memcached. Cache hot paths (like GET endpoints) with a TTL strategy to offload 80%+ of database reads.`
      });
    } else if (readRps > 150) {
      scalabilityDeductions += 10;
      bottlenecks.push({
        id: 'missing_cache_optimization',
        component: 'Cache',
        severity: 'OPTIMIZATION',
        title: 'Opportunity for Read Caching',
        description: `With ${readRps} read requests per second, caching would significantly reduce read latency from ~100ms (database) to <5ms (in-memory cache).`,
        mitigation: 'Implement Redis caching for static or semi-static read-heavy API responses.'
      });
    }
  }

  // --- RULE 3: Database Writes & Sharding/Clustering ---
  const isMongo = database.toLowerCase().includes('mongo');
  if (writeRps > 500 && !infrastructure.sharding) {
    scalabilityDeductions += 20;
    reliabilityDeductions += 15;
    
    if (isMongo) {
      bottlenecks.push({
        id: 'mongo_write_lock_bottleneck',
        component: 'Database',
        severity: 'CRITICAL',
        title: 'MongoDB Write Locks & Primary Node Saturation',
        description: `At ${writeRps} writes/sec, MongoDB's single-primary architecture will face lock contention. Write operations block concurrent transactions and lead to high disk I/O utilization on the primary database instance.`,
        mitigation: 'Configure a MongoDB Sharded Cluster to distribute writes across multiple shards using a hashed shard key on high-cardinality fields.'
      });
    } else {
      bottlenecks.push({
        id: 'database_write_bottleneck',
        component: 'Database',
        severity: 'CRITICAL',
        title: 'Relational Database Write Bottleneck',
        description: `At ${writeRps} writes/sec, database disk write queues will saturate, leading to locks and connection timeout errors.`,
        mitigation: 'Implement database sharding (e.g., Citus for Postgres) or write partitioning, and scale storage IOPS.'
      });
    }
  }

  // --- RULE 4: Database Replication (High Availability) ---
  if (!infrastructure.replicas) {
    availabilityDeductions += 25;
    if (users > 50000 || rps > 200) {
      bottlenecks.push({
        id: 'missing_db_replicas_critical',
        component: 'Database',
        severity: 'CRITICAL',
        title: 'No Database Replication (Single Point of Failure)',
        description: `You are running a single database instance under high traffic. If the database node fails, data will be unavailable, and you risk data corruption or loss. There is no automatic failover.`,
        mitigation: `Configure a Replica Set (MongoDB: 1 Primary, 2 Secondaries) or Primary-Replica replication (Postgres/MySQL) with automatic failover. Direct read traffic to replica nodes.`
      });
    } else {
      bottlenecks.push({
        id: 'missing_db_replicas_warning',
        component: 'Database',
        severity: 'WARNING',
        title: 'Single Database Node Risk',
        description: 'No database replication increases the risk of extended downtime during database maintenance or VM failures.',
        mitigation: 'Enable database replica sets or read replicas to guarantee high availability.'
      });
    }
  }

  // --- RULE 5: Write Buffering & Message Queues ---
  if (!infrastructure.queue && hasWriteHeavyEndpoint) {
    if (writeRps > 200) {
      reliabilityDeductions += 20;
      scalabilityDeductions += 15;
      bottlenecks.push({
        id: 'missing_queue_critical',
        component: 'Queue',
        severity: 'CRITICAL',
        title: 'Synchronous Processing of Write-Heavy Actions',
        description: `Your application processes write-heavy requests (like POST /orders) synchronously. Under peak traffic of ${writeRps} writes/sec, users will experience high response times (> 1 second) because the HTTP request blocks waiting for the database write, third-party integrations, and notifications to complete.`,
        mitigation: 'Introduce an asynchronous message broker (e.g., RabbitMQ, Apache Kafka, or BullMQ). Convert POST endpoints to queue the task and return a 202 Accepted status immediately.'
      });
    } else if (writeRps > 50) {
      reliabilityDeductions += 10;
      bottlenecks.push({
        id: 'missing_queue_optimization',
        component: 'Queue',
        severity: 'OPTIMIZATION',
        title: 'Asynchronous Job Queues Recommended',
        description: `Decoupling request ingestion from processing would improve reliability and smooth out database traffic spikes.`,
        mitigation: 'Use a background task manager (e.g. BullMQ for Node) to process non-blocking tasks asynchronously.'
      });
    }
  }

  // --- RULE 6: Network Payload Bandwidth ---
  if (maxPayloadSize > 500 && rps > 100) {
    reliabilityDeductions += 15;
    const bandwidthMbps = ((maxPayloadSize * rps * 8) / 1024).toFixed(1);
    bottlenecks.push({
      id: 'network_payload_saturation',
      component: 'Network',
      severity: 'WARNING',
      title: 'High Network Bandwidth Saturation Risk',
      description: `With a peak payload size of ${maxPayloadSize} KB at ${rps} RPS, your backend must transmit ~${bandwidthMbps} Mbps of raw data. This can saturate network interface cards (NICs), inflate serialization latency, and increase egress costs.`,
      mitigation: 'Implement response compression (Gzip/Brotli), optimize query payloads to exclude unused fields, and utilize pagination.'
    });
  }

  // Calculate final subscores
  const scalabilityScore = Math.max(10, 100 - scalabilityDeductions);
  const reliabilityScore = Math.max(10, 100 - reliabilityDeductions);
  const availabilityScore = Math.max(10, 100 - availabilityDeductions);

  // Overall Score is a weighted average
  const overallScore = Math.round((scalabilityScore * 0.4) + (reliabilityScore * 0.3) + (availabilityScore * 0.3));

  // Determine an automated recommendation text summary
  let recommendationSummary = '';
  if (overallScore >= 85) {
    recommendationSummary = 'Your system architecture is exceptionally well-suited for your target workload. Consider adding minor logging and monitoring (like Prometheus/Grafana) to maintain visibility.';
  } else if (overallScore >= 65) {
    recommendationSummary = 'Your system can support moderate loads, but will experience degraded performance at peak traffic. Priorities should be setting up caching for reads and upgrading database instances to replicas.';
  } else {
    recommendationSummary = 'CRITICAL UPGRADES REQUIRED. Under peak load, your system will likely experience cascading failures (connection pool exhaustion, CPU lockup, and database crashes). Immediately implement horizontal backend scaling, Redis caching, and a message queue for write operations.';
  }

  return {
    score: overallScore,
    subscores: {
      scalability: scalabilityScore,
      reliability: reliabilityScore,
      availability: availabilityScore
    },
    bottlenecks,
    recommendationText: recommendationSummary
  };
}
