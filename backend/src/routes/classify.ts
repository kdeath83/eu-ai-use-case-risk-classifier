import { Router, Request, Response } from 'express';
import { generateClassificationReport } from '../services/report';
import { SystemInput } from '../types';
import { validateSystemInput } from '../middleware/validation';

const router = Router();

router.post('/', validateSystemInput, (req: Request, res: Response) => {
  try {
    const input: SystemInput = req.body;
    const report = generateClassificationReport(input);
    return res.json(report);
  } catch (err: any) {
    console.error('Classification error:', err);
    return res.status(500).json({ error: 'Internal server error during classification' });
  }
});

export default router;
