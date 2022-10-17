const withSentry = require('serverless-sentry-lib');
const AWS = require('aws-sdk');
const csv = require('csvtojson');
const UUID = require('uuid');
const {WebClient} = require('@slack/web-api');

AWS.config.update({region: 'us-east-1'});

let DEMO_TIME = 5;
const MAX_SPONSOR = 3;
const MAX_TIME = 5;
const MIN_TIME = 5;
const BITCAMP_SLACK_BOT_NAME = 'Bitcamp Platform Bot';
const SLACK_RETRIES = 3;
const SLACK_SLEEP_TIME = 1000; // 1 sec
const MS_PER_MINUTE = 60000;

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': '*',
};

/**
 * Sleep function
 *
 * @param ms Time to sleep in milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * This function will scan a table and return the result
 *
 * @param table The table to scan
 * @returns The result from the scan
 */
async function scanTable(table) {
  const params = {
    TableName: table,
  };

  // using DocumentClient auto parses the output into nice JSON!
  const ddb = new AWS.DynamoDB.DocumentClient();

  return (await ddb.scan(params).promise()).Items;
}

/**
 * This function will scan a table with the given expression and return the result
 *
 * @param table The table to scan
 * @param tableKey The key in the table to match the value to
 * @param tableValue The value to look for in the table
 * @returns The items returned from the scan
 */
async function scanTableWithExpression(table, tableKey, tableValue) {
  const params = {
    TableName: table,
    FilterExpression: `${tableKey} = :tableValue`,
    ExpressionAttributeValues: {':tableValue': tableValue},
  };

  // using DocumentClient auto parses the output into nice JSON!
  const ddb = new AWS.DynamoDB.DocumentClient();

  return (await ddb.scan(params).promise()).Items;
}

/**
 * This function will get the time for the expo session. It will check the schedule table
 * for an event called "Expo" and will return a list with the expo's start and end time.
 *
 * @returns a list with the expo's start and end time
 */
async function getExpoTime() {
  const table = process.env.SCHEDULE_TABLE;
  const tableResponse = await scanTableWithExpression(table, 'event_name', 'Virtual Expo');

  if (tableResponse[0] === undefined) {
    throw new Error(`Missing Expo event in ${table}`);
  }
  return [tableResponse[0].start_time, tableResponse[0].end_time];
}

/**
 * Retrieves the project ID for the given team from the DEVPOST_LINK_TABLE table
 *
 * @param teamName The name of the team to get the project ID for
 * @returns The project ID
 */
async function getTeamId(teamName) {
  const table = process.env.DEVPOST_LINK_TABLE;
  const tableResponse = await scanTableWithExpression(table, 'devpost_link', teamName);

  if (tableResponse[0] === undefined) {
    //throw new Error(`Missing team: ${teamName} in ${table}`);
    return null;
  }
  return tableResponse[0].id;
}

/**
 * Puts data in given table.  Uses batchWrite to upload up to 25 demos at a time.
 *
 * @param table The table to put the data in
 * @param data The data to put in the table
 * @returns Promise with results
 */
async function addToTable(data, table = process.env.EXPO_TABLE) {
  let params = {
    RequestItems: {
      [table]: [],
    },
  };

  // using DocumentClient auto parses the output into nice JSON!
  const ddb = new AWS.DynamoDB.DocumentClient();

  let requestsSent = 0;
  // dynamically add post request body params to document
  Promise.all(data.map(async (d) => {
    const dataRow = {PutRequest: {Item: {}}};
    Object.keys(d).forEach((k) => {
      dataRow.PutRequest.Item[k] = d[k];
    });
    params.RequestItems[process.env.EXPO_TABLE].push(dataRow);
    requestsSent += 1;

    // batchWrite can only handle 25 requests at a time
    if (requestsSent === 25) {
      const result = ddb.batchWrite(params).promise();

      // Reset params
      params = {
        RequestItems: {
          [table]: [],
        },
      };
      requestsSent = 0;
      return result;
    }
    return undefined;
  }));

  if (requestsSent > 0) {
    await ddb.batchWrite(params).promise();
  }
}

