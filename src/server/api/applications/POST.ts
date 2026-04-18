import type { Request, Response } from 'express';
import { db, generateId } from '../db.js';
import { getUserIdFromRequest } from '../authUtils.js';

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { jobTitle, company, status, notes } = req.body;
  if (!jobTitle || !company) return res.status(400).json({ error: 'Job title and company are required' });

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
}
