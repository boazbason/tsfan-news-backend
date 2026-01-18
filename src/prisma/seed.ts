import prisma from './client';
import bcrypt from 'bcrypt';

async function main(){ 
  const pass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@safed.local' },
    update: {},
    create: { email: 'admin@safed.local', password: pass, name: 'Admin', role: 'ADMIN' }
  });

  await prisma.post.create({
    data: {
      title: 'דוגמה: פתיחת שירות החדשות - מלא',
      slug: 'open-service-example',
      content: 'זו פוסט לדוגמה עם יכולות מלאות.',
      excerpt: 'פוסט דוגמה',
      featured: true,
      published: true,
      authorId: (await prisma.user.findFirst({ where: { email: 'admin@safed.local' } }))!.id,
      category: 'local'
    }
  });

  await prisma.subscriber.createMany({
    data: [{ email: 'reader1@example.com' }, { email: 'reader2@example.com' }],
    skipDuplicates: true
  });
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=> prisma.$disconnect());
