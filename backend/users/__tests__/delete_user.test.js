// tests for delete_user

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');

const { lambdaWrapper } = jestPlugin;
const adder = lambdaWrapper.wrap(mod, { handler: 'add_user' });
const wrapped = lambdaWrapper.wrap(mod, { handler: 'delete_user' });

const AWS = require('aws-sdk');

const delete_user = {
  body: JSON.stringify({
    email: 'newUser@gmail.com',
    full_name: 'Delete User',
    access_level: 'Hack',
    group: 'hacker',
  }),
};

describe('delete_user', () => {
  beforeAll((done) => {
    done();
  });

  it('Correctly adds and deletes the user', async () => {
    const added = await adder.run(delete_user);

    const myId = JSON.parse(added.body).id;
    const valid_request = {
      body: JSON.stringify({
        id: myId,
      }),
    };

    return await wrapped.run(valid_request).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toMatchObject({ body: {}, statusCode: 200 });

      // Check to see if user deleted
      const ddb = new AWS.DynamoDB.DocumentClient();

      const getChange = {
        TableName: process.env.USERS_TABLE,
        Key: { id: myId },
      };

      const result = await ddb.get(getChange).promise();

      expect(result).toMatchObject({});
    });
  });

  it('Fails to delete user without id', async () => {
    const added = await adder.run(delete_user);

    const invalid_request = {
      body: JSON.stringify({
        full_name: 'delete user',
      }),
    };
    return await wrapped.run(invalid_request).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toMatchObject({ body: {}, statusCode: 500 });
    });
  });
});
