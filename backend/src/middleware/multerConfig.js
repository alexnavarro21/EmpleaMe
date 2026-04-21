const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false, // virtual-hosted-style URLs
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: (_req, _file, cb) => cb(null, process.env.S3_BUCKET_NAME),
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (_req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = file.originalname.split('.').pop();
      cb(null, `uploads/${uniqueSuffix}.${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB máx
});

module.exports = upload;
