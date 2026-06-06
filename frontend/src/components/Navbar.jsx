import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, FileSpreadsheet, Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <ShieldCheck className="logo-icon" size={28} />
        <span className="text-gradient">ScaleCheck</span>
      </Link>
      
      <ul className="nav-links">
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
              <span>Create Analysis</span>
            </div>
          </NavLink>
        </li>
        <li>
          <NavLink to="/loadtest" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} />
              <span>Live Load Test</span>
            </div>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
