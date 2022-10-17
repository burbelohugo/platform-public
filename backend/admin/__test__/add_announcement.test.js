// tests for get_point_totals

const jestPlugin = require('serverless-jest-plugin');
const mod = require('../handler');

const { lambdaWrapper } = jestPlugin;
const addAnnouncement = lambdaWrapper.wrap(mod, { handler: 'add_announcement' });
const sampleAnnouncement = 'Some random announcement';

const makeEvent = (body) => ({ body: JSON.stringify(body) });

describe('add_announcement', () => {
  beforeAll((done) => {
    done();
  });

  it('Adds a new announcement when given the correct params', async () => {
    const validRequest = makeEvent({
      event: {
        channel: process.env.ANNOUNCEMENTS_CHANNEL,
        text: sampleAnnouncement,
      },
    });

    // Check response metadata
    const response = await addAnnouncement.run(validRequest);
    expect(response).toBeDefined();
    expect(response).toHaveProperty('statusCode', 200);

    // Check response object
    const body = JSON.parse(response.body);
    expect(body.id).toBeDefined();
    expect(Date.parse(body.timestamp)).not.toBeNaN();
    expect(body.text).toEqual(sampleAnnouncement);
  });

  it('Parses Slack message text into HTML', async () => {
    // Map of Slack messages to expected output
    const messageTranslationTable = {
      "Plain Text": "Plain Text",
      "<https://raw-url.com>": "<a href=\"https://raw-url.com\">https://raw-url.com</a>",
      "<https://bit.camp|our website>": "<a href=\"https://bit.camp\">our website</a>",
      "<#C01TMUYMSTE|channel-link>": "",
      "<!tag>": "",
      "*bold*": "<strong>bold</strong>",
      "_italic_": "<i>italic</i>",
      "~strikethrough~": "<del>strikethrough</del>",
      "`code`": '<code>code</code>',
    };

    // Test that every message is stored w/ the appropriate HTML 
    for(const [msg, html] of Object.entries(messageTranslationTable)) {
      const validRequest = makeEvent({
        event: {
          channel: process.env.ANNOUNCEMENTS_CHANNEL,
          text: msg,
        },
      });
      

      // Check response object
      const response = await addAnnouncement.run(validRequest);
      expect(response).toHaveProperty('statusCode', 200);

      const body = JSON.parse(response.body);
      expect(body.text).toEqual(html);
    }
  }); 

  it('Fails with no event key', async () => {
    const noEventRequest = makeEvent({});

    const response = await addAnnouncement.run(noEventRequest);
    expect(response.statusCode).not.toEqual(200);
  });

  it('Fails with an incorrect channel ID', async () => {
    const badChannelRequest = makeEvent({
      event: {
        channel: 'some random channel',
        text: sampleAnnouncement,
      },
    });

    const response = await addAnnouncement.run(badChannelRequest);
    expect(response.statusCode).not.toEqual(200);
  });

  it('Fails with a subtype of a message', async () => {
    const messageSubtypeRequest = makeEvent({
      event: {
        channel: process.env.ANNOUNCEMENTS_CHANNEL,
        text: sampleAnnouncement,
        subtype: 'channel_join',
      },
    });

    const response = await addAnnouncement.run(messageSubtypeRequest);
    expect(response.statusCode).not.toEqual(200);
  });

  it('Fails with no text field', async () => {
    const noTextRequest = makeEvent({
      event: {
        channel: process.env.ANNOUNCEMENTS_CHANNEL,
      },
    });

    const response = await addAnnouncement.run(noTextRequest);
    expect(response.statusCode).not.toEqual(200);
  });
});
