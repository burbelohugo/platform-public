// tests for add_shortlink_click

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');

const { lambdaWrapper } = jestPlugin;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'add_shortlink_click' });

const AWS = require('aws-sdk');

const request = {
  body: JSON.stringify({
    link_id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    user_id: 'sdfjdskjas-asdkasdjajdfs-2nmn22sd',
    timestamp: new Date().toLocaleString(),
  }),
};

describe('add_shortlink_click', () => {
  beforeAll((done) => {
    done();
  });

  it('Successfully adds shortlink click', async () => await wrapped.run(request).then(async (response) => {
    expect(response).toBeDefined();
    expect(response).toMatchObject({ body: {}, statusCode: 200 });

    // Check to see if click added
    const ddb = new AWS.DynamoDB.DocumentClient();
    const { id } = JSON.parse(response.body);

    const getChange = {
      TableName: process.env.SHORTLINK_CLICKS_TABLE,
      Key: { id },
    };

    const result = await ddb.get(getChange).promise();

    const link_id = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

    expect(result.Item.link_id).toMatch(link_id);
  }));
});
