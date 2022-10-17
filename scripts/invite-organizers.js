/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-destructuring */
const Axios = require('axios');

const csv = require('csvtojson');

const endpoint = 'https://api.beta.gotechnica.org/users/add';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Convert a csv file with csvtojson
csv()
  .fromFile('./organizers.csv')
  .then(async (csvResult) => {
    const users = csvResult.map(
      (item) => {
        item.access_level = "Organizer";
        return item;
      },
    );

    // eslint-disable-next-line no-restricted-syntax
    for (const user of users) {
      console.log(`Inviting ${user.full_name}`);
      await Axios.post(endpoint, user);
      await sleep(100);
    }
  });
