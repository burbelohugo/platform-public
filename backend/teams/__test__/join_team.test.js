'use strict';

//tests for join_team

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapper = lambdaWrapper.wrap(mod, { handler: 'join_team' });

const AWS = require('aws-sdk');

//valid invited team with team_id and user_id
const valid_team_to_join = {
    body: JSON.stringify({
        "team_id": "12jj32k42",
        "user_id": "2j3kjfd9s"
    })
};

//invalid team missing both ids
const missing_both_ids = {
    body: JSON.stringify({})
};

//invalid team missing team_id
const missing_team_id = {
    body: JSON.stringify({
        "user_id": "donde id"
    })
};

//invalid team missing user_id
const missing_user_id = {
    body: JSON.stringify({
        "team_id": "donde esta"
    })
};

describe('join_team', () => {
    beforeAll((done) => {
        done();
    });

    it('Successfully accepts request to join a team', async() =>{
        return await wrapper.run(valid_team_to_join).then(async (response) =>{
            expect(response).toBeDefined();
            expect(response).toHaveProperty('statusCode', 200);
        }); 
    });

    it('Successfully rejects request to join a team without both ids', async() =>{
        return await wrapper.run(missing_both_ids).then(async (response) =>{
            expect(response).toBeDefined();
            expect(response).toHaveProperty('statusCode', 500);
        }); 
    });
});