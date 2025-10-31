const express = require("express");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const app = express();
const storage = new Storage();
const BUCKET_NAME = "deccan-annotation-dev";

const pathMapping = {
  "annotation-admin.delta.soulhq.ai": "annotation-admin-dev/dist",
  "nucleus.delta.soulhq.ai": "nucleus/storybook-static",
  "authentication.delta.soulhq.ai": "authentication/dist",
};

app.get("*", async (req, res) => {
  try {
    const host = req.headers["host"]?.toLowerCase();
    console.log("Incoming host:", host, "Path:", req.path);

    const prefix = pathMapping[host];
    if (!prefix) {
      console.log("❌ Host not found in mapping");
      return res.status(404).send("Host not found");
    }

    let filePath = req.path;
    if (!path.extname(filePath)) filePath = "/index.html";
    const finalPath = path.join(prefix, filePath);
    console.log("Resolved path:", finalPath);

    const file = storage.bucket(BUCKET_NAME).file(finalPath);
    const [exists] = await file.exists();
    if (!exists) {
      console.log("❌ File not found:", finalPath);
      return res.status(404).send("File not found");
    }

    res.set("Cache-Control", "public, max-age=3600");
    file.createReadStream().pipe(res);
  } catch (err) {
    console.error("💥 Server error:", err);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(⁠ ✅ Server running on port ${PORT} ⁠));
