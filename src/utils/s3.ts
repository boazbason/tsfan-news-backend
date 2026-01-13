import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;
const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;
const acl = process.env.AWS_S3_ACL as ObjectCannedACL | undefined;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

type UploadResult = {
  key: string;
  url: string;
};

const buildObjectKey = (file: Express.Multer.File, prefix: string) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const safeExt = ext && ext.length <= 12 ? ext : '';
  const randomHex = crypto.randomBytes(16).toString('hex');
  return `${prefix}/${Date.now()}-${randomHex}${safeExt}`;
};

const resolvePublicUrl = (key: string) => {
  if (publicBaseUrl) {
    const normalizedBase = publicBaseUrl.replace(/\/+$/, '');
    if (!bucket || normalizedBase.includes(bucket)) {
      return `${normalizedBase}/${key}`;
    }
  }
  if (!region || !bucket) {
    throw new Error('AWS_REGION and AWS_S3_BUCKET must be set to build a public URL');
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

export const uploadImageToS3 = async (file: Express.Multer.File, prefix = 'uploads'): Promise<UploadResult> => {
  console.log('region: ', region, 'bucket: ', bucket);
  
  if (!region || !bucket) {
    throw new Error('Missing AWS_REGION or AWS_S3_BUCKET');
  }
  if (!file?.buffer) {
    throw new Error('Missing file buffer for S3 upload');
  }

  const key = buildObjectKey(file, prefix);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: acl || undefined
  });

  await s3.send(command);
  console.log({key});
  

  return { key, url: resolvePublicUrl(key) };
};
