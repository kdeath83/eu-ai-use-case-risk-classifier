import { SystemInput, AnnexIIIResult } from './types';

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
    { useCase: 'Access to essential services', keywords: ['essential service', 'healthcare', 'insurance', 'credit', 'loan', 'banking', 'emergency', 'benefit', 'social', 'housing'], description: 'AI systems for access to essential private and public services and benefits' }
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

const ANNEX_I_KEYWORDS = [
  'safety component', 'safety system', 'machinery safety', 'toy safety', 'medical device',
  'radio equipment', 'pressure equipment', 'cableway', 'personal protective', 'construction product'
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
