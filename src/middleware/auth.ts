import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export type AuthRequest = Request & { user?: any };

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Malformed token' });
  const token = parts[1];
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function roleRequired(role: 'ADMIN'|'EDITOR') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'No user' });
    if (user.role !== role && user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
