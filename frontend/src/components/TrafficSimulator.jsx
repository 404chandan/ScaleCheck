import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Gauge, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TrafficSimulator({ simulationData, initialRps = 100 }) {
  const { latencyVsRps = [], errorRateVsRps = [], capacity = { current: 200, optimized: 2000 } } = simulationData || {};

  // Maximum RPS in the simulation data
  const maxSimRps = latencyVsRps.length > 0 ? latencyVsRps[latencyVsRps.length - 1].rps : 2000;
  
  const [simRps, setSimRps] = useState(initialRps);

  // Interpolate current values based on slider RPS
  const currentMetrics = useMemo(() => {
    if (latencyVsRps.length === 0) {
      return { currentLat: 100, optLat: 15, currentErr: 0, optErr: 0 };
    }

    // Find closest step
    let closestStep = latencyVsRps[0];
    let minDiff = Math.abs(closestStep.rps - simRps);

    for (let i = 1; i < latencyVsRps.length; i++) {
      const diff = Math.abs(latencyVsRps[i].rps - simRps);
      if (diff < minDiff) {
        minDiff = diff;
        closestStep = latencyVsRps[i];
      }
    }

    // Find error rate step
    const errStep = errorRateVsRps.find(e => e.rps === closestStep.rps) || { current: 0, optimized: 0 };

    // Calculate dynamic scores based on latency and errors
    const calculateScore = (latency, errRate) => {
      let score = 100;
      // Deduct for latency
      if (latency > 1500) score -= 45;
      else if (latency > 500) score -= 25;
      else if (latency > 150) score -= 12;
      else if (latency > 50) score -= 5;

      // Deduct for errors
      score -= errRate * 1.5;

      return Math.max(10, Math.round(score));
    };

    return {
      currentLat: closestStep.current,
      optLat: closestStep.optimized,
      currentErr: errStep.current,
      optErr: errStep.optimized,
      currentScore: calculateScore(closestStep.current, errStep.current),
      optScore: calculateScore(closestStep.optimized, errStep.optimized)
    };
  }, [simRps, latencyVsRps, errorRateVsRps]);

  // Chart configuration
  const latencyChartData = {
    labels: latencyVsRps.map(d => `${d.rps} RPS`),
    datasets: [
      {
        label: 'Current Architecture Latency (ms)',
        data: latencyVsRps.map(d => d.current),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.04)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Optimized Architecture Latency (ms)',
        data: latencyVsRps.map(d => d.optimized),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.04)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'Space Grotesk', size: 10 }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#0d0c18',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#64748b', font: { size: 9 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#64748b', font: { size: 9 } }
      }
    }
  };

  return (
    <div className="glass-card simulator-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Gauge style={{ color: 'var(--secondary)' }} size={20} />
          <span>Interactive Load Simulator</span>
        </h3>
        <span style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: '0.8rem', 
          background: 'var(--primary-bg)', 
          color: 'var(--primary)', 
          padding: '0.1rem 0.5rem', 
          borderRadius: '4px' 
        }}>
          Baseline Limit: {capacity.current} RPS
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Adjust the slider to simulate traffic and see how your current system compares to the recommended setup under load.
      </p>

      {/* Slider Control */}
      <div className="simulator-slider-group" style={{ margin: '1rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
          <span>Simulated Requests</span>
          <span className="text-cyan-gradient" style={{ fontSize: '1.2rem' }}>{simRps} RPS</span>
        </div>
        <input 
          type="range" 
          min="10" 
          max={maxSimRps} 
          step="20"
          value={simRps}
          onChange={(e) => setSimRps(Number(e.target.value))}
          className="sim-slider"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>10 RPS</span>
          <span>{Math.round(maxSimRps / 2)} RPS</span>
          <span>{maxSimRps} RPS</span>
        </div>
      </div>

      {/* Side by Side Simulation Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* CURRENT COLUMN */}
        <div className="glass-card" style={{ background: 'rgba(239, 68, 68, 0.02)', borderColor: simRps > capacity.current ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-border)' }}>
          <h4 style={{ color: '#ef4444', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={14} />
            <span>Your Current Setup</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Response Time</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '700', color: currentMetrics.currentLat > 1000 ? '#ef4444' : currentMetrics.currentLat > 200 ? '#f59e0b' : '#fff' }}>
                {currentMetrics.currentLat} <span style={{ fontSize: '0.85rem' }}>ms</span>
              </div>
            </div>
            
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Error Rate</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '700', color: currentMetrics.currentErr > 5 ? '#ef4444' : '#fff' }}>
                {currentMetrics.currentErr}%
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Health Score</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '700', color: currentMetrics.currentScore > 75 ? 'var(--success)' : currentMetrics.currentScore > 50 ? 'var(--warning)' : 'var(--critical)' }}>
                {currentMetrics.currentScore} <span style={{ fontSize: '0.85rem' }}>/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* OPTIMIZED COLUMN */}
        <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.02)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
          <h4 style={{ color: '#10b981', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={14} />
            <span>Recommended Setup</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Response Time</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                {currentMetrics.optLat} <span style={{ fontSize: '0.85rem' }}>ms</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Error Rate</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                {currentMetrics.optErr}%
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Health Score</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                {currentMetrics.optScore} <span style={{ fontSize: '0.85rem' }}>/100</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Latency Chart */}
      <div style={{ height: '220px', marginTop: '1rem', position: 'relative' }}>
        <Line data={latencyChartData} options={chartOptions} />
      </div>
    </div>
  );
}
