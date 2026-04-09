const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const { randomUUID } = require('crypto');

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

const upload = multer({ storage: multer.memoryStorage() });

async function uploadToS3(file) {
  const ext = path.extname(file.originalname);
  const key = `uploads/${randomUUID()}${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }));

  return `https://${process.env.S3_BUCKET_NAME}.t3.storageapi.dev/${key}`;
}

module.exports = { upload, uploadToS3 };
