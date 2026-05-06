const multer = require('multer');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { Upload } = require('@aws-sdk/lib-storage');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');
const fs = require('fs');
const os = require('os');

ffmpeg.setFfmpegPath(ffmpegStatic);

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

const memUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

const COMPRESSIBLE_IMAGES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const VIDEO_MIMES = new Set(['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi', 'video/mov']);

async function compressImage(buffer) {
  return sharp(buffer)
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
}

function compressVideo(inputBuffer) {
  return new Promise((resolve, reject) => {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const tmpIn = path.join(os.tmpdir(), `emp-in-${suffix}.mp4`);
    const tmpOut = path.join(os.tmpdir(), `emp-out-${suffix}.mp4`);

    fs.writeFileSync(tmpIn, inputBuffer);

    ffmpeg(tmpIn)
      .videoCodec('libx264')
      .outputOptions(['-crf 23', '-preset fast', '-movflags +faststart'])
      .audioCodec('aac')
      .output(tmpOut)
      .on('end', () => {
        const output = fs.readFileSync(tmpOut);
        try { fs.unlinkSync(tmpIn); } catch {}
        try { fs.unlinkSync(tmpOut); } catch {}
        resolve(output);
      })
      .on('error', (err) => {
        try { fs.unlinkSync(tmpIn); } catch {}
        try { fs.unlinkSync(tmpOut); } catch {}
        reject(err);
      })
      .run();
  });
}

async function uploadToS3(buffer, contentType, ext) {
  const key = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    },
  });
  await upload.done();
  return key;
}

function compressAndUpload(fieldName) {
  const memMiddleware = memUpload.single(fieldName);

  return (req, res, next) => {
    memMiddleware(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file) return next();

      try {
        const mime = req.file.mimetype;
        let buffer = req.file.buffer;
        let contentType = mime;
        let ext = path.extname(req.file.originalname).toLowerCase() || '.bin';

        if (COMPRESSIBLE_IMAGES.has(mime)) {
          buffer = await compressImage(buffer);
          contentType = 'image/jpeg';
          ext = '.jpg';
        } else if (mime.startsWith('video/') || VIDEO_MIMES.has(mime)) {
          buffer = await compressVideo(buffer);
          contentType = 'video/mp4';
          ext = '.mp4';
        }

        const key = await uploadToS3(buffer, contentType, ext);
        req.file.key = key;
        next();
      } catch (compErr) {
        next(compErr);
      }
    });
  };
}

module.exports = compressAndUpload;
