/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-destructuring */
const Axios = require('axios');

const csv = require('csvtojson');

const endpoint = 'https://kqm1kgz1g7.execute-api.us-east-1.amazonaws.com/prod/users/add';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Convert a csv file with csvtojson
csv()
  .fromFile('./responses.csv')
  .then(async (csvResult) => {
    const users = csvResult.map(
      (item) => {
        const teamChoice = assignTeam(item);
        return {
          full_name: `${item['What is your *first name*?']} ${item['Nice to meet you {{field:first_name}}! What is your *last name*?']}`,
          email: item['What is your *email address*?'],
          phone: item['What is your *phone number*?'],
          school: item['What *school* do you attend?'],
          group: 'hacker', // for sponsors: "sponsor"
          access_level: 'Hack', // for sponsors: "{company name}"
        };
      },
    );
  });
