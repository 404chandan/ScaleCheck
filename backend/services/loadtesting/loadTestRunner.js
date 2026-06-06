import autocannon from 'autocannon';

/**
 * Executes a load test programmatically using autocannon.
 * Streams intermediate tick events using the onTick callback.
 * Returns a Promise that resolves with the final results.
 */
export function executeLoadTest(options, onTick) {
  return new Promise((resolve, reject) => {
    const { url, connections = 10, duration = 10 } = options;

    console.log(`Starting load test on ${url} for ${duration}s with ${connections} connections...`);

    const instance = autocannon({
      url,
      connections,
      duration,
      // Optional customizations could be added here
    }, (err, results) => {
      if (err) {
        console.error('Autocannon execution error:', err);
        return reject(err);
      }
      resolve(results);
    });

    // Handle progress events every second (tick)
    instance.on('tick', () => {
      // Calculate current performance
      // Autocannon instance exposes running stats
      const currentStats = {
        requests: instance.requests.sent,
        throughput: instance.requests.average,
        latency: instance.requests.latency.average,
        errors: instance.requests.errors,
        durationCompleted: instance.stats.duration
      };
      
      if (onTick && typeof onTick === 'function') {
        onTick(currentStats);
      }
    });

    // Handle process interruption / client close
    instance.on('error', (err) => {
      console.error('Autocannon process error event:', err);
      reject(err);
    });
  });
}