/**
 * Pulls csv file from submissions.csv s3 bucket and returns the json data within
 *
 * @param bucket The s3 bucket
 * @param fileKey The s3 key
 * @returns The file content
 */
async function csvToJSON(bucket, fileKey) {
  const s3 = new AWS.S3();
  const params = {Bucket: bucket, Key: fileKey};
  // get csv file and create stream
  const stream = s3.getObject(params).createReadStream();
  // convert csv file (stream) to JSON format data
  return csv().fromStream(stream);
}

/**
 * Creates an empty schedule for a sponsor
 *
 * @returns An empty schedule
 */
function getEmptyTimeBlocks(sponsor, startTime, endTime) {
  const blocks = [];
  let currentDate = new Date(startTime);
  const endDate = new Date(endTime);
  let interval = (endDate - currentDate) * sponsor.demoSession;
  interval = interval / sponsor.num_applicants / MS_PER_MINUTE;
  // cap interval time to max time
  if (interval >= MAX_TIME) {
    DEMO_TIME = MAX_TIME;
  } else if (interval < MAX_TIME && interval > MIN_TIME) {
    DEMO_TIME = Math.floor(interval);
  } else {
    DEMO_TIME = MIN_TIME;
  }
  let nextDemoEnd = currentDate.getTime() + DEMO_TIME * MS_PER_MINUTE;
  while (nextDemoEnd <= endDate) {
    const e = new Date(nextDemoEnd);
    blocks.push({
      start: currentDate,
      end: e,
      sponsor: sponsor.name,
      numCanAssign: sponsor.demoSession,
      zoom_link: sponsor.zoomLink,
    });
    currentDate = e;
    nextDemoEnd = currentDate.getTime() + DEMO_TIME * MS_PER_MINUTE;
  }
  return blocks;
}

/**
 * Returns the number of demos which have already been scheduled for the team
 *
 * @param submission The team's submission object
 * @returns {number} number of demos scheduled for the team
 */
function numScheduledDemos(submission) {
  return submission.demoTimes.length;
}

/**
 * Checks to see if the given time is free for the team
 *
 * @param submission The team's submission object
 * @param time The time to check
 * @returns {boolean} If the team is free during the given time
 */
function isTimeFree(submission, timeStart, timeEnd) {
  // TODO: This needs to also check end time since blocks can be different lengths
  let isFree = true;
  submission.demoTimes.forEach((timeblock) => {
    if ((timeblock.start >= timeStart && timeblock.start < timeEnd) || (timeblock.end <= timeEnd && timeblock.end > timeStart)) {
      isFree = false;
    }
  });
  return isFree;
}

/**
 * Looks for an open time block which the team can be assigned to
 *
 * @param sponsor The sponsor's object
 * @param team The team object we want to schedule
 * @returns {number} The index of the time block from sponsorBlocks which the team
 *                      can be assigned to.
 */
function assignTeamToOpenBlock(sponsor, team) {
  // The max number of teams the sponsor will currently see
  let maxCurrent = 0;
  let openBlock = null;
  let backUp = null;

  sponsor.blocks.some((timeBlock, i) => {
    // The block should not have a team assigned and should be available to for the current team
    if (timeBlock.numCanAssign > 0 && isTimeFree(team, timeBlock.start, timeBlock.end)) {
      if (timeBlock.numCanAssign === sponsor.demoSession && !openBlock) {
        // This means no teams have been assigned to this time
        openBlock = i;
        return true;
      }
      if (timeBlock.numCanAssign > maxCurrent) {
        // Find the time with the least number of teams assigned
        maxCurrent = timeBlock.numCanAssign;
        backUp = i;
      }
    }
    return false;
  });

  if (openBlock != null) {
    return openBlock;
  }
  return backUp != null ? backUp : -1;
}

/**
 * Gets the submission object for the team name given from the submissions list.
 *
 * @param submissions The list of submissions
 * @param teamName The name of the team
 * @returns The team's submission object
 */
function getTeamSubmission(submissions, teamName) {
  return submissions.filter((submission) => submission.title === teamName)[0];
}

/**
 * Formats the given date as a local time string.
 *
 * @param date The date to format
 * @returns {string} The time as a formatted string
 */
