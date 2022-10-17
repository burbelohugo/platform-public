const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const withSentry = require('serverless-sentry-lib');
const twilio = require('twilio');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': '*',
};

AWS.config.update({ region: 'us-east-1' });

const TOTAL_VISITS = 5;

// Marks a user as having attended sponsor room
// Route restricted to users with role sponsor
module.exports.complete_visit = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica');
  const sponsor = decoded.email;

  const ddb = new AWS.DynamoDB.DocumentClient();

  // Get the sponsor's room-name
  const sponsorRoomParams = {
    TableName: process.env.ACTIVE_SPONSORS_TABLE,
    ConsistentRead: true,
    Key: {
      email: sponsor,
    },
  };

  const sponsorRoomResult = await ddb.get(sponsorRoomParams).promise();
  const roomName = sponsorRoomResult.Item.room_name;

  while (true) {
    try {
      const params = {
        TableName: process.env.HACKER_QUEUE_TABLE,
        FilterExpression: 'assigned_to = :room_name',
        ExpressionAttributeValues: {
          ':room_name': roomName,
        },
      };

      // eslint-disable-next-line no-await-in-loop
      const { Items } = await ddb.scan(params).promise();
      console.log(Items);

      const transactItems = [];
      const tableName = process.env.HACKER_QUEUE_TABLE;

      Items.forEach((item) => {
        transactItems.push(
          {
            Update: {
              TableName: tableName,
              Key: {
                email: item.email,
                priority: item.priority,
              },
              UpdateExpression: 'REMOVE assigned_to',
            },
          },
        );
      });

      if (transactItems.length === 0) {
        return {
          statusCode: 200,
          headers: HEADERS,
        };
      }
      //  eslint-disable-next-line no-await-in-loop
      await ddb.transactWrite({ TransactItems: transactItems }).promise();

      return {
        statusCode: 200,
        headers: HEADERS,
      };
    } catch (e) {
      // no-op
    }
  }
});

// Adds hacker to speed chat queue
module.exports.join_chat = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica'); // TODO load jwt secret from environment vars

  const ddb = new AWS.DynamoDB.DocumentClient();

  // return 500 if jwt does not contain email
  if (!decoded.email) {
    return {
      statusCode: 500,
      body: 'join_chat expects an email',
    };
  }

  // Find hacker information
  const queryParams = {
    TableName: process.env.HACKER_QUEUE_TABLE,
    KeyConditionExpression: '#email = :email',
    ConsistentRead: true,
    ExpressionAttributeNames: {
      '#email': 'email',
    },
    ExpressionAttributeValues: {
      ':email': decoded.email,
    },
  };

  const result = await ddb.query(queryParams).promise();

  // Only add hacker to speed chatting if they haven't joined in the past
  if (result.Items.length === 0) {
    // Add hacker email and priority (by time) to HACKER_QUEUE table
    const params = {
      TableName: process.env.HACKER_QUEUE_TABLE,
      Item: {
        email: decoded.email,
        priority: -1 * Math.floor(new Date().getTime() / 1000),
      },
    };

    await ddb.put(params).promise();
  }

  return {
    statusCode: 200,
    headers: HEADERS,
  };
});

module.exports.check_status = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica'); // TODO load jwt secret from environment vars

  const ddb = new AWS.DynamoDB.DocumentClient();

  // return 500 if jwt does not contain email
  if (!decoded.email) {
    return {
      statusCode: 500,
      body: 'join_chat expects an email',
    };
  }

  // Find hacker information
  const queryParams = {
    TableName: process.env.HACKER_QUEUE_TABLE,
    KeyConditionExpression: '#email = :email',
    ConsistentRead: true,
    ExpressionAttributeNames: {
      '#email': 'email',
    },
    ExpressionAttributeValues: {
      ':email': decoded.email,
    },
  };

  const result = await ddb.query(queryParams).promise();

  if (result.Items.length !== 0) {
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items[0]),
      headers: HEADERS,
    };
  }

  return {
    statusCode: 500,
    body: 'provided hacker was not found in table',
  };
});

