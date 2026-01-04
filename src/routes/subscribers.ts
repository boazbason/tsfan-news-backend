import { Router } from 'express';
import prisma from '../prisma/client';

const router = Router();

router.post('/', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    const sub = await prisma.subscriber.create({ data: { email } });
    res.status(201).json(sub);
  } catch (e:any) {
    res.status(400).json({ error: 'Already subscribed or invalid' });
  }
});

router.get('/', async (req, res) => {
  const list = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(list);
});

export default router;
