const aws = require('aws-sdk');
const uuid = require('uuid');

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
const uploadFile = async (createReadStream, filename) => {
  const uploadParams = {
    Bucket: bucketName,
    Body: createReadStream(),
    Key: `${uuid.v4()}${filename}`,
  };

  // .promise() on a function returns a Promise instead of a callback
  // return s3.upload(uploadParams).promise();

  return new Promise((resolve, reject) => {
    s3.upload(uploadParams, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(data);
        resolve(data);
      }
    });
  });
};

module.exports = uploadFile;
