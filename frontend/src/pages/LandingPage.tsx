import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-hero">
      <Shield size={64} color="#0D3360" style={{ marginBottom: '1.5rem' }} />
      <h2>EU AI Use Case Risk Classifier</h2>
      <p>
        Determine whether your AI system qualifies as <strong>high-risk</strong> under Article 6 of the EU AI Act.
        Built for financial services institutions, compliance teams, and legal advisors.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/assess')} style={{ fontSize: '1.125rem', padding: '0.875rem 2rem' }}>
        Start Assessment <ArrowRight size={20} />
      </button>
      <div className="mt-4" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ maxWidth: '250px', textAlign: 'left' }}>
          <h4 style={{ color: '#0D3360', marginBottom: '0.5rem' }}>Annex III Analysis</h4>
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Check all 8 sectoral use cases with keyword-based confidence scoring.</p>
        </div>
        <div className="card" style={{ maxWidth: '250px', textAlign: 'left' }}>
          <h4 style={{ color: '#0D3360', marginBottom: '0.5rem' }}>Material Influence</h4>
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Assess whether your system materially influences decision outcomes.</p>
        </div>
        <div className="card" style={{ maxWidth: '250px', textAlign: 'left' }}>
          <h4 style={{ color: '#0D3360', marginBottom: '0.5rem' }}>Filter Wizard</h4>
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Navigate Article 6(3) exemptions with guided decision logic.</p>
        </div>
      </div>
    </div>
  );
}
