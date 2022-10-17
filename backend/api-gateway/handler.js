// auth.js contains only the logic for the Lambda Custom Authorizer
// https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html

var jwt = require('jsonwebtoken');

// ----------------------------- POLICY CONDITIONS -----------------------------

const organizerCondition = {
    StringEquals: { "aws:ResourceTag/acl": ["hacker", "mentor", "sponsor", "organizer"] }
};

const sponsorCondition = {
    StringEquals: { "aws:ResourceTag/acl": ["hacker", "mentor", "sponsor"] }
};

const mentorCondition = {
    StringEquals: { "aws:ResourceTag/acl": ["hacker", "mentor"] }
};

const hackerCondition = {
    StringEquals: { "aws:ResourceTag/acl": "hacker" }
};

const allowStatement = {
    Effect: "Allow",
    Action: "apigateway:Invoke",
    Resource: "*"
};

const denyStatement = {
    Effect: "Deny",
    Action: "apigateway:*",
    Resource: "*"
};

const makeAllowStatement = (condition) => {
    allowStatement.Condition = condition;
    return allowStatement;
}

module.exports.auth = (event, context, callback) => {
    const privateKey = 'technica'; // TODO this should change
    var tokenPayload;
    var policy = {
        principalId: tokenPayload.email,
        policyDocument: {
          Version: "2012-10-17",
          Statement: [{
            Effect: "Allow",
            Action: "apigateway:Invoke",
            Resource: "arn:aws:execute-api:us-east-1:296008842815:*/*/*/authz/*" // always allow access to authz
          }]
        }
    };
    
    try {
        jwt.verify(event.authorizationToken, privateKey);      
        policy.context = tokenPayload;
    } catch (error) {
        callback(null, policy);
    }

    switch (tokenPayload.role) {
        case "admin":
            policy.policyDocument.Statement.push(allowStatement);
            break;
        case "organizer":
            policy.policyDocument.Statement.push(makeAllowStatement(organizerCondition));
            break;
        case "sponsor":
            policy.policyDocument.Statement.push(makeAllowStatement(sponsorCondition));
            break;
        case "mentor":
            policy.policyDocument.Statement.push(makeAllowStatement(mentorCondition));
            break;
        case "hacker":
            policy.policyDocument.Statement.push(makeAllowStatement(hackerCondition));
            break;
        default:
            policy.policyDocument.Statement.push(makeAllowStatement(denyStatement));
            break;
    }

    callback(null, policy);
};