const AWS = require('aws-sdk');
const UUID = require('uuid');
const withSentry = require('serverless-sentry-lib');
const rp = require('request-promise');
const { IncomingWebhook } = require('@slack/webhook');

const TESTING_STAGE = 'test';
const ADD_USER_EVENT = 'REGISTER';
const INVITE_USER_EVENT = 'LOGIN';
const LOGIN_LINK_TTL_MINUTES = 1440;
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': '*',
};

AWS.config.update({ region: 'us-east-1' });

// User ID hashing strategy
const emailToUserId = (email) => UUID.v5(email, process.env.UUID_NAMESPACE);

// generate random, cryptographically secure, url safe hex string
const randomHex = () => {
  const crypto = require('crypto'); // eslint-disable-line
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

// send an email with a login link for the user
const sendLoginLinkEmail = async (userId, setRegistrationStatus, isRequestFromApp) => {
  const ddb = new AWS.DynamoDB.DocumentClient();

  // Get the user's info to send email and update dbs
  // TODO: is this an unnecessary query? only need user name and email
  const userResp = await ddb.get({
    TableName: process.env.USERS_TABLE,
    Key: { id: userId },
  }).promise();
  const user = userResp.Item;

  const loginId = randomHex();
  const loginLink = `${process.env.BASE_INVITE_URL}?lid=${loginId}`;
  const firstName = user.full_name.split(' ')[0];

  // new item in "platform-invites" table with pertinent information
  const result = await ddb.put({
    TableName: process.env.INVITES_TABLE,
    Item: {
      id: loginId,
      user_id: user.id,
      email: user.email,
      invite_link: loginLink,
      expiry: (Math.floor(new Date().getTime() / 1000) + (LOGIN_LINK_TTL_MINUTES * 60)),
    },
  }).promise();

  // If not running integration suites, send email to user
  if (process.env.STAGE !== TESTING_STAGE) {
    const ses = new AWS.SES();

    if (isRequestFromApp) {
      const params = {
        Destination: { ToAddresses: [user.email] },
        Source: 'Technica <hello@gotechnica.org>',
        ConfigurationSetName: 'platform',
        Template: 'PlatformMagicLinkMobile',
        TemplateData: `{ "firstName":"${firstName}", "loginCode": "${loginId}" }`,
      };
      await ses.sendTemplatedEmail(params).promise();
    } else {
      const params = {
        Destination: { ToAddresses: [user.email] },
        Source: 'Technica <hello@gotechnica.org>',
        ConfigurationSetName: 'platform',
        Template: 'PlatformMagicLink',
        TemplateData: `{ "firstName":"${firstName}", "loginLink": "${loginLink}", "loginCode": "${loginId}" }`,
      };
      await ses.sendTemplatedEmail(params).promise();
    }
  }

  // We can set a flag in the body to not update their registration
  // status if they're just logging back in
  if (setRegistrationStatus) {
    // update ddb table:"platform-users" so user's
    // `registration_status` is "email_invite_sent"
    await ddb.update({
      TableName: process.env.USERS_TABLE,
      Key: { id: user.id.toString() },
      UpdateExpression: 'SET registration_status = :s',
      ExpressionAttributeValues: { ':s': 'email_invite_sent' },
    }).promise();
  }

  return result.Item;
};

// ----- AUTHZ RELATED FUNCTIONS/ROUTES ----------------------------------------

// Sends an email invite to a user for registering/logging in
module.exports.send_login_link = withSentry(async (event) => {
  const body = JSON.parse(event.body);
  const ddb = new AWS.DynamoDB.DocumentClient();

  // check for id in request
  if (!body.email) {
    return {
      statusCode: 500,
      body: 'send_login_link expects keys "email"',
    };
  }

  // Create parameters for activity item
  const activityParams = {
    TableName: process.env.ACTIVITY_TABLE,
    Item: {
      id: UUID.v4(),
      user_id: body.id,
      event: INVITE_USER_EVENT,
      timestamp: new Date().toString(),
    },
  };

  // Call DynamoDB to add activity item to the table
  await ddb.put(activityParams).promise();

  if (body.app) {
    const result = await sendLoginLinkEmail(emailToUserId(body.email), body.setRegistrationStatus, true);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: HEADERS,
    };
  }
  const result = await sendLoginLinkEmail(emailToUserId(body.email), body.setRegistrationStatus, false);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: HEADERS,
  };
});

