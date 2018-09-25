"use strict";

const GlossaryUtils = require("./glossary_utils"),
    {Text} = require("dialogflow-fulfillment");

const enquireGlossaryIntentHandler = (agent) => {
    const term = agent.parameters.term,
        contextsIn = agent.contexts;
    const responseToApiAi = GlossaryUtils.buildSpeechForAnsweringGlossaryEnquiry(term, contextsIn);

    responseToApiAi.contextOut && responseToApiAi.contextOut.forEach(context => agent.setContext(context));
    const text = new Text({
        text: responseToApiAi.displayText,
        ssml: responseToApiAi.speech,
        platform: agent.ACTIONS_ON_GOOGLE
    });

    agent.add(text);
};

module.exports = enquireGlossaryIntentHandler;