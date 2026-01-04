import { Router } from 'express';
import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email already exists' });
  const hash = await bcrypt.hash(password, 10);
  console.log({ data: { email, password: hash, name } });

  const user = await prisma.user.create({ data: { email, password: hash, name } });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.post('/login', async (req, res) => {
  console.log('testtt');

  console.log(req.body);

  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) return res.status(400).json({ error: 'email and password required' });
  const user = await prisma.user.findUnique({ where: { email: usernameOrEmail } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.get('/me', async (req: any, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const parts = auth.split(' ');
    const payload: any = jwt.verify(parts[1], JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
