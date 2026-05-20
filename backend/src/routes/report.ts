import { Router, Request, Response } from 'express';
import { generateClassificationReport } from '../services/report';
import { SystemInput } from '../types';
import { validateSystemInput } from '../middleware/validation';

const router = Router();

router.post('/export', validateSystemInput, (req: Request, res: Response) => {
  try {
    const input: SystemInput = req.body;
    const report = generateClassificationReport(input);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="ai-risk-report-${report.id}.json"`);
    return res.json(report.exportJson);
  } catch (err: any) {
    console.error('Export error:', err);
    return res.status(500).json({ error: 'Internal server error during export' });
  }
});

router.post('/preview', validateSystemInput, (req: Request, res: Response) => {
  try {
    const input: SystemInput = req.body;
    const report = generateClassificationReport(input);
    return res.json({
      id: report.id,
      timestamp: report.timestamp,
      overallClassification: report.overallClassification,
      evidenceSummary: report.evidenceSummary,
      exportJson: report.exportJson
    });
  } catch (err: any) {
    console.error('Preview error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
