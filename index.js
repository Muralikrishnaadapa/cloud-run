const express = require('express');
const app = express();

app.get('*', (req, res) => {
  console.log('Incoming host:', req.headers.host);
  res.send('✅ Cloud Run is working!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(⁠ Server started on port ${PORT} ⁠));
