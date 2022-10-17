const AWS = require('aws-sdk');
const UUID = require('uuid');
const withSentry = require('serverless-sentry-lib');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': '*',
};

AWS.config.update({ region: 'us-east-1' });

// POST teams/create with an empty body
module.exports.create_team = withSentry(async () => {
  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.TEAMS_TABLE,
    Item: {
      id: UUID.v4(),
      timestamp: new Date().toLocaleString(),
      project_submitted: false,
    },
  };

  // Call DynamoDB to add the item to the table
  await ddb.put(params).promise();

  // return 500 on error
  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    headers: HEADERS,
  };
});

module.exports.join_team = withSentry(async (event) => {
  const body = JSON.parse(event.body);
  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!body.user_id && !body.team_id) {
    return {
      statusCode: 500,
      body: 'Missing required ids: user_id and team_id',
    };
  }

  const params = {
    TableName: process.env.MEMBERSHIPS_TABLE,
    Item: {
      id: body.user_id,
      team: body.team_id,
    },
  };

  // Call DynamoDB to add the item to the table
  await ddb.put(params).promise();

  const updateParams = {
    TableName: process.env.TEAMS_TABLE,
    Key: {
      id: body.team_id,
    },
    UpdateExpression: 'ADD members :user_id',
    ExpressionAttributeValues: {
      ':user_id': ddb.createSet([body.user_id]),
    },
  };
  await ddb.update(updateParams).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
    headers: HEADERS,
  };
});

// find a membership item, delete it
module.exports.leave_team = withSentry(async (event) => {
  const body = JSON.parse(event.body);
  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.MEMBERSHIPS_TABLE,
    Key: {
      id: body.user_id,
    },
  };

  await ddb.delete(params).promise();

  const updateParams = {
    TableName: process.env.TEAMS_TABLE,
    Key: {
      id: body.team_id,
    },
    UpdateExpression: 'DELETE members :user_id',
    ExpressionAttributeValues: {
      ':user_id': ddb.createSet([body.user_id]),
    },
  };

  await ddb.update(updateParams).promise();

  // TODO: If the team is now empty, remove the team fromt the TEAMS_TABLEu

  return {
    statusCode: 200,
    headers: HEADERS,
  };
});

// module.exports.invite_to_team = withSentry(async (event) => {
//   const returnEvent = event;
//   const body = JSON.parse(returnEvent.body);
//   const email = body.email || NO_EMAIL;
//   const ddb = new AWS.DynamoDB.DocumentClient();

//   // const params = {
//   //   TableName: process.env.USERS_TABLE,
//   //   FilterExpression: 'email = :val',
//   //   ExpressionAttributeValues: {
//   //     ':val': email,
//   //   },
//   // };

//   // const result = await ddb.scan(params).promise();
//   // if (result.Items && result.Items.length > 0) {
//   //   const newBody = body;
//   //   newBody.user_id = result.Items[0].id;
//   //   returnEvent.body = JSON.stringify(newBody);
//   //   console.log(returnEvent.body)
//   // }

//   return postRequestToTable(returnEvent, process.env.INVITES_TABLE);
// });

// // Retrieves the team invites for a hacker
// module.exports.get_team_invites = withSentry(async (event) => {
//   const userId = event.queryStringParameters.user_id;

//   if (!userId) {
//     return {
//       statusCode: 500,
//       body: 'get_team_invites expects keys "user_id"',
//     };
//   }

//   const ddb = new AWS.DynamoDB.DocumentClient();

//   const params = {
//     TableName: process.env.INVITES_TABLE,
//     FilterExpression: 'user_id = :val',
//     ExpressionAttributeValues: {
//       ':val': userId,
//     },
//   };

//   // TODO: Replace ddb.scan with ddb.query or other efficient method
//   const result = await ddb.scan(params).promise();

//   return {
//     statusCode: 200,
//     body: JSON.stringify(result.Items),
//     headers: HEADERS,
//   };
// });

module.exports.get_users_for_team = withSentry(async (event) => {
  const teamId = event.queryStringParameters.team_id;

  if (!teamId) {
    return {
      statusCode: 500,
      body: 'get_users_for_team expects keys "team_id"',
    };
  }

  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.TEAMS_TABLE,
    Key: {
      id: teamId,
    },
  };

  const result = await ddb.get(params).promise();

  if (!result.Item || !result.Item.members) {
    return {
      statusCode: 200,
      body: JSON.stringify([]),
      headers: HEADERS,
    };
  }

  const uniqueIds = result.Item.members.values;

  const userIds = uniqueIds.map((uniqueId) => ({ id: uniqueId }));

  const queryParams = { RequestItems: {} };
  queryParams.RequestItems[process.env.USERS_TABLE] = {
    Keys: userIds,
    ProjectionExpression: 'id, full_name, email, school',
  };

  const usersResult = await ddb.batchGet(queryParams).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(usersResult.Responses[process.env.USERS_TABLE]),
    headers: HEADERS,
  };
});

