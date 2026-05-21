import { Download, RotateCcw, FileText, AlertTriangle, CheckCircle, XCircle, Clock, Shield, User, Building } from 'lucide-react';

interface ClassificationReportProps {
  report: any;
  onRestart: () => void;
}

export default function ClassificationReport({ report, onRestart }: ClassificationReportProps) {
  if (!report) return null;

  const { overallClassification, evidenceSummary, exportJson, materialInfluence, profiling, article6Filter, nextSteps } = report;

  const badgeClass = overallClassification === 'high-risk' ? 'badge-red' : overallClassification === 'not-high-risk' ? 'badge-green' : 'badge-amber';
  const badgeText = overallClassification === 'high-risk' ? 'HIGH-RISK' : overallClassification === 'not-high-risk' ? 'NOT HIGH-RISK' : 'BORDERLINE';

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-risk-report-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const priorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: '#EF4444',
      high: '#F59E0B',
      medium: '#3B82F6',
      low: '#6B7280'
    };
    return <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors[priority] || '#6B7280', textTransform: 'uppercase' }}>{priority}</span>;
  };

  const roleIcon = (role: string) => {
    if (role === 'provider') return <Building size={14} color="#6B7280" />;
    if (role === 'deployer') return <User size={14} color="#6B7280" />;
    return <Shield size={14} color="#6B7280" />;
  };

  const applicableSteps = nextSteps?.filter((s: any) => s.applicable) || [];
  const criticalSteps = applicableSteps.filter((s: any) => s.priority === 'critical');
  const highSteps = applicableSteps.filter((s: any) => s.priority === 'high');
  const otherSteps = applicableSteps.filter((s: any) => s.priority !== 'critical' && s.priority !== 'high');

  return (
    <div>
      <div className="card text-center">
        <h3 className="card-title">Classification Report</h3>
        <div className={`badge ${badgeClass}`} style={{ fontSize: '1.25rem', padding: '0.75rem 1.5rem', marginBottom: '1rem' }}>
          {badgeText}
        </div>
        <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '1.5rem' }}>
          Confidence: {evidenceSummary.overallConfidence}%
        </p>
        <div className="flex justify-between gap-4">
          <button className="btn btn-success" onClick={handleExport}>
            <Download size={18} /> Export JSON
          </button>
          <button className="btn btn-secondary" onClick={onRestart}>
            <RotateCcw size={18} /> New Assessment
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Evidence Summary</h3>

        <div className="report-section">
          <h4 className="report-section-title">Annex III Triggers</h4>
          {evidenceSummary.annexIIITriggers.length > 0 ? (
            evidenceSummary.annexIIITriggers.map((trigger: string, i: number) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} color="#F59E0B" />
                <span>{trigger}</span>
              </div>
            ))
          ) : (
            <p style={{ color: '#6b7280' }}>No Annex III use cases triggered.</p>
          )}
        </div>

        <div className="report-section">
          <h4 className="report-section-title">Material Influence</h4>
          <p>{evidenceSummary.materialInfluenceRationale}</p>
          <div className="score-bar mt-4">
            <div
              className={`score-bar-fill ${materialInfluence?.score <= 30 ? 'green' : materialInfluence?.score <= 50 ? 'amber' : 'red'}`}
              style={{ width: `${materialInfluence?.score || 0}%` }}
            />
          </div>
          <p className="text-center" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Score: {materialInfluence?.score || 0}/100
          </p>
        </div>

        <div className="report-section">
          <h4 className="report-section-title">Profiling Status</h4>
          <div className="flex items-center gap-2">
            {profiling?.isProfiling ? (
              <>
                <XCircle size={20} color="#EF4444" />
                <span style={{ color: '#991b1b', fontWeight: 500 }}>{evidenceSummary.profilingStatus}</span>
              </>
            ) : (
              <>
                <CheckCircle size={20} color="#10B981" />
                <span style={{ color: '#065f46' }}>{evidenceSummary.profilingStatus}</span>
              </>
            )}
          </div>
        </div>

        <div className="report-section">
          <h4 className="report-section-title">Article 6(3) Filter</h4>
          <p>{evidenceSummary.article6Rationale}</p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} />
          Next Steps & Compliance Actions
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Based on Regulation (EU) 2024/1689. High-risk obligations enter into force <strong>2 August 2026</strong>.
        </p>

        {criticalSteps.length > 0 && (
          <div className="mb-4">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#991b1b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Critical Priority
            </h4>
            {criticalSteps.map((step: any, i: number) => (
              <div key={`c-${i}`} className="flex items-start gap-3 mb-3" style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                <div style={{ marginTop: '2px' }}>{roleIcon(step.role)}</div>
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{step.action}</span>
                    {priorityBadge(step.priority)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {step.article && <span style={{ fontWeight: 600 }}>{step.article}</span>}
                    {step.article && step.deadline && ' · '}
                    {step.deadline && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {step.deadline}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {highSteps.length > 0 && (
          <div className="mb-4">
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400e', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              High Priority
            </h4>
            {highSteps.map((step: any, i: number) => (
              <div key={`h-${i}`} className="flex items-start gap-3 mb-3" style={{ padding: '0.75rem', background: '#fffbeb', borderRadius: '0.5rem', border: '1px solid #fde68a' }}>
                <div style={{ marginTop: '2px' }}>{roleIcon(step.role)}</div>
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{step.action}</span>
                    {priorityBadge(step.priority)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {step.article && <span style={{ fontWeight: 600 }}>{step.article}</span>}
                    {step.article && step.deadline && ' · '}
                    {step.deadline && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {step.deadline}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {otherSteps.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Medium / Low Priority
            </h4>
            {otherSteps.map((step: any, i: number) => (
              <div key={`o-${i}`} className="flex items-start gap-3 mb-2" style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ marginTop: '2px' }}>{roleIcon(step.role)}</div>
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{step.action}</span>
                    {priorityBadge(step.priority)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.15rem' }}>
                    {step.article && <span style={{ fontWeight: 600 }}>{step.article}</span>}
                    {step.article && step.deadline && ' · '}
                    {step.deadline && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={10} /> {step.deadline}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ background: '#fefce8', border: '1px solid #fde047' }}>
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} />
          Recommendation
        </h3>
        <p style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>
          {article6Filter?.recommendation || 'Conduct further analysis to determine classification.'}
        </p>
        <p className="mt-4" style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
          Disclaimer: This report is generated by automated analysis and does not constitute legal advice.
          Always consult qualified legal counsel for definitive classification under the EU AI Act (Regulation (EU) 2024/1689).
        </p>
      </div>
    </div>
  );
}
