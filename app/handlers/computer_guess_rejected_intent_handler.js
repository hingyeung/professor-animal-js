"use strict";

const AWS = require("aws-sdk"),
    {getLogger} = require('../services/logger_utils');

const logger = getLogger();

const computerGuessRejectedIntentHandler = async (agent, animal, sessionId, snsTopicArn) => {
    let sns = new AWS.SNS(),
        params = {
            Message: `Professor Animal has made an incorrect guess. The answer was ${animal}. Session ID: ${sessionId}`,
            Subject: "Professor Animal has just lost a game.",
            TopicArn: snsTopicArn
        };

    await sns.publish(params, function (err, data) {
        if (err) logger.error('SNS publish error', err); // an error occurred
        else logger.info('SNS message published: %o', data);           // successful response
    }).promise();
    agent.add(`I need to learn more about ${animal}. Do you want to play again?`);
};

module.exports = computerGuessRejectedIntentHandler;