import { SystemInput, Article6FilterResult, MaterialInfluenceResult, ProfilingResult } from './types';

/**
 * Article 6(3) Filter Assessment
 * 
 * Based on Draft Commission Guidelines on Classification of High-Risk AI Systems
 * https://digital-strategy.ec.europa.eu/en/library/draft-commission-guidelines-classification-high-risk-ai-systems
 * 
 * Key principles from guidelines:
 * - Human involvement does NOT change high-risk classification under Article 6(2) (para 77)
 * - Filter applies only to Article 6(2) systems, not Article 6(1) (para 87)
 * - Conditions are alternative (any one can apply) but must be interpreted narrowly (para 88)
 * - Profiling systems are ALWAYS high-risk (para 89) - cannot benefit from filter
 * - System must not materially influence outcome (para 88)
 * - Complex systems where combined outputs influence decisions cannot use filter (para 90)
 */

export function evaluateArticle6Filter(
  input: SystemInput,
  materialInfluence: MaterialInfluenceResult,
  profiling: ProfilingResult
): Article6FilterResult {
  const materialInfluenceExceeded = materialInfluence.exceedsThreshold;
  const combinedText = `${input.description} ${input.intendedPurpose} ${input.marketingMaterials || ''} ${input.termsOfService || ''} ${input.technicalSpecs || ''}`.toLowerCase();

  // Per guidelines para 88: Conditions (a)-(d) are alternative - any one can exempt
  // But they must be interpreted narrowly as they are exceptions to fundamental rights protections
  const conditions = [
    { 
      id: 'c1', 
      name: 'Narrow procedural task', 
      description: 'AI system intended to perform a narrow procedural task (Art 6(3)(a)) - e.g., transform unstructured to structured data, classify documents, detect duplicates',
      // Examples from guidelines para 91-92: categorise, change format, detect duplicates, data entry, simple search
      satisfied: input.autonomyLevel === 'none' || input.autonomyLevel === 'low' && /\b(categorize|categorise|classify|format|convert|transform|duplicate|data entry|search|index|sort|filter)\b/i.test(combinedText),
      weight: 0.25 
    },
    { 
      id: 'c2', 
      name: 'Improves completed human activity', 
      description: 'AI system intended to improve result of previously completed human activity (Art 6(3)(b))',
      // Must be AFTER human completes activity, not concurrent or before
      satisfied: /\b(improve|refine|enhance|correct|quality check|post-process|after|previously completed|ex post|human first|manual review first)\b/i.test(combinedText),
      weight: 0.25 
    },
    { 
      id: 'c3', 
      name: 'Detects decision-making patterns', 
      description: 'AI system detects patterns/deviations without replacing or influencing human assessment, without proper human review (Art 6(3)(c))',
      // Key: NOT meant to replace or influence human assessment + human review required
      satisfied: input.autonomyLevel === 'low' && 
                 /\b(pattern|trend|anomaly|deviation|monitor|detect|flag|alert|highlight)\b/i.test(combinedText) &&
                 !/\b(replace|override|bypass|ignore human|automate decision|final decision)\b/i.test(combinedText),
      weight: 0.25 
    },
    { 
      id: 'c4', 
      name: 'Preparatory task', 
      description: 'AI system performs preparatory task to an assessment (Art 6(3)(d)) - e.g., gathering information, initial screening',
      // Must be BEFORE the main assessment, not the assessment itself
      satisfied: input.autonomyLevel === 'none' || (input.autonomyLevel === 'low' && 
                 /\b(gather|collect|prepare|initial|preliminary|screen|triage|before|prior to|input for)\b/i.test(combinedText)),
      weight: 0.25 
    }
    // REMOVED: Human oversight as filter condition - per guidelines para 77, human involvement
    // does NOT change high-risk classification under Article 6(2). Human oversight is a compliance
    // requirement (Art 14), not a classification exemption mechanism.
  ];

  const satisfiedConditions = conditions.filter(c => c.satisfied);
  const satisfiedCount = satisfiedConditions.length;

  let outcome: Article6FilterResult['outcome'];
  let rationale: string;
  let recommendation: string;

  // Per guidelines para 89: Profiling systems are ALWAYS high-risk - filter inapplicable
  if (profiling.absoluteRedFlag || profiling.isProfiling) {
    outcome = 'likely_high_risk';
    rationale = 'Profiling detected (Art 6(3) third sub-paragraph): Systems performing profiling within GDPR meaning are ALWAYS high-risk. Filter mechanism inapplicable.';
    recommendation = 'Proceed as high-risk under Annex III. Implement full compliance obligations including risk management, data governance, transparency, human oversight, accuracy, and security. Reference: Draft Guidelines para 89.';
  } 
  // Per guidelines para 88: Must not materially influence outcome for filter to apply
  else if (materialInfluenceExceeded) {
    outcome = 'likely_high_risk';
    rationale = `Material influence EXCEEDED (score ${materialInfluence.score}/100). Per Art 6(3) first sub-paragraph, system must not materially influence decision outcome for filter to apply.`;
    recommendation = 'Proceed as high-risk under Annex III. Implement full compliance obligations. Reference: Draft Guidelines para 88.';
  } 
  // Per guidelines para 88: Any one condition (a)-(d) can exempt if material influence not exceeded
  else if (satisfiedCount >= 1) {
    const conditionNames = satisfiedConditions.map(c => c.name).join(', ');
    outcome = 'likely_exempt';
    rationale = `Material influence NOT exceeded (score ${materialInfluence.score}/100). Filter condition(s) satisfied: ${conditionNames}. Per Art 6(3), conditions are alternative - any one can exempt.`;
    recommendation = 'System likely exempt from high-risk classification under Article 6(3). Document self-assessment rationale, register in EU database if required under Art 6(4), and monitor for changes in use. Reference: Draft Guidelines para 88.';
  } 
  else {
    outcome = 'borderline';
    rationale = `Material influence NOT exceeded (score ${materialInfluence.score}/100), but no Article 6(3) filter conditions clearly satisfied. System may still pose significant risk.`;
    recommendation = 'Borderline case: Seek legal review. Consider registering in EU database under Article 6(4). Prepare compliance measures given proximity to high-risk threshold. Reference: Draft Guidelines Section 2.7.';
  }

  return { outcome, materialInfluenceExceeded, conditions, rationale, recommendation };
}
