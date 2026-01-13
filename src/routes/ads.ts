import { Router } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, roleRequired } from '../middleware/auth';
import multer from 'multer';
import { uploadImageToS3 } from '../utils/s3';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res) => {
  const ads = await prisma.ad.findMany({ where: { active: true } });
  res.json(ads);
});

router.post('/', authMiddleware, roleRequired('ADMIN'), upload.single('image'), async (req:any, res:any) => {
  try {
    const { title, url, position, startAt, endAt, active } = req.body;
    let image: string | undefined;
    if (req.file) {
      const uploaded = await uploadImageToS3(req.file, 'ads');
      image = uploaded.url;
    }
    const ad = await prisma.ad.create({ data: { title, url, position, startAt: startAt || undefined, endAt: endAt || undefined, active: active === 'true' || active === true, image } });
    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ad' });
  }
});

router.put('/:id', authMiddleware, roleRequired('ADMIN'), upload.single('image'), async (req:any, res:any) => {
  const id = req.params.id;
  const data:any = req.body;
  try {
    if (req.file) {
      const uploaded = await uploadImageToS3(req.file, 'ads');
      data.image = uploaded.url;
    }
    const updated = await prisma.ad.update({ where: { id }, data });
    res.json(updated);
  } catch (error) {
    res.status(404).json({ error: 'Not found' });
  }
});

router.delete('/:id', authMiddleware, roleRequired('ADMIN'), async (req, res) => {
  const id = req.params.id;
  await prisma.ad.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
