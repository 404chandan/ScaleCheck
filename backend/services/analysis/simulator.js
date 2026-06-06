/**
 * ScaleCheck Traffic Performance Simulator
 * Generates mathematical simulation curves demonstrating system behavior under load,
 * showing "Current Architecture" vs "Optimized Architecture" profiles.
 */

export function generateSimulationData(input) {
  const {
    backend = 'Node',
    database = 'Mongo',
    traffic = { rps: 100, users: 10000 },
    endpoints = [],
    infrastructure = { loadBalancer: false, cache: false, replicas: false, sharding: false, queue: false }
  } = input;

  const targetRps = Number(traffic.rps) || 100;
  
  // Calculate read/write ratio
  let readRatio = 70;
  let writeRatio = 30;
  if (endpoints && endpoints.length > 0) {
    let sumRead = 0;
    endpoints.forEach(ep => { sumRead += Number(ep.readRatio || 50); });
    readRatio = sumRead / endpoints.length;
    writeRatio = 100 - readRatio;
  }

  // Base parameters
  let baseLatency = 40; // in ms
  if (backend.toLowerCase().includes('python') || backend.toLowerCase().includes('django')) baseLatency = 70;
  if (backend.toLowerCase().includes('go') || backend.toLowerCase().includes('gin')) baseLatency = 15;
  if (backend.toLowerCase().includes('java') || backend.toLowerCase().includes('spring')) baseLatency = 30;

  // Database additions
  let dbLatency = 15;
  if (database.toLowerCase().includes('postgres') || database.toLowerCase().includes('mysql')) dbLatency = 20;

  const currentBase = baseLatency + dbLatency;

  // Let's generate curves from 0 to 2.5x the target RPS or at least up to 4000 RPS
  const maxRps = Math.max(targetRps * 2.5, 2000);
  const steps = 15;
  const stepSize = Math.ceil(maxRps / steps);

  const latencyVsRps = [];
  const throughputVsUsers = [];
  const errorRateVsRps = [];

  // Determine Breaking Point (Saturation Threshold)
  // Current Architecture Capacity
  let currentCapacity = 250; // default low cap
  if (infrastructure.loadBalancer) currentCapacity += 400;
  if (infrastructure.cache) currentCapacity += 500;
  if (infrastructure.replicas) currentCapacity += 300;
  if (infrastructure.sharding) currentCapacity += 500;
  if (infrastructure.queue) currentCapacity += 400;

  // If no optimizations, capacity remains very low
  if (!infrastructure.loadBalancer && !infrastructure.cache && !infrastructure.replicas) {
    currentCapacity = 200; 
  }

  // Optimized Capacity (assuming all recommended items are turned on)
  const optimizedCapacity = 2500; // Multi-node, Redis-cached, Sharded DB cluster

  // 1. Latency & Error Rate curves
  for (let i = 0; i <= steps; i++) {
    const currentRps = i * stepSize;

    // --- Latency (Current Architecture) ---
    let currentLatency = currentBase;
    if (currentRps > 0) {
      if (currentRps < currentCapacity) {
        // Linear increase under safe capacity
        currentLatency += (currentRps / currentCapacity) * 30;
      } else {
        // Exponential degradation after saturation
        const overflow = currentRps - currentCapacity;
        currentLatency += 30 + Math.pow(overflow, 1.6) * 0.5;
      }
    }
    // Cap latency at 5000ms representing timeouts
    currentLatency = Math.min(5000, Math.round(currentLatency));

    // --- Latency (Optimized Architecture) ---
    // Optimized uses redis cache for reads (2ms) and spreads load
    const optReadLatency = 2; // Cache hit
    const optWriteLatency = currentBase * 0.8; // Optimized DB
    const optBase = (optReadLatency * (readRatio / 100)) + (optWriteLatency * (writeRatio / 100));
    
    let optimizedLatency = optBase;
    if (currentRps > 0) {
      if (currentRps < optimizedCapacity) {
        optimizedLatency += (currentRps / optimizedCapacity) * 15;
      } else {
        const overflow = currentRps - optimizedCapacity;
        optimizedLatency += 15 + Math.pow(overflow, 1.4) * 0.2;
      }
    }
    optimizedLatency = Math.min(5000, Math.round(optimizedLatency));

    // --- Error Rate (Current) ---
    let currentErrors = 0;
    if (currentRps > currentCapacity) {
      const overloadRatio = (currentRps - currentCapacity) / currentCapacity;
      currentErrors = Math.min(99, Math.round(overloadRatio * 80));
    }

    // --- Error Rate (Optimized) ---
    let optimizedErrors = 0;
    if (currentRps > optimizedCapacity) {
      const overloadRatio = (currentRps - optimizedCapacity) / optimizedCapacity;
      optimizedErrors = Math.min(99, Math.round(overloadRatio * 60));
    }

    latencyVsRps.push({
      rps: currentRps,
      current: currentLatency,
      optimized: optimizedLatency
    });

    errorRateVsRps.push({
      rps: currentRps,
      current: currentErrors,
      optimized: optimizedErrors
    });
  }

  // 2. Throughput vs Concurrent Users curve
  // Under low user count, concurrency scales linearly.
  // When users exceed server connection limits, throughput plateaus or drops (current)
  // while optimized keeps scaling to a much higher point.
  const maxUsers = Math.max(traffic.users * 2.0, 10000);
  const userStepSize = Math.ceil(maxUsers / steps);

  for (let i = 0; i <= steps; i++) {
    const activeUsers = i * userStepSize;

    // Current throughput capacity
    let currentThroughput = 0;
    const currentMaxThroughput = currentCapacity;
    // Map active users to requested RPS: e.g. 1 user does 0.1 RPS
    const requestedRps = activeUsers * 0.1;

    if (requestedRps <= currentMaxThroughput) {
      currentThroughput = requestedRps;
    } else {
      // Degradation due to system lockup/thrashing
      const overflow = requestedRps - currentMaxThroughput;
      currentThroughput = Math.max(currentMaxThroughput * 0.5, currentMaxThroughput - (overflow * 0.15));
    }

    // Optimized throughput capacity
    let optimizedThroughput = 0;
    const optimizedMaxThroughput = optimizedCapacity;
    if (requestedRps <= optimizedMaxThroughput) {
      optimizedThroughput = requestedRps;
    } else {
      const overflow = requestedRps - optimizedMaxThroughput;
      optimizedThroughput = Math.max(optimizedMaxThroughput * 0.8, optimizedMaxThroughput - (overflow * 0.05));
    }

    throughputVsUsers.push({
      users: activeUsers,
      current: Math.round(currentThroughput),
      optimized: Math.round(optimizedThroughput)
    });
  }

  return {
    latencyVsRps,
    throughputVsUsers,
    errorRateVsRps,
    capacity: {
      current: currentCapacity,
      optimized: optimizedCapacity
    }
  };
}
