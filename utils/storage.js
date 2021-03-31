/* eslint-disable consistent-return */
const aws = require('aws-sdk');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// NOTE: Node v12 or bust, Maximum call stack size exceeded error
// eslint-disable-next-line consistent-return
const uploadFile = async (createReadStream, key) => {
  const uploadParams = {
    Bucket: bucketName,
    Body: createReadStream(),
    Key: key,
  };

  // try {
  //   return s3.upload(uploadParams).promise();
  // } catch (error) {
  //   console.log(error);
  //   // throw new Error(error);
  // }

  // .promise() on a function returns a Promise instead of a callback
  // return s3.upload(uploadParams).promise();

  return new Promise((resolve, reject) => {
    s3.upload(uploadParams, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const getFileStream = async (key, res) => {
  const downloadParams = {
    Bucket: bucketName,
    Key: key,
  };
  // const stream = await s3.getObject(downloadParams).createReadStream();
  // return s3.getObject(downloadParams).promise();

  return new Promise((resolve, reject) => {
    s3.getObject(downloadParams)
      .createReadStream()
      .on('end', () => resolve())
      .on('error', (error) => reject(error))
      .pipe(res);
  });

  // try {
  //   return s3.getObject(downloadParams).createReadStream().pipe(res);
  // } catch (error) {
  //   console.log(error);
  //   // throw new Error(error);
  // }
};

const deleteFile = async (key) =>
  new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: bucketName,
        Key: key,
      },
      (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });

module.exports = { uploadFile, getFileStream, deleteFile };
