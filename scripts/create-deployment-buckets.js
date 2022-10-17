const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const PREFIX = "platform";
const SERVICE_LIST = ["admin", "expo", "projects", "teams", "campfire-games", "schedule", "users", "chats", "tracking", "mobile"];
const STAGE_LIST = ['prd', 'stg', 'dev', 'test'];

const createBucket = (service, stage) => {
  const fullBucketName = `${PREFIX}-${service}-${stage}-layers-bucket`;
  var params = {
    Bucket: fullBucketName,
    ACL: "private",
  };
  s3.createBucket(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data); // successful response
  });
};

STAGE_LIST.forEach((stage) => {
  SERVICE_LIST.forEach((service) => {
    createBucket(service, stage);
  });
});
