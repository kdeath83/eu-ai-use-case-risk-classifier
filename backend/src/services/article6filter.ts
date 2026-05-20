import { SystemInput, Article6FilterResult, MaterialInfluenceResult, ProfilingResult } from '../types';

export function evaluateArticle6Filter(
  input: SystemInput,
  materialInfluence: MaterialInfluenceResult,
  profiling: ProfilingResult
): Article6FilterResult {
  const materialInfluenceExceeded = materialInfluence.exceedsThreshold;

  const combinedText = `${input.description} ${input.intendedPurpose} ${input.marketingMaterials || ''} ${input.termsOfService || ''} ${input.technicalSpecs || ''}`.toLowerCase();

  const conditions = [
    {
      id: 'c1',
      name: 'Narrow procedural task',
      description: 'The system performs a narrow, purely procedural or preparatory task',
      satisfied: input.autonomyLevel === 'none' || input.autonomyLevel === 'low',
      weight: 0.2
    },
    {
      id: 'c2',
      name: 'Improves completed human activity',
      description: 'The system substantially improves the result of a previously completed human activity',
      satisfied: input.humanReview && /improve|refine|enhance|quality assurance|ex post|previously completed|after human|post-hoc/i.test(combinedText),
      weight: 0.2
    },
    {
      id: 'c3',
      name: 'Detects decision-making patterns',
      description: 'The system detects patterns in decision-making without replacing or influencing human judgment',
      satisfied: input.autonomyLevel === 'low' && input.outputs.some(o => /pattern|trend|analysis|analytic/i.test(o)),
      weight: 0.2
    },
    {
      id: 'c4',
      name: 'Preparatory task',
      description: 'The system performs a preparatory task for an assessment relevant to the use case',
      satisfied: input.autonomyLevel === 'none' || (input.autonomyLevel === 'low' && input.humanReview),
      weight: 0.2
    },
    {
      id: 'c5',
      name: 'Human in the loop with override',
      description: 'Human meaningfully reviews and can override every decision',
      satisfied: input.humanReview && input.humanOverride,
      weight: 0.2
    }
  ];

  const satisfiedCount = conditions.filter(c => c.satisfied).length;
  const totalWeight = conditions.reduce((sum, c) => sum + (c.satisfied ? c.weight : 0), 0);

  let outcome: Article6FilterResult['outcome'];
  let rationale: string;
  let recommendation: string;

  if (profiling.absoluteRedFlag) {
    outcome = 'likely_high_risk';
    rationale = 'Absolute red flag: Profiling detected with personal data processing. Article 6(3) filter is inapplicable.';
    recommendation = 'Proceed as high-risk under Annex III. Implement full compliance obligations.';
  } else if (!materialInfluenceExceeded && satisfiedCount >= 3) {
    outcome = 'likely_exempt';
    rationale = `Material influence test NOT exceeded (score ${materialInfluence.score}). ${satisfiedCount}/5 alternative conditions satisfied (weight ${totalWeight.toFixed(1)}). System likely performs a narrow, preparatory, or human-assisted task.`;
    recommendation = 'System likely exempt from high-risk classification under Article 6(3). Document rationale and monitor for changes in use.';
  } else if (!materialInfluenceExceeded && satisfiedCount >= 1) {
    outcome = 'borderline';
    rationale = `Material influence test NOT exceeded (score ${materialInfluence.score}), but only ${satisfiedCount}/5 alternative conditions partially satisfied. Some Annex III relevance may remain.`;
    recommendation = 'Borderline case: Seek legal review. Consider registering as borderline in EU database under Article 6(4). Prepare compliance measures.';
  } else if (materialInfluenceExceeded) {
    outcome = 'likely_high_risk';
    rationale = `Material influence test EXCEEDED (score ${materialInfluence.score}). System materially influences outcomes. Article 6(3) filter does not apply.`;
    recommendation = 'Proceed as high-risk under Annex III. Implement full compliance obligations including risk management, data governance, transparency, human oversight, accuracy, and security.';
  } else {
    outcome = 'borderline';
    rationale = `Material influence test NOT exceeded (score ${materialInfluence.score}), but no alternative conditions clearly satisfied. Need further analysis of intended purpose and sector relevance.`;
    recommendation = 'Borderline case: Conduct deeper sector-specific analysis. Seek legal review before final classification.';
  }

  return {
    outcome,
    materialInfluenceExceeded,
    conditions,
    rationale,
    recommendation
  };
}
