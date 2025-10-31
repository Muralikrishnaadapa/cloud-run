const express = require('express');
const app = express();

app.get('*', (req, res) => {
  console.log('Received request with host:', req.headers.host);
  res.send('Hello from Cloud Run');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(⁠ Server running on ${PORT} ⁠));
