"use strict";

const AWS = require("aws-sdk");

const computerGuessRejectedIntentHandler = (agent, animal, snsTopicArn) => {
    let sns = new AWS.SNS(),
        params = {
            Message: "Professor Animal has made an incorrect guess. The answer was " + animal,
            Subject: "Professor Animal has just lost a game.",
            TopicArn: snsTopicArn
        };

    sns.publish(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
    agent.add(`I need to learn more about ${animal}. Do you want to play again?`)
};

module.exports = computerGuessRejectedIntentHandler;