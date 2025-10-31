const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const app = express();
const storage = new Storage();

// 🔧 Your GCS bucket name
const BUCKET_NAME = 'deccan-annotation-dev';

// 🔧 Mapping of domain → folder path inside the bucket
const pathMapping = {
  "annotation-admin.delta.soulhq.ai": "annotation-admin-dev/dist",
  // add other mappings below
  "nucleus.delta.soulhq.ai": "nucleus-dev/dist",
  "authentication.delta.soulhq.ai": "authentication-dev/dist",
};

// 🔧 Function to serve files from GCS
async function serveFile(bucketName, filePath, res) {
  const file = storage.bucket(bucketName).file(filePath);
  const [exists] = await file.exists();
  if (!exists) {
    console.error(`❌ File not found in bucket: ${filePath}`);
    return res.status(404).send('File not found');
  }

  const readStream = file.createReadStream();
  readStream.on('error', (err) => {
    console.error(`⚠️ Error reading file: ${filePath}`, err);
    res.status(500).send('Server error');
  });
  readStream.pipe(res);
}

// 🔧 Express route to handle all requests
app.get('*', async (req, res) => {
  try {
    // Log full incoming header details for debugging
    console.log("🔎 Incoming Host:", req.headers.host);
    console.log("🔎 Request path:", req.path);
    console.log("🔎 Full headers:", JSON.stringify(req.headers, null, 2));

    const host = req.headers.host;
    const prefix = pathMapping[host];

    // If host not mapped, show the host we received for debugging
    if (!prefix) {
      console.warn(`⚠️ Host not found in mapping: ${host}`);
      return res.status(404).send(`Host not found: ${host}`);
    }

    let filePath = req.path;
    if (!path.extname(filePath)) {
      filePath = '/index.html'; // Default to index.html for SPA routes
    }
    filePath = path.join(prefix, filePath);

    console.log(`📂 Serving file from GCS: ${filePath}`);
    await serveFile(BUCKET_NAME, filePath, res);
  } catch (err) {
    console.error("💥 Server error:", err);
    res.status(500).send('Server error');
  }
});

// Cloud Run requires listening on the environment port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

module.exports = app;
