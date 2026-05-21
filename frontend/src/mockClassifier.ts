import { generateClassificationReport } from './services/report';

export function runClassification(input: any) {
  return generateClassificationReport(input);
}
