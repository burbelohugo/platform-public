// tests for add_shortlink

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');

const { lambdaWrapper } = jestPlugin;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'add_shortlink' });

const AWS = require('aws-sdk');

const valid_request = {
  body: JSON.stringify({
    link: 'zoom.us/meet/sdjfksdzanfks',
    target: 'Animal crossing workshop',
  }),
};

const invalid_request = {
  body: JSON.stringify({
    link: "where's my target?",
  }),
};

describe('add_shortlink', () => {
  beforeAll((done) => {
    done();
  });

  it('Successfully adds shortlink', async () => await wrapped.run(valid_request).then(async (response) => {
    expect(response).toBeDefined();
    expect(response).toMatchObject({ body: {}, statusCode: 200 });
  }));

  it('Fails to add shortlink without target', async () => await wrapped.run(invalid_request).then(async (response) => {
    expect(response).toBeDefined();
    expect(response).toMatchObject({ body: {}, statusCode: 500 });
  }));
});