module.exports.get_team_membership_for_user = withSentry(async (event) => {
  const userId = event.queryStringParameters.user_id;

  if (!userId) {
    return {
      statusCode: 500,
      body: 'get_team_invites expects keys "user_id"',
    };
  }

  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.MEMBERSHIPS_TABLE,
    Key: {
      id: userId,
    },
  };

  const result = await ddb.get(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
    headers: HEADERS,
  };
});

// Retrieves all the invites for a team
// module.exports.get_hackers_invited_to_team = withSentry(async (event) => {
//   const teamId = String(event.queryStringParameters.team_id);

//   if (!teamId) {
//     return {
//       statusCode: 500,
//       body: 'get_hackers_invited_to_team expects keys "team_id"',
//     };
//   }

//   const ddb = new AWS.DynamoDB.DocumentClient();

//   const params = {
//     TableName: process.env.INVITES_TABLE,
//     FilterExpression: 'team_id = :val',
//     ExpressionAttributeValues: {
//       ':val': teamId,
//     },
//   };

//   // TODO: Replace ddb.scan with ddb.query or other efficient method
//   const result = await ddb.scan(params).promise();

//   return {
//     statusCode: 200,
//     body: JSON.stringify(result.Items),
//     headers: HEADERS,
//   };
// });

module.exports.get_team_submission = withSentry(async (event) => {
  const teamId = event.queryStringParameters.team_id;

  if (!teamId) {
    return {
      statusCode: 500,
      body: 'get_team_submission expects keys "team_id"',
    };
  }

  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.TEAMS_TABLE,
    Key: {
      id: teamId,
    },
  };

  const result = await ddb.get(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
    headers: HEADERS,
  };
});

module.exports.update_team_submission = withSentry(async (event) => {
  const ddb = new AWS.DynamoDB.DocumentClient();

  const body = JSON.parse(event.body);

  if (!body.team_id) {
    return {
      statusCode: 500,
      body: 'update_team_submission expects key "team_id"',
    };
  }

  const id = body.team_id;

  // Initialize UpdateExpression for ddb.update()
  let update = 'SET';

  // Initialize ExpressionAttributeNames for ddb.update()
  const exprAttrNames = {};

  // Initialize ExpressionAttributeValues for ddb,updateItem()
  const exprAttrValues = {};

  let counter = 0;

  // dynamically update post request body params to document
  Object.keys(body).forEach((k) => {
    if (k !== 'team_id') {
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
    TableName: process.env.TEAMS_TABLE,
    Key: {
      id,
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

// module.exports.add_zoom_link_for_team = withSentry(async (event) => {
//   const ddb = new AWS.DynamoDB.DocumentClient();
//   const body = JSON.parse(event.body);
//   if (!body.id || !body.link) {
//     return {
//       statusCode: 500,
//       body: 'Missing id or link keys',
//     };
//   }

//   const params = {
//     TableName: process.env.TEAMS_TABLE,
//     Key: {
//       id: body.id,
//     },
//     UpdateExpression: 'set zoom_link = :p',
//     ExpressionAttributeValues: {
//       ':p': body.link,
//     },
//     ReturnValues: 'UPDATED_NEW',
//   };

//   const result = await ddb.update(params).promise();

//   return {
//     statusCode: 200,
//     body: JSON.stringify(result.Item),
//     headers: HEADERS,
//   };
// });

module.exports.get_team = withSentry(async (event) => {
  const { id } = event.queryStringParameters;

  const ddb = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: process.env.TEAMS_TABLE,
    Key: {
      id,
    },
  };

  const result = await ddb.get(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
    headers: HEADERS,
  };
});

// module.exports.delete_team_invite = withSentry(async (event) => {
//   const body = JSON.parse(event.body);
//   const ddb = new AWS.DynamoDB.DocumentClient();

//   const deleteParams = {
//     TableName: process.env.INVITES_TABLE,
//     Key: {
//       id: body.id,
//     },
//   };

//   try {
//     // Call DynamoDB to delete the item from the table
//     const statusResult = await ddb.delete(deleteParams).promise();
//     return {
//       statusCode: 200,
//       body: JSON.stringify(statusResult),
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Credentials': true,
//       },
//     };
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: 'Error, id may not be present',
//     };
//   }
// });
