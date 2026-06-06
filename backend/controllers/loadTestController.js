import { LoadTest } from '../models/LoadTest.js';
import autocannon from 'autocannon';

export async function runLoadTest(req, res) {
  const { url, connections = '10', duration = '10', analysisId } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing target url parameter.' });
  }

  const numConnections = parseInt(connections, 10) || 10;
  const numDuration = parseInt(duration, 10) || 10;

  // Set up Server-Sent Events (SSE) headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  console.log(`SSE: Client connected to run load test on: ${url}`);

  let activeInstance = null;

  try {
    // Start autocannon
    activeInstance = autocannon({
      url,
      connections: numConnections,
      duration: numDuration
    }, async (err, results) => {
      if (err) {
        console.error('SSE: Autocannon run callback error:', err);
        res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
        return res.end();
      }

      console.log('SSE: Autocannon finished. Saving results...');

      // Compile results object
      const latencyAverage = results.latency.average;
      const latencyP99 = results.latency.p99;
      const totalRequests = results.requests.sent;
      const averageRps = results.requests.average;
      
      // Calculate failure rate (sum of non-2xx status codes + error events)
      const non2xx = totalRequests - (results['2xx'] || 0);
      const errors = results.errors || 0;
      const failureRate = totalRequests > 0 ? Math.round(((non2xx + errors) / totalRequests) * 100) : 0;

      const testResults = {
        analysisId: analysisId || 'unlinked',
        url,
        duration: numDuration,
        connections: numConnections,
        results: {
          averageLatency: latencyAverage,
          p99Latency: latencyP99,
          maxRps: results.requests.max || averageRps,
          failureRate: Math.min(100, failureRate),
          totalRequests,
          throughput: averageRps
        }
      };

      // Save to database
      const savedTest = await LoadTest.create(testResults);

      // Send done event and end connection
      res.write(`data: ${JSON.stringify({ type: 'done', results: savedTest })}\n\n`);
      res.end();
    });

    // Send tick updates every second
    activeInstance.on('tick', () => {
      const currentStats = {
        requests: activeInstance.requests.sent,
        throughput: activeInstance.requests.average || 0,
        latency: activeInstance.requests.latency.average || 0,
        errors: activeInstance.requests.errors || 0,
        durationCompleted: activeInstance.stats.duration
      };
      
      res.write(`data: ${JSON.stringify({ type: 'tick', data: currentStats })}\n\n`);
    });

    // Handle client disconnecting (closing browser or canceling)
    req.on('close', () => {
      console.log('SSE: Client connection closed. Stopping load test...');
      if (activeInstance) {
        activeInstance.stop();
      }
    });

  } catch (error) {
    console.error('SSE: Error setting up load test:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
    res.end();
  }
}

export async function getLoadTestsByAnalysis(req, res) {
  try {
    const { analysisId } = req.params;
    const tests = await LoadTest.find({ analysisId });
    res.json(tests);
  } catch (error) {
    console.error('Error in getLoadTestsByAnalysis:', error);
    res.status(500).json({ error: 'Failed to retrieve load tests.' });
  }
}
