// tests for get_shortlink

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');

const { lambdaWrapper } = jestPlugin;
const adder = lambdaWrapper.wrap(mod, { handler: 'add_shortlink' });
const wrapped = lambdaWrapper.wrap(mod, { handler: 'get_shortlink' });

const AWS = require('aws-sdk');

const add_request = {
  body: JSON.stringify({
    shortlinks: '2A1931',
    link: 'zoom.us/meet/hrfss',
    target: 'Jammin',
  }),
};

const get_request = {
  queryStringParameters: JSON.stringify({ shortlinks: '2A1931' }),

};
describe('get_shortlink', () => {
  beforeAll((done) => {
    done();
  });

  it('Successfully gets shortlink', async () => {
    const response = await adder.run(add_request);
    return await wrapped.run(get_request).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toMatchObject({ body: {}, statusCode: 200 });
    });
  });
});
