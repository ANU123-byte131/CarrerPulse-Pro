import { Router, Request, Response } from 'express';
import { db, generateId } from './db.js';
import { authMiddleware } from './auth.js';

const router = Router();

// GET /api/applications
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const apps = db.applications.filter(a => a.userId === userId);
  res.json(apps);
});

// GET /api/applications/stats
router.get('/stats', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const apps = db.applications.filter(a => a.userId === userId);
  const total = apps.length;
  const applied = apps.filter(a => a.status === 'Applied').length;
  const interviewing = apps.filter(a => a.status === 'Interviewing').length;
  const offers = apps.filter(a => a.status === 'Offer').length;
  const rejected = apps.filter(a => a.status === 'Rejected').length;
  const responseRate = total > 0 ? Math.round(((interviewing + offers) / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;
  res.json({ total, applied, interviewing, offers, rejected, responseRate, offerRate });
});

// POST /api/applications
router.post('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { jobTitle, company, status, notes } = req.body;
  if (!jobTitle || !company) {
    return res.status(400).json({ error: 'Job title and company are required' });
  }
  const app = {
    id: generateId(),
    userId,
    jobTitle,
    company,
    status: status || 'Applied',
    appliedDate: new Date().toISOString(),
    notes: notes || '',
  };
  db.applications.push(app);
  res.status(201).json(app);
});

// PATCH /api/applications/:id
router.patch('/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const app = db.applications.find(a => a.id === id && a.userId === userId);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  const { status, notes, jobTitle, company } = req.body;
  if (status) app.status = status;
  if (notes !== undefined) app.notes = notes;
  if (jobTitle) app.jobTitle = jobTitle;
  if (company) app.company = company;
  res.json(app);
});

// DELETE /api/applications/:id
router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const idx = db.applications.findIndex(a => a.id === id && a.userId === userId);
  if (idx === -1) return res.status(404).json({ error: 'Application not found' });
  db.applications.splice(idx, 1);
  res.json({ success: true });
});

export default router;