// Retrieves a single user from the database
module.exports.get_token = withSentry(async (event) => {
  const jwt = require('jsonwebtoken'); // eslint-disable-line
  const loginId = String(event.queryStringParameters.lid);
  const ddb = new AWS.DynamoDB.DocumentClient();

  // 1. see if login token exists
  const item = await ddb.get({
    TableName: process.env.INVITES_TABLE,
    Key: { id: loginId },
  }).promise();

  // 2. get user id corresponding to login token
  const userId = item.Item.user_id;

  // 3. get user corresponding to user id
  const rawUser = await ddb.get({
    TableName: process.env.USERS_TABLE,
    Key: { id: userId },
  }).promise();
  const user = rawUser.Item;

  // 4. copy token fields
  const tokenPayload = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    access_level: user.access_level,
    group: user.group,
  };

  console.log(tokenPayload);

  // 5. sign jwt token
  const token = jwt.sign(tokenPayload, 'technica'); // TODO load jwt secret from aws systems manager

  console.log(user);

  const response = {
    token,
    user,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(response),
    headers: HEADERS,
  };
});

// ----- END AUTHZ RELATED FUNCTIONS/ROUTES ------------------------------------

// adds a new user to the database
module.exports.add_user = withSentry(async (user) => {
  const body = JSON.parse(user.body);
  const ddb = new AWS.DynamoDB.DocumentClient();

  // checks if any field is missing to create a  user
  if (!body.email
    || !body.full_name
    || !body.access_level // TODO refactor to `role` instead of `access_level`?
    || !body.group) {
    return {
      statusCode: 500,
      body: 'add_user is missing a field',
    };
  }

  body.id = emailToUserId(body.email);
  body.signed_waiver = false;

  const params = {
    TableName: process.env.USERS_TABLE,
    Item: {},
  };

  // dynamically add post request body params to document
  Object.keys(body).forEach((k) => {
    params.Item[k] = body[k];
  });

  // Create parameters for activity item
  const activityParams = {
    TableName: process.env.ACTIVITY_TABLE,
    Item: {
      id: UUID.v4(),
      user_id: body.id,
      event: ADD_USER_EVENT,
      timestamp: new Date().toString(),
    },
  };

  await Promise.all([
    ddb.put(params).promise(), // Call DynamoDB to add the item to the table
    ddb.put(activityParams).promise(), // Call DynamoDB to add activity item to the table
  ]);

  body.setRegistrationStatus = true;

  // Send the user an invite email
  await sendLoginLinkEmail(body.id, true, false);

  // Returns status code 200 and JSON string of 'result'
  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    headers: HEADERS,
  };
});

// send a user an in-person invite
module.exports.invite_user_irl = withSentry(async (event) => {
  const body = JSON.parse(event.body);
  const ddb = new AWS.DynamoDB.DocumentClient();

  // check for id in request
  if (!body.email) {
    return {
      statusCode: 500,
      body: 'send_login_link expects keys "email"',
    };
  }

  // Get the user's info to send email and update dbs
  // TODO: is this an unnecessary query? only need user name and email
  const userResp = await ddb.get({
    TableName: process.env.USERS_TABLE,
    Key: { id: emailToUserId(body.email) },
  }).promise();
  const user = userResp.Item;

  const firstName = user.full_name.split(' ')[0];

  const ses = new AWS.SES();
  const params = {
    Destination: { ToAddresses: [body.email] },
    Source: 'Technica <hello@gotechnica.org>',
    ConfigurationSetName: 'platform',
    Template: 'InPersonInvite',
    TemplateData: `{ "firstName":"${firstName}", "userID": "${emailToUserId(body.email)}" }`,
  };
  await ses.sendTemplatedEmail(params).promise();

  return {
    statusCode: 200,
    headers: HEADERS,
  };
});

