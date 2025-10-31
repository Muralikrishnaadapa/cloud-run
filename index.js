const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const app = express();
const storage = new Storage();
const BUCKET_NAME = 'deccan-annotation-dev';

const pathMapping = {
  "annotation-admin.delta.soulhq.ai": "annotation-admin-dev/dist"
  // ... add other mappings here
};

async function serveFile(bucketName, filePath, res) {
  const file = storage.bucket(bucketName).file(filePath);
  const [exists] = await file.exists();
  if (!exists) return res.status(404).send('File not found');

  const readStream = file.createReadStream();
  readStream.on('error', (err) => {
    console.error(err);
    res.status(500).send('Server error');
  });
  readStream.pipe(res);
}

app.get('*', async (req, res) => {
  try {
    const host = req.headers.host;
    const prefix = pathMapping[host];
    if (!prefix) return res.status(404).send('Host not found');

    let filePath = req.path;
    if (!path.extname(filePath)) filePath = '/index.html';
    filePath = path.join(prefix, filePath);

    await serveFile(BUCKET_NAME, filePath, res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Cloud Run requires listening on the port from the environment variable
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

module.exports = app;
