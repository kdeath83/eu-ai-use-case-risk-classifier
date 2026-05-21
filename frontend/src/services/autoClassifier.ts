import { SystemInput, AnnexIIIResult, MaterialInfluenceResult, ProfilingResult, Article6FilterResult } from './types';
import { classifyAnnexIII } from './annexiii';
import { scoreMaterialInfluence } from './materialInfluence';
import { detectProfiling } from './profiling';
import { evaluateArticle6Filter } from './article6filter';

/**
 * AI-Powered Use Case Classifier
 * 
 * Based on Draft Commission Guidelines on Classification of High-Risk AI Systems
 * https://digital-strategy.ec.europa.eu/en/library/draft-commission-guidelines-classification-high-risk-ai-systems
 * 
 * This classifier auto-infers system properties from free-text descriptions and applies
 * the Article 6 classification framework per the draft guidelines.
 * 
 * IMPORTANT LIMITATIONS:
 * - Human involvement does NOT change high-risk classification under Article 6(2) (para 77)
 * - This auto-detection is heuristic; definitive classification requires legal review
 * - Annex I safety components require sectoral expertise and conformity assessment verification
 * - Complex systems with split architectures must be assessed as whole per para 72
 * 
 * Entry into force (postponed via AI Omnibus):
 * - Article 6(2) + Annex III: 2 December 2027
 * - Article 6(1) + Annex I: 2 August 2028
 */

// Auto-infer system inputs from free text description
export function autoClassifyFromDescription(description: string): {
  systemInput: SystemInput;
  annexIII: AnnexIIIResult[];
  materialInfluence: MaterialInfluenceResult;
  profiling: ProfilingResult;
  article6Filter: Article6FilterResult;
} {
  const desc = description.toLowerCase();

  // Auto-detect sector based on keywords
  let targetSector: SystemInput['targetSector'] = 'none';
  const sectorKeywords: Record<string, string[]> = {
    biometrics: ['biometric', 'face recognition', 'facial', 'fingerprint', 'iris', 'retina', 'voice recognition', 'authentication'],
    critical_infrastructure: ['energy', 'water', 'gas', 'grid', 'traffic', 'transport', 'infrastructure'],
    education: ['education', 'school', 'university', 'student', 'admission', 'exam', 'grading', 'learning'],
    employment: ['employment', 'recruitment', 'hiring', 'worker', 'employee', 'performance', 'promotion', 'termination'],
    essential_services: ['credit', 'loan', 'bank', 'insurance', 'healthcare', 'mortgage', 'underwriting', 'claims', 'investment', 'superannuation', 'pension', 'financial'],
    law_enforcement: ['police', 'law enforcement', 'investigation', 'crime', 'criminal', 'detective'],
    migration: ['migration', 'asylum', 'border', 'visa', 'immigration', 'passport'],
    justice_democratic: ['justice', 'court', 'judge', 'legal', 'election', 'voting', 'democratic']
  };

  let maxSectorScore = 0;
  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    const score = keywords.filter(kw => desc.includes(kw)).length;
    if (score > maxSectorScore) {
      maxSectorScore = score;
      targetSector = sector as SystemInput['targetSector'];
    }
  }

  // Auto-detect autonomy level
  let autonomyLevel: SystemInput['autonomyLevel'] = 'medium';
  if (desc.includes('fully autonomous') || desc.includes('no human') || desc.includes('automatically')) {
    autonomyLevel = 'high';
  } else if (desc.includes('recommend') || desc.includes('suggest') || desc.includes('assist')) {
    autonomyLevel = 'medium';
  } else if (desc.includes('pure tool') || desc.includes('human decides')) {
    autonomyLevel = 'low';
  }

  // Auto-detect human oversight
  // NOTE: Per Draft Guidelines para 77, human involvement does NOT change high-risk 
  // classification under Article 6(2). Human oversight is a compliance requirement (Art 14),
  // not a classification exemption mechanism. We detect it for informational purposes only.
  const humanReview = !desc.includes('no human review') && !desc.includes('fully autonomous');
  const humanOverride = desc.includes('human can override') || desc.includes('human review') || humanReview;

  // Auto-detect personal data processing
  const personalDataProcessed = 
    desc.includes('personal') || 
    desc.includes('customer data') || 
    desc.includes('user data') ||
    desc.includes('biometric') ||
    desc.includes('identity') ||
    desc.includes('profile');

  // Extract system name from first sentence or use default
  const systemName = description.split('.')[0].slice(0, 50) || 'AI System';

  // Build inferred system input
  const systemInput: SystemInput = {
    systemName,
    description,
    intendedPurpose: description,
    targetSector,
    autonomyLevel,
    humanReview,
    humanOverride,
    personalDataProcessed,
    dataInputs: personalDataProcessed ? ['personal data', 'user inputs'] : ['system data'],
    outputs: ['recommendations', 'decisions']
  };

  // Run classification
  const annexIII = classifyAnnexIII(systemInput);
  const materialInfluence = scoreMaterialInfluence(systemInput);
  const profiling = detectProfiling(systemInput);
  const article6Filter = evaluateArticle6Filter(systemInput, materialInfluence, profiling);

  return {
    systemInput,
    annexIII,
    materialInfluence,
    profiling,
    article6Filter
  };
}

// Generate a user-friendly summary from classification results
export function generateFriendlySummary(
  annexIII: AnnexIIIResult[],
  materialInfluence: MaterialInfluenceResult,
  profiling: ProfilingResult,
  article6Filter: Article6FilterResult
): string {
  const triggeredAnnexIII = annexIII.filter(r => r.triggered);
  
  let summary = '';
  
  if (triggeredAnnexIII.length > 0) {
    summary += `🔍 **Annex III Detection**: Your use case matches "${triggeredAnnexIII[0].useCase}" `;
    summary += `with ${triggeredAnnexIII[0].confidenceScore}% confidence.\n\n`;
  }

  if (profiling.isProfiling) {
    summary += `⚠️ **Profiling Detected**: This system appears to process personal data for evaluation/assessment. `;
    summary += `GDPR Article 4 considerations apply.\n\n`;
  }

  if (materialInfluence.exceedsThreshold) {
    summary += `📊 **Material Influence**: Score ${materialInfluence.score}/100 exceeds threshold. `;
    summary += `The system materially influences decisions.\n\n`;
  } else {
    summary += `✅ **Material Influence**: Score ${materialInfluence.score}/100 below threshold. `;
    summary += `Limited material influence detected.\n\n`;
  }

  summary += `**Recommendation**: ${article6Filter.recommendation}`;

  return summary;
}
