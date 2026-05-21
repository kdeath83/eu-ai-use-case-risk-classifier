import { SystemInput, AnnexIIIResult } from './types';

/**
 * Annex III Classification Engine
 * 
 * Based on Draft Commission Guidelines on Classification of High-Risk AI Systems
 * https://digital-strategy.ec.europa.eu/en/library/draft-commission-guidelines-classification-high-risk-ai-systems
 * 
 * Key principles from guidelines:
 * - Article 6(2) + Annex III: Stand-alone AI systems posing significant risk to health, safety, fundamental rights
 * - Human involvement does NOT affect classification (para 77)
 * - Natural persons includes sole traders, self-employed, professionals (para 65)
 * - Intended purpose determined by provider in instructions, marketing, technical docs (para 10-12)
 * - Complex systems: Split architectures assessed as whole if combined outputs influence decisions (para 72)
 * - Entry into force: 2 August 2026 (postponed to 2 December 2027 via AI Omnibus) - para 448
 */

const ANNEX_III_USE_CASES: Record<string, { useCase: string; keywords: string[]; description: string }[]> = {
  biometrics: [
    { useCase: 'Remote biometric identification', keywords: ['biometric', 'face recognition', 'facial', 'fingerprint', 'iris', 'retina', 'identification', 'verification', 'authentication', 'voice recognition', 'surveillance', 'CCTV'], description: 'AI systems used for remote biometric identification of natural persons' },
    { useCase: 'Biometric categorisation', keywords: ['categorise', 'category', 'gender', 'age', 'ethnicity', 'emotion', 'mood', 'biometric'], description: 'AI systems used to categorize individuals based on biometric data' }
  ],
  critical_infrastructure: [
    { useCase: 'Management of critical infrastructure', keywords: ['critical infrastructure', 'energy', 'water', 'gas', 'supply', 'network', 'grid', 'transport', 'traffic management'], description: 'AI systems managing critical digital infrastructure, road traffic, water, gas, electricity supply' }
  ],
  education: [
    { useCase: 'Education and vocational training', keywords: ['education', 'school', 'university', 'student', 'admission', 'assessment', 'exam', 'grading', 'vocational', 'training', 'learning'], description: 'AI systems for determining access, admission, or assessment in education' }
  ],
  employment: [
    { useCase: 'Employment and workers management', keywords: ['employment', 'recruitment', 'hiring', 'worker', 'employee', 'performance', 'promotion', 'termination', 'monitoring', 'workplace'], description: 'AI systems for recruitment, selection, promotion, termination, or monitoring workers' }
  ],
  essential_services: [
    { useCase: 'Access to essential services', keywords: ['essential service', 'healthcare', 'insurance', 'credit', 'loan', 'banking', 'bank', 'emergency', 'benefit', 'social', 'housing', 'pension', 'superannuation', 'super', 'mortgage', 'underwriting', 'claims', 'investment', 'wealth management', 'retirement', 'fund', 'financing', 'lending', 'underwriter', 'actuary', 'financial services'], description: 'AI systems for access to essential private and public services and benefits' }
  ],
  law_enforcement: [
    { useCase: 'Law enforcement', keywords: ['law enforcement', 'police', 'investigation', 'crime', 'criminal', 'risk assessment', 'polygraph', 'evidence', 'detective'], description: 'AI systems used by law enforcement authorities or on their behalf' }
  ],
  migration: [
    { useCase: 'Migration and border control', keywords: ['migration', 'asylum', 'border', 'visa', 'refugee', 'immigration', 'frontier', 'passport'], description: 'AI systems for migration, asylum, and border control management' }
  ],
  justice_democratic: [
    { useCase: 'Administration of justice and democratic processes', keywords: ['justice', 'court', 'judge', 'legal', 'democratic', 'election', 'voting', 'ballot', 'poll', 'jurisdiction', 'trial'], description: 'AI systems for administration of justice and democratic processes including elections' }
  ]
};

/**
 * Annex I Safety Component Detection
 * 
 * Per Draft Guidelines Section III, Article 6(1) requires TWO cumulative conditions:
 * 1. AI system is a safety component/product under Union harmonisation legislation (Annex I)
 * 2. Product requires third-party conformity assessment
 * 
 * Safety component definition (Art 3(14)): Fulfils safety function OR failure/malfunction endangers health/safety
 * Safety functions include: monitoring hazardous conditions, detecting safety risks, preventive/corrective actions,
 * controlling safety-critical parameters, safe stop/emergency shutdown (para 41-44)
 * 
 * Note: This keyword-based detection is heuristic. Definitive classification requires sectoral expertise
 * and verification of conformity assessment requirements under relevant Union harmonisation legislation.
 */
