const AWS = require('aws-sdk');
const withSentry = require('serverless-sentry-lib');
const { IncomingWebhook } = require('@slack/webhook');
const UUID = require('uuid');
const { parse: slackParser, NodeType } = require('slack-message-parser');
const jwt = require('jsonwebtoken');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { document } = (new JSDOM(`...`)).window;

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': '*',
};

AWS.config.update({ region: 'us-east-1' });

module.exports.frontend_version = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({v: 1}),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  }
};

// returns a user's easter egg progress
module.exports.get_easter_eggs = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica'); // TODO load jwt secret from environment vars

  if (!decoded.id) {
    return {
      statusCode: 500,
      body: 'get_easter_eggs expects an id',
    };
  }

  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.EASTER_EGGS_TABLE,
    Key: {
      id: decoded.id,
    },
  };

  const result = await ddb.get(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };
});

// updates the progress integer in the table
module.exports.update_easter_eggs = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const body = JSON.parse(event.body);
  const decoded = jwt.verify(authToken, 'technica'); // TODO load jwt secret from environment vars

  if (!decoded.id) {
    return {
      statusCode: 500,
      body: 'update_easter_eggs expects an id',
    };
  }

  if (!body.progress) {
    return {
      statusCode: 500,
      body: 'update_easter_eggs expects key "progress"',
    };
  }

  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.EASTER_EGGS_TABLE,
    Item: {
      id: decoded.id,
      progress: body.progress,
    },
  };

  const result = await ddb.put(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
    headers: HEADERS,
  };
});

module.exports.add_sponsor_booth = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  const ddb = new AWS.DynamoDB.DocumentClient();

  const id = UUID.v4();

  const params = {
    TableName: process.env.SPONSOR_BOOTHS_TABLE,
    Item: {},
  };

  if (!body.id) {
    body.id = id;
  }

  Object.keys(body).forEach((k) => {
    params.Item[k] = body[k];
  });

  if (params.Item.downloadable_content) {
    params.Item.downloadable_content = JSON.parse(params.Item.downloadable_content);
  }

  if (params.Item.footer_links) {
    params.Item.footer_links = JSON.parse(params.Item.footer_links);
  }

  if (params.Item.images) {
    params.Item.images = JSON.parse(params.Item.images);
  }

  await ddb.put(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    headers: HEADERS,
  };
});

module.exports.update_sponsor_booth = withSentry(async (event) => {
  const body = JSON.parse(event.body);
  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!body.id) {
    return {
      statusCode: 500,
      body: 'update_sponsor_booth expects key "id"',
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
    TableName: process.env.SPONSOR_BOOTHS_TABLE,
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

module.exports.delete_sponsor_booth = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!body.id) {
    return {
      statusCode: 500,
      body: 'delete_sponsor expects key "id"',
    };
  }

  const params = {
    TableName: process.env.SPONSOR_BOOTHS_TABLE,
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

module.exports.get_sponsor_booths = withSentry(async () => {
  const params = {
    TableName: process.env.SPONSOR_BOOTHS_TABLE,
  };

  const ddb = new AWS.DynamoDB.DocumentClient();

  const result = await ddb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
    headers: HEADERS,
  };
});

/** Returns the booth ids of all sponsors with active booths */
module.exports.get_active_sponsor_booths = withSentry(async () => {
  const params = {
    TableName: process.env.SPONSOR_BOOTHS_TABLE,
    ProjectionExpression: 'id',
    FilterExpression: '#booth_open = :val',
    ExpressionAttributeNames: {
      '#booth_open': 'booth_open',
    },
    ExpressionAttributeValues: {
      ':val': true,
    },
  };

  const ddb = new AWS.DynamoDB.DocumentClient();

  // TODO: Replace ddb.scan with ddb.query or other efficient method
  const result = await ddb.scan(params).promise();
  const ids = result.Items.map((item) => item.id);

  return {
    statusCode: 200,
    body: JSON.stringify(ids),
    headers: HEADERS,
  };
});

module.exports.get_sponsor_booth = withSentry(async (event) => {
  const { id } = event.queryStringParameters;
  const params = {
    TableName: process.env.SPONSOR_BOOTHS_TABLE,
    KeyConditionExpression: '#id = :id',
    ExpressionAttributeNames: {
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':id': id,
    },
  };

  const ddb = new AWS.DynamoDB.DocumentClient();

  const result = await ddb.query(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: HEADERS,
  };
});

// route restricted to users with role admin
module.exports.track_sponsor_activity = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  const ddb = new AWS.DynamoDB.DocumentClient();

  const id = UUID.v4();

  const params = {
    TableName: process.env.SPONSOR_ACTIVITY_TRACKING_TABLE,
    Item: {},
  };

  body.id = id;

  Object.keys(body).forEach((k) => {
    params.Item[k] = body[k];
  });

  params.Item.timestamp = new Date().toString();

  await ddb.put(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    headers: HEADERS,
  };
});

