import { Router } from 'express';
import { authMiddleware, roleRequired } from '../middleware/auth';
import prisma from '../prisma/client';

const router = Router();

router.get('/stats', authMiddleware, roleRequired('ADMIN'), async (req, res) => {
  const posts = await prisma.post.count();
  const users = await prisma.user.count();
  const comments = await prisma.comment.count();
  const ads = await prisma.ad.count();
  res.json({ posts, users, comments, ads });
});

// additional admin endpoints can be added here

export default router;
