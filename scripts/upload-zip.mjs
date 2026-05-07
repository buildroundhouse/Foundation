import { Client } from '@replit/object-storage';

const file = process.argv[2];
const key = process.argv[3] || `public/${file.split('/').pop()}`;
const client = new Client({ bucketId: process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID });
const r = await client.uploadFromFilename(key, file);
console.log(JSON.stringify(r));
console.log('KEY:', key);
