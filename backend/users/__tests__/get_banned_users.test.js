// tests for get_bannned_users

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');

const { lambdaWrapper } = jestPlugin;
const adder = lambdaWrapper.wrap(mod, { handler: 'ban_user' });
const wrapped = lambdaWrapper.wrap(mod, { handler: 'get_banned_users' });

const AWS = require('aws-sdk');

const banned_users = {
  body: JSON.stringify({
    id: 'sdfjskddfjsdfs-fsdjf1231',
    reason: 'did a bad',
  }),
};

const received_banned_users = [{
  id: 'sdfjskddfjsdfs-fsdjf1231',
  reason: 'did a bad',
}];
describe('get_banned_users', () => {
  beforeAll((done) => {
    done();
  });

  it('Succeeds in retrieving users from banned users table', async () => {
    const response = await adder.run(banned_users);

    const event = {
      queryStringParameters: { id: 'sdfjskddfjsdfs-fsdjf1231' },
    };

    return wrapped.run(event).then((response) => {
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 200);
      expect(response).toMatchObject({ body: JSON.stringify(received_banned_users) });
    });
  });
});
