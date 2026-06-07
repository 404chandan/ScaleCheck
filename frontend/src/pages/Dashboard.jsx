import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Calendar, FileText, ArrowRight, ShieldCheck, CheckSquare, Activity, ShieldAlert } from 'lucide-react';
import { useUser } from '../userContext';

// Architect Optimization Widget
const ArchitectWidget = () => (
  <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <CheckSquare size={16} />
      <span>[ARCHITECTURAL_MITIGATION_WORKSPACE]</span>
    </h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', fontSize: '0.85rem' }}>
      <div>
        <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>PENDING_DESIGN_DECISIONS:</div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          <li>[ ] Validate database connection pool scale limits</li>
          <li>[ ] Deploy Redis cluster nodes inside secure VPC subnets</li>
          <li>[ ] Configure RabbitMQ message queue retry handlers</li>
        </ul>
      </div>
      <div>
        <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>ACTIVE_BLUEPRINTS_STATE:</div>
        <div style={{ fontFamily: 'var(--font-mono)', background: 'rgba(4,3,10,0.6)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', padding: '0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div>CONFIG_ID: CLUSTER_CFG_0x8F92</div>
          <div>COMPILATION: SUCCESSFUL [2.08s]</div>
          <div>OPTIMIZATION_VECTORS: 3 paths identified</div>
        </div>
      </div>
    </div>
  </div>
);

// SRE Traffic Controller Widget
const SreWidget = () => (
  <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--secondary)' }}>
    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--secondary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Activity size={16} />
      <span>[SRE_TRAFFIC_TELEMETRY_FEED]</span>
    </h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', fontSize: '0.85rem' }}>
      <div style={{ background: 'rgba(4,3,10,0.5)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>ACTIVE_STRESS_AGENT</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--secondary)', marginTop: '0.2rem' }}>NONE [IDLE]</div>
      </div>
      <div style={{ background: 'rgba(4,3,10,0.5)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>HTTP_SOCKET_BUFFER</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginTop: '0.2rem' }}>64 KB [DEFAULT]</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/loadtest" className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem', background: 'var(--secondary)' }}>
          DEPLOY STRESS TEST AGENT
        </Link>
      </div>
    </div>
  </div>
);

// Compliance Auditor Checklist Widget
const AuditorWidget = ({ reports }) => {
  const latestReport = reports[0];
  const hasLB = latestReport?.infrastructure.loadBalancer;
  const hasCache = latestReport?.infrastructure.cache;
  const hasReplicas = latestReport?.infrastructure.replicas;
  const hasQueue = latestReport?.infrastructure.queue;

  return (
    <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--success)' }}>
      <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--success)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldAlert size={16} style={{ color: 'var(--success)' }} />
        <span>[SYSTEM_SECURITY_AND_COMPLIANCE_MATRIX]</span>
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.5rem' }}>SECURITY_RULE</th>
              <th style={{ padding: '0.5rem' }}>MEASURED_STATUS</th>
              <th style={{ padding: '0.5rem' }}>SEVERITY</th>
              <th style={{ padding: '0.5rem' }}>REMEDY_SCHEME</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td style={{ padding: '0.5rem' }}>Traffic Redundancy (LB)</td>
              <td style={{ padding: '0.5rem', color: hasLB ? 'var(--success)' : 'var(--warning)' }}>
                {hasLB ? '[PASS] Balancer Active' : '[WARN] Single Endpoint'}
              </td>
              <td style={{ padding: '0.5rem' }}>MEDIUM</td>
              <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Map routing table Nginx/ALB paths</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td style={{ padding: '0.5rem' }}>Database Replication Factor</td>
              <td style={{ padding: '0.5rem', color: hasReplicas ? 'var(--success)' : 'var(--critical)' }}>
                {hasReplicas ? '[PASS] Clustered Replicas' : '[FAIL] Single DB Instance'}
              </td>
              <td style={{ padding: '0.5rem' }}>CRITICAL</td>
              <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Configure read replicas set topology</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td style={{ padding: '0.5rem' }}>Response Caching Layer</td>
              <td style={{ padding: '0.5rem', color: hasCache ? 'var(--success)' : 'var(--text-muted)' }}>
                {hasCache ? '[PASS] Redis Cache Active' : '[INFO] Uncached Architecture'}
              </td>
              <td style={{ padding: '0.5rem' }}>LOW</td>
              <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Attach in-memory Redis cluster</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem' }}>Concurrency Spike Buffering</td>
              <td style={{ padding: '0.5rem', color: hasQueue ? 'var(--success)' : 'var(--text-muted)' }}>
                {hasQueue ? '[PASS] Queue Active' : '[INFO] Direct DB Pipelines'}
              </td>
              <td style={{ padding: '0.5rem' }}>LOW</td>
              <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Deploy message broker (RabbitMQ/Kafka)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/analysis`);
      if (!res.ok) throw new Error('Failed to load analysis reports.');
      const data = await res.json();
      setReports(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const deleteReport = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this analysis report?')) return;

    try {
      const res = await fetch(`${API_URL}/api/analysis/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReports(reports.filter(r => r._id !== id));
      } else {
        alert('Failed to delete report.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    }
  };

  // Compute stats metrics
  const stats = React.useMemo(() => {
    if (reports.length === 0) {
      return { total: 0, avgScore: 0, criticalCount: 0, healthyCount: 0 };
    }
    const scores = reports.map(r => r.results.score);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / reports.length);
    
    const critical = reports.filter(r => r.results.score < 60).length;
    const healthy = reports.filter(r => r.results.score >= 80).length;

    return {
      total: reports.length,
      avgScore: avg,
      criticalCount: critical,
      healthyCount: healthy
    };
  }, [reports]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="terminal-console" style={{ height: 'auto', padding: '2rem', textAlign: 'center' }}>
          Initializing SRE Dashboard, loading system profiles...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Dynamic Security greeting banner */}
      {user && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '0.8rem 1.2rem', background: 'rgba(8,7,16,0.6)', borderLeft: `3px solid ${user.role === 'architect' ? 'var(--primary)' : user.role === 'sre' ? 'var(--secondary)' : 'var(--success)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            USER_PRINCIPAL: <strong style={{ color: '#fff' }}>{user.title}</strong>
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            CLEARANCE: <strong style={{ color: 'var(--text-primary)' }}>{user.clearance}</strong>
          </span>
        </div>
      )}

      <div className="dashboard-header">
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.2rem' }}>SRE Architecture Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Predict backend scaling risks, profile APIs, and review system design bottlenecks.</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          <Plus size={16} />
          <span>New SRE Review</span>
        </Link>
      </div>

      {error && (
        <div className="glass-card" style={{ background: 'var(--critical-bg)', borderColor: 'rgba(239, 68, 68, 0.2)', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--critical)', fontWeight: '600' }}>[WARN] Connection Error: {error}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Make sure the backend server is running locally (default port 5000) or check the configuration.</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-title">Total Analyses</div>
          <div className="stat-val text-cyan-gradient">{stats.total}</div>
          <div className="stat-sub">Profiled system topologies</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-title">Average Score</div>
          <div className="stat-val" style={{ color: stats.avgScore >= 80 ? 'var(--success)' : stats.avgScore >= 60 ? 'var(--warning)' : 'var(--critical)' }}>
            {stats.avgScore} <span style={{ fontSize: '1.2rem' }}>/100</span>
          </div>
          <div className="stat-sub">Across all infrastructures</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-title">Unstable Systems</div>
          <div className="stat-val" style={{ color: stats.criticalCount > 0 ? 'var(--critical)' : 'var(--text-secondary)' }}>
            {stats.criticalCount}
          </div>
          <div className="stat-sub">Scores below 60/100</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-title">Production Ready</div>
          <div className="stat-val" style={{ color: 'var(--success)' }}>{stats.healthyCount}</div>
          <div className="stat-sub">Scores above 80/100</div>
        </div>
      </div>

      {/* Dynamic Role-Based Mitigation Workspace Widgets */}
      {user?.role === 'architect' && <ArchitectWidget />}
      {user?.role === 'sre' && <SreWidget />}
      {user?.role === 'auditor' && <AuditorWidget reports={reports} />}

      {/* Reports List */}
      <div>
        <div className="reports-list-header">
          <h2 style={{ fontSize: '1.4rem' }}>Recent System Design Reviews</h2>
        </div>

        {reports.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No scaling analyses yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Create an analysis profile of your application, enter expected traffic, and get SRE recommendation feedback.
            </p>
            <Link to="/create" className="btn btn-primary">
              <Plus size={16} />
              <span>Launch First Analysis</span>
            </Link>
          </div>
        ) : (
          <div className="reports-grid">
            {reports.map((report) => {
              const score = report.results.score;
              const scoreClass = score >= 80 ? 'score-high' : score >= 60 ? 'score-med' : 'score-low';
              const createdDate = new Date(report.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <Link 
                  key={report._id} 
                  to={`/report/${report._id}`} 
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="glass-card report-item-card">
                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                      <div className={`report-item-score ${scoreClass}`}>
                        {score}
                      </div>

                      <div className="report-item-info">
                        <h3 style={{ fontSize: '1.1rem' }}>{report.name}</h3>
                        <div className="report-item-meta">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Calendar size={12} />
                            {createdDate}
                          </span>
                          <span>Stack: <strong>{report.backend} + {report.database}</strong></span>
                          <span>Peak: <strong>{report.traffic.rps} req/sec</strong></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="report-item-badge" style={{ 
                        background: report.infrastructure.loadBalancer && report.infrastructure.cache ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: report.infrastructure.loadBalancer && report.infrastructure.cache ? 'var(--success)' : 'var(--text-secondary)'
                      }}>
                        {report.infrastructure.loadBalancer ? 'Load Balanced' : 'Single Instance'}
                      </span>
                      <button 
                        className="btn btn-secondary" 
                        onClick={(e) => deleteReport(e, report._id)}
                        style={{ padding: '0.4rem', borderRadius: '50%' }}
                        title="Delete profile"
                      >
                        <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                      </button>
                      <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
