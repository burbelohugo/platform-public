// For authoring Nightwatch tests, see
// https://nightwatchjs.org/guide

module.exports = {
  'default e2e tests': (browser) => {
    browser
      .init()
      .waitForElementVisible('#app')
      .assert.containsText('h1', "Welcome to Bitcamp's Virtual Platform!")
      .assert.elementCount('img', 1)
      .pause(1000)
      .click('.schedule')
      .assert.containsText('h1', 'This is a schedule page')
      .pause(5000)
      .click('.profile')
      .assert.containsText('h1', 'This is a profile page')
      .pause(3000)
      .end();
  },
};
