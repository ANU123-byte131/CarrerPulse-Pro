import { Router, Request, Response } from 'express';
import { db, generateId } from './db.js';

const router = Router();
const JWT_SECRET = 'careerpulse_secret_2026';

// Simple hash function (pure JS, no bcrypt)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16) + str.length.toString(16);
}

// Simple JWT implementation
function createToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now() }));
  const signature = btoa(simpleHash(header + '.' + body + JWT_SECRET));
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    const expectedSig = btoa(simpleHash(parts[0] + '.' + parts[1] + JWT_SECRET));
    if (parts[2] !== expectedSig) return null;
    return payload;
  } catch {
    return null;
  }
}

export function authMiddleware(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  (req as any).userId = payload.userId;
  (req as any).userEmail = payload.email;
  next();
}

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
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
  // Create default profile
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
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
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
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const profile = db.profiles.find(p => p.userId === userId);
  res.json({ user: { id: user.id, email: user.email, name: user.name }, profile });
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { education, skills, experience, targetRole, bio, experienceLevel } = req.body;
  const profileIdx = db.profiles.findIndex(p => p.userId === userId);
  if (profileIdx === -1) {
    db.profiles.push({ userId, education: education || '', skills: skills || [], experience: experience || [], targetRole: targetRole || '', bio: bio || '', experienceLevel: experienceLevel || 'Entry Level' });
  } else {
    db.profiles[profileIdx] = { ...db.profiles[profileIdx], ...{ education, skills, experience, targetRole, bio, experienceLevel } };
  }
  res.json({ profile: db.profiles.find(p => p.userId === userId) });
});

export default router;