// delete a single user from the database
// route restricted to users with role admin
module.exports.delete_user = withSentry(async (event) => {
  const body = JSON.parse(event.body);
  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!body.id) {
    return {
      statusCode: 500,
      body: 'delete_user is missing id',
    };
  }

  const deleteParams = {
    TableName: process.env.USERS_TABLE,
    Key: { id: body.id },
  };

  const statusResult = await ddb.delete(deleteParams).promise();

  // return 500 on error
  return {
    statusCode: 200,
    body: JSON.stringify(statusResult.Item),
    headers: HEADERS,
  };
});

// Retrieves a single user from the database
module.exports.get_user = withSentry(async (event) => {
  const id = String(event.queryStringParameters.id);
  const ddb = new AWS.DynamoDB.DocumentClient();
  const item = await ddb.get({
    TableName: process.env.USERS_TABLE,
    Key: { id },
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(item.Item),
    headers: HEADERS,
  };
});

// finds a user given their email
module.exports.find_user_by_email = withSentry(async (event) => {
  const { email } = event.queryStringParameters;
  if (!email) {
    return {
      statusCode: 500,
      body: 'find_user_by_email expects keys "email"',
    };
  }

  const ddb = new AWS.DynamoDB.DocumentClient();
  const id = emailToUserId(email);
  const item = await ddb.get({
    TableName: process.env.USERS_TABLE,
    Key: { id },
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(item.Item),
    headers: HEADERS,
  };
});

// Updates an existing schedule user in the database
module.exports.update_user = withSentry(async (user) => {
  const ddb = new AWS.DynamoDB.DocumentClient();

  const body = JSON.parse(user.body);

  if (!body.id) {
    return {
      statusCode: 500,
      body: 'update_user expects key "id"',
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
    TableName: process.env.USERS_TABLE,
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
    body: JSON.stringify(result.Item),
    headers: HEADERS,
  };
});

// Adds a user to banned users table
// route restricted to users with role organizer
module.exports.ban_user = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  if (!body.id) {
    return {
      statusCode: 500,
      body: 'ban_user expects keys "id"',
    };
  }

  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.BANNED_USERS_TABLE,
    Item: {},
  };

  // Dynamically add post request body params to document
  Object.keys(body).forEach((k) => {
    params.Item[k] = body[k];
  });

  // Call DynamoDB to add the item to the table
  const result = await ddb.put(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
    headers: HEADERS,
  };
});

