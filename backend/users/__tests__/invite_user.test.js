// tests for invite_user
// Generated by serverless-jest-plugin

const jestPlugin = require('serverless-jest-plugin');
const mod = require('../handler');

const { lambdaWrapper } = jestPlugin;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'invite_user' });

const adder = lambdaWrapper.wrap(mod, { handler: 'add_user' });
const bootstrap_user = {
  body: JSON.stringify({
    access_level: 'Test',
    email: 'hello@bit.camp',
    full_name: 'Serverless Test',
    group: 'hacker',
  }),
};

describe('invite_user', () => {
  beforeAll((done) => {
    //  lambdaWrapper.init(liveFunction); // Run the deployed lambda

    done();
  });

  it('Error case', () => {
    const event = {
      body: JSON.stringify({}),
    };

    return wrapped.run(event).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 500);
    });
  });

  it('Valid case', async () => {
    // Add a user into the DB
    const response = await adder.run(bootstrap_user);
    const test_user_id = (JSON.parse(response.body).id);

    const event = {
      body: JSON.stringify({
        id: test_user_id,
      }),
    };

    // Check to make sure our fancy event id was returned by endpoint
    return await wrapped.run(event).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toHaveProperty('statusCode', 200);
    });
  });
});
