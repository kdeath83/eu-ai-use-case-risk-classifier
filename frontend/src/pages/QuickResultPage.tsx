import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { autoClassifyFromDescription, generateFriendlySummary } from '../services/autoClassifier';
import { buildReport } from '../services/report';
import Layout from '../components/Layout';
import { Download, RotateCcw, AlertTriangle, CheckCircle, XCircle, Shield, Scale, User, FileText, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export default function QuickResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const description = (location.state as any)?.description || '';
  const [showDetails, setShowDetails] = useState(false);

  const results = useMemo(() => {
    if (!description) return null;
    return autoClassifyFromDescription(description);
  }, [description]);

  const report = useMemo(() => {
    if (!results) return null;
    return buildReport(
      results.systemInput,
      results.annexIII,
      results.materialInfluence,
      results.profiling,
      results.article6Filter
    );
  }, [results]);

  const friendlySummary = useMemo(() => {
    if (!results) return '';
    return generateFriendlySummary(
      results.annexIII,
      results.materialInfluence,
      results.profiling,
      results.article6Filter
    );
  }, [results]);

  if (!description || !results || !report) {
    return (
      <Layout>
        <div className="card text-center" style={{ padding: '4rem' }}>
          <p style={{ color: '#888', marginBottom: '1.5rem' }}>No use case description provided.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Start New Assessment</button>
        </div>
      </Layout>
    );
  }

  const { overallClassification, evidenceSummary, nextSteps } = report;
  const { annexIII, materialInfluence, profiling, article6Filter } = results;

  const triggeredAnnexIII = annexIII.filter(r => r.triggered);

  const getBadge = () => {
    if (overallClassification === 'high-risk') {
      return { class: 'badge-red', text: 'HIGH-RISK', icon: <AlertTriangle size={20} />, color: '#ff3333' };
    }
    if (overallClassification === 'not-high-risk') {
      return { class: 'badge-green', text: 'NOT HIGH-RISK', icon: <CheckCircle size={20} />, color: '#00ff88' };
    }
    return { class: 'badge-amber', text: 'BORDERLINE', icon: <Scale size={20} />, color: '#ffb800' };
  };

  const badge = getBadge();

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(report.exportJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-risk-report-${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applicableSteps = nextSteps?.filter((s: any) => s.applicable) || [];

  return (
    <Layout>
      {/* Main Result Card */}
      <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Shield size={64} color={badge.color} style={{ filter: `drop-shadow(0 0 20px ${badge.color}40)` }} />
        </div>

        <div className={`badge ${badge.class}`} style={{ fontSize: '1.5rem', padding: '1rem 2rem', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
          {badge.icon}
          {badge.text}
        </div>

        <p style={{ fontSize: '1.25rem', color: '#888', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Confidence: {evidenceSummary.overallConfidence}%
        </p>

        <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '1rem' }}>
          Based on <a href="https://digital-strategy.ec.europa.eu/en/library/draft-commission-guidelines-classification-high-risk-ai-systems" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff' }}>Draft Commission Guidelines on Classification of High-Risk AI Systems</a>
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={18} /> Export Report
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            <RotateCcw size={18} /> New Assessment
          </button>
        </div>
      </div>

      {/* AI Summary */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-title">
          <FileText size={20} color="#00d4ff" />
          Classification Summary
        </div>
        <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: '#e0e0e0' }}>
          {friendlySummary}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="main-grid" style={{ marginBottom: '2rem' }}>
        {/* Annex III */}
        <div className={`card ${triggeredAnnexIII.length > 0 ? 'alert-panel' : 'success-panel'}`}>
          <div className="card-title">
            <AlertTriangle size={18} color={triggeredAnnexIII.length > 0 ? '#ff3333' : '#00ff88'} />
            Annex III Triggers
          </div>
          {triggeredAnnexIII.length > 0 ? (
            triggeredAnnexIII.map((trigger, i) => (
              <div key={i} className="checklist-item fail" style={{ marginBottom: '0.5rem' }}>
                <XCircle size={16} color="#ff3333" />
                <span>{trigger.useCase} ({trigger.confidenceScore}%)</span>
              </div>
            ))
          ) : (
            <div className="checklist-item pass">
              <CheckCircle size={16} color="#00ff88" />
              <span>No Annex III use cases triggered</span>
            </div>
          )}
        </div>

        {/* Material Influence */}
        <div className={`card ${materialInfluence.exceedsThreshold ? 'warning-panel' : 'success-panel'}`}>
          <div className="card-title">
            <Scale size={18} color={materialInfluence.exceedsThreshold ? '#ffb800' : '#00ff88'} />
            Material Influence
          </div>
          <div className="metric-large" style={{ margin: '1rem 0' }}>
            <span className="value" style={{ fontSize: '2.5rem' }}>{materialInfluence.score}</span>
            <span className="unit">/100</span>
          </div>
          <div className="score-bar" style={{ marginBottom: '1rem' }}>
            <div
              className={`score-bar-fill ${materialInfluence.score <= 30 ? 'green' : materialInfluence.score <= 50 ? 'amber' : 'red'}`}
              style={{ width: `${materialInfluence.score}%` }}
            />
          </div>
          <p style={{ fontSize: '0.875rem', color: '#888' }}>
            {materialInfluence.exceedsThreshold ? 'Exceeds threshold - material influence detected' : 'Below threshold - limited influence'}
          </p>
        </div>

        {/* Profiling */}
        <div className={`card ${profiling.isProfiling ? 'warning-panel' : 'success-panel'}`}>
          <div className="card-title">
            <User size={18} color={profiling.isProfiling ? '#ffb800' : '#00ff88'} />
            Profiling Check
          </div>
          {profiling.isProfiling ? (
            <>
              <div className="checklist-item fail">
                <AlertTriangle size={16} color="#ffb800" />
                <span>Profiling detected</span>
              </div>
              {profiling.redFlags.length > 0 && (
                <p style={{ fontSize: '0.875rem', color: '#888', marginTop: '0.5rem' }}>
                  Flags: {profiling.redFlags.join(', ')}
                </p>
              )}
            </>
          ) : (
            <div className="checklist-item pass">
              <CheckCircle size={16} color="#00ff88" />
              <span>No profiling detected</span>
            </div>
          )}
        </div>

        {/* Article 6 Filter */}
        <div className={`card ${article6Filter.outcome === 'likely_high_risk' ? 'alert-panel' : article6Filter.outcome === 'borderline' ? 'warning-panel' : 'success-panel'}`}>
          <div className="card-title">
            <Shield size={18} color={article6Filter.outcome === 'likely_high_risk' ? '#ff3333' : article6Filter.outcome === 'borderline' ? '#ffb800' : '#00ff88'} />
            Article 6(3) Filter
          </div>
          <p style={{ marginBottom: '1rem', color: '#e0e0e0' }}>
            {article6Filter.rationale}
          </p>
          <div className={`badge ${article6Filter.outcome === 'likely_high_risk' ? 'badge-red' : article6Filter.outcome === 'borderline' ? 'badge-amber' : 'badge-green'}`}>
            {article6Filter.outcome.replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {applicableSteps.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-title">
            <ArrowRight size={20} color="#00d4ff" />
            Recommended Next Steps
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {applicableSteps.slice(0, 5).map((step: any, i: number) => (
              <div key={i} className="checklist-item" style={{ borderLeft: `3px solid ${step.priority === 'critical' ? '#ff3333' : step.priority === 'high' ? '#ffb800' : '#00d4ff'}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: step.priority === 'critical' ? '#ff3333' : step.priority === 'high' ? '#ffb800' : '#888' }}>
                      {step.priority}
                    </span>
                    {step.article && (
                      <span style={{ fontSize: '0.75rem', color: '#00d4ff' }}>Art. {step.article}</span>
                    )}
                  </div>
                  <p style={{ margin: 0, color: '#e0e0e0' }}>{step.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entry into Force Notice */}
      <div className="card" style={{ marginBottom: '2rem', borderColor: '#ff6b35' }}>
        <div className="card-title" style={{ color: '#ff6b35' }}>
          <AlertTriangle size={20} color="#ff6b35" />
          Entry into Force (AI Omnibus)
        </div>
        <p style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.75rem' }}>
          Per Draft Guidelines para 448, high-risk obligations apply from:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ color: '#e0e0e0', fontWeight: 600, marginBottom: '0.25rem' }}>Article 6(2) + Annex III</p>
            <p style={{ color: '#888', fontSize: '0.875rem' }}>2 December 2027</p>
          </div>
          <div>
            <p style={{ color: '#e0e0e0', fontWeight: 600, marginBottom: '0.25rem' }}>Article 6(1) + Annex I</p>
            <p style={{ color: '#888', fontSize: '0.875rem' }}>2 August 2028</p>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '1rem' }}>
          Reference: <a href="https://digital-strategy.ec.europa.eu/en/library/draft-commission-guidelines-classification-high-risk-ai-systems" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff' }}>Draft Commission Guidelines para 448</a>
        </p>
      </div>

      {/* Expandable Details */}
      <div className="card">
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{ width: '100%', background: 'transparent', border: 'none', color: '#e0e0e0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}
        >
          <span className="card-title" style={{ margin: 0 }}>
            <FileText size={20} color="#00d4ff" />
            Full Technical Details
          </span>
          {showDetails ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
        </button>

        {showDetails && (
          <div style={{ marginTop: '1.5rem' }}>
            <div className="report-section">
              <h4 className="report-section-title">Inferred System Properties</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Detected Sector</p>
                  <p style={{ color: '#e0e0e0', textTransform: 'capitalize' }}>{results.systemInput.targetSector.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Autonomy Level</p>
                  <p style={{ color: '#e0e0e0', textTransform: 'capitalize' }}>{results.systemInput.autonomyLevel}</p>
                </div>
                <div>
                  <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Human Review</p>
                  <p style={{ color: '#e0e0e0' }}>{results.systemInput.humanReview ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Personal Data</p>
                  <p style={{ color: '#e0e0e0' }}>{results.systemInput.personalDataProcessed ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <div className="report-section">
              <h4 className="report-section-title">Original Description</h4>
              <p style={{ color: '#888', fontSize: '0.875rem', lineHeight: '1.6' }}>{description}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
