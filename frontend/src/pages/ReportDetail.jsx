import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Server, Network, Database, RefreshCw, Cpu } from 'lucide-react';
import ArchitectureMap from '../components/ArchitectureMap';
import TrafficSimulator from '../components/TrafficSimulator';
import BottleneckList from '../components/BottleneckList';
import LiveTestConsole from '../components/LiveTestConsole';

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Topology View Toggle: 'baseline' vs 'recommended'
  const [topologyView, setTopologyView] = useState('recommended');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analysis/${id}`);
      if (!res.ok) throw new Error('Analysis report not found.');
      const data = await res.json();
      setReport(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  // Compute baseline topology on the fly based on user stack inputs
  const baselineTopology = React.useMemo(() => {
    if (!report) return { nodes: [], edges: [] };
    const { backend, database, infrastructure } = report;

    const nodes = [
      { id: 'users', type: 'users', label: 'Client Traffic' }
    ];
    const edges = [];

    // Check what was actually active in baseline
    if (infrastructure.loadBalancer) {
      nodes.push({ id: 'lb', type: 'loadBalancer', label: 'Load Balancer' });
      nodes.push({ id: 'api-1', type: 'api', label: `${backend} Node 1` });
      nodes.push({ id: 'api-2', type: 'api', label: `${backend} Node 2` });
      edges.push({ from: 'users', to: 'lb' });
      edges.push({ from: 'lb', to: 'api-1' });
      edges.push({ from: 'lb', to: 'api-2' });
    } else {
      nodes.push({ id: 'api-1', type: 'api', label: `${backend} Server` });
      edges.push({ from: 'users', to: 'api-1', label: 'Direct HTTP' });
    }

    if (infrastructure.cache) {
      nodes.push({ id: 'redis', type: 'cache', label: 'Redis Cache' });
      edges.push({ from: 'api-1', to: 'redis' });
      if (infrastructure.loadBalancer) edges.push({ from: 'api-2', to: 'redis' });
    }

    if (infrastructure.queue) {
      nodes.push({ id: 'queue', type: 'queue', label: 'Message Queue' });
      edges.push({ from: 'api-1', to: 'queue' });
      if (infrastructure.loadBalancer) edges.push({ from: 'api-2', to: 'queue' });
    }

    const dbLabel = database.toLowerCase().includes('mongo') ? 'MongoDB' : database;
    if (infrastructure.replicas) {
      nodes.push({ id: 'db-primary', type: 'database', label: `${dbLabel} Primary` });
      nodes.push({ id: 'db-replica', type: 'database', label: `${dbLabel} Replica` });
      edges.push({ from: 'api-1', to: 'db-primary', label: 'Writes' });
      edges.push({ from: 'api-1', to: 'db-replica', label: 'Reads' });
      if (infrastructure.loadBalancer) {
        edges.push({ from: 'api-2', to: 'db-primary' });
        edges.push({ from: 'api-2', to: 'db-replica' });
      }
      edges.push({ from: 'db-primary', to: 'db-replica', label: 'Sync' });
      if (infrastructure.queue) {
        edges.push({ from: 'queue', to: 'db-primary' });
      }
    } else {
      nodes.push({ id: 'db-primary', type: 'database', label: `${dbLabel} Instance` });
      edges.push({ from: 'api-1', to: 'db-primary', label: 'Queries' });
      if (infrastructure.loadBalancer) edges.push({ from: 'api-2', to: 'db-primary' });
      if (infrastructure.queue) edges.push({ from: 'queue', to: 'db-primary' });
    }

    return { nodes, edges };
  }, [report]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="terminal-console" style={{ height: 'auto', padding: '2rem', textAlign: 'center' }}>
          Analyzing system design and performance...
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--critical)', marginBottom: '1rem' }}>Report Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error || 'The requested report could not be loaded.'}</p>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { results, aiRecommendation } = report;
  const activeTopology = topologyView === 'recommended' ? (aiRecommendation?.topology || baselineTopology) : baselineTopology;

  // Render SVG circular score
  const renderScoreCircle = (score, title, subtext, colorHex) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="glass-card score-circle-card">
        <div className="score-circle-svg">
          <svg>
            <circle className="score-circle-bg" cx="60" cy="60" r={radius} />
            <circle 
              className="score-circle-fill" 
              cx="60" 
              cy="60" 
              r={radius} 
              stroke={colorHex}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="score-circle-text" style={{ color: colorHex }}>{score}</div>
        </div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.2rem' }}>{title}</h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{subtext}</span>
      </div>
    );
  };

  const overallScoreColor = results.score >= 80 ? 'var(--success)' : results.score >= 60 ? 'var(--warning)' : 'var(--critical)';

  return (
    <div>
      {/* Back to Dashboard */}
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="report-header">
        <div className="report-title-row">
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Scaling Review: {report.name}</h1>
            <div className="report-meta-row">
              <span>Stack: <strong>{report.backend} + {report.database}</strong></span>
              <span>Target RPS: <strong>{report.traffic.rps} req/sec</strong></span>
              <span>Active Peak Users: <strong>{report.traffic.users}</strong></span>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={fetchReport} title="Refresh analysis">
            <RefreshCw size={14} />
            <span>Reload Report</span>
          </button>
        </div>
      </div>

      {/* SVG Score Circles */}
      <div className="scores-section">
        {renderScoreCircle(results.score, 'Overall Score', 'How ready your app is to scale', overallScoreColor)}
        {renderScoreCircle(results.subscores.scalability, 'Scalability', 'Processor & Database speed', '#6366f1')}
        {renderScoreCircle(results.subscores.reliability, 'Reliability', 'How your app handles crashes', '#06b6d4')}
        {renderScoreCircle(results.subscores.availability, 'Availability', 'Backup server setup', '#a855f7')}
      </div>

      {/* Main Report layout */}
      <div className="report-layout">
        
        {/* LEFT PANEL: Architecture map & Traffic simulator */}
        <div className="report-panel">
          
          {/* Network Topology Map */}
          <div className="glass-card flow-container-card">
            <div className="flow-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu style={{ color: 'var(--primary)' }} size={20} />
                <span>Architecture Map</span>
              </h3>
              
              {/* Toggle switch for current vs recommended layout */}
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                <button 
                  onClick={() => setTopologyView('baseline')} 
                  style={{ 
                    border: 'none', 
                    background: topologyView === 'baseline' ? 'var(--primary)' : 'transparent',
                    color: topologyView === 'baseline' ? '#fff' : 'var(--text-secondary)',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  Current Setup
                </button>
                <button 
                  onClick={() => setTopologyView('recommended')} 
                  style={{ 
                    border: 'none', 
                    background: topologyView === 'recommended' ? 'var(--primary)' : 'transparent',
                    color: topologyView === 'recommended' ? '#fff' : 'var(--text-secondary)',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  Recommended Setup
                </button>
              </div>
            </div>

            <ArchitectureMap topology={activeTopology} />
          </div>

          {/* Traffic Simulator */}
          {aiRecommendation?.simulation && (
            <TrafficSimulator 
              simulationData={aiRecommendation.simulation} 
              initialRps={report.traffic.rps}
            />
          )}

        </div>

        {/* RIGHT PANEL: Bottlenecks, AI Advice, and Load test console */}
        <div className="report-panel">
          
          {/* SRE Executive Summary */}
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(20, 18, 38, 0.5) 100%)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <Sparkles style={{ color: 'var(--primary)' }} size={20} />
              <span>Design Recommendations</span>
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)', fontStyle: 'italic', borderLeft: '2px solid var(--primary)', paddingLeft: '0.8rem' }}>
              "{aiRecommendation?.summary || results.recommendationText}"
            </p>
          </div>

          {/* SRE Bottlenecks & AI Advice */}
          <BottleneckList 
            bottlenecks={results.bottlenecks} 
            aiRecommendations={aiRecommendation?.recommendations}
          />

          {/* Live Load Tester Console */}
          <LiveTestConsole analysisId={report._id} />

        </div>

      </div>
    </div>
  );
}
