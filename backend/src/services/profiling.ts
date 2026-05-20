import { SystemInput, ProfilingResult } from '../types';
import { LruCache } from './cache';

const MAX_ARRAY_SCAN = 50;
const MAX_TEXT_LENGTH = 50000;
const profilingCache = new LruCache<string, ProfilingResult>(500);

const PROFILING_INDICATORS = [
  { category: 'Performance at work', keywords: ['performance', 'productivity', 'efficiency', 'work output', 'attendance', 'punctuality'] },
  { category: 'Economic situation', keywords: ['income', 'salary', 'wage', 'debt', 'credit score', 'financial', 'economic', 'wealth', 'poverty'] },
  { category: 'Health', keywords: ['health', 'medical', 'disease', 'condition', 'diagnosis', 'treatment', 'wellness', 'fitness'] },
  { category: 'Preferences', keywords: ['preference', 'taste', 'like', 'dislike', 'choice', 'opinion', 'sentiment'] },
  { category: 'Interests', keywords: ['interest', 'hobby', 'activity', 'engagement', 'participation'] },
  { category: 'Reliability', keywords: ['reliability', 'trustworthiness', 'dependability', 'risk profile', 'creditworthiness'] },
  { category: 'Behaviour', keywords: ['behaviour', 'behavior', 'conduct', 'action', 'pattern', 'habit', 'routine'] },
  { category: 'Location/movements', keywords: ['location', 'tracking', 'movement', 'geolocation', 'GPS', 'whereabouts', 'travel'] }
];

function clampArray<T>(arr: T[], max: number): T[] {
  return arr.length > max ? arr.slice(0, max) : arr;
}

function clampText(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max);
}

export function detectProfiling(input: SystemInput): ProfilingResult {
  const key = JSON.stringify({ d: input.description, p: input.intendedPurpose, m: input.marketingMaterials, pd: input.personalDataProcessed });
  const cached = profilingCache.get(key);
  if (cached) return cached;

  const dataInputs = clampArray(input.dataInputs, MAX_ARRAY_SCAN);
  const outputs = clampArray(input.outputs, MAX_ARRAY_SCAN);
  const rawCombined = `${input.description} ${input.intendedPurpose} ${input.marketingMaterials || ''} ${dataInputs.join(' ')} ${outputs.join(' ')}`;
  const combinedText = clampText(rawCombined, MAX_TEXT_LENGTH).toLowerCase();

  const redFlags: string[] = [];
  let absoluteRedFlag = false;

  for (const indicator of PROFILING_INDICATORS) {
    for (const keyword of indicator.keywords) {
      if (combinedText.includes(keyword.toLowerCase())) {
        redFlags.push(indicator.category);
        break;
      }
    }
  }

  const uniqueFlags = [...new Set(redFlags)];
  const gdprMatch = input.personalDataProcessed && uniqueFlags.length > 0;

  if (gdprMatch && uniqueFlags.length >= 2) absoluteRedFlag = true;
  const isProfiling = gdprMatch || uniqueFlags.length >= 3;

  const result: ProfilingResult = {
    isProfiling,
    redFlags: uniqueFlags,
    gdprArticle4Match: gdprMatch,
    absoluteRedFlag,
    details: isProfiling
      ? `Profiling indicators detected: ${uniqueFlags.join(', ')}. ${absoluteRedFlag ? 'Absolute red flag: Article 6(3) filter is INAPPLICABLE.' : ''}`
      : 'No clear profiling indicators detected. Article 6(3) filter may be applicable.'
  };

  profilingCache.set(key, result);
  return result;
}
