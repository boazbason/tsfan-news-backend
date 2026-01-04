import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';
import commentsRoutes from './routes/comments';
import adsRoutes from './routes/ads';
import subsRoutes from './routes/subscribers';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// static uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (_, res) => res.json({ ok: true, message: 'Safed News backend (Postgres) running' }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/subscribers', subsRoutes);
app.use('/api/admin', adminRoutes);


// --- Aliases added to match frontend endpoints detected
// app.use('/login', authRoutes);
// app.use('/register', authRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
