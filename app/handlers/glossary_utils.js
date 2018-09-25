'use strict';

const ResponseToApiAi = require("../models/response_to_api_ai"),
    GlossaryRepo = require("../services/glossary_repo");

const buildSpeechForAnsweringGlossaryEnquiryForTerm = function(term, contextsIn) {
    const glossaryRepo = new GlossaryRepo();
    let definition = glossaryRepo.getDefinition(term);
    if (definition) {
        return ResponseToApiAi.answerGlossaryEnquiry(term, definition, contextsIn);
    } else {
        return ResponseToApiAi.answerUnknownGlossaryEnquiry(term, contextsIn);
    }
};

const buildSpeechForAnsweringGlossaryEnquiry = function(term, contextsIn) {
    return buildSpeechForAnsweringGlossaryEnquiryForTerm(term, contextsIn);
};

module.exports = {
    buildSpeechForAnsweringGlossaryEnquiryForTerm: buildSpeechForAnsweringGlossaryEnquiryForTerm,
    buildSpeechForAnsweringGlossaryEnquiry: buildSpeechForAnsweringGlossaryEnquiry
};