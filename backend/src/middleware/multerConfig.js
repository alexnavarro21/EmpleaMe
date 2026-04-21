const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

const MIME_MAP = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp',
  mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
  pdf: 'application/pdf',
};

const ALLOWED_EXTENSIONS = new Set(Object.keys(MIME_MAP));

const upload = multer({
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error(`Tipo de archivo no permitido: .${ext}`));
    }
    cb(null, true);
  },
  storage: multerS3({
    s3,
    bucket: (_req, _file, cb) => cb(null, process.env.S3_BUCKET_NAME),
    contentType: (_req, file, cb) => {
      const ext = path.extname(file.originalname).slice(1).toLowerCase();
      cb(null, MIME_MAP[ext] || file.mimetype || 'application/octet-stream');
    },
    key: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `uploads/${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = upload;