function formatTime(date) {
  return date.toLocaleTimeString('en-us', {hour12: true, timeStyle: 'short', timeZone: 'America/New_York'});
}

/**
 * Updates the response dict returned by the lambda
 *
 * @param response The response object
 * @param code The return code
 * @param message The message for the response
 * @returns The updated response dict
 */
function updateResponse(response, code, message) {
  response.statusCode = code;
  // response.body.message = String(message);
  response.body = JSON.stringify(response.body, null, 2);
  return response;
}

/**
 * Creates a map with teams ids mapping to a list of users in the team
 *
 * @param teamMemberships The items in the MEMBERSHIPS_TABLE
 * @returns a map with teams ids mapping to a list of users in the team
 */
function getTeamMapping(teamMemberships) {
  const teamMapping = {};
  const teamNameMapping = {};
  teamMemberships.forEach((teamMembership) => {
    if (teamMembership.team_id in teamMapping) {
      teamMapping[teamMembership.team_id].push(teamMembership.user_id);
    } else {
      teamNameMapping[teamMembership.team_id] = teamMembership.team_name;
      teamMapping[teamMembership.team_id] = [teamMembership.user_id];
    }
  });

  return [teamMapping, teamNameMapping];
}

/**
 * Creates a map with user ids mapping to their slack id
 *
 * @param users The items in the USERS_TABLE
 * @returns a map with user ids mapping to their slack id
 */
function getSlackIdMappings(users) {
  const slackMappings = {};
  users.forEach((user) => {
    slackMappings[user.id] = user.slack_id;
  });

  return slackMappings;
}

/**
 * Gets the slack api token
 *
 * @returns The slack api token
 */
async function getSlackToken() {
  const SecretsManager = new AWS.SecretsManager();
  const SecretsManagerSlackKey = await SecretsManager.getSecretValue(
    {SecretId: process.env.SLACK_WEBHOOK_SECRET_NAME},
  ).promise();
  const secretsJSON = JSON.parse(SecretsManagerSlackKey.SecretString);

  return secretsJSON.PLATFORM_SLACK_OAUTH_TOKEN;
}

/**
 * Sends a message with the slack sdk.  If the message fails, this function will return a dict with result.ok
 * set to false.
 *
 * @param slackFunction The function to run from the slack api
 * @param message The parameters to send in slack's postMessage function
 * @returns The result of the call to slack's postMessage function
 */
async function sendSlackMessage(slackFunction, message) {
  let result = {};
  try {
    result = await slackFunction(message);
  } catch (error) {
    result.ok = false;
    result.error = error;
  }
  return result;
}

/**
 * Sends slack messages to all the users with demos.  Each user is sent their full demo schedule.
 *
 * @param demos The expo demos
 * @param teamMapping a map with teams ids mapping to a list of users in the team
 * @param slackIdMappings a map with user ids mapping to their slack id
 * @param teamNameMapping a map with teams ids mapping to their team name
 * @returns A list of users who could not be sent their schedule
 */
async function sendSlackMessages(demos, teamMapping, slackIdMappings, teamNameMapping) {
  const webMessages = new WebClient(await getSlackToken(), {rejectRateLimitedCalls: true});
  const teams = [...new Set(demos.map((demo) => demo.team_id))];
  const failedUsers = [];

  /* eslint-disable no-restricted-syntax */
  for (const team of teams) {
    /* eslint-disable no-restricted-syntax */
    if (typeof teamMapping[team] !== 'undefined') {
      for (const user of teamMapping[team]) {
        const blocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Expo schedule for: ${teamNameMapping[team]}\n `
                + 'When you join a demo session, please rename yourself in Zoom to "<Your Name> (<Your Team Name>)"\n'
                + 'All times below are show in EST',
            },
          }];
        demos.filter((demo) => demo.team_id === team).forEach((demo) => {
          blocks.push({
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Prize Category:* ${demo.sponsor_name}\n`
                  + `*Time:* ${formatTime(new Date(demo.start_time))} - ${formatTime(new Date(demo.end_time))}\n`
                  + `*Zoom Link:* ${demo.zoom_link}\n`,
              },
            ],
          });
        });

        let retries = 0;
        const message = {
          channel: slackIdMappings[user],
          username: BITCAMP_SLACK_BOT_NAME,
          blocks,
        };

        /* eslint-disable no-await-in-loop */
        let result = await sendSlackMessage(webMessages.chat.postMessage, message);
        /* eslint-disable no-await-in-loop */
        await sleep(SLACK_SLEEP_TIME);

        while (!result.ok && retries < SLACK_RETRIES) {
          /* eslint-disable no-await-in-loop */
          result = await sendSlackMessage(webMessages.chat.postMessage, message);
          retries += 1;
          /* eslint-disable no-await-in-loop */
          await sleep(SLACK_SLEEP_TIME);
        }

        if (!result.ok) {
          failedUsers.push(user);
          console.error(`Unable to send slack message to ${user}`);
          console.error(result.error);
        }
      }
    } else {
      console.error(`No team mapping for ${team}`);
    }
  }
  return failedUsers;
}

