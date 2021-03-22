const express = require('express');
const cors = require('cors');

const { getFileStream } = require('./utils/storage');

const app = express();

app.use(cors());
// a neccessary evil, not all can go though graphql
// this way only the server can serve the images
// and the bucket stays protected to the public
app.get('/files/:key', (req, res) => {
  const { key } = req.params;
  getFileStream(key, res);
  // const readStream = getFileStream(key);
  // readStream.pipe(res);
});

module.exports = app;
