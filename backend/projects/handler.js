const AWS = require('aws-sdk');
const UUID = require('uuid');
const withSentry = require('serverless-sentry-lib');
const { IncomingWebhook } = require('@slack/webhook');
const { WebClient } = require('@slack/web-api');
const axios = require('axios');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': '*',
};

AWS.config.update({ region: 'us-east-1' });

/**
 * Puts data in given table
 *
 * @param table The table to put the data in
 * @param data The data to put in the table
 * @returns Promise with results
 */
async function addToTable(table, data) {
  const params = {
    TableName: table,
    Item: {},
  };

  // using DocumentClient auto parses the output into nice JSON!
  const ddb = new AWS.DynamoDB.DocumentClient();

  // dynamically add post request body params to document
  Object.keys(data).forEach((k) => {
    params.Item[k] = data[k];
  });

  // Call DynamoDB to add the item to the table
  return ddb.put(params).promise();
}

// Retrieves all sponsors from the database
module.exports.get_sponsorship_info = withSentry(async () => {
  const params = {
    TableName: process.env.SPONSORS_INFO_TABLE,
  };

  // using DocumentClient auto parses the output into nice JSON!
  const ddb = new AWS.DynamoDB.DocumentClient();

  const result = await ddb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
    headers: HEADERS,
  };
});

// route restricted to users with role organizer
// Adds a new sponsor to the database
module.exports.add_sponsor = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  body.id = UUID.v4();

  return addToTable(process.env.SPONSORS_INFO_TABLE, body).then(() => ({
    statusCode: 200,
    body: JSON.stringify(body),
    headers: HEADERS,
  }));
});

// route restricted to users with role organizer
// Adds a new sponsor to the database from a typescript form
module.exports.add_sponsor_from_form = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  // These are the questions we will use from the form
  const nameQuestion = '01EZXF7VC61YCW32882BHTTGTT';
  const eventQuestion = '22f39ea4-2ed3-4128-a045-c6d09cd6b2bb';
  const prizeQuestion = 'd59a48d2-b567-40f3-b9bf-d52441034266';
  const websiteLinkQuestion = '581e6518-b362-4cac-a442-cd8a9c319b73';
  const descriptionQuestion = '080fef79-7620-42b4-b6e0-f599cb08e879';
  const contactQuestion = '6193e3e3-6216-44ed-9240-c713b8871b3f';
  const jobListingQuestion = 'bbb97449-33e9-439c-a8af-e6a968043226';

  // Create the sponsor booth object
  const sponsorBooth = {
    id: UUID.v4(),
    downloadable_content: [],
    main_title: 'About Us',
    footer_title: 'Job Postings',
    footer_links: [],
  };

  const sponsorName = body.form_response.answers.filter((response) => response.field.ref === nameQuestion);
  const eventHosted = body.form_response.answers.filter((response) => response.field.ref === eventQuestion);
  const prizes = body.form_response.answers.filter((response) => response.field.ref === prizeQuestion);
  const websiteLink = body.form_response.answers.filter((response) => response.field.ref === websiteLinkQuestion);
  const description = body.form_response.answers.filter((response) => response.field.ref === descriptionQuestion);
  const contact = body.form_response.answers.filter((response) => response.field.ref === contactQuestion);
  const jobListing = body.form_response.answers.filter((response) => response.field.ref === jobListingQuestion);

  if (websiteLink.length > 0) {
    sponsorBooth.downloadable_content.push({
      title: 'Website',
      link: websiteLink[0].url,
    });
  }

  if (description.length > 0) {
    sponsorBooth.description = description[0].text;
  }

  if (contact.length > 0) {
    sponsorBooth.email_one = contact[0].text;
  }

  if (jobListing.length > 0) {
    // Should be comma separated
    jobListing[0].text.split(',')
      .forEach((link) => sponsorBooth.footer_links.push({
        title: '',
        link: link.trim(),
      }));
  }

  // Create the sponsor info object
  const sponsorInfo = {
    id: UUID.v4(),
    booth_id: sponsorBooth.id,
  };
  if (sponsorName.length > 0) {
    sponsorInfo.name = sponsorName[0].text;
  }

  if (eventHosted.length > 0) {
    sponsorInfo.events_hosted = [eventHosted[0].text];
  }

  if (prizes.length > 0) {
    sponsorInfo.prizes = [prizes[0].text];
  }

  return addToTable(process.env.SPONSOR_BOOTHS_TABLE, sponsorBooth).then(() => addToTable(process.env.SPONSORS_INFO_TABLE, sponsorInfo).then(() => ({
    statusCode: 200,
    body: JSON.stringify({ ...sponsorBooth, ...sponsorInfo }),
    headers: HEADERS,
  })));
});

