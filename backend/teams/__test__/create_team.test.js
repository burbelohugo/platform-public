'use strict';

//tests for create_team

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapper = lambdaWrapper.wrap(mod, { handler: 'create_team' });

const AWS = require('aws-sdk');

//valid team with team_name
const valid_team = {
    body: JSON.stringify({
        team_name: "hacking hackers",
    })
};

//invalid team without team_name
const invalid_team = {
    body: JSON.stringify({})
};

describe('create_team', () => {
    beforeAll((done) => {
        done();
    });

    it('Successfully accepts request to create a new team', async() =>{
        return await wrapper.run(valid_team).then(async (response) =>{
            expect(response).toBeDefined();
            expect(response).toHaveProperty('statusCode', 200);
        }); 
    });

    it('Successfully rejects request to create a new team', async() =>{
        return await wrapper.run(invalid_team).then(async (response) =>{
            expect(response).toBeDefined();
            expect(response).toHaveProperty('statusCode', 500);
        }); 
    });
});