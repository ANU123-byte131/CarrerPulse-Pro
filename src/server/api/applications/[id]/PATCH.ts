import type { Request, Response } from 'express';
import { db } from '../../db.js';
import { getUserIdFromRequest } from '../../authUtils.js';

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const app = db.applications.find(a => a.id === id && a.userId === userId);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  const { status, notes, jobTitle, company } = req.body;
  if (status) app.status = status;
  if (notes !== undefined) app.notes = notes;
  if (jobTitle) app.jobTitle = jobTitle;
  if (company) app.company = company;
  res.json(app);
}
