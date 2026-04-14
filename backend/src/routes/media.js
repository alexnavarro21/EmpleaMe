const router = require("express").Router();
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "auto",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

// GET /api/media/uploads/:filename
router.get("/uploads/:filename", async (req, res) => {
  const key = `uploads/${req.params.filename}`;
  try {
    const { Body, ContentType } = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      })
    );
    if (ContentType) res.setHeader("Content-Type", ContentType);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    Body.pipe(res);
  } catch (err) {
    if (err.name === "NoSuchKey") return res.status(404).json({ error: "Archivo no encontrado" });
    res.status(500).json({ error: "Error al obtener archivo" });
  }
});

module.exports = router;
