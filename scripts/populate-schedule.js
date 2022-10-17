/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* Create random events for the schedule (currently on dev) */
const Axios = require('axios');

const endpoint = 'https://6lsghdvrp4.execute-api.us-east-1.amazonaws.com/dev/add_event';

const zoomInfo = require('./zoomInfo.js');

/* Create random word of length "length" */
function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/* Create random int i, min<=i<max */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

/* Add 0s so that s is two digits */
const pad_zero = (s) => (s.length > 1 ? s : `0${s}`);

/* Pick a random value from a list */
function randomlySample(lst) {
  return lst[getRandomInt(0, lst.length)];
}

/* Create a random event object */
const random_event = () => {
  const description = makeid(50);
  const event_name = makeid(10);
  let day = getRandomInt(9, 12);
  let start_time = getRandomInt(0, 24);
  let end_time = start_time + getRandomInt(1, 24 - start_time);
  const { zoom_link, zoom_email } = randomlySample(zoomInfo);

  if (day === 9) {
    start_time = getRandomInt(9, 24);
    end_time = start_time + getRandomInt(1, 24 - start_time);
  } else if (day === 11) {
    start_time = getRandomInt(0, 16);
    end_time = start_time + getRandomInt(1, 17 - start_time);
  }

  day = pad_zero(day.toString());
  start_time = `2021-04-${day}T${pad_zero(start_time.toString())}:00:00Z`;
  end_time = `2021-04-${day}T${pad_zero(end_time.toString())}:00:00Z`;
  const category = ['main-event', 'mini-event', 'workshop', 'food', 'demo'][getRandomInt(0, 4)];
  const event = {
    event_name,
    description,
    category,
    start_time,
    end_time,
    zoom_link,
    zoom_email,
  };
  return event;
};

// Add 30 random events
const num_events_to_populate = 30;

for (let i = 0; i < num_events_to_populate; i += 1) {
  Axios.post(endpoint, random_event()).then((response) => {
    console.log(response);
  }, (error) => {
    console.log(error);
  });
}
