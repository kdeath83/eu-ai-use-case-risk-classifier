import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'EU AI Use Case Risk Classifier API',
    version: '1.0.0',
    euAiActReference: 'Article 6 draft guidelines (May 2026)'
  });
});

export default router;
