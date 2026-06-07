import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Database, 
  Server, 
  Zap, 
  ListOrdered, 
  Globe,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function BottleneckList({ bottlenecks = [], aiRecommendations = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getComponentIcon = (comp) => {
    switch (comp.toLowerCase()) {
      case 'database': return <Database size={18} />;
      case 'backend': return <Server size={18} />;
      case 'cache': return <Zap size={18} />;
      case 'queue': return <ListOrdered size={18} />;
      case 'network': return <Globe size={18} />;
      default: return <AlertTriangle size={18} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Detected Bottlenecks (Deterministic) */}
      <div>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle style={{ color: 'var(--warning)' }} size={20} />
          <span>Detected Architectural Risks ({bottlenecks.length})</span>
        </h3>
        
        {bottlenecks.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', color: 'var(--success)', padding: '2rem' }}>
            <p style={{ fontWeight: '600' }}>[PASS] No critical bottlenecks detected!</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Your system parameters fit within standard scaling capabilities.</p>
          </div>
        ) : (
          <div className="bottleneck-card-list">
            {bottlenecks.map((b) => {
              const isExpanded = expandedId === b.id;
              const severityClass = b.severity.toLowerCase(); // critical, warning, optimization
              
              return (
                <div 
                  key={b.id} 
                  className={`glass-card bottleneck-item-card ${severityClass}`}
                  style={{ padding: '1rem' }}
                >
                  <div className="bottleneck-item-header" onClick={() => toggleExpand(b.id)}>
                    <div className="bottleneck-item-title-area">
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {getComponentIcon(b.component)}
                      </span>
                      <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{b.title}</span>
                      <span className={`severity-badge ${severityClass}`}>{b.severity}</span>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bottleneck-body">
                      <p className="bottleneck-description">{b.description}</p>
                      <div className="bottleneck-mitigation">
                        <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>SRE Recommended Action:</strong>
                        <span style={{ color: 'var(--text-secondary)' }}>{b.mitigation}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Advanced Recommendations */}
      {aiRecommendations && aiRecommendations.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles style={{ color: 'var(--primary)' }} size={20} />
            <span>AI Recommendation Action Plan ({aiRecommendations.length})</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {aiRecommendations.map((r, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1.2rem', background: 'rgba(99, 102, 241, 0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: 'var(--primary)' }}>{getComponentIcon(r.component)}</span>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.component}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      padding: '0.1rem 0.5rem', 
                      borderRadius: '4px',
                      color: r.priority === 'High' ? 'var(--critical)' : r.priority === 'Medium' ? 'var(--warning)' : 'var(--text-secondary)' 
                    }}>
                      Priority: {r.priority}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.1rem 0.5rem', borderRadius: '4px', color: 'var(--secondary)' }}>
                      Diff: {r.difficulty}
                    </span>
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <ArrowRight size={16} style={{ color: 'var(--secondary)', marginTop: '0.2rem', flexShrink: 0 }} />
                  <span>{r.action}</span>
                </h4>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.4rem' }}>
                  <strong>Expected Impact:</strong> {r.impact}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
