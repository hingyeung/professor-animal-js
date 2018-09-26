class WebhookRequestBuilder {
    static createAnswerQuestionWebhookRequest(answer) {
        const outputContexts = [
                {
                    "name": "projects/animalgenie20180906/agent/sessions/4f3a8260-5868-f5c1-f4dd-73215b1f0f56/contexts/ingame",
                    "lifespanCount": 1
                },
                {
                    "name": "projects/animalgenie20180906/agent/sessions/4f3a8260-5868-f5c1-f4dd-73215b1f0f56/contexts/question.field:types",
                    "lifespan": 1
                },
                {
                    "name": "projects/animalgenie20180906/agent/sessions/4f3a8260-5868-f5c1-f4dd-73215b1f0f56/contexts/question.chosenValue:mammal",
                    "lifespan": 1
                }
            ],
            intent = {
                "name": "projects/animalgenie20180906/agent/intents/d7e5f593-dfa0-4488-8bbf-98ba8c34b8c1",
                "displayName": "Response.To.InGameQuestion.Yes"
            };

        return WebhookRequestBuilder.createWebhookRequest(answer, "answer_question", {answer: answer}, outputContexts, intent);
    }

    static createAnswerQuestionWebhookRequestWithoutCurrentFieldAndChosenValueInContext(answer) {
        const outputContexts = [
                {
                    "name": "projects/animalgenie20180906/agent/sessions/4f3a8260-5868-f5c1-f4dd-73215b1f0f56/contexts/ingame",
                    "lifespanCount": 1
                }
            ],
            intent = {
                "name": "projects/animalgenie20180906/agent/intents/d7e5f593-dfa0-4488-8bbf-98ba8c34b8c1",
                "displayName": "Response.To.InGameQuestion.Yes"
            };

        return WebhookRequestBuilder.createWebhookRequest(answer, "answer_question", {answer: answer}, outputContexts, intent);
    }

    static createAnswerQuestionRepeatWebhookRequest() {
        const outputContexts = [
                {
                    "name": "projects/animalgenie20180906/agent/sessions/4f3a8260-5868-f5c1-f4dd-73215b1f0f56/contexts/ingame",
                    "lifespanCount": 1
                }
            ],
            intent = {
                "name": "projects/animalgenie20180906/agent/intents/d7e5f593-dfa0-4488-8bbf-98ba8c34b8c1",
                "displayName": "Response.To.InGameQuestion.Repeat"
            };

        return WebhookRequestBuilder.createWebhookRequest("Repeat", "answer_question_repeat", {}, outputContexts, intent);
    }

    static createEnquireGlossaryRequest() {
        const outputContexts = [
                {
                    "name": "projects/animalgenie20180906/agent/sessions/4f3a8260-5868-f5c1-f4dd-73215b1f0f56/contexts/ingame",
                    "lifespanCount": 1
                }
            ],
            intent = {
                "name": "projects/animalgenie20180906/agent/intents/d7e5f593-dfa0-4488-8bbf-98ba8c34b8c1",
                "displayName": "Enquire.Glossary"
            };

        return WebhookRequestBuilder.createWebhookRequest("what is mammal", "answer_question_glossary_enquiry", {"term": "mammal"}, outputContexts, intent);
    }

    static createStartGameWebhookRequest() {
        const outputContexts = [
                {
                    "name": "projects/animalgenie20180906/agent/sessions/4f3a8260-5868-f5c1-f4dd-73215b1f0f56/contexts/readytoplay",
                    "lifespanCount": 1
                }
            ],
            intent = {
                "name": "projects/animalgenie20180906/agent/intents/d7e5f593-dfa0-4488-8bbf-98ba8c34b8c1",
                "displayName": "Test Game Reset"
            };

        return WebhookRequestBuilder.createWebhookRequest("test game reset", "startgame", {}, outputContexts, intent);
    }

    static createWebhookRequest(queryText, action, parameters, outputContexts, intent) {
        return {
            body: {
                "responseId": "81902796-90a9-4d68-8a2d-e41bc605072b",
                "queryResult": {
                    "queryText": queryText,
                    "action": action,
                    "parameters": parameters,
                    "allRequiredParamsPresent": true,
                    "fulfillmentMessages": [
                        {
                            "text": {
                                "text": [
                                    ""
                                ]
                            }
                        }
                    ],
                    "outputContexts": outputContexts,
                    "intent": intent,
                    "intentDetectionConfidence": 0.59,
                    "languageCode": "en"
                },
                "originalDetectIntentRequest": {
                    "payload": {}
                },
                "session": "projects/animalgenie20180906/agent/sessions/4f3a8260-5868-f5c1-f4dd-73215b1f0f56"
            }
        };
    }
}

module.exports = WebhookRequestBuilder;