const AWS = require('aws-sdk');
const withSentry = require('serverless-sentry-lib');
const { Expo } = require('expo-server-sdk');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': '*',
};

AWS.config.update({ region: 'us-east-1' });
const expo = new Expo();

module.exports.register = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  // return 500 if no token or invalid token
  if (!body.expo_token || !Expo.isExpoPushToken(body.expo_token)) {
    return {
      statusCode: 500,
      body: 'register expects a valid expo token',
    };
  }

  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.EXPO_TOKEN_TABLE,
    Item: {
      token: body.expo_token,
    },
  };

  await ddb.put(params).promise();

  return {
    statusCode: 200,
    headers: HEADERS,
  };
});

module.exports.send_announcement = withSentry(async (event) => {
  const body = JSON.parse(event.body);

  // return 500 if no announcement
  if (!body.announcement) {
    return {
      statusCode: 500,
      body: 'missing announcement',
    };
  }

  const ddb = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: process.env.EXPO_TOKEN_TABLE,
  };

  const tokens = [];
  let last;

  // scan has 1MB limit, so while loop allows us to get all tokens
  do {
    // eslint-disable-next-line no-await-in-loop
    const items = await ddb.scan(params).promise();
    items.Items.forEach((item) => tokens.push(item));
    params.ExclusiveStartKey = items.LastEvaluatedKey;
    last = items.LastEvaluatedKey;
  } while (last);

  // construct message for each token
  const messages = tokens.map((token) => ({
    to: token.token,
    title: 'Technica',
    sound: 'default',
    body: body.announcement,
    priority: 'high',
  }));

  const errors = [];

  // chunk them to send in batches
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  if (chunks) {
    await (async () => {
      // eslint-disable-next-line
      for (let chunk of chunks) {
        try {
          // eslint-disable-next-line
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);

          tickets.push(...ticketChunk);
        } catch (error) {
          errors.push(error);
        }
      }
    })();
  } else {
    await (async () => {
      // eslint-disable-next-line
      for (let message of messages) {
        try {
          // eslint-disable-next-line
          const ticketChunk = await expo.sendPushNotificationsAsync(message);

          tickets.push(...ticketChunk);
        } catch (error) {
          errors.push(error);
        }
      }
    })();
  }

  // receipts are returned after notifications have been delivered
  const receiptIds = [];
  tickets.forEach((ticket) => {
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  });

  // checking receipts for errors
  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  receiptIdChunks.forEach((chunk) => {
    (async () => {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

        receipts.forEach((receiptId) => {
          const { status, message, details } = receipts[receiptId];
          if (status === 'error') {
            errors.push({ status, message, details });
          }
        });
      } catch (error) {
        errors.push(error);
      }
    })();
  });

  if (errors.length !== 0) {
    return {
      statusCode: 500,
      body: JSON.stringify(errors),
    };
  }

  return {
    statusCode: 200,
    headers: HEADERS,
  };
});
