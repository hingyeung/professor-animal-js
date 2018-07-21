'use strict';

const AnimalGenie = require('./animal_genie');

exports.myHandler = function (event, context, callback) {
    console.dir(event.result.action);
    console.dir(event.result.contexts);
    console.dir(event.result.parameters);
    console.dir(context);

    let animalGenie = new AnimalGenie();
    animalGenie.play(event, callback, {
        notificationTopicArn: process.env.NOTIFICATION_TOPIC_ARN
    });

    // or
    // callback("some error type");
};
