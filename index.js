const express = require('express');
const { Storage } = require('@google-cloud/storage');
const app = express();

const storage = new Storage();

// Log all incoming requests at the middleware level
app.use((req, res, next) => {
    console.log(`[MIDDLEWARE] ${req.method} ${req.path}`);
    console.log(`[MIDDLEWARE] Host: ${req.headers.host}`);
    console.log(`[MIDDLEWARE] X-Forwarded-Host: ${req.headers['x-forwarded-host']}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// All routes - Handle multiple domains based on Host header
app.all('*', async (req, res) => {
    // Get the original host - check X-Forwarded-Host first (when behind Load Balancer),
    // then fall back to Host header
    const host = req.headers['x-forwarded-host'] || req.headers.host || '';
    // Remove port if present
    const hostname = host.split(':')[0];
    
    console.log(`[DEBUG] Request received: ${req.method} ${req.path}`);
    console.log(`[DEBUG] Host header: ${req.headers.host}`);
    console.log(`[DEBUG] X-Forwarded-Host: ${req.headers['x-forwarded-host']}`);
    console.log(`[DEBUG] Resolved hostname: ${hostname}`);
    
    // Path mapping for all domains
    const pathMapping = {
        "annotation-admin-groot.delta.deccan.ai": "/deccan-annotation-dev/0.5.32/dist",
        "studio-platform-groot.delta.deccan.ai": "/studio-platform-groot/3.1.51/dist",
        "studio-groot.delta.deccan.ai": "/studio-groot/0.0.16/dist"
    };
    
    const pathPrefix = pathMapping[hostname];
    
    if (!pathPrefix) {
        console.error(`Host not found in mapping: ${hostname}`);
        return res.status(404).send(`Host not found: ${hostname}`);
    }
    
    try {
        let requestPath = req.path;
        
        // If no file extension, serve index.html
        if (!requestPath.match(/\.[^\/]+$/)) {
            requestPath = pathPrefix + "/index.html";
        } else {
            requestPath = pathPrefix + requestPath;
        }
        
        const bucketName = process.env.BUCKET_NAME || 'deccan-annotation-dev';
        const filePath = requestPath.startsWith('/') ? requestPath.substring(1) : requestPath;
        
        console.log(`Fetching: gs://${bucketName}/${filePath} for host: ${hostname}`);
        
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
