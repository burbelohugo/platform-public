/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
const Axios = require('axios');

const csv = require('csvtojson');

//const endpoint = 'https://qyg880us5g.execute-api.us-east-1.amazonaws.com/dev/projects/sponsor'; // dev
// const endpoint = 'https://9wzxx0iaug.execute-api.us-east-1.amazonaws.com/stg/projects/sponsor'; // stg
const endpoint = 'https://s1emwta04f.execute-api.us-east-1.amazonaws.com/prd/projects/sponsor'; // prd

// Convert a csv file with csvtojson
csv()
  .fromFile('./technica-sponsors.csv')
  .then(async (csvResult) => {
    const formattedScheduleItems = csvResult.map((item) => {
      //delete item.id;
      //delete item.link;
      return item;
    });
    // eslint-disable-next-line no-restricted-syntax
    for (const item of formattedScheduleItems) {
      await Axios.post(endpoint, item);
      // await sleep(100);
    }
  });
