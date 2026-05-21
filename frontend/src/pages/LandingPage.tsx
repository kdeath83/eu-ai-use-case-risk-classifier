import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, ScanLine } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (description.trim()) {
      // Store the description and navigate to assessment
      navigate('/assess', { state: { initialDescription: description } });
    }
  };

  return (
    <div className="landing-hero">
      <div style={{ marginBottom: '2rem' }}>
        <Shield size={80} color="#00d4ff" style={{ filter: 'drop-shadow(0 0 20px rgba(0, 212, 255, 0.5))' }} />
      </div>
      <h2>EU AI USE CASE RISK CLASSIFIER</h2>
      <p style={{ marginBottom: '3rem' }}>
        Determine whether your AI system qualifies as <strong style={{ color: '#00d4ff' }}>high-risk</strong> under Article 6 of the EU AI Act.
      </p>

      {/* Free Text Input - Main Action */}
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto 2rem', textAlign: 'left' }}>
        <div className="card-title" style={{ justifyContent: 'center' }}>
          <ScanLine size={20} color="#00d4ff" />
          Describe the AI Use Case
        </div>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what your AI system does. For example: 'A machine learning model that analyzes credit applications and recommends loan approval decisions for mortgage applications...'"
            rows={6}
            style={{ fontSize: '1rem', lineHeight: '1.6' }}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!description.trim()}
          style={{ width: '100%', fontSize: '1rem', padding: '1rem', justifyContent: 'center' }}
        >
          CLASSIFY USE CASE <ArrowRight size={20} />
        </button>
      </div>

      {/* Quick Examples */}
      <div style={{ marginTop: '2rem' }}>
        <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1rem' }}>Or try an example:</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setDescription('Credit scoring algorithm that evaluates loan applications using alternative data sources including social media activity and browsing history to determine creditworthiness.')}
            style={{ fontSize: '0.8rem' }}
          >
            Credit Scoring
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setDescription('AI-powered chatbot for customer service that handles routine banking inquiries and can escalate complex issues to human agents.')}
            style={{ fontSize: '0.8rem' }}
          >
            Customer Service Bot
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setDescription('Facial recognition system for identity verification at border control checkpoints, processing biometric data to authenticate travelers.')}
            style={{ fontSize: '0.8rem' }}
          >
            Biometric ID
          </button>
        </div>
      </div>
    </div>
  );
}
