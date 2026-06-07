import React, { createContext, useState, useEffect, useContext } from 'react';

// Predefined system personas matching user roles
export const PERSONAS = {
  architect: {
    role: 'architect',
    title: 'Principal Systems Architect',
    clearance: 'L9-ARCHITECT-CORE',
    node: 'CLUSTER_SH_W1',
    scope: ['read:topology', 'write:topology', 'read:bottlenecks', 'read:loadtests', 'read:compliance'],
    ipAddress: '10.240.10.82',
    terminalPrompt: 'architect@scalecheck:~$'
  },
  sre: {
    role: 'sre',
    title: 'Senior SRE Core Engineer',
    clearance: 'L8-SRE-INJECTOR',
    node: 'CLUSTER_SH_W2',
    scope: ['read:topology', 'read:bottlenecks', 'read:loadtests', 'write:loadtests', 'read:compliance'],
    ipAddress: '10.240.12.105',
    terminalPrompt: 'sre@scalecheck:~$'
  },
  auditor: {
    role: 'auditor',
    title: 'Security & Compliance Officer',
    clearance: 'L5-AUDIT-COMPLIANCE',
    node: 'CLUSTER_SH_W3',
    scope: ['read:topology', 'read:bottlenecks', 'read:loadtests', 'read:compliance', 'write:compliance'],
    ipAddress: '10.240.4.16',
    terminalPrompt: 'auditor@scalecheck:~$'
  }
};

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('scalecheck_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (PERSONAS[parsed.role]) {
          return PERSONAS[parsed.role];
        }
      } catch (e) {
        console.error('Failed to parse stored session:', e);
      }
    }
    return null; // Null means guest (unauthenticated)
  });

  const login = (role) => {
    if (PERSONAS[role]) {
      const selectedUser = PERSONAS[role];
      setUser(selectedUser);
      localStorage.setItem('scalecheck_session', JSON.stringify({ role }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('scalecheck_session');
  };

  return (
    <UserContext.Provider value={{ user, login, logout, personas: PERSONAS }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
