/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
const Axios = require("axios");

const csv = require("csvtojson");

const dev = "https://api.alpha.gotechnica.org/schedule/event"; // dev
const stg = "https://api.beta.gotechnica.org/schedule/event"; // stg
const prd = "https://api.gotechnica.org/schedule/event"; // prd

// Convert a csv file with csvtojson
csv()
  .fromFile("./technica2021-schedule.csv")
  .then(async (csvResult) => {
    const formattedScheduleItems = csvResult.map((item) => {
      delete item.id;
      delete item.link;
      return item;
    });
    // eslint-disable-next-line no-restricted-syntax
    for (const item of formattedScheduleItems) {
      await Promise.all([
        Axios.post(dev, item),
        Axios.post(stg, item),
        Axios.post(prd, item)
      ]);
    }
  });
