import { ClassificationReport, SystemInput, AnnexIIIResult, MaterialInfluenceResult, ProfilingResult, Article6FilterResult } from '../types';
import { classifyAnnexIII } from './annexiii';
import { scoreMaterialInfluence } from './materialInfluence';
import { detectProfiling } from './profiling';
import { evaluateArticle6Filter } from './article6filter';
import { v4 as uuidv4 } from 'uuid';

function isFriaApplicable(sector: string, isProfiling: boolean): boolean {
  const friaSectors = ['essential_services', 'law_enforcement', 'migration', 'justice_democratic'];
  return friaSectors.includes(sector) || isProfiling;
}

function getNextSteps(
  classification: ClassificationReport['overallClassification'],
  sector: string,
  isProfiling: boolean,
  materialInfluenceExceeded: boolean
): import('../types').NextStep[] {
  const HIGH_RISK_DEADLINE = '2 August 2026';
  const FRIA_APPLICABLE = isFriaApplicable(sector, isProfiling);

  const providerHighRisk: import('../types').NextStep[] = [
    { action: 'Establish risk management system (continuous, lifecycle-long)', article: 'Art. 9', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Implement data governance and management practices for training/validation/testing data', article: 'Art. 10', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Draw up technical documentation (pre-market, kept up-to-date)', article: 'Art. 11', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Enable automatic logging/record-keeping over system lifetime', article: 'Art. 12', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Draft instructions for use with accuracy, limitations, cybersecurity info', article: 'Art. 13', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Design human oversight measures built into the system', article: 'Art. 14', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Validate accuracy, robustness, and cybersecurity', article: 'Art. 15', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Establish quality management system (regulatory compliance, design control, risk management, post-market monitoring)', article: 'Art. 17', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Keep documentation available to authorities for 10 years post-market', article: 'Art. 18', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Retain automatically generated logs for at least 6 months', article: 'Art. 19', deadline: HIGH_RISK_DEADLINE, priority: 'high', role: 'provider', applicable: true },
    { action: 'Appoint authorized representative in EU (if provider established outside EU)', article: 'Art. 22', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Register system in EU database before placing on market', article: 'Art. 49(1)', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Draw up EU Declaration of Conformity (machine-readable, keep 10 years)', article: 'Art. 47', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Affix CE marking (visible, legible, indelible; digital for digital systems)', article: 'Art. 48', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Undergo conformity assessment: internal control (Annex VI) or with notified body (Annex VII)', article: 'Art. 43', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'provider', applicable: true },
    { action: 'Establish post-market monitoring system (Commission template due 2 Feb 2026)', article: 'Art. 72', deadline: '2 February 2026 (template)', priority: 'high', role: 'provider', applicable: true },
    { action: 'Set up serious incident reporting procedure (15 days standard, 2 days widespread, immediate for death)', article: 'Art. 73', deadline: HIGH_RISK_DEADLINE, priority: 'high', role: 'provider', applicable: true },
  ];

  const deployerHighRisk: import('../types').NextStep[] = [
    { action: 'Use system in accordance with instructions for use', article: 'Art. 26(1)', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'deployer', applicable: true },
    { action: 'Assign human oversight to competent, trained personnel with authority', article: 'Art. 26(2)', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'deployer', applicable: true },
    { action: 'Ensure input data is relevant and sufficiently representative', article: 'Art. 26(4)', deadline: HIGH_RISK_DEADLINE, priority: 'high', role: 'deployer', applicable: true },
    { action: 'Monitor operation and inform provider of risks; suspend use if risk identified', article: 'Art. 26(5)', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'deployer', applicable: true },
    { action: 'Keep automatically generated logs for at least 6 months', article: 'Art. 26(6)', deadline: HIGH_RISK_DEADLINE, priority: 'high', role: 'deployer', applicable: true },
    { action: 'Inform workers\' representatives and affected workers before workplace use', article: 'Art. 26(7)', deadline: HIGH_RISK_DEADLINE, priority: 'medium', role: 'deployer', applicable: true },
    { action: 'Verify system is registered in EU database before use (public authority deployers must also register)', article: 'Art. 26(8) + Art. 49', deadline: HIGH_RISK_DEADLINE, priority: 'critical', role: 'deployer', applicable: true },
    { action: 'Use provider information (Art. 13) to comply with GDPR data protection impact assessment', article: 'Art. 26(9)', deadline: HIGH_RISK_DEADLINE, priority: 'high', role: 'deployer', applicable: true },
    { action: 'Ensure AI literacy of staff dealing with operation and use of AI systems', article: 'Art. 4', deadline: 'Already in force (2 Feb 2025)', priority: 'high', role: 'both', applicable: true },
    { action: 'Conduct fundamental rights impact assessment (public bodies, public service providers, insurance/credit systems)', article: 'Art. 27', deadline: HIGH_RISK_DEADLINE, priority: FRIA_APPLICABLE ? 'critical' : 'low', role: 'deployer', applicable: FRIA_APPLICABLE },
  ];

  const notHighRisk: import('../types').NextStep[] = [
    { action: 'Document assessment that system is not high-risk (before placing on market)', article: 'Art. 6(4)', deadline: 'Before placing on market', priority: 'critical', role: 'provider', applicable: true },
    { action: 'Register system in EU database (even if not high-risk)', article: 'Art. 49(2)', deadline: 'Before placing on market', priority: 'critical', role: 'provider', applicable: true },
    { action: 'Ensure AI literacy of staff dealing with operation and use of AI systems', article: 'Art. 4', deadline: 'Already in force (2 Feb 2025)', priority: 'high', role: 'both', applicable: true },
    { action: 'If generating synthetic content: mark outputs as artificially generated/manipulated', article: 'Art. 50(2)', deadline: '2 August 2026', priority: 'high', role: 'provider', applicable: true },
    { action: 'Consider voluntary codes of conduct applying Section 2 requirements', article: 'Art. 95', deadline: 'Ongoing', priority: 'low', role: 'any', applicable: true },
    { action: 'Monitor for changes in intended purpose or sector that could trigger high-risk classification', article: 'Best practice', deadline: '6-month review recommended', priority: 'medium', role: 'both', applicable: true },
  ];

  const borderline: import('../types').NextStep[] = [
    { action: 'Document assessment rigorously with legal counsel', article: 'Art. 6(4)', deadline: 'Before placing on market', priority: 'critical', role: 'provider', applicable: true },
    { action: 'Register in EU database under Art. 49(2)', article: 'Art. 49(2)', deadline: 'Before placing on market', priority: 'critical', role: 'provider', applicable: true },
    { action: 'Seek formal legal review before finalizing classification', article: 'Best practice', deadline: 'Before placing on market', priority: 'critical', role: 'both', applicable: true },
    { action: 'Prepare risk management and data governance documentation in parallel', article: 'Risk mitigation', deadline: 'Ongoing', priority: 'high', role: 'provider', applicable: true },
    { action: 'Monitor Commission draft guidelines and updates', article: 'Art. 6(5)', deadline: 'Ongoing', priority: 'medium', role: 'both', applicable: true },
    { action: 'Set 3-month re-review date to reassess classification', article: 'Best practice', deadline: '3 months from assessment', priority: 'medium', role: 'both', applicable: true },
    { action: 'Ensure AI literacy of staff', article: 'Art. 4', deadline: 'Already in force (2 Feb 2025)', priority: 'high', role: 'both', applicable: true },
  ];

  if (classification === 'high-risk') {
    return [...providerHighRisk, ...deployerHighRisk];
  }
  if (classification === 'not-high-risk') {
    return notHighRisk;
  }
  return borderline;
}

export function generateClassificationReport(input: SystemInput): ClassificationReport {
  const annexIIIResults = classifyAnnexIII(input);
  const materialInfluence = scoreMaterialInfluence(input);
  const profiling = detectProfiling(input);
  const article6Filter = evaluateArticle6Filter(input, materialInfluence, profiling);

  // Determine overall classification
  let overallClassification: ClassificationReport['overallClassification'];
  let overallConfidence = 0;

  const anyAnnexIIITriggered = annexIIIResults.some(r => r.triggered && r.sector !== 'broad_marketing');
  const broadMarketingTriggered = annexIIIResults.some(r => r.sector === 'broad_marketing' && r.triggered);

  if (profiling.absoluteRedFlag || (anyAnnexIIITriggered && article6Filter.outcome === 'likely_high_risk')) {
    overallClassification = 'high-risk';
    overallConfidence = 85;
  } else if (broadMarketingTriggered && article6Filter.materialInfluenceExceeded) {
    overallClassification = 'high-risk';
    overallConfidence = 75;
  } else if (article6Filter.outcome === 'likely_high_risk') {
    overallClassification = 'high-risk';
    overallConfidence = 70;
  } else if (article6Filter.outcome === 'likely_exempt' && !anyAnnexIIITriggered) {
    overallClassification = 'not-high-risk';
    overallConfidence = 70;
  } else if (article6Filter.outcome === 'likely_exempt' && anyAnnexIIITriggered) {
    overallClassification = 'borderline';
    overallConfidence = 55;
  } else {
    overallClassification = 'borderline';
    overallConfidence = 50;
  }

  const evidenceSummary = {
    annexIIITriggers: annexIIIResults.filter(r => r.triggered).map(r => `${r.sector}: ${r.useCase} (${r.confidenceScore}%)`),
    materialInfluenceRationale: materialInfluence.rationale,
    profilingStatus: profiling.isProfiling ? `Profiling detected: ${profiling.redFlags.join(', ')}` : 'No profiling detected',
    article6Rationale: article6Filter.rationale,
    overallConfidence
  };

  const nextSteps = getNextSteps(overallClassification, input.targetSector, profiling.isProfiling, materialInfluence.exceedsThreshold);

  const exportJson = {
    reportId: uuidv4(),
    generatedAt: new Date().toISOString(),
    euAiActReference: 'Regulation (EU) 2024/1689',
    systemName: input.systemName,
    classification: overallClassification,
    confidence: overallConfidence,
    annexIII: annexIIIResults,
    materialInfluenceScore: materialInfluence.score,
    profilingDetected: profiling.isProfiling,
    article6FilterOutcome: article6Filter.outcome,
    evidenceSummary,
    nextSteps,
    legalDisclaimer: 'This report is generated by automated analysis and does not constitute legal advice. Always consult qualified legal counsel for definitive classification under the EU AI Act (Regulation (EU) 2024/1689).'
  };

  return {
    id: exportJson.reportId,
    timestamp: exportJson.generatedAt,
    systemInput: input,
    overallClassification,
    annexIIIResults,
    materialInfluence,
    profiling,
    article6Filter,
    evidenceSummary,
    nextSteps,
    exportJson
  };
}
