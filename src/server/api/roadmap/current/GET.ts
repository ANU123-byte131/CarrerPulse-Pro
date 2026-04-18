import type { Request, Response } from 'express';
import { db } from '../../db.js';
import { getUserIdFromRequest } from '../../authUtils.js';

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const roadmap = db.roadmaps.find(r => r.userId === userId);
  if (!roadmap) return res.status(404).json({ error: 'No roadmap found' });
  res.json(roadmap);
}
