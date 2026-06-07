import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, FileSpreadsheet, Activity, LogOut, LogIn, Terminal } from 'lucide-react';
import { useUser } from '../userContext';

export default function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  return (
    <nav className="navbar">
      <Link to={user ? "/" : "/landing"} className="logo">
        <ShieldCheck className="logo-icon" size={28} />
        <span className="text-gradient">ScaleCheck</span>
      </Link>
      
      {/* Active User Session Terminal Badge */}
      {user && (
        <div style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: '0.75rem', 
          color: 'var(--text-secondary)',
          background: 'rgba(4, 3, 10, 0.6)',
          border: '1px solid var(--surface-border)',
          padding: '0.4rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.5)'
        }}>
          <span style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: user.role === 'architect' ? 'var(--primary)' : user.role === 'sre' ? 'var(--secondary)' : 'var(--success)',
            boxShadow: `0 0 8px ${user.role === 'architect' ? 'var(--primary)' : user.role === 'sre' ? 'var(--secondary)' : 'var(--success)'}`,
            display: 'inline-block',
            animation: 'pulse 2s infinite'
          }} />
          <span>SESSION: <strong style={{ color: '#fff' }}>{user.clearance}</strong></span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span>IP: <strong style={{ color: '#fff' }}>{user.ipAddress}</strong></span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span>NODE: <strong style={{ color: '#fff' }}>{user.node}</strong></span>
        </div>
      )}

      <ul className="nav-links">
        {user ? (
          <>
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileSpreadsheet size={16} />
                  <span>Topology Config <span style={{ fontSize: '0.7rem', opacity: 0.8, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>[L9]</span></span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/loadtest" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Activity size={16} />
                  <span>Stress Injector <span style={{ fontSize: '0.7rem', opacity: 0.8, color: 'var(--secondary)', fontFamily: 'var(--font-mono)' }}>[L8]</span></span>
                </div>
              </NavLink>
            </li>
            <li>
              <button 
                onClick={handleLogout} 
                className="nav-link" 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontFamily: 'inherit', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  color: 'var(--critical)' 
                }}
              >
                <LogOut size={16} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>[TERMINATE]</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/landing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Terminal size={16} />
                  <span>Console Landing</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LogIn size={16} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>[ESTABLISH_SESSION]</span>
                </div>
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
