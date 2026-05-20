import { ArrowRight, ArrowLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { SystemInput, ProfilingResult } from '../services/types';

interface ProfilingCheckProps {
  systemData: SystemInput | null;
  profiling: ProfilingResult;
  onComplete: () => void;
  onBack: () => void;
}

const allIndicators = [
  { label: 'Performance at work', flag: 'Performance at work' },
  { label: 'Economic situation (credit, financial)', flag: 'Economic situation' },
  { label: 'Health data', flag: 'Health' },
  { label: 'Personal preferences or interests', flag: 'Preferences' },
  { label: 'Reliability or trustworthiness', flag: 'Reliability' },
  { label: 'Behaviour patterns', flag: 'Behaviour' },
  { label: 'Location or movements', flag: 'Location/movements' },
  { label: 'Interests', flag: 'Interests' },
];

export default function ProfilingCheck({ systemData, profiling, onComplete, onBack }: ProfilingCheckProps) {
  const { isProfiling, redFlags, absoluteRedFlag, details } = profiling;

  return (
    <div>
      <div className="card">
        <h3 className="card-title">Profiling Detection</h3>
        <p className="mb-4" style={{ color: '#4b5563' }}>
          Profiling means any automated processing of personal data to evaluate aspects relating to a natural person
          (GDPR Article 4(4)). If profiling is detected, the Article 6(3) filter is <strong>absolutely inapplicable</strong>.
        </p>

        {isProfiling && (
          <div className="warning-banner">
            <AlertTriangle className="warning-banner-icon" size={24} />
            <div>
              <strong>Profiling detected — Article 6(3) filter is INAPPLICABLE</strong>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                The system processes personal data to evaluate personal aspects. This system must be treated as high-risk.
              </p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="form-label">Profiling Indicators Detected</p>
          {allIndicators.map(ind => {
            const flagged = redFlags.includes(ind.flag);
            return (
              <div key={ind.flag} className={`checklist-item ${flagged ? 'fail' : 'pass'}`}>
                {flagged ? (
                  <XCircle size={20} color="#EF4444" />
                ) : (
                  <CheckCircle size={20} color="#10B981" />
                )}
                <span>{ind.label}</span>
              </div>
            );
          })}
        </div>

        {absoluteRedFlag && (
          <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <p style={{ color: '#991b1b', margin: 0, fontWeight: 500 }}>
              Absolute Red Flag: Profiling + Personal Data Processing
            </p>
            <p style={{ color: '#991b1b', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
              Article 6(3) exemption filter cannot apply.
            </p>
          </div>
        )}

        <div className="form-group mt-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={systemData?.personalDataProcessed || false} disabled />
            System processes personal data (from System Info step)
          </label>
        </div>

        <p className="mt-4" style={{ fontSize: '0.875rem', color: '#4b5563' }}>
          {details}
        </p>
      </div>

      <div className="flex justify-between mt-4">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <button className="btn btn-primary" onClick={onComplete}>
          Next <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
