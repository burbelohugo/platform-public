// tests for get_point_totals

const jestPlugin = require('serverless-jest-plugin');
const AWS = require('aws-sdk');
const mod = require('../handler');

const { lambdaWrapper } = jestPlugin;
const getActiveSponsorBooths = lambdaWrapper.wrap(mod, {
  handler: 'get_active_sponsor_booths',
});
const addSponsorBooth = lambdaWrapper.wrap(mod, { handler: 'add_sponsor_booth' });

/**
 * Deletes ever sponsor booth
 */
async function deleteAllBooths() {
  const ddb = new AWS.DynamoDB.DocumentClient();
  const params = {
    ProjectionExpression: 'id',
    TableName: process.env.SPONSOR_BOOTHS_TABLE,
  };
  const result = await ddb.scan(params).promise();
  const deleteParams = result.Items.map(({ id }) => ({
    TableName: process.env.SPONSOR_BOOTHS_TABLE,
    Key: { id },
  }));

  return Promise.all(deleteParams.map((param) => ddb.delete(param).promise()));
}

describe('get_active_sponsor_booths', () => {
  beforeAll(async (done) => {
    await deleteAllBooths();
    done();
  });

  it('Gets the ids of all sponsors with open booths', async () => {
    // Define test DB entries
    const sponsorBooths = [
      {
        booth_open: true,
      },
      {
        booth_open: false,
        other_key: 'test',
      },
      {
        booth_open: true,
        other_key: 'test',
      },
    ];

    // Upload all booths to DB
    const promises = sponsorBooths.map((booth) => addSponsorBooth.run({ body: JSON.stringify(booth) }));

    // Extract id of each open booth
    const responses = await Promise.all(promises);
    const openBoothIds = responses
      .map((response) => JSON.parse(response.body).id)
      .filter((id, i) => sponsorBooths[i].booth_open);

    // Run response & check metadata
    const response = await getActiveSponsorBooths.run();
    expect(response).toBeDefined();
    expect(response).toHaveProperty('statusCode', 200);

    // Check response object
    const body = JSON.parse(response.body);
    expect(body.length).toBe(openBoothIds.length);
    expect(body).toEqual(expect.arrayContaining(openBoothIds));
  });
});
