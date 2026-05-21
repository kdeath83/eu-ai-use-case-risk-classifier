import { useState, useCallback } from 'react';
import { buildReport } from '../services/report';
import { scoreMaterialInfluence } from '../services/materialInfluence';
import { detectProfiling } from '../services/profiling';
import { evaluateArticle6Filter } from '../services/article6filter';
import { classifyAnnexIII } from '../services/annexiii';
import Layout from '../components/Layout';
import ProgressIndicator from '../components/ProgressIndicator';
import SystemInputForm from '../components/SystemInputForm';
import MaterialInfluenceWizard from '../components/MaterialInfluenceWizard';
import ProfilingCheck from '../components/ProfilingCheck';
import FilterWizard from '../components/FilterWizard';
import ClassificationReport from '../components/ClassificationReport';
import type { SystemInput, MaterialInfluenceResult, ProfilingResult, Article6FilterResult, AnnexIIIResult } from '../services/types';

export default function AssessmentPage() {
  const [step, setStep] = useState(1);
  const [systemData, setSystemData] = useState<SystemInput | null>(null);
  const [annexIIIResults, setAnnexIIIResults] = useState<AnnexIIIResult[]>([]);
  const [materialInfluence, setMaterialInfluence] = useState<MaterialInfluenceResult | null>(null);
  const [profiling, setProfiling] = useState<ProfilingResult | null>(null);
  const [article6Filter, setArticle6Filter] = useState<Article6FilterResult | null>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSystemSubmit = useCallback((data: SystemInput) => {
    setSystemData(data);
    setError(null);

    // Compute all classification results deterministically from raw input
    const annexIII = classifyAnnexIII(data);
    const mi = scoreMaterialInfluence(data);
    const pr = detectProfiling(data);
    const a6 = evaluateArticle6Filter(data, mi, pr);

    setAnnexIIIResults(annexIII);
    setMaterialInfluence(mi);
    setProfiling(pr);
    setArticle6Filter(a6);
    setStep(2);
  }, []);

  const handleFilterComplete = useCallback(() => {
    if (!systemData || !materialInfluence || !profiling || !article6Filter || !annexIIIResults.length) {
      setError('Classification data is incomplete. Please restart the assessment.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const generatedReport = buildReport(systemData, annexIIIResults, materialInfluence, profiling, article6Filter);
      setReport(generatedReport);
      setStep(5);
    } catch (err: any) {
      setError(err.message || 'Failed to generate classification report');
    } finally {
      setLoading(false);
    }
  }, [systemData, annexIIIResults, materialInfluence, profiling, article6Filter]);

  const handleRestart = useCallback(() => {
    setStep(1);
    setSystemData(null);
    setAnnexIIIResults([]);
    setMaterialInfluence(null);
    setProfiling(null);
    setArticle6Filter(null);
    setReport(null);
    setError(null);
  }, []);

  return (
    <Layout>
      <ProgressIndicator currentStep={step} />

      {error && (
        <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca', marginBottom: '1.5rem' }}>
          <p style={{ color: '#991b1b', margin: 0 }}><strong>Error:</strong> {error}</p>
        </div>
      )}

      {loading && (
        <div className="card text-center">
          <p>Generating classification report...</p>
        </div>
      )}

      {!loading && step === 1 && (
        <SystemInputForm onSubmit={handleSystemSubmit} initialData={systemData} />
      )}

      {!loading && step === 2 && materialInfluence && (
        <MaterialInfluenceWizard
          materialInfluence={materialInfluence}
          onComplete={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {!loading && step === 3 && profiling && systemData && (
        <ProfilingCheck
          systemData={systemData}
          profiling={profiling}
          onComplete={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {!loading && step === 4 && materialInfluence && profiling && article6Filter && (
        <FilterWizard
          materialInfluence={materialInfluence}
          profiling={profiling}
          article6Filter={article6Filter}
          onComplete={handleFilterComplete}
          onBack={() => setStep(3)}
        />
      )}

      {!loading && step === 5 && report && (
        <ClassificationReport report={report} onRestart={handleRestart} />
      )}
    </Layout>
  );
}