// route restricted to users with role sponsor
// Updates a sponsor in the database
module.exports.update_sponsor = withSentry(async (event) => {
  const body = JSON.parse(event.body);
  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!body.id) {
    return {
      statusCode: 500,
      body: 'update_sponsor expects key "id"',
    };
  }

  const { id } = body;
  // Initialize UpdateExpression for ddb.update()
  let update = 'SET';
  // Initialize ExpressionAttributeNames for ddb.update()
  const exprAttrNames = {};
  // Initialize ExpressionAttributeValues for ddb,updateItem()
  const exprAttrValues = {};
  let counter = 0;

  // dynamically update post request body params to document
  Object.keys(body).forEach((k) => {
    if (k !== 'id') {
      const ref = `val${counter}`;
      const updateElement = ` #${k} =:${ref},`;
      update = update.concat(updateElement);
      exprAttrNames[`#${k}`] = k;
      exprAttrValues[`:${ref}`] = body[k];
      counter += 1;
    }
  });

  // Remove trailing comma from UpdateExpression added on line 405
  update = update.slice(0, -1);

  const params = {
    TableName: process.env.SPONSORS_INFO_TABLE,
    Key: {
      id: id.toString(),
    },
    UpdateExpression: update,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
  };

  // Call DynamoDB to update the item to the table
  const result = await ddb.update(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: HEADERS,
  };
});

// route restricted to users with role admin
module.exports.delete_sponsor = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!body.id) {
    return {
      statusCode: 500,
      body: 'delete_sponsor expects key "id"',
    };
  }

  const params = {
    TableName: process.env.SPONSORS_INFO_TABLE,
    Key: {
      id: body.id,
    },
  };

  // Call DynamoDB to delete the item in the table
  await ddb.delete(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ id: body.id }),
    headers: HEADERS,
  };
});

