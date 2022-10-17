//package imports
const AWS = require("aws-sdk");
const UUID = require("uuid");

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Headers": "*",
};

AWS.config.update({ region: "us-east-1" });

/*module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello World",
    }),
  };
};*/

module.exports.create_project = async (event) => {
  const body = JSON.parse(event.body); //POST request is a long string if it's not parsed

  const ddb = new AWS.DynamoDB.DocumentClient(); //calls DynamoDB

  const id = UUID.v4();

  const params = {
    TableName: "platform-dev-project-submissions-fellows",
    Item: {
      /*id: id,
      name: body.name,
      author: body.author,*/
    },
  };

  body.id = id;
  Object.keys(body).forEach((k) => {
    params.Item[k] = body[k];
  });

  await ddb.put(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    HEADERS,
  };
};

module.exports.create_like = async (event) => {
  const body = JSON.parse(event.body); //POST request is a long string if it's not parsed

  const ddb = new AWS.DynamoDB.DocumentClient(); //calls DynamoDB

  const id = UUID.v4();

  const params = {
    TableName: "platform-dev-fellow-submission-likes",
    Item: {
      /*id: id,
      name: body.name,
      author: body.author,*/
    },
  };

  body.id = id;
  Object.keys(body).forEach((k) => {
    params.Item[k] = body[k];
  });

  await ddb.put(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    HEADERS,
  };
};

module.exports.get_projects = async (project) => {
  const params = {
    TableName: "platform-dev-project-submissions-fellows",
  };

  const ddb = new AWS.DynamoDB.DocumentClient();

  const result = await ddb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
    headers: HEADERS,
  };
};

module.exports.get_project = async (event) => {
  const { id } = event.queryStringParameters;
  const params = {
    TableName: "platform-dev-project-submissions-fellows",
    KeyConditionExpression: "#id = :id",
    ExpressionAttributeNames: {
      "#id": "id",
    },
    ExpressionAttributeValues: {
      ":id": id,
    },
  };

  const ddb = new AWS.DynamoDB.DocumentClient();

  const result = await ddb.query(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: HEADERS,
  };
};
