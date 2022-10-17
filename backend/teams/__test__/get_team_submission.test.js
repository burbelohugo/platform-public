'use strict';

//tests for get_team_submission

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const adder = lambdaWrapper.wrap(mod, { handler: 'create_team' });
const getter = lambdaWrapper.wrap(mod, { handler: 'get_team_submission' });

const AWS = require('aws-sdk');

const add = {
    body: JSON.stringify({
        "team_name": "getter test",
        "project_submitted": false
    })
};

//invalid get request with no team_id
const invalid_request = {
    queryStringParameters: { id: 'this is not team_id' }
};


describe('get_team_submission', () => {
    beforeAll((done) => {
        done();
    });

    it('Successfully adds a team and gets the correct team', async () => {
        const added = await adder.run(add);
        const addedId = JSON.parse(added.body).id;
        const getRequest = {
            queryStringParameters: {team_id: addedId},
        };
        return await getter.run(getRequest).then(async (response) => {
          expect(response).toBeDefined();
          expect(response).toHaveProperty('statusCode', 200);
          const teamName = 'getter test';
          expect(JSON.parse(response.body)[0].team_name).toMatch(teamName);
        });
    });

    it('Successfully rejects request to get a teams info without id', async() =>{
        return await getter.run(invalid_request).then(async (response) => {
            expect(response).toBeDefined();
            expect(response).toHaveProperty('statusCode', 500);
        }); 
    });
});