import { ReactNode, useEffect, useState } from 'react';
import { Shield, Activity } from 'lucide-react';
import { isMockMode } from '../api';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <header className="war-room-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="status-indicator" />
          <Shield size={28} color="#00d4ff" />
          <h1>
            EU AI RISK CLASSIFIER
            <span className="alpha-badge">ARTICLE 6</span>
          </h1>
        </div>
        <div className="system-time" id="clock">{time}</div>
      </header>
      {isMockMode && (
        <div style={{ background: 'rgba(255, 107, 53, 0.1)', borderBottom: '1px solid #ff6b35', padding: '0.5rem 1rem', textAlign: 'center', fontSize: '0.875rem', color: '#ff6b35' }}>
          <Activity size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          <strong>MOCK MODE ACTIVE:</strong> Client-side classification only. Connect backend for full API analysis.
        </div>
      )}
      <main className="app-layout">{children}</main>
      <footer className="war-room-footer">
        <div>
          <span className="connection-status">● LIVE CONNECTION</span>
          <span>Data: EU AI Act Regulation (EU) 2024/1689</span>
        </div>
        <div>
          <span>CLASSIFIER v1.0 | NOT LEGAL ADVICE</span>
        </div>
      </footer>
    </div>
  );
}
