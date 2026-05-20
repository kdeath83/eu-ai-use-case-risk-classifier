import { SystemInput, MaterialInfluenceResult, MaterialInfluenceAnswers } from '../types';
import { LruCache } from './cache';

const MAX_ARRAY_SCAN = 50;
const miCache = new LruCache<string, MaterialInfluenceResult>(500);

function clampArray<T>(arr: T[], max: number): T[] {
  return arr.length > max ? arr.slice(0, max) : arr;
}

export function scoreMaterialInfluence(input: SystemInput): MaterialInfluenceResult {
  const key = JSON.stringify({ a: input.autonomyLevel, h: input.humanReview, o: input.humanOverride, d: input.dataInputs.length, out: input.outputs.length });
  const cached = miCache.get(key);
  if (cached) return cached;

  const answers: MaterialInfluenceAnswers = {
    autonomousDecisions: input.autonomyLevel === 'high' || input.autonomyLevel === 'full',
    humanReviews: input.humanReview,
    humanOverrides: input.humanOverride,
    systemInitiatesActions: input.autonomyLevel === 'medium' || input.autonomyLevel === 'high' || input.autonomyLevel === 'full',
    outcomesBinding: input.autonomyLevel === 'full' && !input.humanOverride
  };

  let score = 0;
  const rationaleParts: string[] = [];

  const autonomyScores: Record<string, number> = {
    none: 0,
    low: 10,
    medium: 35,
    high: 70,
    full: 90
  };
  score += autonomyScores[input.autonomyLevel] || 0;
  rationaleParts.push(`Autonomy level (${input.autonomyLevel}): +${autonomyScores[input.autonomyLevel] || 0} points`);

  if (input.humanReview) {
    score -= 15;
    rationaleParts.push('Human review present: -15 points');
  } else {
    rationaleParts.push('No human review: +0 (already factored in autonomy)');
  }

  if (input.humanOverride) {
    score -= 25;
    rationaleParts.push('Human override capability: -25 points');
  } else {
    score += 10;
    rationaleParts.push('Absence of human override capability: +10 points (system outputs are binding)');
  }

  const dataInputs = clampArray(input.dataInputs, MAX_ARRAY_SCAN);
  const outputs = clampArray(input.outputs, MAX_ARRAY_SCAN);

  const sensitiveInputs = dataInputs.some(di =>
    /biometric|personal|health|financial|criminal|behavior|location/i.test(di)
  );
  if (sensitiveInputs) {
    score += 10;
    rationaleParts.push('Sensitive data inputs detected: +10 points');
  }

  const bindingOutputs = outputs.some(o =>
    /decision|approval|denial|score|rating|classification|determination/i.test(o)
  );
  if (bindingOutputs) {
    score += 10;
    rationaleParts.push('Binding outcome outputs detected: +10 points');
  }

  score = Math.max(0, Math.min(100, score));

  const threshold = 50;
  const exceedsThreshold = score > threshold;

  const result: MaterialInfluenceResult = {
    score,
    threshold,
    exceedsThreshold,
    answers,
    rationale: rationaleParts.join('. ') + `. Final score: ${score}/100.`
  };

  miCache.set(key, result);
  return result;
}
