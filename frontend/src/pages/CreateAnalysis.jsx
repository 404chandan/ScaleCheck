import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShieldAlert, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function CreateAnalysis() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('Food Delivery API');
  const [backend, setBackend] = useState('Node + Express');
  const [database, setDatabase] = useState('MongoDB');
  
  const [users, setUsers] = useState(10000);
  const [rps, setRps] = useState(100);
  const [growth, setGrowth] = useState(20);

  const [endpoints, setEndpoints] = useState([
    { method: 'GET', path: '/restaurants', readRatio: 90, writeRatio: 10, payloadSize: 80, dbOps: true },
    { method: 'POST', path: '/orders', readRatio: 10, writeRatio: 90, payloadSize: 2, dbOps: true }
  ]);

  const [infrastructure, setInfrastructure] = useState({
    loadBalancer: false,
    cache: false,
    replicas: false,
    sharding: false,
    queue: false
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const addEndpoint = () => {
    setEndpoints([
      ...endpoints,
      { method: 'GET', path: '/api/v1/resource', readRatio: 50, writeRatio: 50, payloadSize: 10, dbOps: true }
    ]);
  };

  const updateEndpoint = (index, field, value) => {
    const updated = [...endpoints];
    updated[index][field] = value;
    
    // Auto sync write/read ratios if one is modified
    if (field === 'readRatio') {
      updated[index].writeRatio = 100 - Number(value);
    } else if (field === 'writeRatio') {
      updated[index].readRatio = 100 - Number(value);
    }

    setEndpoints(updated);
  };

  const removeEndpoint = (index) => {
    setEndpoints(endpoints.filter((_, idx) => idx !== index));
  };

  const handleInfraToggle = (key) => {
    setInfrastructure(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const submitAnalysis = async () => {
    if (!name.trim()) return alert('Please enter a system name.');
    
    setLoading(true);
    try {
      const payload = {
        name,
        backend,
        database,
        traffic: { users: Number(users), rps: Number(rps), growth: Number(growth) },
        endpoints,
        infrastructure
      };

      const res = await fetch('http://localhost:5000/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Server returned error building report.');
      }

      const report = await res.json();
      navigate(`/report/${report._id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate scaling report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wizard-container">
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '2rem' }}>Configure Architecture Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Provide system parameters. The SRE engine will map risk indices and failure bottlenecks.</p>
      </div>

      {/* Progress Indicator */}
      <div className="wizard-progress">
        <div className="progress-bar-fill" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
        <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>1</div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>2</div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>3</div>
        <div className={`progress-step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>4</div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        
        {/* STEP 1: GENERAL INFO */}
        {step === 1 && (
          <div className="form-section">
            <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Step 1: Application Profile</h3>
            
            <div className="form-group">
              <label htmlFor="sys-name">Application Name</label>
              <input 
                id="sys-name" 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Order Processing Service"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sys-backend">Backend Technology Stack</label>
                <select 
                  id="sys-backend" 
                  className="form-control" 
                  value={backend} 
                  onChange={(e) => setBackend(e.target.value)}
                >
                  <option value="Node + Express">Node + Express</option>
                  <option value="Python + FastAPI">Python + FastAPI</option>
                  <option value="Python + Django">Python + Django</option>
                  <option value="Go + Gin">Go + Gin (High Performance)</option>
                  <option value="Java + Spring Boot">Java + Spring Boot</option>
                  <option value="Ruby on Rails">Ruby on Rails</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sys-db">Primary Database</label>
                <select 
                  id="sys-db" 
                  className="form-control" 
                  value={database} 
                  onChange={(e) => setDatabase(e.target.value)}
                >
                  <option value="MongoDB">MongoDB (Document Store)</option>
                  <option value="PostgreSQL">PostgreSQL (Relational)</option>
                  <option value="MySQL">MySQL (Relational)</option>
                  <option value="Redis">Redis (Key-Value/Cache)</option>
                  <option value="Cassandra">Apache Cassandra (Wide Column)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TRAFFIC PROFILE */}
        {step === 2 && (
          <div className="form-section">
            <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Step 2: Load & Growth Predictions</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="traffic-rps">Peak Throughput (req/sec)</label>
                <input 
                  id="traffic-rps" 
                  type="number" 
                  className="form-control" 
                  value={rps} 
                  onChange={(e) => setRps(e.target.value)} 
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="traffic-users">Concurrent Active Users</label>
                <input 
                  id="traffic-users" 
                  type="number" 
                  className="form-control" 
                  value={users} 
                  onChange={(e) => setUsers(e.target.value)} 
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="traffic-growth">Expected 12-Month Traffic Growth (%)</label>
              <input 
                id="traffic-growth" 
                type="number" 
                className="form-control" 
                value={growth} 
                onChange={(e) => setGrowth(e.target.value)} 
                min="0"
                placeholder="e.g. 20"
              />
            </div>
          </div>
        )}

        {/* STEP 3: ENDPOINTS CONFIG */}
        {step === 3 && (
          <div className="form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
              <h3>Step 3: API Endpoints ({endpoints.length})</h3>
              <button className="btn btn-secondary" onClick={addEndpoint} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <Plus size={14} /> Add Endpoint
              </button>
            </div>

            <div className="endpoints-list">
              {endpoints.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No endpoints configured. Default profiles will apply.</p>
              ) : (
                endpoints.map((ep, idx) => (
                  <div key={idx} className="endpoint-item">
                    <select 
                      className="form-control"
                      value={ep.method}
                      onChange={(e) => updateEndpoint(idx, 'method', e.target.value)}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>

                    <input 
                      type="text" 
                      className="form-control" 
                      value={ep.path} 
                      onChange={(e) => updateEndpoint(idx, 'path', e.target.value)} 
                      placeholder="/api/resource"
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Read/Write: {ep.readRatio}/{ep.writeRatio}%</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="10"
                        value={ep.readRatio} 
                        onChange={(e) => updateEndpoint(idx, 'readRatio', e.target.value)}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                    </div>

                    <input 
                      type="number" 
                      className="form-control" 
                      value={ep.payloadSize} 
                      onChange={(e) => updateEndpoint(idx, 'payloadSize', e.target.value)} 
                      placeholder="Size KB"
                      title="Average payload size in KB"
                    />

                    <button 
                      className="btn btn-danger" 
                      onClick={() => removeEndpoint(idx)}
                      style={{ padding: '0.4rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 4: ARCHITECTURE TOGGLES */}
        {step === 4 && (
          <div className="form-section">
            <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Step 4: Active Architecture Topology</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check which scaling strategies are ALREADY implemented in your baseline setup.</p>
            
            <div className="toggle-grid">
              
              <div 
                className={`toggle-card ${infrastructure.loadBalancer ? 'active' : ''}`}
                onClick={() => handleInfraToggle('loadBalancer')}
              >
                <input 
                  type="checkbox" 
                  className="toggle-checkbox" 
                  checked={infrastructure.loadBalancer} 
                  onChange={() => {}} // Controlled by card click
                />
                <div className="toggle-label">
                  <span className="toggle-title">Load Balancer</span>
                  <span className="toggle-desc">Nginx, ALB, or Envoy active</span>
                </div>
              </div>

              <div 
                className={`toggle-card ${infrastructure.cache ? 'active' : ''}`}
                onClick={() => handleInfraToggle('cache')}
              >
                <input 
                  type="checkbox" 
                  className="toggle-checkbox" 
                  checked={infrastructure.cache} 
                  onChange={() => {}}
                />
                <div className="toggle-label">
                  <span className="toggle-title">In-Memory Cache</span>
                  <span className="toggle-desc">Redis or Memcached enabled</span>
                </div>
              </div>

              <div 
                className={`toggle-card ${infrastructure.replicas ? 'active' : ''}`}
                onClick={() => handleInfraToggle('replicas')}
              >
                <input 
                  type="checkbox" 
                  className="toggle-checkbox" 
                  checked={infrastructure.replicas} 
                  onChange={() => {}}
                />
                <div className="toggle-label">
                  <span className="toggle-title">DB Replication</span>
                  <span className="toggle-desc">Read replicas or replica set</span>
                </div>
              </div>

              <div 
                className={`toggle-card ${infrastructure.sharding ? 'active' : ''}`}
                onClick={() => handleInfraToggle('sharding')}
              >
                <input 
                  type="checkbox" 
                  className="toggle-checkbox" 
                  checked={infrastructure.sharding} 
                  onChange={() => {}}
                />
                <div className="toggle-label">
                  <span className="toggle-title">DB Sharding</span>
                  <span className="toggle-desc">Distributed cluster shards</span>
                </div>
              </div>

              <div 
                className={`toggle-card ${infrastructure.queue ? 'active' : ''}`}
                onClick={() => handleInfraToggle('queue')}
              >
                <input 
                  type="checkbox" 
                  className="toggle-checkbox" 
                  checked={infrastructure.queue} 
                  onChange={() => {}}
                />
                <div className="toggle-label">
                  <span className="toggle-title">Message Queue</span>
                  <span className="toggle-desc">RabbitMQ, Kafka, or BullMQ</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Form navigation */}
        <div className="wizard-footer">
          {step > 1 ? (
            <button className="btn btn-secondary" onClick={prevStep} disabled={loading}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div></div> // Spacing placeholder
          )}

          {step < 4 ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={submitAnalysis} disabled={loading}>
              {loading ? (
                <span>Generating SRE Report...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  <span>Generate SRE Report</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
