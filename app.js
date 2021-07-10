const express = require('express');
const cors = require('cors');

const { getFileStream } = require('./utils/storage');

const app = express();

app.use(cors());
app.use(
  express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 })
);
// a neccessary evil, not all can go though graphql
// this way only the server can serve the images
// and the bucket stays protected to the public
app.get('/files/:key', (req, res) => {
  const { key } = req.params;
  try {
    getFileStream(key, res);
  } catch (error) {
    console.log(error);
  }
  // const readStream = getFileStream(key);
  // readStream.pipe(res);
});

module.exports = app;
