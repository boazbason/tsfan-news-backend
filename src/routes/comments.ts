import { Router } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, AuthRequest, roleRequired } from '../middleware/auth';

const router = Router();

// Create comment (must be logged in)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { postId, content, parentId } = req.body;
  if (!postId || !content) return res.status(400).json({ error: 'postId and content required' });
  const comment = await prisma.comment.create({ data: { content, postId, parentId: parentId || null, authorId: req.user.id, approved: false } });
  res.status(201).json(comment);
});

// Get comments for post
router.get('/post/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const comments = await prisma.comment.findMany(
    { where: { postId, approved: true }, 
    // include: { author: true, replies: true }, 
    orderBy: { createdAt: 'asc' } });
  res.json(comments);
});

// Approve or delete (admin/editor)
router.put('/:id/approve', authMiddleware, roleRequired('EDITOR'), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const updated = await prisma.comment.update({ where: { id }, data: { approved: true } });
  res.json(updated);
});

router.delete('/:id', authMiddleware, roleRequired('EDITOR'), async (req: AuthRequest, res) => {
  const id = req.params.id;
  await prisma.comment.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
