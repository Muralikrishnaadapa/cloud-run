const express = require('express');
const { Storage } = require('@google-cloud/storage');
const app = express();

const storage = new Storage();

// Health check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// All routes - Since URL map routes ONLY annotation-admin-google.delta.soulhq.ai to this backend,
// we can directly use that domain without checking Host header
app.all('*', async (req, res) => {
    try {
        // Always use this domain since it's the only one routed to this backend via Load Balancer
        const pathPrefix = "/annotation-admin-dev/dist";
        let requestPath = req.path;
        
        // If no file extension, serve index.html
        if (!requestPath.match(/\.[^\/]+$/)) {
            requestPath = pathPrefix + "/index.html";
        } else {
            requestPath = pathPrefix + requestPath;
        }
        
        const bucketName = process.env.BUCKET_NAME || 'deccan-annotation-dev';
        const filePath = requestPath.startsWith('/') ? requestPath.substring(1) : requestPath;
        
        console.log(`Fetching: gs://${bucketName}/${filePath}`);
        
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(filePath);
        
        const [exists] = await file.exists();
        
        if (!exists) {
            console.error(`File not found: ${filePath}`);
            return res.status(404).send(`File not found: ${filePath}`);
        }
        
        const [metadata] = await file.getMetadata();
        const contentType = metadata.contentType || 'text/html';
        const [fileContent] = await file.download();
        
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=3600');
        res.status(200).send(fileContent);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error: ' + error.message);
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
