// tests for ban_user

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');

const { lambdaWrapper } = jestPlugin;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'ban_user' });
const AWS = require('aws-sdk');

const valid_case = {
  id: 'sdfjskddfjsdfs-fsdjf1231',
  reason: 'did a bad',
};

const invalid_case = {
  reason: 'did a bad',
};

describe('ban_user', () => {
  beforeAll(async (done) => {
    const ddb = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: process.env.BANNED_USERS_TABLE,
    };
    const result = await ddb.scan(params).promise();
    result.Items.forEach((item) => {
      ddb.delete(item);
    });
    done();
  });

  it('Succeeds in adding user to banned users table', async () => {
    const stub = valid_case;
    const event = {
      body: JSON.stringify(stub),
    };

    return await wrapped.run(event).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 200);
    });
  });

  it('Fails in adding user to banned users table', async () => {
    const stub = invalid_case;
    const event = {
      body: JSON.stringify(stub),
    };

    return await wrapped.run(event).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 500);
    });
  });
});
