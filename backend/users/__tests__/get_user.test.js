// tests for get_shortlink

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');

const { lambdaWrapper } = jestPlugin;
const adder = lambdaWrapper.wrap(mod, { handler: 'add_user' });
const wrapped = lambdaWrapper.wrap(mod, { handler: 'get_user' });

const AWS = require('aws-sdk');

const add_user = {
  body: JSON.stringify({
    email: 'newUser@gmail.com',
    full_name: 'New User',
    access_level: 'Hack',
    group: 'hacker',
  }),
};

describe('get_user', () => {
  beforeAll((done) => {
    done();
  });

  it('Successfully gets user', async () => {
    const added = await adder.run(add_user);
    const myId = JSON.parse(added.body).id;
    const valid_request = {
      queryStringParameters: JSON.stringify({ id: myId }),
    };

    return await wrapped.run(valid_request).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toMatchObject({ body: {}, statusCode: 200 });
    });
  });
});
