import type { Request, Response } from 'express';
import { db } from '../db.js';
import { getUserIdFromRequest } from '../authUtils.js';

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const apps = db.applications.filter(a => a.userId === userId);
  res.json(apps);
}
