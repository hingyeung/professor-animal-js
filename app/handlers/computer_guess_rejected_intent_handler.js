"use strict";

const AWS = require("aws-sdk"),
    {getLogger} = require('../services/logger_utils');

const logger = getLogger();

const computerGuessRejectedIntentHandler = async (agent, animal, sessionId, snsTopicArn) => {
    const sns = new AWS.SNS(),
        params = {
            Message: `Professor Animal has made an incorrect guess. The answer was ${animal}. Session ID: ${sessionId}`,
            Subject: "Professor Animal has just lost a game.",
            TopicArn: snsTopicArn
        };

    try {
        await sns.publish(params).promise();
        logger.info('SNS message published');
        agent.add(`I need to learn more about ${animal}. Do you want to play again?`);
    } catch (err) {
        logger.error('SNS publish error', err); // an error occurred
    }
};

module.exports = computerGuessRejectedIntentHandler;