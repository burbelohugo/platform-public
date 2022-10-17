// tests for update_event

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');

const { lambdaWrapper } = jestPlugin;
const adder = lambdaWrapper.wrap(mod, { handler: 'add_event' });
const wrapped = lambdaWrapper.wrap(mod, { handler: 'update_event' });

const AWS = require('aws-sdk');

const old_event = {
  body: JSON.stringify({
    id: 'hwat',
    category: 'main',
    description: 'Update this workshop for Technica!',
    event_name: "hugo's awesome workshop",
  }),
};

const new_event = {
  body: JSON.stringify({
    id: 'hwat',
    category: 'main',
    description: 'This workshop is updated for Technica!',
    event_name: "hugo's awesome workshop",
  }),
};

const invalid_request = {
  body: JSON.stringify({
    category: 'new category',
    description: 'missing id :O',
  }),

};

describe('update_event', () => {
  beforeAll((done) => {
    done();
  });

  it('Correctly adds and updates the event', async () => {
    const added = await adder.run(old_event);

    return await wrapped.run(new_event).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toMatchObject({ body: {}, statusCode: 200 });

      // Check to see if event updated
      const ddb = new AWS.DynamoDB.DocumentClient();
      const { id } = JSON.parse(new_event.body);

      const getChange = {
        TableName: process.env.SCHEDULE_TABLE,
        Key: { id },
      };

      const result = await ddb.get(getChange).promise();

      const descrip = 'This workshop is updated for Technica!';
      expect(result.Item.description).toMatch(descrip);
    });
  });

  it('Fails to update event without id', async () => {
    const added = await adder.run(old_event);

    return await wrapped.run(invalid_request).then(async (response) => {
      expect(response).toBeDefined();
      expect(response).toMatchObject({ body: {}, statusCode: 500 });
    });
  });
});
