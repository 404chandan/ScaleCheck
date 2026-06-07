import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateAnalysis from './pages/CreateAnalysis';
import ReportDetail from './pages/ReportDetail';
import LiveTestConsole from './components/LiveTestConsole';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import { UserProvider, useUser } from './userContext';
import './App.css';

// Clearance Required Shield Page
const ClearanceDenied = () => {
  const ip = "127.0.0.1";
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="glass-card" style={{ maxWidth: '600px', width: '100%', borderColor: 'var(--critical)', background: 'var(--critical-bg)', padding: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', color: 'var(--critical)', marginBottom: '1rem', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', paddingBottom: '0.5rem' }}>
          [ERR_SECURITY_RESTRICTION]
        </h2>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          <div>LOG_LEVEL: CRITICAL</div>
          <div>REMOTE_ADDR: {ip}</div>
          <div>TIMESTAMP: {timestamp}</div>
          <div>MESSAGE: Access to core analytics node requires verification signatures. Authorization token absent from browser headers.</div>
        </div>
        <Link to="/login" className="btn btn-danger" style={{ width: '100%' }}>
          LAUNCH AUTHENTICATION CHALLENGE
        </Link>
      </div>
    </div>
  );
};

// Route wrapper that checks for authentication
const ProtectedRoute = ({ children }) => {
  const { user } = useUser();
  if (!user) {
    return <ClearanceDenied />;
  }
  return children;
};

// Main page routes mapping
const AuthenticatedHome = () => {
  const { user } = useUser();
  if (!user) {
    return <LandingPage />;
  }
  return <Dashboard />;
};

const StandaloneLoadTest = () => (
  <div>
    <h1 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Standalone Load Tester</h1>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Target any local or remote service endpoint to benchmark HTTP performance in real-time.</p>
    <LiveTestConsole />
  </div>
);

function AppContent() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<AuthenticatedHome />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create" element={<ProtectedRoute><CreateAnalysis /></ProtectedRoute>} />
            <Route path="/report/:id" element={<ProtectedRoute><ReportDetail /></ProtectedRoute>} />
            <Route path="/loadtest" element={<ProtectedRoute><StandaloneLoadTest /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
