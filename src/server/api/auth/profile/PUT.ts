import type { Request, Response } from 'express';
import { db } from '../../db.js';
import { verifyToken } from '../../authUtils.js';

export default async function handler(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const userId = payload.userId;
  const { education, skills, experience, targetRole, bio, experienceLevel } = req.body;
  const profileIdx = db.profiles.findIndex(p => p.userId === userId);
  if (profileIdx === -1) {
    db.profiles.push({ userId, education: education || '', skills: skills || [], experience: experience || [], targetRole: targetRole || '', bio: bio || '', experienceLevel: experienceLevel || 'Entry Level' });
  } else {
    db.profiles[profileIdx] = {
      ...db.profiles[profileIdx],
      ...(education !== undefined && { education }),
      ...(skills !== undefined && { skills }),
      ...(experience !== undefined && { experience }),
      ...(targetRole !== undefined && { targetRole }),
      ...(bio !== undefined && { bio }),
      ...(experienceLevel !== undefined && { experienceLevel }),
    };
  }
  res.json({ profile: db.profiles.find(p => p.userId === userId) });
}
