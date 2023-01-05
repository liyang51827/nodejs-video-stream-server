const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/video', (req, res) => {
  try {
    // Ensure there is a range given for the video
    const range = req && req.headers && req.headers.range;
    if (!range) {
      res.status(400).send('BAD_REQUEST: No Range Header');
      return;
    }
  
    const VIDEO_PATH = './bucket/demo.mp4';
    const videoSize = fs.statSync(VIDEO_PATH).size;
  
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  
    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4'
    };
  
    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);
  
    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(VIDEO_PATH, { start, end });
  
    // Stream the video chunk to the client
    videoStream.pipe(res);
  } catch (e) {
    console.log(e);
    res.status(400).send('Error occurred');
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
