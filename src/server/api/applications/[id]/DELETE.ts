import type { Request, Response } from 'express';
import { db } from '../../db.js';
import { getUserIdFromRequest } from '../../authUtils.js';

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  const idx = db.applications.findIndex(a => a.id === id && a.userId === userId);
  if (idx === -1) return res.status(404).json({ error: 'Application not found' });
  db.applications.splice(idx, 1);
  res.json({ success: true });
}
