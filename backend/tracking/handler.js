const AWS = require("aws-sdk");
const withSentry = require("serverless-sentry-lib");

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Headers": "*",
};

AWS.config.update({ region: "us-east-1" });

// Update a users status in the user status table
module.exports.status = withSentry(async (event) => {
  const ddb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  
  if (!body.isReturning) {
    body.isReturning = false;
  }

  var beforeStatus, result;

  if (!body.event || !body.user_id || !body.loc) {
    return {
      statusCode: 500,
      body: "Missing status, returning, or user_id keys",
    };
  }

  if (body.new) {
    const params = {
      TableName: process.env.USER_STATUS_TABLE,
      Item: {
        id: body.user_id,
        loc: body.loc,
        event: body.event,
        name: body.name,
      },
    };

    await ddb.put(params).promise()
  } else {
    // id to locate which hacker to update
    beforeStatus = await ddb.get({
      TableName: process.env.USER_STATUS_TABLE,
      Key: { id: body.user_id }
    }).promise()

    const sameVenue = beforeStatus.Item.loc === body.loc;
    const sameAction = beforeStatus.Item.event === body.event;
    // cannot do same action (leave or enter twice)
    // cannot exit different venue after entering the other
    const invalidSequence = (sameAction) || (!sameVenue && !sameAction && (beforeStatus.Item.event == "entering"));
    if (invalidSequence) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          before: beforeStatus.Item
        }),
        headers: HEADERS,
      };  
    }

    const params = {
      TableName: process.env.USER_STATUS_TABLE,
      Key: {
        id: body.user_id,
      },
      UpdateExpression:
        "set event = :stat, lastUpdated = :time, isReturning = :return, loc = :location",
      ExpressionAttributeValues: {
        ":stat": body.event,
        ":time": new Date().toString(), // fix  
        ":return": body.isReturning,
        ":location": body.loc,
      },
      ReturnValues: "UPDATED_NEW",
    };

    // Call DynamoDB to update profile
    result = await ddb.update(params).promise();
  }

  // Update live tracking for armory and esj
  const locName = body.loc.toLowerCase();  
  const opName = body.event.toLowerCase();
  if ((locName === 'armory' || locName === 'esj') &&
      ((opName === 'entering') || (opName === 'exiting'))) {

    var opStr = "";
    if (opName === 'entering') {
      opStr = '+';
    } else if (opName === 'exiting') {
      opStr = '-';
    } 
	
    const lc_params = {
      TableName: process.env.LIVE_COUNT_TABLE,
      Key: {
        id: locName,
      },
      UpdateExpression:
        "set live_count = live_count " + opStr + " :valOne",
      ExpressionAttributeValues: {
        ":valOne": 1,
      },
    };
    await ddb.update(lc_params).promise();  
  }  
    
  let toReturn = "";
  if (!body.new) {
    toReturn = JSON.stringify({
      before: beforeStatus.Item,
      after: result.Item
    })
  }

  return {
    statusCode: 200,
    body: toReturn,
    headers: HEADERS,
  };
});

// Adds a note under a specified user
module.exports.add_user_note = withSentry(async (event) => {
  const ddb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  if (!body.note || !body.user_id) {
    return {
      statusCode: 500,
      body: 'Missing note or user_id keys',
    };
  }

  // get current list of notes
  // id to locate which hacker to update
  const params = {
    TableName: process.env.TRACKING_NOTES_TABLE,
    Key: {
      userId: body.user_id,
    },
  };

  // Call DynamoDB to update profile
  const result = await ddb.get(params).promise();

  // If note list is empty
  if (!result.Item) {
    const newParams = {
      TableName: process.env.TRACKING_NOTES_TABLE,
      Item: {
        userId: body.user_id,
        notes: [body.note],
      },
    };

    // Call DynamoDB to update profile
    const putResult = await ddb.put(newParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(putResult.Item),
      headers: HEADERS,
    };
  }

  const updateParams = {
    TableName: process.env.TRACKING_NOTES_TABLE,
    Key: {
      userId: body.user_id,
    },
    UpdateExpression: 'set #notes = list_append(#notes, :note)',
    ExpressionAttributeNames: {
      '#notes': 'notes',
    },
    ExpressionAttributeValues: {
      ':note': [body.note],
    },
    ReturnValues: 'UPDATED_NEW',
  };

  // Call DynamoDB to update profile
  const updateResult = await ddb.update(updateParams).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(updateResult.Item),
    headers: HEADERS,
  };
});

// Gets all note under a specified user
module.exports.get_user_notes = withSentry(async (event) => {
  const ddb = new AWS.DynamoDB.DocumentClient();

  if (!event.queryStringParameters.id) {
    return {
      statusCode: 500,
      body: 'Missing id query string',
    };
  }

  const id = String(event.queryStringParameters.id);

  // id to locate which hacker to update
  const params = {
    TableName: process.env.TRACKING_NOTES_TABLE,
    Key: {
      userId: id,
    },
  };

  // Call DynamoDB to update profile
  const result = await ddb.get(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
    headers: HEADERS,
  };
});

module.exports.get_attendance = withSentry(async (event) => {
  const ddb = new AWS.DynamoDB.DocumentClient();
  const id = String(event.queryStringParameters.id);
  const item = await ddb.get({
    TableName: process.env.USER_ATTENDANCE_TABLE,
    Key: { user_id: id },
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(item.Item),
    headers: HEADERS,
  };
});

module.exports.attendance = withSentry(async (event) => {
  const ddb = new AWS.DynamoDB.DocumentClient();
  const body = JSON.parse(event.body);
  if (!body.event || !(typeof body.online === "boolean") || !body.user_id) {
    return {
      statusCode: 500,
      body: 'Missing event, online, or user_id keys',
    };
  }

  const getParams = {
    TableName: process.env.USER_ATTENDANCE_TABLE,
    Key: {
      user_id: body.user_id,
    }};

  const attendance = await ddb.get(getParams).promise();

  var attendanceObject = [];
  const timestamp = Date.now();

  if(attendance.Item) {
    if(body.online) {
      var jsonObj;
      try {
        const obj = JSON.parse(attendance.Item.virtual);
        jsonObj = (obj) ? obj : [];
      } catch(e) {
        jsonObj = [];
      }
      attendanceObject = [
        ...jsonObj,
        {
          [timestamp]: body.event,
        },
      ];
    } else {
      var jsonObj;
      try {
        const obj = JSON.parse(attendance.Item.inperson);
        jsonObj = (obj) ? obj : [];
      } catch(e) {
        jsonObj = [];
      }
     
      attendanceObject = [
        ...jsonObj,
        {
          [timestamp]: body.event,
        },
      ];
    }
  } else {
    if(body.online) {
      attendanceObject = [
        {
          [timestamp]: body.event,
        },
      ];
    } else {
      attendanceObject = [
        {
          [timestamp]: body.event,
        },
      ];
    }
  }

  const oldVirtual = (attendance.Item) ? attendance.Item.virtual : [];
  const oldInperson = (attendance.Item) ? attendance.Item.inperson : [];

  const putParams = {
    TableName: process.env.USER_ATTENDANCE_TABLE,
    Item: {
      user_id: body.user_id,
      virtual: (body.online) ? JSON.stringify(attendanceObject) : oldVirtual,
      inperson: (body.online) ? oldInperson : JSON.stringify(attendanceObject),
    }, 
  };

  const result = await ddb.put(putParams).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
    headers: HEADERS,
  };
});