const ANNEX_I_KEYWORDS = [
  // Products covered by Union harmonisation legislation listed in Annex I AI Act
  'machinery', 'toy', 'lift', 'elevator', 'equipment explosive atmosphere', 'atex',
  'radio equipment', 'pressure equipment', 'recreational craft', 'cableway', 
  'appliances burning gaseous fuels', 'gas appliance',
  'medical device', 'in vitro diagnostic', 'ivd',
  'automotive', 'aviation', 'aerospace', 'vehicle safety', 'car safety',
  'personal protective equipment', 'ppe',
  'construction product', 'building safety',
  // Safety component indicators
  'safety component', 'safety system', 'safety function', 'safety critical',
  'emergency stop', 'safe stop', 'safety shutdown', 'safety monitoring',
  'hazard detection', 'risk detection', 'safety control', 'safety parameter'
];

const MAX_TEXT_LENGTH = 50000;
const annexCache = new Map<string, AnnexIIIResult[]>();
const MAX_CACHE_SIZE = 100;

function clampText(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max);
}

function hashInput(input: SystemInput): string {
  return JSON.stringify({
    d: input.description,
    p: input.intendedPurpose,
    m: input.marketingMaterials,
    t: input.termsOfService,
    ts: input.technicalSpecs,
    s: input.targetSector
  });
}

export function classifyAnnexIII(input: SystemInput): AnnexIIIResult[] {
  const key = hashInput(input);
  const cached = annexCache.get(key);
  if (cached) return cached;

  if (annexCache.size >= MAX_CACHE_SIZE) {
    const first = annexCache.keys().next().value;
    if (first !== undefined) annexCache.delete(first);
  }

  const results: AnnexIIIResult[] = [];
  const rawCombined = `${input.description} ${input.intendedPurpose} ${input.marketingMaterials || ''} ${input.termsOfService || ''} ${input.technicalSpecs || ''}`;
  const combinedText = clampText(rawCombined, MAX_TEXT_LENGTH).toLowerCase();

  const sectorsToCheck = input.targetSector === 'none'
    ? Object.keys(ANNEX_III_USE_CASES)
    : [input.targetSector];

  for (const sector of sectorsToCheck) {
    const useCases = ANNEX_III_USE_CASES[sector] || [];
    for (const uc of useCases) {
      let score = 0;
      const matchedKeywords: string[] = [];

      for (const keyword of uc.keywords) {
        if (combinedText.includes(keyword.toLowerCase())) {
          score += 8;
          matchedKeywords.push(keyword);
        }
      }

      if (input.targetSector === sector) score += 25;
      score = Math.min(100, score);
      const triggered = score > 50;

      results.push({
        sector,
        useCase: uc.useCase,
        confidenceScore: score,
        triggered,
        rationale: triggered
          ? `Triggered by keywords: ${matchedKeywords.join(', ')}${input.targetSector === sector ? ' (explicit sector match)' : ''}`
          : `Low match confidence. Keywords found: ${matchedKeywords.join(', ') || 'none'}`
      });
    }
  }

  let safetyScore = 0;
  const matchedSafetyKeywords: string[] = [];
  for (const keyword of ANNEX_I_KEYWORDS) {
    if (combinedText.includes(keyword.toLowerCase())) {
      safetyScore += 15;
      matchedSafetyKeywords.push(keyword);
    }
  }
  safetyScore = Math.min(100, safetyScore);
  if (safetyScore > 0) {
    results.push({
      sector: 'annex_i',
      useCase: 'Safety Component under Annex I',
      confidenceScore: safetyScore,
      triggered: safetyScore > 50,
      rationale: safetyScore > 50
        ? `Potential Annex I safety component. Keywords: ${matchedSafetyKeywords.join(', ')}`
        : `Weak Annex I match. Keywords: ${matchedSafetyKeywords.join(', ') || 'none'}`
    });
  }

  // NOTE: Broad marketing language is NOT a classification criterion under the EU AI Act
  // or draft guidelines. Classification depends on intended purpose (Art. 6(2)), not
  // marketing breadth. The following check is advisory only — it flags potentially
  // misleading marketing but does NOT affect the classification outcome.
  const marketingText = clampText(input.marketingMaterials || '', MAX_TEXT_LENGTH).toLowerCase();
  const broadTerms = ['comprehensive', 'all-in-one', 'universal', 'every', 'any', 'all sectors', 'all industries', 'fully automated', 'end-to-end'];
  const foundBroadTerms = broadTerms.filter(t => marketingText.includes(t));
  if (foundBroadTerms.length >= 2) {
    results.push({
      sector: 'broad_marketing_advisory',
      useCase: 'Advisory: Broad marketing language detected — verify intended purpose matches actual use',
      confidenceScore: 0,
      triggered: false,
      rationale: `Broad marketing terms found (${foundBroadTerms.join(', ')}). Per draft guidelines para 77, classification depends on intended purpose, not marketing breadth. Review whether stated purpose matches actual use.`
    });
  }

  annexCache.set(key, results);
  return results;
}
