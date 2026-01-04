import { Router } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, roleRequired } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = Router();
const upload = multer({ dest: path.join(__dirname, '..', '..', 'uploads') });

router.get('/', async (req, res) => {
  const ads = await prisma.ad.findMany({ where: { active: true } });
  res.json(ads);
});

router.post('/', authMiddleware, roleRequired('ADMIN'), upload.single('image'), async (req:any, res:any) => {
  const { title, url, position, startAt, endAt, active } = req.body;
  const image = req.file ? '/uploads/' + req.file.filename : undefined;
  const ad = await prisma.ad.create({ data: { title, url, position, startAt: startAt || undefined, endAt: endAt || undefined, active: active === 'true' || active === true, image } });
  res.status(201).json(ad);
});

router.put('/:id', authMiddleware, roleRequired('ADMIN'), upload.single('image'), async (req:any, res:any) => {
  const id = req.params.id;
  const data:any = req.body;
  if (req.file) data.image = '/uploads/' + req.file.filename;
  const updated = await prisma.ad.update({ where: { id }, data });
  res.json(updated);
});

router.delete('/:id', authMiddleware, roleRequired('ADMIN'), async (req, res) => {
  const id = req.params.id;
  await prisma.ad.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
