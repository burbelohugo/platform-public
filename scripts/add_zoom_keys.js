// this script creates tables and adds Zoom API keys to them.
// usage: node add_zoom_keys.js

const AWS = require('aws-sdk');
const UUID = require('uuid');


AWS.config.update({ region: 'us-east-1' });

const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const ddb = new AWS.DynamoDB.DocumentClient();

const TABLE_LIST = [
  { name: 'zoom-api-keys', keyName: 'key' },
];

const STAGE_LIST = ['prod', 'stage', 'dev', 'test'];
const KEY_LIST = [
    {
        "key": "<Zoom API key>",
        "email": "<email>"
    },
]

add_item = async (tableName, stage, item) => {
    const fullTableName = `platform-${stage}-${tableName}`;
    const body = item;
    const id = UUID.v4();
    const params = {
        TableName: fullTableName,
        Item: {},
    };

    body.id = id;

    // dynamically add post request body params to document
    Object.keys(body).forEach((k) => {
        params.Item[k] = body[k];
    });

    // Call DynamoDB to add the item to the table
    await ddb.put(params).promise();

    console.log("success");
};

// create tables, then populate
STAGE_LIST.forEach((stage) => {
  TABLE_LIST.forEach((table) => {
    KEY_LIST.forEach((item) => {
        let res = add_item(table.name, stage, item);
    })
  });
});
