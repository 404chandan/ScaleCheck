import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Terminal, Shield, Cpu, Activity, Database, AlertCircle, Play, Sliders } from 'lucide-react';
import { useUser } from '../userContext';

// Matrix Rain Effect Component
const MatrixRain = ({ active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Fit to container
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    const columns = Math.floor(canvas.width / 14);
    const yPositions = Array(columns).fill(0);
    const chars = "01010110011001010100001101001000010001010100001101001011"; // "SCALECHECK" in binary

    let animationId;
    const draw = () => {
      ctx.fillStyle = 'rgba(4, 3, 10, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#10b981';
      ctx.font = '11px Courier';

      for (let i = 0; i < yPositions.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 14;
        const y = yPositions[i];

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          yPositions[i] = 0;
        } else {
          yPositions[i] += 14;
        }
      }
    };

    const interval = setInterval(draw, 33);
    
    const handleResize = () => {
      if (canvas) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.15 }} />;
};

// SVG Animated Flow Visualizer
const TrafficFlowVisualizer = () => {
  const [trafficRate, setTrafficRate] = useState(50);
  const [activePackets, setActivePackets] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPacket = {
        id: Math.random(),
        offset: 0,
        y: Math.random() > 0.5 ? 60 : 120, // alternate databases vs cache route
        speed: (Math.random() * 2 + 1) * (trafficRate / 50)
      };
      
      setActivePackets(prev => {
        const updated = prev.map(p => ({ ...p, offset: p.offset + p.speed }));
        // Filter out completed packets
        return [...updated.filter(p => p.offset < 400), newPacket];
      });
    }, 15000 / (trafficRate + 1));

    return () => clearInterval(interval);
  }, [trafficRate]);

  return (
    <div className="glass-card" style={{ padding: '1.5rem', flex: 1, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--secondary)' }}>
          <Activity size={16} />
          <span>REAL-TIME PACKET FLOW INJECTOR SIMULATION</span>
        </h4>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
          RATE: {trafficRate * 4} RPS
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ background: '#04030a', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', padding: '1rem', position: 'relative', height: '200px' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 180" style={{ overflow: 'visible' }}>
          {/* Paths */}
          <line x1="50" y1="90" x2="150" y2="90" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 150 90 Q 200 40 250 40 T 350 40" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 150 90 Q 200 140 250 140 T 350 140" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="350" y1="90" x2="450" y2="90" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Node Circles */}
          {/* Client node */}
          <circle cx="50" cy="90" r="14" fill="#0c1b35" stroke="var(--primary)" strokeWidth="2" />
          <text x="50" y="94" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="var(--font-mono)" fontWeight="bold">CLI</text>

          {/* Load Balancer */}
          <circle cx="150" cy="90" r="14" fill="#062f3c" stroke="var(--secondary)" strokeWidth="2" />
          <text x="150" y="94" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="var(--font-mono)" fontWeight="bold">LB</text>

          {/* Cache Node */}
          <circle cx="250" cy="40" r="14" fill="#3c0b24" stroke="#ec4899" strokeWidth="2" />
          <text x="250" y="44" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="var(--font-mono)" fontWeight="bold">REDIS</text>

          {/* Backend API Node */}
          <circle cx="350" cy="90" r="14" fill="#1b1235" stroke="#a855f7" strokeWidth="2" />
          <text x="350" y="94" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="var(--font-mono)" fontWeight="bold">API</text>

          {/* DB Replica */}
          <circle cx="250" cy="140" r="14" fill="#072d1f" stroke="var(--success)" strokeWidth="2" />
          <text x="250" y="144" textAnchor="middle" fill="#fff" fontSize="8" fontFamily="var(--font-mono)" fontWeight="bold">PG_DB</text>

          {/* Dynamic Packets */}
          {activePackets.map(p => {
            // Map offset (0 to 400) to coordinates along the nodes
            let cx = 50 + (p.offset * 0.95);
            let cy = 90;
            
            if (p.offset > 100 && p.offset <= 300) {
              const localOffset = (p.offset - 100) / 200; // 0 to 1
              cx = 150 + localOffset * 200;
              cy = p.y === 60 
                ? 90 - Math.sin(localOffset * Math.PI) * 45 // upper loop cache
                : 90 + Math.sin(localOffset * Math.PI) * 45; // lower loop db
            } else if (p.offset > 300) {
              cx = 350 + ((p.offset - 300) * 1.0);
              cy = 90;
            }

            return (
              <circle
                key={p.id}
                cx={cx}
                cy={cy}
                r="3"
                fill={p.y === 60 ? "#ec4899" : "var(--success)"}
                filter="drop-shadow(0 0 3px rgba(255,255,255,0.8))"
              />
            );
          })}
        </svg>
      </div>

      <div style={{ marginTop: '1rem' }} className="simulator-slider-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>SIMULATED LOAD LEVEL</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{trafficRate}%</span>
        </div>
        <input 
          type="range" 
          min="10" 
          max="100" 
          value={trafficRate} 
          onChange={(e) => setTrafficRate(Number(e.target.value))} 
          className="sim-slider" 
        />
      </div>
    </div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { login, personas } = useUser();
  const [cliInput, setCliInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    { text: "ScaleCheck [Version 1.4.0-build.8294]", type: "system" },
    { text: "(c) 2026 ScaleCheck Cluster. All rights reserved.", type: "system" },
    { text: "Node communication: active. Diagnostics database: linked.", type: "system" },
    { text: "Type 'help' to review console operations.", type: "system" },
    { text: "", type: "default" }
  ]);
  const [matrixActive, setMatrixActive] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const handleCliSubmit = (e) => {
    e.preventDefault();
    const cleanCmd = cliInput.trim().toLowerCase();
    if (!cleanCmd) return;

    const newLogs = [...terminalLogs, { text: `sre@scalecheck:~$ ${cliInput}`, type: "input" }];
    
    switch (cleanCmd) {
      case 'clear':
        setTerminalLogs([]);
        setCliInput('');
        return;
      case 'help':
        newLogs.push(
          { text: "AVAILABLE UTILITIES FOR CONSOLE SHELL:", type: "info" },
          { text: "  help       - Display command structure checklist", type: "info" },
          { text: "  features   - Output system capacity profiles in YAML representation", type: "info" },
          { text: "  diagnose   - Execute node hardware and latency diagnostic operations", type: "info" },
          { text: "  matrix     - Toggle green binary background rain visualization", type: "info" },
          { text: "  login      - Launch credential authentication portal", type: "info" },
          { text: "  clear      - Clear buffer logs", type: "info" }
        );
        break;
      case 'features':
        newLogs.push(
          { text: "SYSTEM_BENCHMARK_PROFILES:", type: "success" },
          { text: "  ---", type: "success" },
          { text: "  INJECTOR_CAPACITY: 50,000 requests/sec", type: "success" },
          { text: "  PIPELINE_ENGINE: Server-Sent Events (SSE) stream client", type: "success" },
          { text: "  REPRESENTATION: ReactFlow Interactive Topology mapping", type: "success" },
          { text: "  COMPLIANCE: SRE structural analysis index v1.0", type: "success" }
        );
        break;
      case 'diagnose':
        newLogs.push({ text: "Initializing diagnostic scan...", type: "system" });
        setTimeout(() => {
          setTerminalLogs(prev => [
            ...prev,
            { text: "[ OK ] loopback interface address (127.0.0.1) responding: 0.04ms", type: "success" },
            { text: "[ OK ] database transaction storage engines validated.", type: "success" },
            { text: "[ OK ] live telemetry packet queues established.", type: "success" },
            { text: "[ OK ] diagnostic scans complete. All pipelines healthy.", type: "success" }
          ]);
        }, 800);
        break;
      case 'matrix':
        setMatrixActive(prev => !prev);
        newLogs.push({ text: `Binary stream display: ${!matrixActive ? 'ENABLED' : 'DISABLED'}`, type: "system" });
        break;
      case 'login':
        newLogs.push({ text: "Routing to login interface...", type: "system" });
        setTimeout(() => navigate('/login'), 500);
        break;
      default:
        newLogs.push({ text: `bash: ${cleanCmd}: command signature absent. Type 'help' for support list.`, type: "error" });
    }

    setTerminalLogs(newLogs);
    setCliInput('');
  };

  const handleQuickLogin = (role) => {
    login(role);
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Title & ASCII art Area */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <pre style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: '0.8rem', 
          lineHeight: '1.2', 
          color: 'var(--primary)',
          textShadow: '0 0 10px var(--primary-glow)',
          overflowX: 'auto',
          padding: '1rem 0',
          background: 'rgba(8,7,16,0.3)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-md)',
          display: 'inline-block',
          width: '100%',
          maxWidth: '620px'
        }}>
{`   ___   ___   __   _     ____  ___   _  _  ____  ___  _  _ 
  / __) / __) /__\\ ( )   (  __)/ __) ( )_( )(  __)/ __)( )_( )
  \\__ \\( (__ /(__)\\/ (_/\  ) _) ( (__  ) _ (  ) _) ( (__  ) _ ( 
  (___/ \\___)(__)(__)____)(____)\\___)(_) (_)(____)\\___)(_) (_)`}
        </pre>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '1rem', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
          [DEPLOYMENT BENCHMARK & MULTI-TIER ARCHITECTURAL ANALYSIS ENGINE]
        </p>
      </div>

      {/* Main Split Console Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* Interactive Terminal console */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '380px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}>
              <Terminal size={16} />
              <span>DIAGNOSTICS SHELL CONSOLE</span>
            </h4>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', paddingRight: '0.5rem' }}>
            {terminalLogs.map((log, idx) => (
              <div key={idx} style={{ 
                color: log.type === 'error' ? 'var(--critical)' : 
                       log.type === 'success' ? 'var(--success)' : 
                       log.type === 'info' ? 'var(--secondary)' : 
                       log.type === 'input' ? 'var(--text-primary)' : 'var(--text-secondary)',
                whiteSpace: 'pre-wrap'
              }}>
                {log.text}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          <MatrixRain active={matrixActive} />

          <form onSubmit={handleCliSubmit} style={{ display: 'flex', borderTop: '1px solid var(--surface-border)', paddingTop: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--success)', paddingRight: '0.5rem' }}>sre@scalecheck:~$</span>
            <input 
              type="text" 
              className="form-control" 
              style={{ flex: 1, background: 'transparent', border: 'none', padding: 0, outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff' }}
              placeholder="type help for options..."
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
            />
          </form>
        </div>

        {/* Dynamic visual flow simulator */}
        <TrafficFlowVisualizer />

      </div>

      {/* Feature Checklist Cards */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          [CORE_ENGINE_CAPABILITIES]
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ display: 'flex', gap: '1rem' }}>
            <Cpu size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Multi-Tier Profiler</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Inspect scaling constraints across database engines, backend structures, APIs, and load configurations.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', gap: '1rem' }}>
            <Activity size={24} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Live Stress Injector</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Directly bench HTTP connections with high concurrency threads and track response latency spikes.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', gap: '1rem' }}>
            <Database size={24} style={{ color: 'var(--success)', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Topology Visualizer</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Render dynamic system layout maps including caches, sharded clusters, queues, and instances.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Access Authentication Portals / Persona select */}
      <div className="glass-card" style={{ background: 'rgba(20, 18, 38, 0.4)', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          <Shield style={{ color: 'var(--primary)' }} size={20} />
          <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>[SECURE_ACCESS_SIGN_ON_PORTAL]</h3>
        </div>
        
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Select a system role node below to directly initialize a localized session profile. Each persona maps specific access levels and modifies dashboard utilities.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          {/* Architect Card */}
          <div className="glass-card" style={{ borderColor: 'var(--surface-border)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-primary)' }}>ROLE: ARCHITECT</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>LVL_9</span>
              </div>
              <ul style={{ listStyle: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <li>NODE: {personas.architect.node}</li>
                <li>PERMIT: Write System Architecture</li>
                <li>RESTRICT: Load Injection [Read Only]</li>
              </ul>
            </div>
            <button className="btn btn-primary" onClick={() => handleQuickLogin('architect')} style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }}>
              LAUNCH ARCHITECT CONSOLE
            </button>
          </div>

          {/* SRE Card */}
          <div className="glass-card" style={{ borderColor: 'var(--surface-border)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-primary)' }}>ROLE: SRE_ENGINEER</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--secondary)', border: '1px solid var(--secondary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>LVL_8</span>
              </div>
              <ul style={{ listStyle: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <li>NODE: {personas.sre.node}</li>
                <li>PERMIT: Launch Traffic Stress Tests</li>
                <li>RESTRICT: Edit Topology [Read Only]</li>
              </ul>
            </div>
            <button className="btn btn-primary" onClick={() => handleQuickLogin('sre')} style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', background: 'var(--secondary)' }}>
              LAUNCH SRE CONSOLE
            </button>
          </div>

          {/* Auditor Card */}
          <div className="glass-card" style={{ borderColor: 'var(--surface-border)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-primary)' }}>ROLE: AUDITOR_CORE</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--success)', border: '1px solid var(--success)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>LVL_5</span>
              </div>
              <ul style={{ listStyle: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <li>NODE: {personas.auditor.node}</li>
                <li>PERMIT: Audit Compliance Checklist</li>
                <li>RESTRICT: Core Modifications [Read Only]</li>
              </ul>
            </div>
            <button className="btn btn-primary" onClick={() => handleQuickLogin('auditor')} style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', background: 'var(--success)' }}>
              LAUNCH AUDITOR CONSOLE
            </button>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Or launch the manual credential form directly by heading to the <Link to="/login" style={{ color: 'var(--primary)' }}>Authentication Shell</Link>.
          </span>
        </div>
      </div>

    </div>
  );
}