// adds a new mentorship request to the database
module.exports.create_mentorship_request = withSentry(async (request) => {
  const body = JSON.parse(request.body);
  const ddb = new AWS.DynamoDB.DocumentClient();
  const id = UUID.v4();
  body.id = id;

  // checks if any field is missing to create a request
  if (!body.title || !body.description || !body.topic) {
    return {
      statusCode: 500,
      body: 'create_mentorship_request is missing a field',
    };
  }

  const userQueryParams = {
    TableName: process.env.USERS_TABLE,
    KeyConditionExpression: '#id = :id',
    ExpressionAttributeNames: {
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':id': body.user_id,
    },
  };

  const userQueryResult = await ddb.query(userQueryParams).promise();
  const userName = userQueryResult.Items[0].full_name;

  const params = {
    TableName: process.env.MENTORSHIP_REQUESTS_TABLE,
    Item: {},
  };

  // dynamically add post request body params to document
  Object.keys(body).forEach((k) => {
    params.Item[k] = body[k];
  });

  params.Item.timestamp = new Date().toString();
  params.Item.full_user_name = userName;
  params.Item.resolved = false;

  // Call DynamoDB to add the item to the table
  await ddb.put(params).promise();

  const SecretsManager = new AWS.SecretsManager({ region: 'us-east-1' });
  const SecretsManagerSlackKey = await SecretsManager.getSecretValue(
    { SecretId: process.env.SLACK_WEBHOOK_SECRET_NAME },
  ).promise();
  const webhookJSON = JSON.parse(SecretsManagerSlackKey.SecretString);
  const webhookUrl = webhookJSON.PLATFORM_MENTOR_SLACK_WEBHOOK;
  const webhook = new IncomingWebhook(webhookUrl);

  await webhook.send({
    blocks: [
      {
        block_id: userName,
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'New mentorship request:',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Name:*\n${userName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Topic:*\n${body.topic}`,
          },
          {
            type: 'mrkdwn',
            text: `*Title:*\n${body.title}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Description:*\n${body.description}`,
          },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              emoji: true,
              text: 'Claim',
            },
            style: 'primary',
            value: body.id,
            action_id: userQueryResult.Items[0].slack_id || 'test',
          },
        ],
      },
    ],
  });

  // Returns status code 200 and JSON string of 'result'
  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    headers: HEADERS,
  };
});

// route restricted to users with role mentor
// Retrieves all active mentorship requests from the database
module.exports.get_active_mentorship_requests = withSentry(async () => {
  const params = {
    TableName: process.env.MENTORSHIP_REQUESTS_TABLE,
    KeyConditionExpression: 'active = true',
  };

  const ddb = new AWS.DynamoDB.DocumentClient();
  // TODO: Replace ddb.scan with ddb.query or other efficient method
  const result = await ddb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
    headers: HEADERS,
  };
});

// update a mentorship request
module.exports.update_mentorship_request = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  // dynamically add body params to update request
  // this assumes body params are flat, AKA no dicts/lists inside
  // use an attribute map to avoid a name conflict with reserved keywords
  // atm only supports 52 attribute mappings
  let updateExpression = 'set ';
  const attributeMap = {};
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let charIndex = 0;
  const charactersLength = characters.length;

  Object.keys(body).forEach((k) => {
    if (k !== 'id' && k !== 'timestamp') {
      if (charIndex < charactersLength) {
        const attr = characters.charAt(charIndex);
        charIndex += 1;
        attributeMap[`:${attr}`] = body[k];
        updateExpression += `${k} = :${attr}, `;
      } else {
        throw new Error(
          'attribute placeholders exhausted (num of attributes is >52).',
        );
      }
    }
  });
  updateExpression = updateExpression.slice(0, -2);

  const params = {
    TableName: process.env.MENTORSHIP_REQUESTS_TABLE,
    Key: {
      id: body.id,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: attributeMap,
    ReturnValues: 'UPDATED_NEW', // return updated attributes
  };

  const ddb = new AWS.DynamoDB.DocumentClient();

  const result = await ddb.update(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
    headers: HEADERS,
  };
});

// Retrieves mentorship requests by a user from the database
module.exports.get_user_mentorship_requests = withSentry(async (event) => {
  const userId = event.queryStringParameters.user_id;

  const params = {
    TableName: process.env.MENTORSHIP_REQUESTS_TABLE,
    FilterExpression: 'user_id = :u',
    ExpressionAttributeValues: {
      ':u': userId,
    },
  };

  const ddb = new AWS.DynamoDB.DocumentClient();

  // TODO: Replace ddb.scan with ddb.query or other efficient method
  const result = await ddb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
    headers: HEADERS,
  };
});

// Implement backend endpoint to create a new devpost submission for a team
module.exports.create_project_submission = withSentry(async (event) => {
  const body = JSON.parse(event.body);
  const devpostLinkTable = process.env.DEVPOST_LINK_TABLE;

  // Check for validity
  if (!body.team_id || !body.team_name || !body.devpost_link) {
    return {
      statusCode: 500,
      body: 'create_project_submission expects params: team_id, team_name, devpost_link',
    };
  }

  const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
  const id = UUID.v4();

  const params = {
    TableName: devpostLinkTable,
    Item: {
      id: { S: id },
      team_id: { S: body.team_id },
      team_name: { S: body.team_name },
      devpost_link: { S: body.devpost_link },
    },
  };

  // Call DynamoDB to add the item to the table
  await ddb.putItem(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    headers: HEADERS,
  };
});

// adds a new project submission checklist item to the database
module.exports.create_project_checklist_item = withSentry(async (request) => {
  const body = JSON.parse(request.body);
  const ddb = new AWS.DynamoDB.DocumentClient();

  // checks if any field is missing to create a request
  if (!body.team_id || !body.checklist_item_id) {
    return {
      statusCode: 500,
      body: 'create_project_checklist_item is missing a field',
    };
  }

  body.id = UUID.v4();
  body.is_checked = false;

  const params = {
    TableName: process.env.PROJECT_SUBMISSION_CHECKLIST_ITEMS_TABLE,
    Item: {},
  };

  // dynamically add post request body params to document
  Object.keys(body).forEach((k) => {
    params.Item[k] = body[k];
  });

  // Call DynamoDB to add the item to the table
  await ddb.put(params).promise();

  // Returns status code 200 and JSON string of 'result'
  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    headers: HEADERS,
  };
});

// gets a project submission checklist from the database matching a team id
module.exports.get_project_checklist_item = withSentry(async (event) => {
  const teamId = event.queryStringParameters.team_id;

  const params = {
    TableName: process.env.PROJECT_SUBMISSION_CHECKLIST_ITEMS_TABLE,
    FilterExpression: 'team_id = :t',
    ExpressionAttributeValues: {
      ':t': teamId,
    },
  };

  // using DocumentClient auto parses the output into nice JSON!
  const ddb = new AWS.DynamoDB.DocumentClient();

  // TODO: Replace ddb.scan with ddb.query or other efficient method
  const result = await ddb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
    headers: HEADERS,
  };
});

// updates an existing project submission checklist item in the database
module.exports.update_project_checklist_item = withSentry(async (event) => {
  const ddb = new AWS.DynamoDB.DocumentClient();

  const body = JSON.parse(event.body);

  if (!body.id) {
    return {
      statusCode: 500,
      body: 'update_project_checklist_item expects key "id"',
    };
  }

  const { id } = body;

  // Initialize UpdateExpression for ddb.update()
  let update = 'SET';

  // Initialize ExpressionAttributeNames for ddb.update()
  const exprAttrNames = {};

  // Initialize ExpressionAttributeValues for ddb,updateItem()
  const exprAttrValues = {};

  let counter = 0;

  // dynamically update post request body params to document
  Object.keys(body).forEach((k) => {
    if (k !== 'id') {
      const ref = `val${counter}`;
      const updateElement = ` #${k} =:${ref},`;
      update = update.concat(updateElement);
      exprAttrNames[`#${k}`] = k;
      exprAttrValues[`:${ref}`] = body[k];
      counter += 1;
    }
  });

  // Remove trailing comma from UpdateExpression
  update = update.slice(0, -1);

  const params = {
    TableName: process.env.PROJECT_SUBMISSION_CHECKLIST_ITEMS_TABLE,
    Key: {
      id: id.toString(),
    },
    UpdateExpression: update,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
  };

  // Call DynamoDB to update the item to the table
  const result = await ddb.update(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: HEADERS,
  };
});

// Implement backend endpoint to update a devpost submission for a team
module.exports.update_project_submission = withSentry(async (event) => {
  const body = JSON.parse(event.body);
  const devpostLinkTable = process.env.DEVPOST_LINK_TABLE;
  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!body.id) {
    return {
      statusCode: 500,
      body: 'update_project_submission expects key "id"',
    };
  }

  const { id } = body;
  // Initialize UpdateExpression for ddb.update()
  let update = 'SET';
  // Initialize ExpressionAttributeNames for ddb.update()
  const exprAttrNames = {};
  // Initialize ExpressionAttributeValues for ddb,updateItem()
  const exprAttrValues = {};
  let counter = 0;

  // dynamically update post request body params to document
  Object.keys(body).forEach((k) => {
    if (k !== 'id') {
      const ref = `val${counter}`;
      const updateElement = ` #${k} =:${ref},`;
      update = update.concat(updateElement);
      exprAttrNames[`#${k}`] = k;
      exprAttrValues[`:${ref}`] = body[k];
      counter += 1;
    }
  });

  // Remove trailing comma from UpdateExpression added on line 405
  update = update.slice(0, -1);

  const params = {
    TableName: devpostLinkTable,
    Key: {
      id: id.toString(),
    },
    UpdateExpression: update,
    ExpressionAttributeNames: exprAttrNames,
    ExpressionAttributeValues: exprAttrValues,
  };

  // Call DynamoDB to update the item to the table
  const result = await ddb.update(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: HEADERS,
  };
});

// route restricted to users with role mentor
module.exports.claim_mentorship_request = withSentry(async (event) => {
  const ddb = new AWS.DynamoDB.DocumentClient();
  const { body } = event;
  const parsedPayload = JSON.parse(decodeURIComponent(body.slice(body.indexOf('payload=') + 'payload='.length)));
  const { user } = parsedPayload;
  const mentorSlackUserId = user.id;

  const SecretsManager = new AWS.SecretsManager({ region: 'us-east-1' });
  const SecretsManagerSlackKey = await SecretsManager.getSecretValue(
    { SecretId: process.env.SLACK_WEBHOOK_SECRET_NAME },
  ).promise();
  const webhookJSON = JSON.parse(SecretsManagerSlackKey.SecretString);
  const SlackOauthToken = webhookJSON.PLATFORM_SLACK_OAUTH_TOKEN;

  const mentorshipRequestId = parsedPayload.actions[0].value;
  const hackerSlackUserId = parsedPayload.actions[0].action_id;
  const { response_url: responseUrl } = parsedPayload;

  const queryParams = {
    TableName: process.env.MENTORSHIP_REQUESTS_TABLE,
    KeyConditionExpression: '#id = :id',
    ExpressionAttributeNames: {
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':id': mentorshipRequestId,
    },
  };

  const queryResult = await ddb.query(queryParams).promise();
  const { title } = queryResult.Items[0];
  const userName = queryResult.Items[0].full_user_name;

  const web = new WebClient(SlackOauthToken);
  const conversation = await web.conversations.open({
    token: SlackOauthToken,
    users: `${mentorSlackUserId},${hackerSlackUserId}`,
  });
  await web.chat.postMessage({
    channel: conversation.channel.id,
    text: `Hi there! I'm connecting the two of you so <@${hackerSlackUserId}> can receive help with their mentorship request, titled: ${title}`,
  });

  const slackUpdateMessageResponse = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'New mentorship request:',
        },
      },
      {
        type: 'section',
        block_id: body.title,
        fields: [
          {
            type: 'mrkdwn',
            text: `*Name:*\n${userName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Topic:*\n${queryResult.Items[0].topic}`,
          },
          {
            type: 'mrkdwn',
            text: `*Title:*\n${queryResult.Items[0].title}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Description:*\n${queryResult.Items[0].description}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `:white_check_mark: Claimed by <@${mentorSlackUserId}>`,
          },
        ],
      },
    ],
  };

  await axios.post(responseUrl, slackUpdateMessageResponse);

  const updateParams = {
    TableName: process.env.MENTORSHIP_REQUESTS_TABLE,
    Key: {
      id: mentorshipRequestId,
    },
    UpdateExpression: 'set resolved = :p',
    ExpressionAttributeValues: {
      ':p': true,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  await ddb.update(updateParams).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({}),
    headers: HEADERS,
  };
});

module.exports.lookup_user_slack_id_by_email = withSentry(async (event) => {
  const { email } = event.queryStringParameters;

  const SecretsManager = new AWS.SecretsManager({ region: 'us-east-1' });
  const SecretsManagerSlackKey = await SecretsManager.getSecretValue(
    { SecretId: process.env.SLACK_WEBHOOK_SECRET_NAME },
  ).promise();
  const webhookJSON = JSON.parse(SecretsManagerSlackKey.SecretString);
  const SlackOauthToken = webhookJSON.PLATFORM_SLACK_OAUTH_TOKEN;

  const web = new WebClient(SlackOauthToken);
  let result = {};
  try {
    const apiResult = await web.users.lookupByEmail({ token: SlackOauthToken, email });
    result = apiResult;
  } catch (e) {
    const webhookUrl = webhookJSON.PLATFORM_ACTIVITY_SLACK_WEBHOOK;
    const webhook = new IncomingWebhook(webhookUrl);
    await webhook.send({
      text: `Could not find slack account for email ${email}`,
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: HEADERS,
  };
});

// route restricted to users with role sponsor
module.exports.add_favorite_hacker = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  if (!body.sponsor_id || !body.user_id) {
    return {
      statusCode: 500,
      body: 'add_favorite_hacker expects key "sponsor_id" and key "user_id"',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
    };
  }

  return addToTable(process.env.FAVORITE_HACKERS_TABLE, body).then(() => ({
    statusCode: 200,
    body: JSON.stringify(body),
    headers: HEADERS,
  }));
});

// route restricted to users with role sponsor
module.exports.delete_favorite_hacker = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!body.sponsor_id || !body.user_id) {
    return {
      statusCode: 500,
      body: 'delete_favorite_hacker expects key "sponsor_id" and key "user_id"',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
    };
  }

  const params = {
    TableName: process.env.FAVORITE_HACKERS_TABLE,
    Key: {
      sponsor_id: body.sponsor_id,
      user_id: body.user_id,
    },
  };

  // Call DynamoDB to delete the item in the table
  const statusResult = await ddb.delete(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(statusResult.Item),
    headers: HEADERS,
  };
});

// route restricted to users with role sponsor
module.exports.get_favorite_hackers = withSentry(async (event) => {
  const ddb = new AWS.DynamoDB.DocumentClient();
  const sponsorId = event.queryStringParameters.sponsor_id;

  const params = {
    TableName: process.env.FAVORITE_HACKERS_TABLE,
    KeyConditionExpression: 'sponsor_id = :s',
    ExpressionAttributeValues: {
      ':s': sponsorId,
    },
  };

  const result = await ddb.query(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
    headers: HEADERS,
  };
});