module.exports.get_sponsor_activity = withSentry(async (event) => {
  const { sponsorId } = event.queryStringParameters;
  const { activityType } = event.queryStringParameters;
  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.SPONSOR_ACTIVITY_TRACKING_TABLE,
    FilterExpression: 'sponsor_id = :val AND activity_name = :activity',
    ExpressionAttributeValues: {
      ':val': sponsorId,
      ':activity': activityType,
    },
  };

  // TODO: Replace ddb.scan with ddb.query or other efficient method
  const result = await ddb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
    headers: HEADERS,
  };
});

/**
 * Converts a Slack message to HTML
 * @param slackMsg A string containing the raw slack message
 * @returns string containing HTML of the Slack message, replacing
 * markdown and links with the appropriate HTML elements
 */
function parseSlackMessage(slackMsg) {
  const parseTree = slackParser(slackMsg);

  // Recursive function for interpreting the parse tree
  const toHTML = (node) => {
    switch (node.type) {
      case NodeType.Text:
        return node.text;
      case NodeType.URL:
        return `<a href="${node.url}">${node.label ? node.label.map(toHTML).join('') : node.url}</a>`;
      case NodeType.Bold:
        return `<strong>${node.children.map(toHTML).join('')}</strong>`;
      case NodeType.Italic:
        return `<i>${node.children.map(toHTML).join('')}</i>`;
      case NodeType.Strike:
        return `<del>${node.children.map(toHTML).join('')}</del>`;
      case NodeType.Code:
        return `<code>${node.text}</code>`;
      case NodeType.Root:
        return node.children.map(toHTML).join('');
      default:
        return '';
    }
  };

  return toHTML(parseTree);
}

module.exports.add_announcement = withSentry(async (slackEvent) => {
  const body = JSON.parse(slackEvent.body);

  if (body.challenge) {
    return {
      statusCode: 200,
      body: body.challenge,
      headers: HEADERS,
    };
  }

  // Fail if we don't get a valid slack message
  if (!body || !body.event.channel || !body.event.text) {
    return {
      statusCode: 500,
      body: 'add_announcement expects keys "event.channel" and "event.text"',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
    };
  }

  // Fail if the message wasn't a (non-subtyped) message from the announcements channel
  if (body.event.channel !== process.env.ANNOUNCEMENTS_CHANNEL) {
    return {
      statusCode: 403,
      body: 'Only messages in the #announcements channel can be added',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
    };
  }

  // Otherwise, write the announcement to the DB
  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.ANNOUNCEMENTS_TABLE,
    Item: {
      id: UUID.v4(),
      timestamp: new Date().toISOString(),
      text: parseSlackMessage(body.event.text),
    },
  };

  await ddb.put(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    headers: HEADERS,
  };
});

module.exports.get_announcements = withSentry(async () => {
  const params = {
    TableName: process.env.ANNOUNCEMENTS_TABLE,
  };

  const ddb = new AWS.DynamoDB.DocumentClient();

  const result = await ddb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
    headers: HEADERS,
  };
});

module.exports.get_mobile_announcements = withSentry(async () => {
  const params = {
    TableName: process.env.ANNOUNCEMENTS_TABLE,
  };

  const ddb = new AWS.DynamoDB.DocumentClient();

  const result = await ddb.scan(params).promise();

  const resultStrings = result.Items.map((x) => {
    const div = document.createElement('div');
    div.innerHTML = x.text;

    const text = div.textContent || div.innerText || '';

    x.text = text;
    return x;
  });

  return {
    statusCode: 200,
    body: JSON.stringify(resultStrings),
    headers: HEADERS,
  };
});

module.exports.log_event_to_slack = withSentry(async (event) => {
  const SecretsManager = new AWS.SecretsManager({ region: 'us-east-1' });
  const SecretsManagerSlackKey = await SecretsManager.getSecretValue(
    { SecretId: process.env.SLACK_WEBHOOK_SECRET_NAME },
  ).promise();
  const webhookJSON = JSON.parse(SecretsManagerSlackKey.SecretString);
  const webhookUrl = webhookJSON.PLATFORM_EMAIL_DELIVERABILITY_WEBHOOK;
  const webhook = new IncomingWebhook(webhookUrl);
  await webhook.send({
    text: JSON.parse(event.body).Message,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({}),
    headers: HEADERS,
  };
});
