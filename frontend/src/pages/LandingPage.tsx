import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Scan, Scale, Filter } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-hero">
      <div style={{ marginBottom: '2rem' }}>
        <Shield size={80} color="#00d4ff" style={{ filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.5))' }} />
      </div>
      <h2>EU AI USE CASE RISK CLASSIFIER</h2>
      <p>
        Determine whether your AI system qualifies as <strong style={{ color: '#00d4ff' }}>high-risk</strong> under Article 6 of the EU AI Act.
        Built for financial services institutions, compliance teams, and legal advisors.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/assess')} style={{ fontSize: '1rem', padding: '1rem 2.5rem' }}>
        INITIATE ASSESSMENT <ArrowRight size={20} />
      </button>

      <div className="feature-grid">
        <div className="feature-card">
          <Scan size={24} color="#00d4ff" style={{ marginBottom: '0.75rem' }} />
          <h4>Annex III Analysis</h4>
          <p>Check all 8 sectoral use cases with keyword-based confidence scoring. Covers banking, insurance, superannuation, and essential services.</p>
        </div>
        <div className="feature-card">
          <Scale size={24} color="#00d4ff" style={{ marginBottom: '0.75rem' }} />
          <h4>Material Influence</h4>
          <p>Assess whether your system materially influences decision outcomes per Article 6(3). 0-100 scoring with clear compliance guidance.</p>
        </div>
        <div className="feature-card">
          <Filter size={24} color="#00d4ff" style={{ marginBottom: '0.75rem' }} />
          <h4>Filter Wizard</h4>
          <p>Navigate Article 6(3) exemptions with guided decision logic. Profiling detection and human oversight requirements.</p>
        </div>
      </div>
    </div>
  );
}
