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

  const user = db.users.find(u => u.id === payload.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const profile = db.profiles.find(p => p.userId === payload.userId);
  res.json({ user: { id: user.id, email: user.email, name: user.name }, profile });
}
