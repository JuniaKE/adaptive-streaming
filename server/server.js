const { Storage } = require('@google-cloud/storage');
const express = require('express');
const fs = require('fs');
const app = express();
const storage = new Storage();
const myBucket = storage.bucket('my-bucket');


app.get('/video', (req, res) => {
  const range = req.headers.range; // The current position we are in the video we are playing (This is in bytes)
  const videoPath = 'data-store/2.mp4'; // Path to the video in our storage
  const videoSize = fs.statSync(videoPath).size; // Total Video Size

  const chunkSize = 1 * 1e+6; // Amount of data to send per request
  const start = range ? Number(range.replace(/\D/g, '')) : 0; // Get a number from our range by deleting chars in the range
  const end = Math.min(start + chunkSize, videoSize - 1);
  const contentLength = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  }

  res.writeHead(206, headers);

  const stream = fs.createReadStream(videoPath, { start, end });
  stream.pipe(res);
})

app.listen(3000);