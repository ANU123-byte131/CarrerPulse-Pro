import type { Request, Response } from 'express';
import { db, generateId } from '../../db.js';
import { createToken, simpleHash } from '../../authUtils.js';

export default async function handler(req: Request, res: Response) {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  const existing = db.users.find(u => u.email === email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const user = {
    id: generateId(),
    email,
    password: simpleHash(password),
    name,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  db.profiles.push({
    userId: user.id,
    education: '',
    skills: [],
    experience: [],
    targetRole: '',
    bio: '',
    experienceLevel: 'Entry Level',
  });
  const token = createToken({ userId: user.id, email: user.email });
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
