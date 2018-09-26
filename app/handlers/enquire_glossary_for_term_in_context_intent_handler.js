'use strict';

const _ = require('lodash'),
    {Text} = require("dialogflow-fulfillment"),
    GlossaryUtils = require('./glossary_utils');

const enquireGlossaryForTermInContextIntentHandler = (agent) => {
    const term = extractQuestionChosenValueFromContext(agent.contexts);
    const responseToApiAi = GlossaryUtils.buildSpeechForAnsweringGlossaryEnquiryForTerm(term, agent.contexts);

    responseToApiAi.contextOut && responseToApiAi.contextOut.forEach(context => agent.setContext(context));
    const text = new Text({
        text: responseToApiAi.displayText,
        ssml: responseToApiAi.speech,
        platform: agent.ACTIONS_ON_GOOGLE
    });

    agent.add(text);
};

const extractQuestionChosenValueFromContext = function(contextList) {
    let chosenValue = null;
    _.find(contextList, function(context) {
        const matched = context.name.match(/^question.chosenValue:(.+)$/);
        chosenValue = matched ? matched[1] : null;
        return matched;
    });

    return chosenValue;
};


module.exports = enquireGlossaryForTermInContextIntentHandler;