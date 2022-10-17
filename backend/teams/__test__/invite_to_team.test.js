'use strict';

//tests for invite_to_team

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const wrapper = lambdaWrapper.wrap(mod, { handler: 'invite_to_team' });

const AWS = require('aws-sdk');

//valid invited team with generated id, team_id, and user_id
const valid_invited_team = {
    body: JSON.stringify({
        "team_id": "12jj32k42-sdfjk32",
        "user_id": "2j3kjfd9sfjdsk-23"
    })
};

//invalid team missing both ids
const missing_both_ids = {
    body: JSON.stringify({})
};

//invalid team missing team_id
const missing_team_id = {
    body: JSON.stringify({
        "user_id": "2j3kjfd9sfjdsk-23"
    })
};

//invalid team missing user_id
const missing_user_id = {
    body: JSON.stringify({
        "team_id": "12jj32k42-sdfjk32"
    })
};

describe('invite_to_team', () => {
    beforeAll((done) => {
        done();
    });

    it('Successfully accepts request to invite a team', async() =>{
        return await wrapper.run(valid_invited_team).then(async (response) =>{
            expect(response).toBeDefined();
            expect(response).toHaveProperty('statusCode', 200);
        }); 
    });

    it('Successfully rejects request to invite a team without both ids', async() =>{
        return await wrapper.run(missing_both_ids).then(async (response) =>{
            expect(response).toBeDefined();
            expect(response).toHaveProperty('statusCode', 500);
        }); 
    });
});