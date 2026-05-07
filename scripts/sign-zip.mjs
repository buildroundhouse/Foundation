const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
const objectName = process.argv[2];
const SIDECAR = 'http://127.0.0.1:1106';

const r = await fetch(`${SIDECAR}/object-storage/signed-object-url`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bucket_name: bucketName,
    object_name: objectName,
    method: 'GET',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }),
});
const j = await r.json();
console.log(j.signed_url);
