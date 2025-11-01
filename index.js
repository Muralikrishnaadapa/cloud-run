// index.js for Cloud Run
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Cloud Run!");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(⁠ Server listening on port ${port} ⁠);
});
