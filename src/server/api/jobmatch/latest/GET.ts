import type { Request, Response } from 'express';
import { db } from '../../db.js';
import { getUserIdFromRequest } from '../../authUtils.js';

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const jd = db.jobDescriptions.find(j => j.userId === userId);
  if (!jd) return res.status(404).json({ error: 'No job match found' });
  res.json(jd);
}