/**
 * Main function for creating the expo schedule. The script reads in a submission file from s3, uses the sponsors from
 * the sponsor info table and the time from the schedule table.  The location of the submission file should be given
 * as a parameter in the event of the lambda.  In the sponsor info table, the script uses the `name`, `zoomLink`, and
 * `demoSession` keys.  In the schedule table, the script looks for an event named `Expo` and uses its start and end
 * time.  The resulting schedule is written to s3, where the location is given as a parameter in the event of the
 * lambda.
 *
 * The script allows teams to be assigned to up to 3 demos.  The script starts by assigning sponsors with the most
 * submissions.  Sponsors can have more than one demo at the same time, as given by the `demoSession` key, however the
 * script will try to minimize the number of concurrent demos.  Any teams who can't be assigned will be logged.
 * 
 * Route restricted to users with role: admin
 *
 * @param event Takes in an event object with the following keys in the body (body should be a string):
 *                - bucket :- s3 bucket to read and write data to
 *                - submissionFileKey: The s3 key of the devpost submission file
 */
module.exports.createExpoSchedule = withSentry(async (event) => {
  const response = {
    headers: HEADERS,
  };

  if (event.body) {
    const body = JSON.parse(event.body);
    if (body.bucket && body.submissionFileKey) {
      try {
        // Pull sponsor data from db
        const tableResponse = await scanTable(process.env.SPONSORS_INFO_TABLE);

        // Get sponsors from table
        let sponsors = tableResponse.map(({zoomLink, demoSession, name, location}) => ({
          zoomLink,
          demoSession,
          name,
          location,
        }));

        // get all the devpost submissions from parsing from s3 bucket
        const devpostSubs = await csvToJSON(body.bucket, body.submissionFileKey);

        // create submission array of all submissions with attributes mapped
        const formattedSubs = devpostSubs.map((item) => {
          const sub = {};
          sub.url = item['Submission Url'];
          sub.title = item['Project Title'];
          sub.submitterFirstName = item['Submitter First Name'];
          sub.submitterLastName = item['Submitter Last Name'];
          sub.submitterEmail = item['Submitter Email'];
          sub.demoTimes = [];
          sub.table_number = item['Table Number'];
          sub.location = 1;

          // format the submissions and add categories that contains the names they are applying for
          // add company name to categories
          sub.categories = sponsors
            .filter((s) => item['Opt-In Prizes'].includes(s.name))
            .map((s) => s.name);

          // Remove any duplicate sponsors
          sub.categories = [...new Set(sub.categories)];

          // if applied to more than 3 categories, pick the first 3
          if (sub.categories.length > MAX_SPONSOR) {
            sub.categories = sub.categories.slice(0, MAX_SPONSOR);
          }
          return sub;
        });

        // Get teams which applied to the sponsor
        sponsors = sponsors.map((sponsor) => {
          const updatedSponsor = sponsor;
          // For each sponsor, get a list of teams which submitted to that sponsor's prize
          updatedSponsor.submissions = formattedSubs.filter((submission) => submission.categories.includes(sponsor.name));
          updatedSponsor.num_applicants = sponsor.submissions.length;
          return updatedSponsor;
        });

        const times = await getExpoTime();

        // Order the sponsor by location (prioritize in-person and hybrid) how many teams have applied to their prize
        sponsors = sponsors
          .sort((a, b) => {
            if (a.location === b.location) {
              return b.num_applicants - a.num_applicants;
            }
            return a.location - b.location;
          })
          .filter((sponsor) => sponsor.num_applicants > 0)
          .map((sponsor) => {
            const updatedSponsor = sponsor;
            // Create a list of time blocks for the sponsor
            updatedSponsor.blocks = getEmptyTimeBlocks(sponsor, times[0], times[1]);
            // Order the teams by location (prioritize in-person and hybrid) starting with the teams who have the most demo slots already
            // assigned aka teams that are most full first
            const sortedTeams = updatedSponsor.submissions.sort((a, b) => {
              if (a.location === b.location) {
                return numScheduledDemos(getTeamSubmission(formattedSubs, b.title)) - numScheduledDemos(getTeamSubmission(formattedSubs, a.title));
              }
              return a.location - b.location;
            }).filter((thing, index, self) => index === self.findIndex((t) => (t.title === thing.title)));

            // Assign the teams who have applied to the sponsor's prize
            sortedTeams.forEach((team) => {
              const teamInfo = getTeamSubmission(formattedSubs, team.title);
              const openBlock = assignTeamToOpenBlock(updatedSponsor, teamInfo);
              if (openBlock >= 0) {
                // There is an open time block the team can be put in
                // Assign the team to this time
                updatedSponsor.blocks[openBlock].numCanAssign -= 1;
                // If sponsor is not online:
                if (updatedSponsor.location < 2) {
                  // If hackers are in-person
                  if (team.location === 0) {
                    // If time is within allowable window for table assignments
                    if (openBlock < 6) {
                      teamInfo.demoTimes.push({
                        start: updatedSponsor.blocks[openBlock].start,
                        end: updatedSponsor.blocks[openBlock].end,
                        sponsor: updatedSponsor.name,

                        // TODO MAKE SURE THIS ADDS
                        zoom_link: team.table_number,
                        team,
                      });
                    }
                    // Else we are outside the allowable window, so use zoom link
                    else {
                      teamInfo.demoTimes.push({
                        start: updatedSponsor.blocks[openBlock].start,
                        end: updatedSponsor.blocks[openBlock].end,
                        sponsor: updatedSponsor.name,
                        zoom_link: updatedSponsor.zoomLink,
                        team,
                      });
                    }
                  }
                  // Else hackers are online, so use zoom link
                  else {
                    teamInfo.demoTimes.push({
                      start: updatedSponsor.blocks[openBlock].start,
                      end: updatedSponsor.blocks[openBlock].end,
                      sponsor: updatedSponsor.name,
                      zoom_link: updatedSponsor.zoomLink,
                      team,
                    });
                  }
                }
                // Else sponsor is online, so use zoom link
                else {
                  teamInfo.demoTimes.push({
                    start: updatedSponsor.blocks[openBlock].start,
                    end: updatedSponsor.blocks[openBlock].end,
                    sponsor: updatedSponsor.name,
                    zoom_link: updatedSponsor.zoomLink,
                    team,
                  });
                }
              } else {
                // Handle if the team couldn't be assigned
                // This most likely means all the sponsor has run out of time blocks
                console.error(`Team is not assigned ${team.title} for sponsor ${updatedSponsor.name}\n`
                  + `${updatedSponsor.name} has ${updatedSponsor.blocks.length} teams already scheduled`);
              }
            });
            return updatedSponsor;
          });

        // Format the submissions for output
        const demos = await Promise.all(formattedSubs.map(async (team) => {
          const teamTitle = team.title;
          let teamId = await getTeamId(teamTitle.toLowerCase().replace(/\s/g,''));

          if(teamId === null) {
            teamId = "";
          }

          const projectDemos = [];

          team.demoTimes.forEach((demo) => {
            projectDemos.push({
              id: UUID.v4(),
              team_id: teamId,
              team_name: team.title,
              sponsor_name: demo.sponsor,
              start_time: demo.start.toISOString(),
              end_time: demo.end.toISOString(),
              zoom_link: demo.zoom_link,
            });
          });
          return projectDemos;
        }));

        await addToTable(demos.flat(1));
        return new Promise((resolve) => {
          resolve(updateResponse(response, 200,
            'Created schedule'));
        });
      } catch (err) {
        console.error(err);
        return updateResponse(response, 500, err);
      }
    } else {
      return updateResponse(response, 500, 'Missing event body parameters');
    }
  } else {
    return updateResponse(response, 500, 'Missing event body');
  }
});

