/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-destructuring */
const Axios = require('axios');

const endpoint = 'https://api.gotechnica.org/users/irl_invite';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

[
  'nswamy1@gotechnica.org',
  'jlewis23@umd.edu',
  'sbai83100@gmail.com',
  'moh.alik77@gmail.com',
].forEach((email) => {
  console.log(`Inviting ${email}`);
  Axios.post(endpoint, {email: email});
  // await sleep(100);
});