// Pops a hacker from the chats queue
// Route restricted to users with role sponsor
module.exports.pop_hacker = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica');
  const sponsorEmail = decoded.email;
  const sponsorId = decoded.id;
  const ddb = new AWS.DynamoDB.DocumentClient();

  // Get the sponsor's room-name
  const sponsorRoomParams = {
    TableName: process.env.ACTIVE_SPONSORS_TABLE,
    ConsistentRead: true,
    Key: {
      email: sponsorEmail,
    },
  };

  // eslint-disable-next-line no-await-in-loop
  const sponsorRoomResult = await ddb.get(sponsorRoomParams).promise();
  const roomName = sponsorRoomResult.Item.room_name;

  const assignParams = {
    TableName: process.env.HACKER_QUEUE_TABLE,
    ConsistentRead: true,
    FilterExpression: 'assigned_to = :room_name',
    ExpressionAttributeValues: {
      ':room_name': roomName,
    },
  };

  // TODO: Replace ddb.scan with ddb.query or other efficient method
  // Get the hacker's email from the top of the scanned results
  // eslint-disable-next-line no-await-in-loop
  const existingAssign = await ddb.scan(assignParams).promise();

  if (existingAssign.Items && existingAssign.Items.length > 0) {
    return {
      statusCode: 200,
      body: JSON.stringify(existingAssign.Items[0]),
      headers: HEADERS,
    };
  }

  // Get sponsor company from USERS_TABLE
  const sponsorParams = {
    TableName: process.env.USERS_TABLE,
    KeyConditionExpression: '#id = :id',
    ConsistentRead: true,
    ExpressionAttributeNames: {
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':id': sponsorId,
    },
  };

  // eslint-disable-next-line no-await-in-loop
  const sponsorResult = await ddb.query(sponsorParams).promise();
  const company = sponsorResult.Items[0].group;

  while (true) {
    try {
      // Define params for scanning
      // Get hacker with: best priority, |visited_set| < TOTAL_VISITS, visited_set does not contain company, not currently assigned_to
      const params = {
        TableName: process.env.HACKER_QUEUE_TABLE,
        ConsistentRead: true,
        FilterExpression: '(attribute_exists(visited_set) and size(visited_set) < :TOTAL_VISITS and NOT contains(visited_set, :company) and attribute_not_exists(assigned_to)) or (attribute_not_exists(visited_sit) and attribute_not_exists(assigned_to))',
        ExpressionAttributeValues: {
          ':TOTAL_VISITS': TOTAL_VISITS,
          ':company': company,
        },
      };

      // TODO: Replace ddb.scan with ddb.query or other efficient method
      // Get the hacker's email from the top of the scanned results
      // eslint-disable-next-line no-await-in-loop
      const { Items } = await ddb.scan(params).promise();

      // If no available hackers to pop, then return NULL
      if (Items.length === 0) {
        return {
          statusCode: 200,
          body: 'no eligible hackers to dequeue at this moment',
          headers: HEADERS,
        };
      }

      const hacker = Items[0].email;
      const hackerPriority = Number(Items[0].priority);

      if (Items[0].visited_set) {
        const companiesVisited = Items[0].visited_set.values;

        if (companiesVisited.includes(company)) {
          return {
            statusCode: 200,
            body: 'no eligible hackers to dequeue at this moment',
            headers: HEADERS,
          };
        }

        companiesVisited.push(company);
        const companiesVisitedCount = companiesVisited.length;

        // eslint-disable-next-line no-await-in-loop
        const data = await ddb.transactWrite({
          TransactItems: [
            {
              Delete: {
                TableName: process.env.HACKER_QUEUE_TABLE,
                Key: {
                  email: hacker,
                  priority: hackerPriority,
                },
              },
            },
            {
              Put: {
                TableName: process.env.HACKER_QUEUE_TABLE,
                Item: {
                  email: hacker,
                  priority: -1 * Math.floor(new Date().getTime() / 1000) * (companiesVisitedCount + 1),
                  assigned_to: roomName,
                  visited_set: ddb.createSet(companiesVisited),
                },
              },
            },
          ],
        }).promise();

        return {
          statusCode: 200,
          body: JSON.stringify(data.Item),
          headers: HEADERS,
        };
      }

      const companiesVisitedCount = 1;

      // eslint-disable-next-line no-await-in-loop
      const data = await ddb.transactWrite({
        TransactItems: [
          {
            Delete: {
              TableName: process.env.HACKER_QUEUE_TABLE,
              Key: {
                email: hacker,
                priority: hackerPriority,
              },
            },
          },
          {
            Put: {
              TableName: process.env.HACKER_QUEUE_TABLE,
              Item: {
                email: hacker,
                priority: -1 * Math.floor(new Date().getTime() / 1000) * (companiesVisitedCount + 1),
                assigned_to: roomName,
                visited_set: ddb.createSet([company]),
              },
            },
          },
        ],
      }).promise();

      return {
        statusCode: 200,
        body: JSON.stringify(data.Item),
        headers: HEADERS,
      };
    }
    catch (e) {
      // no-op
    }
  }
});