/**
 * This route will fetch the full demo schedule for the event.
 */
module.exports.getExpoSchedule = withSentry(async () => {
  const response = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    }
  };

  try {
    const result = await scanTable(process.env.EXPO_TABLE);

    response.statusCode = 200;
    response.body = JSON.stringify(result, null, 2);
    return new Promise((resolve) => {
      resolve(response);
    });
  } catch (err) {
    console.error(err);
    response.statusCode = 500;
    response.body = JSON.stringify(String(err), null, 2);
    return new Promise((resolve) => {
      resolve(response);
    });
  }
});

/**
 * This route will fetch the demo schedule for a given user.  It will look up the user's team, then
 * look up the user's project id.  From this, it can pull the schedule for that project.
 *
 * @param event Takes in an event object with the following keys in the queryStringParameters:
 *                - userId :- The user id to get demos for
 */
module.exports.getExpoScheduleUser = withSentry(async (event) => {
  const response = {
    headers: HEADERS,
    body: {input: event.queryStringParameters}
  };

  if (event.queryStringParameters && event.queryStringParameters.teamId) {
    try {
      const result = await scanTableWithExpression(process.env.EXPO_TABLE,
        'team_id', event.queryStringParameters.teamId);

      response.statusCode = 200;
      response.body = JSON.stringify(result, null, 2);
      return new Promise((resolve) => {
        resolve(response);
      });
    } catch (err) {
      console.error(err);
      return updateResponse(response, 500, err);
    }
  } else {
    return updateResponse(response, 500, 'Missing teamId parameter');
  }
});

