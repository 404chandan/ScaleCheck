import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, Key, ArrowRight, User } from 'lucide-react';
import { useUser } from '../userContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useUser();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('architect');
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authLogs, setAuthLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const authSequence = [
    { text: "Connecting to server...", time: 300 },
    { text: "[ OK ] Server connection established.", time: 400 },
    { text: "Verifying credentials...", time: 300 },
    { text: "[ OK ] Credentials verified successfully.", time: 400 },
    { text: "Loading your profile data...", time: 300 },
    { text: "[ OK ] Profile loaded successfully.", time: 300 },
    { text: "[ ACCESS GRANTED ] Redirecting to dashboard...", time: 500 }
  ];

  useEffect(() => {
    if (!isAuthenticating) return;
    if (currentStep >= authSequence.length) {
      // Login completed
      login(role);
      navigate('/');
      return;
    }

    const step = authSequence[currentStep];
    const timer = setTimeout(() => {
      setAuthLogs(prev => [...prev, step.text]);
      setCurrentStep(prev => prev + 1);
    }, step.time);

    return () => clearTimeout(timer);
  }, [isAuthenticating, currentStep]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert("Username and password cannot be empty.");
      return;
    }
    
    // Start login animation
    setIsAuthenticating(true);
    setAuthLogs([]);
    setCurrentStep(0);
  };

  const handleSelectPreset = (presetRole, presetUser) => {
    setUsername(presetUser);
    setPassword('****************');
    setRole(presetRole);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', position: 'relative' }}>
        
        {/* Border Scanline Glow effect */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '2px', 
          background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
          animation: 'scanline 2s linear infinite'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.8rem' }}>
          <Shield className="logo-icon" size={24} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', tracking: '0.05em' }}>[Log In]</h2>
        </div>

        {!isAuthenticating ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            
            <div className="form-group">
              <label htmlFor="auth-user" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={12} />
                <span>Username</span>
              </label>
              <input
                id="auth-user"
                type="text"
                className="form-control"
                placeholder="e.g. architect_core"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-key" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Key size={12} />
                <span>Password</span>
              </label>
              <input
                id="auth-key"
                type="password"
                className="form-control"
                placeholder="secret passcode key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Demo Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.2rem' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setRole('architect')}
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.5rem', 
                    background: role === 'architect' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    borderColor: role === 'architect' ? 'var(--primary)' : 'var(--surface-border)',
                    color: role === 'architect' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  ARCHITECT
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setRole('sre')}
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.5rem', 
                    background: role === 'sre' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                    borderColor: role === 'sre' ? 'var(--secondary)' : 'var(--surface-border)',
                    color: role === 'sre' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  SRE
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setRole('auditor')}
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.5rem', 
                    background: role === 'auditor' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    borderColor: role === 'auditor' ? 'var(--success)' : 'var(--surface-border)',
                    color: role === 'auditor' ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  AUDITOR
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <span>Log In</span>
              <ArrowRight size={16} />
            </button>

            {/* Presets Helper */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Preset Demo Accounts:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => handleSelectPreset('architect', 'l9_architect_core')}
                >
                  <span>Architect (Level 9)</span>
                  <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>l9_architect_core</span>
                </button>
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => handleSelectPreset('sre', 'l8_sre_injector')}
                >
                  <span>SRE (Level 8)</span>
                  <span style={{ color: 'var(--secondary)', fontFamily: 'var(--font-mono)' }}>l8_sre_injector</span>
                </button>
                <button 
                  type="button"
                  className="btn btn-secondary" 
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => handleSelectPreset('auditor', 'l5_compliance_auditor')}
                >
                  <span>Compliance Auditor (Level 5)</span>
                  <span style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>l5_compliance_auditor</span>
                </button>
              </div>
            </div>

          </form>
        ) : (
          /* Authentication sequence terminal log */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 'bold' }}>
              <Terminal size={14} />
              <span>Authentication Logs:</span>
            </div>

            <div style={{ 
              background: '#04030a', 
              border: '1px solid var(--surface-border)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.2rem', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem', 
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              color: 'var(--text-secondary)'
            }}>
              {authLogs.map((log, idx) => (
                <div key={idx} style={{ 
                  color: log.startsWith('[ OK ]') ? 'var(--success)' : 
                         log.startsWith('[ ACCESS') ? 'var(--secondary)' : 'var(--text-secondary)'
                }}>
                  {log}
                </div>
              ))}
              <span className="terminal-cursor" style={{ 
                display: 'inline-block', 
                width: '6px', 
                height: '11px', 
                background: 'var(--success)',
                animation: 'blink 1s step-end infinite',
                marginTop: '0.2rem'
              }} />
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              establishing secure connection...
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
