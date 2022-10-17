// Prevents actual slack functions from being called when running test
// (see https://bambielli.com/til/2017-12-14-mocking-node-modules-with-jest/)
module.exports = jest.genMockFromModule('@slack/webhook');
