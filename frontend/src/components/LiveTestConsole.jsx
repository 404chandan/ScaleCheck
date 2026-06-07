import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Play, Square, Terminal as TermIcon, AlertTriangle } from 'lucide-react';

export default function LiveTestConsole({ analysisId = 'unlinked' }) {
  const [url, setUrl] = useState(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/health`);
  const [connections, setConnections] = useState(10);
  const [duration, setDuration] = useState(10);
  
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [chartDataPoints, setChartDataPoints] = useState([]); // Array of { sec, rps, lat }
  const [finalResult, setFinalResult] = useState(null);

  const eventSourceRef = useRef(null);
  const terminalEndRef = useRef(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (text, type = 'default') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time: timestamp, text, type }]);
  };

  const startTest = () => {
    if (isRunning) return;

    setIsRunning(true);
    setFinalResult(null);
    setLogs([]);
    setChartDataPoints([]);
    
    addLog(`Initializing stress test runner for: ${url}`, 'info');
    addLog(`Configuration: Concurrency=${connections} threads, Duration=${duration}s`, 'info');
    addLog(`Establishing SSE pipeline to backend load tester...`, 'info');

    // Create SSE query url
    const sseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/loadtest/run?url=${encodeURIComponent(url)}&connections=${connections}&duration=${duration}&analysisId=${analysisId}`;
    
    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'tick') {
          const { requests, throughput, latency, errors, durationCompleted } = message.data;
          
          addLog(
            `[T+${durationCompleted}s] Total Req: ${requests} | Current RPS: ${Math.round(throughput)} | Avg Latency: ${Math.round(latency)}ms | Errors: ${errors}`,
            errors > 0 ? 'error' : 'default'
          );

          setChartDataPoints((prev) => [
            ...prev,
            { sec: durationCompleted, rps: throughput, lat: latency }
          ]);
        } 
        
        else if (message.type === 'done') {
          const res = message.results;
          addLog(`--------------------------------------------------`, 'info');
          addLog(`✔ STRESS TEST SUCCESSFUL!`, 'success');
          addLog(`Total Requests Sent: ${res.results.totalRequests}`, 'success');
          addLog(`Average Throughput: ${Math.round(res.results.throughput)} requests/sec`, 'success');
          addLog(`Average Latency: ${Math.round(res.results.averageLatency)}ms`, 'success');
          addLog(`99th Percentile Latency: ${Math.round(res.results.p99Latency)}ms`, 'success');
          addLog(`Failure Rate: ${res.results.failureRate}%`, res.results.failureRate > 0 ? 'error' : 'success');
          addLog(`--------------------------------------------------`, 'info');
          
          setFinalResult(res.results);
          setIsRunning(false);
          es.close();
        } 
        
        else if (message.type === 'error') {
          addLog(`❌ Server Error: ${message.message}`, 'error');
          setIsRunning(false);
          es.close();
        }
      };

      es.onerror = (err) => {
        addLog(`❌ Connection lost or failed to start. Ensure backend is running.`, 'error');
        setIsRunning(false);
        es.close();
      };

    } catch (err) {
      addLog(`❌ Failed to establish connection: ${err.message}`, 'error');
      setIsRunning(false);
    }
  };

  const cancelTest = () => {
    if (!isRunning) return;
    
    addLog(`⏹ Stress test aborted by user. Tearing down connections...`, 'error');
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsRunning(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Chart configuration for live rendering
  const liveChartData = {
    labels: chartDataPoints.map(d => `${d.sec}s`),
    datasets: [
      {
        label: 'Throughput (RPS)',
        data: chartDataPoints.map(d => d.rps),
        borderColor: '#06b6d4',
        yAxisID: 'yRps',
        tension: 0.2,
        borderWidth: 2
      },
      {
        label: 'Latency (ms)',
        data: chartDataPoints.map(d => d.lat),
        borderColor: '#a855f7',
        yAxisID: 'yLat',
        tension: 0.2,
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Space Grotesk', size: 10 } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b' } },
      yRps: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#06b6d4' },
        title: { display: true, text: 'RPS', color: '#06b6d4' }
      },
      yLat: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#a855f7' },
        title: { display: true, text: 'Latency (ms)', color: '#a855f7' }
      }
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <TermIcon size={20} style={{ color: 'var(--primary)' }} />
          <span>Live Stress Testing Console</span>
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Stress test a live HTTP endpoint directly from the browser. It fires concurrent requests, tracks performance metrics, and logs them in real time.
        </p>
      </div>

      {/* Target URL Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Target API Endpoint URL</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="http://localhost:5000/health"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isRunning}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Concurrency ({connections} connections)</label>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={connections}
              onChange={(e) => setConnections(Number(e.target.value))}
              disabled={isRunning}
              className="sim-slider"
            />
          </div>
          <div className="form-group">
            <label>Duration ({duration} seconds)</label>
            <input 
              type="range" 
              min="5" 
              max="60" 
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={isRunning}
              className="sim-slider"
            />
          </div>
        </div>

        {/* Start/Cancel controls */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          {!isRunning ? (
            <button className="btn btn-primary" onClick={startTest} style={{ flex: 1 }}>
              <Play size={16} />
              <span>Launch Stress Test</span>
            </button>
          ) : (
            <button className="btn btn-danger" onClick={cancelTest} style={{ flex: 1 }}>
              <Square size={16} />
              <span>Abort Load Test</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time split layout */}
      <div className="live-test-layout" style={{ marginTop: '0.5rem' }}>
        {/* Terminal log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Log Terminal</div>
          <div className="terminal-console">
            {logs.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>Console idle. Launch a load test to observe SRE output...</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`terminal-line ${log.type}`}>
                  <span style={{ color: '#4b5563', marginRight: '0.5rem' }}>[{log.time}]</span>
                  {log.text}
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Real-time Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Live Metric Stream</div>
          <div className="glass-card" style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            {chartDataPoints.length === 0 ? (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Waiting for chart data stream...</span>
            ) : (
              <div style={{ width: '100%', height: '100%' }}>
                <Line data={liveChartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary report card */}
      {finalResult && (
        <div className="glass-card" style={{ background: 'var(--success-bg)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <h4 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
            <CheckCircleIcon />
            <span>Load Test Completed Successfully</span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Avg Throughput</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '700' }}>{Math.round(finalResult.throughput)} RPS</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Avg Latency</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '700' }}>{Math.round(finalResult.averageLatency)} ms</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>99th Percentile</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '700' }}>{Math.round(finalResult.p99Latency)} ms</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Failure Rate</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: '700', color: finalResult.failureRate > 0 ? 'var(--critical)' : 'var(--success)' }}>{finalResult.failureRate}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline icons
const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--success)' }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
