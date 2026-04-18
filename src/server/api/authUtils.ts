const JWT_SECRET = 'careerpulse_secret_2026';

export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16) + str.length.toString(16);
}

export function createToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64');
  const signature = Buffer.from(simpleHash(header + '.' + body + JWT_SECRET)).toString('base64');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    const expectedSig = Buffer.from(simpleHash(parts[0] + '.' + parts[1] + JWT_SECRET)).toString('base64');
    if (parts[2] !== expectedSig) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(req: any): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  return payload?.userId || null;
}
