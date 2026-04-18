import type { Request, Response } from 'express';
import { db } from '../../db.js';
import { createToken, simpleHash } from '../../authUtils.js';

export default async function handler(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = db.users.find(u => u.email === email);
  if (!user || user.password !== simpleHash(password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = createToken({ userId: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
