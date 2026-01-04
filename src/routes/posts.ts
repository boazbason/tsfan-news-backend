import { Router } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, AuthRequest, roleRequired } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import slugify from 'slugify';

const router = Router();
const upload = multer({ dest: path.join(__dirname, '..', '..', 'uploads') });

// List with filters, pagination, featured
router.get('/', async (req, res) => {
  console.log("get posts")
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
  const category = req.query.category as string | undefined;
  const featured = req.query.featured === 'true' ? true : undefined;

  const where: any = {};
  if (category) where.category = { slug: category };
  if (typeof featured !== 'undefined') where.featured = featured;

  const posts = await prisma.post.findMany({
    where,
    include: { author: true, category: true },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit
  });
  const total = await prisma.post.count({ where });
  console.log("the posts: ", posts)
  res.json({ total, page, limit, data: posts });
});

router.get('/featured', async (req, res) => {
  const items = await prisma.post.findMany({ where: { featured: true, published: true }, include: { author: true, category: true }, orderBy: { createdAt: 'desc' }, take: 10 });
  res.json(items);
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const post = await prisma.post.findUnique({ where: { id }, include: { author: true, category: true, comments: true } });
  if (!post) return res.status(404).json({ error: 'Not found' });
  // increment views
  await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });
  res.json(post);
});

// create (editor or admin)
router.post('/', 
  authMiddleware, 
  roleRequired('EDITOR'), 
  upload.single('image'), async (req: AuthRequest, res) => {
  const { title, content, excerpt, categoryId, featured, published } = req.body as any;
  const authorId = req.user.id;
  const slug = slugify(title || Date.now().toString(), { lower: true, strict: true });
  const image = req.file ? '/uploads/' + req.file.filename : undefined;
  const post = await prisma.post.create({
    data: {
      title, slug, content, excerpt, featured: featured === 'true' || featured === true, image, published: published === 'true' || published === true, authorId,
      categoryId: categoryId || undefined
    }
  });
  res.status(201).json(post);
});

// update
router.put('/:id', authMiddleware, roleRequired('EDITOR'), upload.single('image'), async (req: AuthRequest, res) => {
  const id = req.params.id;
  const data: any = req.body;
  if (req.file) data.image = '/uploads/' + req.file.filename;
  try {
    const updated = await prisma.post.update({ where: { id }, data });
    res.json(updated);
  } catch (e:any) {
    res.status(404).json({ error: 'Not found' });
  }
});

router.delete('/:id', authMiddleware, roleRequired('EDITOR'), async (req: AuthRequest, res) => {
  const id = req.params.id;
  await prisma.post.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
