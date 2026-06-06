import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateAnalysis from './pages/CreateAnalysis';
import ReportDetail from './pages/ReportDetail';
import LiveTestConsole from './components/LiveTestConsole';
import './App.css';

const StandaloneLoadTest = () => (
  <div>
    <h1 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Standalone Load Tester</h1>
    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Target any local or remote service endpoint to benchmark HTTP performance in real-time.</p>
    <LiveTestConsole />
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateAnalysis />} />
            <Route path="/report/:id" element={<ReportDetail />} />
            <Route path="/loadtest" element={<StandaloneLoadTest />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