// Removes active sponsor from the database
// Route restricted to users with role sponsor
module.exports.mark_sponsor_offline = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica');

  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!decoded.email) {
    return {
      statusCode: 500,
      body: 'mark_sponsor_offline expects key "email"',
    };
  }

  const params = {
    TableName: process.env.ACTIVE_SPONSORS_TABLE,
    Key: {
      email: decoded.email,
    },
  };

  // Call DynamoDB to delete the item in the table
  await ddb.delete(params).promise();

  return {
    statusCode: 200,
    headers: HEADERS,
  };
});

// Adds new active sponsor to the database
// Route restricted to users with role sponsor
module.exports.mark_sponsor_active = withSentry(async (event) => {
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica');

  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!decoded.id || !decoded.name || !decoded.email) {
    return {
      statusCode: 500,
      body: 'mark_sponsor_active expects keys "id", "name", and "email"',
    };
  }

  // get sponsor company from USERS_TABLE to create room name
  const sponsorParams = {
    TableName: process.env.USERS_TABLE,
    ConsistentRead: true,
    KeyConditionExpression: '#id = :id',
    ExpressionAttributeNames: {
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':id': decoded.id,
    },
  };

  const sponsorResult = await ddb.query(sponsorParams).promise();
  const company = sponsorResult.Items[0].group;
  const first = decoded.name.split(' ')[0];

  let room = `${company}-${first}-`;

  // add 5 random letters to the end of the room name
  for (let i = 0; i < 5; i += 1) {
    room += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }

  const params = {
    TableName: process.env.ACTIVE_SPONSORS_TABLE,
    Item: {
      email: decoded.email,
      company: sponsorResult.Items[0].group,
      room_name: room,
      status: 'ready',
    },
  };

  await ddb.put(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    headers: HEADERS,
  };
});

// Generate user tokens using Twilio API keys
// Route accessible to all roles
module.exports.generate_twilio_token = withSentry(async (event) => {
  console.log(event.headers)
  const authToken = event.headers.Authorization.split(' ')[1];
  const decoded = jwt.verify(authToken, 'technica');

  const SecretsManager = new AWS.SecretsManager({ region: 'us-east-1' });
  const SecretsManagerTwilioKey = await SecretsManager.getSecretValue(
    { SecretId: process.env.TWILIO_SECRET_NAME },
  ).promise();
  const twilioKeyJSON = JSON.parse(SecretsManagerTwilioKey.SecretString);

  const twilioToken = new twilio.jwt.AccessToken(
    twilioKeyJSON.ACCOUNT_SID,
    twilioKeyJSON.API_KEY,
    twilioKeyJSON.API_SECRET,
  );

  // Assign identity to the token
  twilioToken.identity = decoded.email;

  // Grant the access token Twilio Video capabilities
  const grant = new twilio.jwt.AccessToken.VideoGrant();
  // TODO: Consider adding room grant support
  // grant.room = room;
  twilioToken.addGrant(grant);

  // Serialize the token to a JWT string
  return {
    body: JSON.stringify({
      token: twilioToken.toJwt(),
    }),
    headers: HEADERS,
  };
});
