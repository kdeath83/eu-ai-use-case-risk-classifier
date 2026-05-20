import { ReactNode } from 'react';
import { isMockMode } from '../api';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <header className="app-header">
        <h1>EU AI Use Case Risk Classifier</h1>
        <p>EU AI Act Article 6 Compliance Assessment Tool</p>
      </header>
      {isMockMode && (
        <div style={{ background: '#fef3c7', borderBottom: '1px solid #f59e0b', padding: '0.5rem 1rem', textAlign: 'center', fontSize: '0.875rem', color: '#92400e' }}>
          <strong>Mock Mode:</strong> Running client-side classification. Connect to a backend for full API-powered analysis.
        </div>
      )}
      <main className="app-layout">{children}</main>
    </div>
  );
}
