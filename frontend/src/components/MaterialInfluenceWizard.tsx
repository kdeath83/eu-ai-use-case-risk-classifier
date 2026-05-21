import { ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import type { MaterialInfluenceResult } from '../services/types';

interface MaterialInfluenceWizardProps {
  materialInfluence: MaterialInfluenceResult;
  onComplete: () => void;
  onBack: () => void;
}

export default function MaterialInfluenceWizard({ materialInfluence, onComplete, onBack }: MaterialInfluenceWizardProps) {
  const { score, exceedsThreshold, answers, rationale } = materialInfluence;

  const questions = [
    { id: 'q1', text: 'Does the system make autonomous decisions without human initiation?', checked: answers.autonomousDecisions },
    { id: 'q2', text: 'Does a human meaningfully review the system\'s outputs before action is taken?', checked: answers.humanReviews },
    { id: 'q3', text: 'Can a human override or reject the system\'s recommendation?', checked: answers.humanOverrides },
    { id: 'q4', text: 'Does the system initiate actions (e.g., send notifications, trigger workflows)?', checked: answers.systemInitiatesActions },
    { id: 'q5', text: 'Are the system\'s outputs binding or directly executed?', checked: answers.outcomesBinding },
  ];

  return (
    <div>
      <div className="card">
        <h3 className="card-title">Material Influence Assessment</h3>
        <p className="mb-4" style={{ color: '#4b5563' }}>
          Article 6(3) requires that the system does not "materially influence the outcome."
          A system materially influences outcomes when its output shapes the decision environment
          in a way that affects the rights, protections, or economic position of affected persons.
        </p>

        {exceedsThreshold && (
          <div className="warning-banner">
            <AlertTriangle className="warning-banner-icon" size={24} />
            <div>
              <strong>Material influence threshold exceeded</strong>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                Score: {score}/100 (threshold: 50). The Article 6(3) filter likely does not apply.
              </p>
            </div>
          </div>
        )}

        <div className="card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
            <strong>Note:</strong> Per draft guidelines para 70, human involvement does not affect classification under Art. 6(2). A system with full human oversight is still high-risk if its intended purpose matches Annex III. Human oversight is a <strong>compliance requirement</strong> for high-risk systems (Art. 14), not a classification avoidance mechanism.
          </p>
        </div>

        <div className="mb-4">
          <label className="form-label">Material Influence Score</label>
          <div className="score-bar">
            <div
              className={`score-bar-fill ${score <= 30 ? 'green' : score <= 50 ? 'amber' : 'red'}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Preparatory</span>
            <span style={{ fontWeight: 600, color: exceedsThreshold ? '#EF4444' : '#10B981' }}>
              {score}/100
            </span>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Fully Autonomous</span>
          </div>
          <p className="mt-2" style={{ fontSize: '0.875rem', color: '#4b5563' }}>
            {rationale}
          </p>
        </div>

        <div className="mb-4">
          <p className="form-label">Detected Conditions</p>
          {questions.map(q => (
            <div key={q.id} className="form-group">
              <label className="flex items-center gap-3" style={{ opacity: q.checked ? 1 : 0.5 }}>
                <input type="checkbox" checked={q.checked} disabled />
                <span>{q.text}</span>
              </label>
            </div>
          ))}
        </div>
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
