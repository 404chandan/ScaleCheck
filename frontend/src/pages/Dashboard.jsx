import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Calendar, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/analysis');
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
      const res = await fetch(`http://localhost:5000/api/analysis/${id}`, {
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
          <p style={{ color: 'var(--critical)', fontWeight: '600' }}>⚠️ Connection Error: {error}</p>
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
