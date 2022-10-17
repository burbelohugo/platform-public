'use strict';

//tests for leave_team

const mod = require('../handler');

const jestPlugin = require('serverless-jest-plugin');
const lambdaWrapper = jestPlugin.lambdaWrapper;
const adder = lambdaWrapper.wrap(mod, { handler: 'join_team' });
const wrapper = lambdaWrapper.wrap(mod, { handler: 'leave_team' });

const AWS = require('aws-sdk');

//valid leave request with id
const valid_request = {
    body: JSON.stringify({
        id: "testin",
        user_id: "the one that got away",
        team_id: ":,)"
    })
};

const valid_team_to_join = {
    body: JSON.stringify({
        "team_id": ":,)",
        "user_id": "the one that got away"
    })
};

//invalid leave request with no id
const invalid_request = {
    body: JSON.stringify({
        user_id: "the one that got away",
        team_id: ":,)"
    })
};


describe('leave_team', () => {
    beforeAll((done) => {
        done();
    });

    it('Successfully accepts request to leave a team with id', async() =>{
        // Add team into the membership db
        const response = await adder.run(valid_team_to_join);

        // id of team that was added
        const id = JSON.parse(response.body).id;   

        return await wrapper.run(valid_request).then(async (response) =>{
            expect(response).toBeDefined();
            expect(response).toHaveProperty('statusCode', 200);
            
            //check team with id was removed
            const ddb = new AWS.DynamoDB.DocumentClient();
            const getRequest = {
              TableName: process.env.MEMBERSHIPS_TABLE,
              Key: {id: id},
            };
            const result = await ddb.get(getRequest).promise();
            expect(result).toMatchObject({});
        }); 
    });

    it('Successfully rejects request to leave a team without id', async() =>{
        return await wrapper.run(invalid_request).then(async (response) =>{
            expect(response).toBeDefined();
            expect(response).toHaveProperty('statusCode', 500);
        }); 
    });
});