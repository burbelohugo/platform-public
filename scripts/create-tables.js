const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const TABLE_LIST = [
  { name: 'admin', keyName: 'id' },
  { name: 'invites', keyName: 'id' },
  { name: 'team-invites', keyName: 'id' },
  { name: 'team-memberships', keyName: 'id' },
  { name: 'projects', keyName: 'id' },
  { name: 'schedule', keyName: 'id' },
  { name: 'shortlink-clicks', keyName: 'id' },
  { name: 'shortlinks', keyName: 'shortlinks' }, /* NOTE: different keyname for shortlinks */
  { name: 'sponsorship-info', keyName: 'id' },
  { name: 'teams', keyName: 'id' },
  { name: 'user-events', keyName: 'id' },
  { name: 'users', keyName: 'id' },
  { name: 'banned-users', keyName: 'id' },
  { name: 'meetings', keyName: 'id' },
  { name: 'project-submissions', keyName: 'id' },
  { name: 'referrals', keyName: 'id' },
  { name: 'activity', keyName: 'id' },
  { name: 'zoom-api-keys', keyName: 'key' },
  { name: 'easter-eggs', keyName: 'id' },
  { name: 'sponsor-booths', keyName: 'id' },
  { name: 'announcements', keyName: 'id' },
  { name: 'mentorship-requests', keyName: 'id' },
  { name: 'project-checklist-items', keyName: 'id' },
  { name: 'sponsor-activity-tracking', keyName: 'id' },
  { name: 'expo-schedule', keyName: 'id' },
];

const STAGE_LIST = ['prd', 'stg', 'dev', 'test'];

const createTable = (tableName, keyName, stage) => {
  const fullTableName = `platform-${stage}-${tableName}`;
  const params = {
    KeySchema: [
      {
        AttributeName: keyName,
        KeyType: 'HASH',
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: keyName,
        AttributeType: 'S',
      },
    ],
    TableName: fullTableName,
    BillingMode: 'PAY_PER_REQUEST',
  };
  dynamodb.createTable(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log(data);
  });
};

STAGE_LIST.forEach((stage) => {
  TABLE_LIST.forEach((table) => {
    createTable(table.name, table.keyName, stage);
  });
});
