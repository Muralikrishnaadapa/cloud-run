const express = require('express');
const app = express();

app.all('*', async (req, res) => {
    const host = req.headers.host || req.headers['x-forwarded-host'] || '';
    
    const pathMapping = {
        "annotation-admin-google.delta.soulhq.ai": "/annotation-admin-dev/dist",
        "nucleus.delta.soulhq.ai": "/nucleus/0.1.0/storybook-static",
        "authentication.delta.soulhq.ai": "/authentication/0.0.20/dist",
        "freelancer-admin.delta.soulhq.ai": "/freelancer-admin/3.0.136/dist",
        "platform.delta.soulhq.ai": "/user-platform-app/0.0.24/dist",
        "delta.soulhq.ai": "/soul-ai-main/soul-ai-landing-page-462efba3246e6394db.webflow",
        "assessment.delta.soulhq.ai": "/assessment-platform-app/0.0.11/dist",
        "studio-platform.delta.soulhq.ai": "/soul-task-studio/0.0.14/dist", 
        "authentication-new.delta.soulhq.ai": "/authentication-new/0.1.15/dist",
        "platform-new.delta.soulhq.ai": "/user-platform-app-new/6.0.26/dist",
        "assessment-new.delta.soulhq.ai": "/assessment-platform-app-new/8.0.4/dist",
        "studio.delta.soulhq.ai": "/task-studio-app-landing/0.0.12/dist",
        "app.soulhq.ai": "/prod-app-landing234/0.1.0/out",
        "folder2.delta.soulhq.ai": "/prod-soul-task-studio/0.0.7/dist",
        "studio-platform-new.delta.soulhq.ai": "/soul-task-studio-new/3.0.4/dist", 
        "landing.delta.soulhq.ai": "/app-landing/0.0.41/out",
        "llmarch.delta.soulhq.ai": "/llmarch-dev/0.0.7/dist",
        "folder4.delta.soulhq.ai": "/prod-app-landing/0.0.0/dist"
    };
    
    const pathPrefix = pathMapping[host];
    
    if (!pathPrefix) {
        return res.status(404).send('Host not found in mapping');
    }
    
    let requestPath = req.path;
    
    // If the URI does not contain a file extension, treat it as a route, serve index.html
    if (!requestPath.match(/\.[^\/]+$/)) {
        requestPath = pathPrefix + "/index.html";
    } else {
        requestPath = pathPrefix + requestPath;
    }
    
    // Construct the Cloud Storage URL
    const bucketName = process.env.BUCKET_NAME || 'deccan-annotation-dev';
    const fileUrl = `https://storage.googleapis.com/${bucketName}${requestPath}`;
    
    // Fetch and serve the file from Cloud Storage
    try {
        const fetchResponse = await fetch(fileUrl);
        
        if (fetchResponse.ok) {
            const contentType = fetchResponse.headers.get('content-type') || 'text/html';
            const fileContent = await fetchResponse.text();
            
            res.set('Content-Type', contentType);
            res.set('Cache-Control', 'public, max-age=3600');
            res.status(200).send(fileContent);
        } else {
            res.status(fetchResponse.status).send('File not found');
        }
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).send('Internal server error');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
