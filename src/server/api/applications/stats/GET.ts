import type { Request, Response } from 'express';
import { db } from '../../db.js';
import { getUserIdFromRequest } from '../../authUtils.js';

export default async function handler(req: Request, res: Response) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const apps = db.applications.filter(a => a.userId === userId);
  const total = apps.length;
  const applied = apps.filter(a => a.status === 'Applied').length;
  const interviewing = apps.filter(a => a.status === 'Interviewing').length;
  const offers = apps.filter(a => a.status === 'Offer').length;
  const rejected = apps.filter(a => a.status === 'Rejected').length;
  const responseRate = total > 0 ? Math.round(((interviewing + offers) / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;
  res.json({ total, applied, interviewing, offers, rejected, responseRate, offerRate });
}
