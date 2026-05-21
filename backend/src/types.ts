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

export type AutonomyLevel = 'none' | 'low' | 'medium' | 'high' | 'full';

export interface SystemInput {
  systemName: string;
  description: string;
  intendedPurpose: string;
  marketingMaterials?: string;
  termsOfService?: string;
  technicalSpecs?: string;
  targetSector: Sector;
  autonomyLevel: AutonomyLevel;
  humanReview: boolean;
  humanOverride: boolean;
  personalDataProcessed: boolean;
  dataInputs: string[];
  outputs: string[];
}

export interface AnnexIIIResult {
  sector: string;
  useCase: string;
  confidenceScore: number;
  triggered: boolean;
  rationale: string;
}

export interface MaterialInfluenceAnswers {
  autonomousDecisions: boolean;
  humanReviews: boolean;
  humanOverrides: boolean;
  systemInitiatesActions: boolean;
  outcomesBinding: boolean;
}

export interface MaterialInfluenceResult {
  score: number;
  threshold: number;
  exceedsThreshold: boolean;
  answers: MaterialInfluenceAnswers;
  rationale: string;
}

export interface ProfilingResult {
  isProfiling: boolean;
  redFlags: string[];
  gdprArticle4Match: boolean;
  absoluteRedFlag: boolean;
  details: string;
}

export interface Article6FilterCondition {
  id: string;
  name: string;
  description: string;
  satisfied: boolean;
  weight: number;
}

export interface Article6FilterResult {
  outcome: 'likely_exempt' | 'borderline' | 'likely_high_risk';
  materialInfluenceExceeded: boolean;
  conditions: Article6FilterCondition[];
  rationale: string;
  recommendation: string;
}

export interface NextStep {
  action: string;
  article?: string;
  deadline?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  role: 'provider' | 'deployer' | 'both' | 'any';
  applicable: boolean;
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
  evidenceSummary: {
    annexIIITriggers: string[];
    materialInfluenceRationale: string;
    profilingStatus: string;
    article6Rationale: string;
    overallConfidence: number;
  };
  nextSteps: NextStep[];
  exportJson: any;
}