/**
 * This route will fetch the demo schedule for a given sponsor.  Queries the EXPO_TABLE for all demos with
 * the given sponsor's name
 *
 * @param event Takes in an event object with the following keys in the queryStringParameters:
 *                - sponsor name :- The sponsor name to get demos for
 */
module.exports.getExpoScheduleSponsor = withSentry(async (event) => {
  const response = {
    headers: HEADERS,
    body: { input: event.queryStringParameters}
  };

  if (event.queryStringParameters && event.queryStringParameters.sponsorName) {
    try {
      const result = await scanTableWithExpression(process.env.EXPO_TABLE, 'sponsor_name',
        event.queryStringParameters.sponsorName);

      response.statusCode = 200;
      response.body = JSON.stringify(result, null, 2);
      return new Promise((resolve) => {
        resolve(response);
      });
    } catch (err) {
      console.error(err);
      return updateResponse(response, 500, err);
    }
  } else {
    return updateResponse(response, 500, 'Missing sponsorName parameter');
  }
});

/**
 * This function will send out DMs to each hacker who has submitted a hack with their full expo schedule.
 * One message is sent per second.  Each message will have the user's full schedule including start and
 * end times for each demo and an associated zoom link.
 *
 * This function should be run locally since it takes awhile to run.
 * sls invoke local --function sendExpoScheduleSlack --stage STAGE
 * 
 * Route restricted to users with role: admin
 */
module.exports.sendExpoScheduleSlack = withSentry(async () => {
  const response = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    }
  };

  try {
    const [teamMapping, teamNameMapping] = getTeamMapping(await scanTable(process.env.MEMBERSHIPS_TABLE));
    const slackIdMappings = getSlackIdMappings(await scanTable(process.env.USERS_TABLE));
    const demos = await scanTable(process.env.EXPO_TABLE);

    const result = await sendSlackMessages(demos, teamMapping, slackIdMappings, teamNameMapping);

    response.statusCode = 200;
    response.body = JSON.stringify(result, null, 2);
    return new Promise((resolve) => {
      resolve(response);
    });
  } catch (err) {
    console.error(err);
    response.statusCode = 500;
    response.body = JSON.stringify(String(err), null, 2);
    return new Promise((resolve) => {
      resolve(response);
    });
  }
});
