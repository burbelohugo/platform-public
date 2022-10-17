const AWS = require('aws-sdk');
const UUID = require('uuid');
const csv = require('csvtojson');

AWS.config.update({ region: 'us-east-1' });

const sponsors = [
  { name: 'M&T Bank', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'Technica', demoSession: 3, zoomLink: 'https://zoom.us/' },
  { name: 'Bloomberg', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'JP Morgan Chase', demoSession: 3, zoomLink: 'https://zoom.us/' },
  { name: 'Visionist', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'Facebook', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'Capital One', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'Fannie Mae', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'MLH', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'Nextdoor', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'Google', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'Qualcomm', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'Dingman Center', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'FINRA', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'Adobe', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'Tenable', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'Cisco', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'Cvent', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'Splunk', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'Qualtrics', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'Coding it Forward', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'TripAdvisor', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'Altamira', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'T. Rowe Price', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'Goldman Sachs', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'ASRC Federal', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'FiscalNote', demoSession: 2, zoomLink: 'https://zoom.us/' },
  { name: 'Algorand', demoSession: 1, zoomLink: 'https://zoom.us/' },
  { name: 'VistaPrint', demoSession: 2, zoomLink: 'https://zoom.us/' },
];

const ddb = new AWS.DynamoDB.DocumentClient();

const SPONSORS_INFO_TABLE = 'platform-dev-sponsorship-info';
const DEVPOST_LINK_TABLE = 'platform-dev-project-submissions';
const USERS_TABLE = 'platform-dev-users';
const MEMBERSHIPS_TABLE = 'platform-dev-team-memberships';

async function deleteRow(id, table) {
  const params = {
    TableName: table,
    Key: { id },
  };

  // Call DynamoDB to delete the item in the table
  await ddb.delete(params).promise();
}

async function clearTable(table) {
  const params = {
    TableName: table,
  };

  const result = await ddb.scan(params).promise();

  if (result.Items.length > 0) {
    await Promise.all(result.Items.forEach((row) => {
      deleteRow(row.id, table);
    }));
  }
}

async function main() {
  await clearTable(SPONSORS_INFO_TABLE);

  sponsors.forEach(async (sponsor) => {
    const params = {
      TableName: SPONSORS_INFO_TABLE,
      Item: { ...sponsor, id: UUID.v4() },
    };

    // Call DynamoDB to add the item to the table
    await ddb.put(params).promise();
  });

  const submissions = await csv().fromFile('__tests__/inputs/submissions2.csv');

  submissions.forEach(async (submission) => {
    const teamId = UUID.v4();
    const userId = UUID.v4();

    const projectParams = {
      TableName: DEVPOST_LINK_TABLE,
      Item: {
        id: UUID.v4(),
        team_id: teamId,
        team_name: submission.title,
        devpost_link: submission.url,
      },
    };
    await ddb.put(projectParams).promise();

    const UsersParams = {
      TableName: USERS_TABLE,
      Item: {
        id: userId,
        slack_id: 'U01N8TEJ64C',
      },
    };
    await ddb.put(UsersParams).promise();

    const membershipParams = {
      TableName: MEMBERSHIPS_TABLE,
      Item: {
        id: UUID.v4(),
        team_id: teamId,
        user_id: userId,
        team_name: submission.title,
      },
    };
    await ddb.put(membershipParams).promise();
  });
}

main();
