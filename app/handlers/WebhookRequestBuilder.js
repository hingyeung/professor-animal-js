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

    static createStartGameWebhookV1Request() {
        return {
            body: {
                "id": "f668fd90-1948-4012-8150-7a1558e373c0",
                "timestamp": "2017-09-17T03:20:38.081Z",
                "lang": "en",
                "result": {
                    "source": "agent",
                    "resolvedQuery": "game reset",
                    "action": "startgame",
                    "actionIncomplete": false,
                    "parameters": {},
                    "contexts": [
                        {
                            "name": "readytoplay",
                            "parameters": {},
                            "lifespan": 1
                        }
                    ],
                    "metadata": {
                        "intentId": "d7e5f593-dfa0-4488-8bbf-98ba8c34b8c1",
                        "webhookUsed": "true",
                        "webhookForSlotFillingUsed": "false",
                        "webhookResponseTime": 3443,
                        "intentName": "Test Game Reset"
                    },
                    "fulfillment": {
                        "speech": "Does it have long fur?",
                        "source": "samuelli.net",
                        "displayText": "Does it have long fur?",
                        "messages": [
                            {
                                "type": 0,
                                "speech": "Does it have long fur?"
                            }
                        ]
                    },
                    "score": 1
                },
                "status": {
                    "code": 200,
                    "errorType": "success"
                },
                "sessionId": "4f3a8260-5868-f5c1-f4dd-73215b1f0f56"
            }
        };
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