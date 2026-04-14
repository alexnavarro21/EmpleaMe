require('dotenv').config();
const { S3Client, PutBucketAclCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false,
});

async function main() {
  await s3.send(
    new PutBucketAclCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      ACL: 'public-read',
    })
  );
  console.log('Bucket ACL set to public-read OK');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