// Retrieves all users from banned users table
module.exports.get_banned_users = withSentry(async () => {
  const params = {
    TableName: process.env.BANNED_USERS_TABLE,
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

// Update an existing hacker's hacker profile
module.exports.update_hacker_profile = withSentry(async (event) => {
  const ddb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  if (!body.user_id || !body.hacker_profile) {
    return {
      statusCode: 500,
      body: 'Missing user_id or hacker_profile keys',
    };
  }

  // id to locate which hacker to update
  const params = {
    TableName: process.env.USERS_TABLE,
    Key: {
      id: body.user_id.toString(),
    },
    UpdateExpression: 'set hacker_profile = :p',
    ExpressionAttributeValues: {
      ':p': body.hacker_profile,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  // Call DynamoDB to update profile
  const result = await ddb.update(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
    headers: HEADERS,
  };
});

// Posts activity data to the activity table for tracking purposes
module.exports.track_user_activity = withSentry(async (action) => {
  const body = JSON.parse(action.body);
  const ddb = new AWS.DynamoDB.DocumentClient();

  const activityId = UUID.v4();

  if (!body.user_id || !body.action) {
    return {
      statusCode: 500,
      body: 'track_user_activity is missing user_id or action',
    };
  }

  const params = {
    TableName: process.env.ACTIVITY_TABLE,
    Item: {
      id: activityId,
      user_id: body.user_id,
      event: body.action,
      timestamp: new Date().toString(),
    },
  };

  await ddb.put(params).promise();

  const SecretsManager = new AWS.SecretsManager({ region: 'us-east-1' });
  const SecretsManagerSlackKey = await SecretsManager.getSecretValue(
    { SecretId: process.env.SLACK_WEBHOOK_SECRET_NAME },
  ).promise();
  const webhookJSON = JSON.parse(SecretsManagerSlackKey.SecretString);
  const webhookUrl = webhookJSON.PLATFORM_ACTIVITY_SLACK_WEBHOOK;
  const webhook = new IncomingWebhook(webhookUrl);
  if (process.env.STAGE !== TESTING_STAGE) {
    if (body.action === 'TEAM_CREATION') {
      await webhook.send({
        text: `${body.user_name} performed ${body.action} on ${process.env.STAGE}`,
      });
    } else {
      await webhook.send({
        text: `${body.user_name} visited page ${body.action} on ${process.env.STAGE}`,
      });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    headers: HEADERS,
  };
});

module.exports.upload_resume = async (event) => {
  const body = JSON.parse(event.body);

  const s3 = new AWS.S3();

  const folder = UUID.v4();
  const filePath = `${folder}/${body.filename}`;

  const params = {
    Bucket: 'technica-2021-resume',
    Key: filePath,
    Expires: 600,
    ContentType: 'multipart/form-data',
  };

  const s3Result = s3.getSignedUrl('putObject', params);

  return {
    statusCode: 200,
    body: JSON.stringify({ putUrl: s3Result, uploadUrl: `https://technica-2021-resume.s3.amazonaws.com/${filePath}` }),
    headers: HEADERS,
  };
};

module.exports.upload_resume_text = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  if (!body.user_id || !body.resume_text) {
    return {
      statusCode: 500,
      body: 'upload_resume_text is missing user_id or resume_text',
    };
  }

  const ddb = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: process.env.RESUMES_TABLE,
    Item: {
      id: body.user_id,
      submitted: new Date().getTime(),
      resume_text: body.resume_text,
    },
  };

  await ddb.put(params).promise();

  return {
    statusCode: 200,
    body: 'success',
    headers: HEADERS,
  };
});

module.exports.index_resumes = withSentry(async () => {
  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.RESUMES_TABLE,
    FilterExpression: '#submit > :time',
    ExpressionAttributeNames: {
      '#submit': 'submitted',
    },
    ExpressionAttributeValues: {
      ':time': new Date(new Date().getTime() - (30 * 60000)).getTime(),
    },
  };
  const results = await ddb.scan(params).promise();
  console.log(results);

  const data = results.Items.map((e) => ({ type: 'add', id: `uniqueid:${e.id}`, fields: { id: e.id, resume_text: e.resume_text } }));
  console.log(data);
  const options = {
    method: 'POST',
    uri: `${process.env.CLOUDSEARCH_DOMAIN_DOCUMENT}/2013-01-01/documents/batch`,
    headers: {
      'content-type': 'application/json',
    },
    json: true,
    body: data,
  };

  const result = await rp.post(options);
  console.log(result);
});

module.exports.search_resumes = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  if (!body.search_term) {
    return {
      statusCode: 500,
      body: 'search_resumes is missing search_term',
    };
  }

  const options = {
    method: 'GET',
    uri: `${process.env.CLOUDSEARCH_DOMAIN_SEARCH}/2013-01-01/search?q=${body.search_term}&return=id%2C_score`,
    json: true,
  };

  const result = await rp.get(options);

  const results = {
    total: result.hits.found,
    user_ids: result.hits.hit.map((e) => e.fields.id),
  };

  return {
    statusCode: 200,
    body: JSON.stringify(results),
    headers: HEADERS,
  };
});

module.exports.list_profiles = withSentry(async () => {
  const params = {
    TableName: process.env.USERS_TABLE,
    ProjectionExpression: 'id, full_name, participantIsMinor',
  };

  const ddb = new AWS.DynamoDB.DocumentClient();

  // TODO: Replace ddb.scan with ddb.query or other efficient method
  const result = await ddb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: HEADERS,
  };
});
