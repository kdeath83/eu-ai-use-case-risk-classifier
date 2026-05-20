import { ArrowRight, ArrowLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { SystemInput, MaterialInfluenceResult, ProfilingResult, Article6FilterResult } from '../services/types';

interface FilterWizardProps {
  systemData: SystemInput | null;
  materialInfluence: MaterialInfluenceResult;
  profiling: ProfilingResult;
  article6Filter: Article6FilterResult;
  onComplete: () => void;
  onBack: () => void;
}

export default function FilterWizard({
  systemData,
  materialInfluence,
  profiling,
  article6Filter,
  onComplete,
  onBack
}: FilterWizardProps) {
  const { outcome, materialInfluenceExceeded, conditions, recommendation } = article6Filter;
  const satisfiedCount = conditions.filter(c => c.satisfied).length;

  let outcomeLabel: string;
  let outcomeClass: string;

  if (profiling.absoluteRedFlag) {
    outcomeLabel = 'Likely High-Risk (Profiling Exclusion)';
    outcomeClass = 'badge-red';
  } else if (!materialInfluenceExceeded && satisfiedCount >= 3) {
    outcomeLabel = 'Likely Exempt from High-Risk';
    outcomeClass = 'badge-green';
  } else if (!materialInfluenceExceeded && satisfiedCount >= 1) {
    outcomeLabel = 'Borderline — Seek Legal Review';
    outcomeClass = 'badge-amber';
  } else if (materialInfluenceExceeded) {
    outcomeLabel = 'Likely High-Risk (Material Influence Exceeded)';
    outcomeClass = 'badge-red';
  } else {
    outcomeLabel = 'Borderline — Insufficient Filter Conditions';
    outcomeClass = 'badge-amber';
  }

  return (
    <div>
      <div className="card">
        <h3 className="card-title">Article 6(3) Filter Assessment</h3>
        <p className="mb-4" style={{ color: '#4b5563' }}>
          The Article 6(3) filter allows Annex III systems to escape high-risk classification if they meet
          one of five alternative conditions AND do not materially influence outcomes. Profiling systems are absolutely excluded.
        </p>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="form-label">Gatekeeper: Material Influence</span>
            <span className={`badge ${materialInfluenceExceeded ? 'badge-red' : 'badge-green'}`}>
              {materialInfluenceExceeded ? 'EXCEEDED' : 'NOT EXCEEDED'}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Score: {materialInfluence.score}/100 (threshold: 50).
            {materialInfluenceExceeded
              ? ' System materially influences outcomes. Filter cannot apply.'
              : ' System does not materially influence outcomes. Filter may apply.'}
          </p>
        </div>

        {profiling.absoluteRedFlag && (
          <div className="warning-banner">
            <AlertTriangle className="warning-banner-icon" size={24} />
            <div>
              <strong>Profiling detected — Filter is INAPPLICABLE</strong>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                Article 6(3) explicitly excludes profiling systems from the filter mechanism.
              </p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="form-label">Alternative Conditions (need 1+ if gatekeeper not exceeded)</p>
          {conditions.map(c => (
            <div key={c.id} className={`checklist-item ${c.satisfied ? 'pass' : 'fail'}`}>
              {c.satisfied ? (
                <CheckCircle size={20} color="#10B981" />
              ) : (
                <XCircle size={20} color="#EF4444" />
              )}
              <div>
                <strong>{c.name}</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{c.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <p className="form-label">Filter Outcome</p>
          <div className={`badge ${outcomeClass}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            {outcomeLabel}
          </div>
          <p className="mt-4" style={{ fontSize: '0.875rem', color: '#4b5563' }}>
            {satisfiedCount}/5 conditions satisfied.
            {outcome === 'likely_exempt' && ' System likely exempt — document rationale and register under Article 6(4).'}
            {outcome === 'borderline' && ' Borderline case — seek legal review before final classification.'}
            {outcome === 'likely_high_risk' && ' System likely high-risk — implement full compliance obligations.'}
          </p>
        </div>

        <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.9375rem', fontWeight: 500, marginBottom: '0.5rem' }}>Recommendation</p>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>{recommendation}</p>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <button className="btn btn-primary" onClick={onComplete}>
          View Report <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
