import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const MAX_TEXT_LENGTH = 10000;
const MAX_ARRAY_ITEMS = 50;
const MAX_ITEM_LENGTH = 500;

const sectorSchema = z.enum([
  'biometrics',
  'critical_infrastructure',
  'education',
  'employment',
  'essential_services',
  'law_enforcement',
  'migration',
  'justice_democratic',
  'none'
]);

const autonomySchema = z.enum(['none', 'low', 'medium', 'high', 'full']);

export const SystemInputSchema = z.object({
  systemName: z.string().min(1, 'System name is required').max(200, 'System name too long (max 200 chars)'),
  description: z.string().min(1, 'Description is required').max(MAX_TEXT_LENGTH, `Description too long (max ${MAX_TEXT_LENGTH} chars)`),
  intendedPurpose: z.string().min(1, 'Intended purpose is required').max(MAX_TEXT_LENGTH, `Intended purpose too long (max ${MAX_TEXT_LENGTH} chars)`),
  marketingMaterials: z.string().max(MAX_TEXT_LENGTH, `Marketing materials too long (max ${MAX_TEXT_LENGTH} chars)`).optional(),
  termsOfService: z.string().max(MAX_TEXT_LENGTH, `Terms of service too long (max ${MAX_TEXT_LENGTH} chars)`).optional(),
  technicalSpecs: z.string().max(MAX_TEXT_LENGTH, `Technical specs too long (max ${MAX_TEXT_LENGTH} chars)`).optional(),
  targetSector: sectorSchema,
  autonomyLevel: autonomySchema,
  humanReview: z.boolean(),
  humanOverride: z.boolean(),
  personalDataProcessed: z.boolean(),
  dataInputs: z.array(z.string().max(MAX_ITEM_LENGTH, `Input item too long (max ${MAX_ITEM_LENGTH} chars)`)).max(MAX_ARRAY_ITEMS, `Too many data inputs (max ${MAX_ARRAY_ITEMS})`),
  outputs: z.array(z.string().max(MAX_ITEM_LENGTH, `Output item too long (max ${MAX_ITEM_LENGTH} chars)`)).max(MAX_ARRAY_ITEMS, `Too many outputs (max ${MAX_ARRAY_ITEMS})`)
});

export function validateSystemInput(req: Request, res: Response, next: NextFunction) {
  const result = SystemInputSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: result.error.issues
    });
  }
  next();
}
