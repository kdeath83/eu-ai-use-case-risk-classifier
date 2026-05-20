export interface SystemInput {
  id?: string;
  systemName: string;
  description: string;
  intendedPurpose: string;
  marketingMaterials?: string;
  termsOfService?: string;
  autonomyLevel: 'none' | 'low' | 'medium' | 'high' | 'full';
  dataInputs: string[];
  outputs: string[];
  targetSector: Sector;
  humanReview: boolean;
  humanOverride: boolean;
  personalDataProcessed: boolean;
}

export type Sector =
  | 'biometrics'
  | 'critical_infrastructure'
  | 'education'
  | 'employment'
  | 'essential_services'
  | 'law_enforcement'
  | 'migration'
  | 'justice_democratic'
  | 'none';

export interface AnnexIIIResult {
  sector: string;
  useCase: string;
  confidenceScore: number; // 0-100
  triggered: boolean;
  rationale: string;
}

export interface MaterialInfluenceResult {
  score: number; // 0-100
  threshold: number;
  exceedsThreshold: boolean;
  answers: MaterialInfluenceAnswers;
  rationale: string;
}

export interface MaterialInfluenceAnswers {
  autonomousDecisions: boolean;
  humanReviews: boolean;
  humanOverrides: boolean;
  systemInitiatesActions: boolean;
  outcomesBinding: boolean;
}

export interface ProfilingResult {
  isProfiling: boolean;
  redFlags: string[];
  gdprArticle4Match: boolean;
  absoluteRedFlag: boolean; // if true, filter inapplicable
  details: string;
}

export interface Article6FilterResult {
  outcome: 'likely_exempt' | 'borderline' | 'likely_high_risk';
  gatekeeperPassed: boolean; // material influence
  conditions: FilterCondition[];
  rationale: string;
  recommendation: string;
}

export interface FilterCondition {
  id: string;
  name: string;
  description: string;
  satisfied: boolean;
  weight: number;
}

export interface ClassificationReport {
  id: string;
  timestamp: string;
  systemInput: SystemInput;
  overallClassification: 'high-risk' | 'not-high-risk' | 'borderline';
  annexIIIResults: AnnexIIIResult[];
  materialInfluence: MaterialInfluenceResult;
  profiling: ProfilingResult;
  article6Filter: Article6FilterResult;
  evidenceSummary: EvidenceSummary;
  exportJson: object;
}

export interface EvidenceSummary {
  annexIIITriggers: string[];
  materialInfluenceRationale: string;
  profilingStatus: string;
  article6Rationale: string;
  overallConfidence: number;
}
