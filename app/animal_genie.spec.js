'use strict';

const proxyquire = require('proxyquire').noPreserveCache(),
    should = require('chai').should(),
    UserSession = require('./models/UserSession'),
    sinonPromise = require('sinon-promise'),
    Question = require('./models/question'),
    ResponseToApiAi = require('./models/response_to_api_ai'),
    fs = require('fs'),
    Context = require('./models/context'),
    AnimalRepo = require('./services/animal_repo'),
    ActionType = require('./models/action_types'),
    sinon = require('sinon');

describe('AnimalGenie', function () {
    let mockAnimalRepo, mockDbService, getSessionStub, AnimalGenie, animalGenie, nextQuestionStub, mockResponseToApiAi,
        fullAnimalListFromFile, listOfAnimalsRestoredFromSession, convertAnimalNameListToAnimalListStub,
        allAnimalsStub, saveSessionStub, mockQuestionSelector, nextQuestion, apiAiForGiveUpMessage,
        apiAiForRepeatingSpeech, apiAiForAnswerForGlossaryEnquirySpeech, mockGlossaryRepo, handleRequestSpy, askSpy, endSpy,
        userSession, filterStub, mockAnimalFilter, callbackSpy, apiAiResponseForFilterBasedQuestion, mockWebhookClient,
        apiAiResponseForReadyToGuessQuestion, glossaryGetDefinitionStub, apiAiForAnswerForUnknownGlossaryEnquirySpeech;

    beforeEach(function () {
        sinonPromise(sinon);
        callbackSpy = sinon.spy();
        userSession = new UserSession("123", ["Lion", "Eagle"], "types", "A");
        fullAnimalListFromFile = JSON.parse(fs.readFileSync('app/data/test-animals.json'));
        listOfAnimalsRestoredFromSession = [
            {
                "name": "Lion",
                "types": [
                    "vertebrate",
                    "mammal",
                    "big cat",
                    "large",
                    "carnivore",
                    "predator"
                ],
                "behaviours": [
                    "hunt in a pack"
                ],
                "physical": [
                    "mane"
                ],
                "diet": [
                    "zebra",
                    "buffalo",
                    "wildebeest",
                    "giraffes"
                ]
            }, {
                "name": "Eagle",
                "types": [
                    "vertebrate",
                    "bird",
                    "bird of prey",
                    "large"
                ],
                "behaviours": [
                    "carnivore",
                    "predator",
                    "flying"
                ],
                "physical": [
                    "wings",
                    "talon"
                ],
                "diet": [
                    "mouse",
                    "rat",
                    "rabbit"
                ]
            }
        ];
        getSessionStub = sinon.promise().resolves(userSession);
        saveSessionStub = sinon.promise().resolves(userSession);
        askSpy = sinon.spy();
        endSpy = sinon.spy();
        handleRequestSpy = sinon.spy();
        nextQuestion = new Question("diet", ["A", "B"], "A");
        nextQuestionStub = sinon.stub().returns(nextQuestion);
        filterStub = sinon.stub().returns(listOfAnimalsRestoredFromSession);
        apiAiResponseForFilterBasedQuestion = {
            questionType: Question.FILTER_BASED_QUESTION,
            speech: "filter_based_speech"
        };
        apiAiResponseForReadyToGuessQuestion = {
            questionType: Question.READY_TO_GUESS_QUESTION,
            speech: "ready_to_guess_speech"
        };
        apiAiForGiveUpMessage = {questionType: Question.GIVE_UP_MESSAGE, speech: "give_up_speech"};
        apiAiForRepeatingSpeech = {speech: "repeating_speech"};
        apiAiForAnswerForGlossaryEnquirySpeech = {speech: "glossary_definition."};
        apiAiForAnswerForUnknownGlossaryEnquirySpeech = {speech: "unknown_glossary_definition"};

        mockDbService = function () {
            return {
                saveSession: saveSessionStub,
                getSession: getSessionStub
            };
        };
        mockWebhookClient = function () {
            return {
                ask: askSpy,
                end: endSpy,
                handleRequest: handleRequestSpy
            };
        };
        mockAnimalRepo = function () {
            return {
                convertAnimalListToAnimalNameList: (new AnimalRepo()).convertAnimalListToAnimalNameList,
            };
        };
        glossaryGetDefinitionStub = sinon.stub();
        mockGlossaryRepo = function () {
            return {
                getDefinition: glossaryGetDefinitionStub.returns("glossary_definition")
            };
        };
        mockQuestionSelector = {
            nextQuestion: nextQuestionStub
        };
        mockResponseToApiAi = {
            fromQuestion: sinon.stub().callsFake(function (question, contextOut) {
                if (question.questionType === Question.FILTER_BASED_QUESTION) {
                    return apiAiResponseForFilterBasedQuestion;
                } else if (question.questionType === Question.READY_TO_GUESS_QUESTION) {
                    return apiAiResponseForReadyToGuessQuestion;
                } else {
                    return apiAiForGiveUpMessage;
                }
            }),
            repeatSpeechFromUserSesssion: function () {
                return apiAiForRepeatingSpeech;
            },
            answerGlossaryEnquiry: function () {
                return apiAiForAnswerForGlossaryEnquirySpeech;
            },
            answerUnknownGlossaryEnquiry: function () {
                return apiAiForAnswerForUnknownGlossaryEnquirySpeech;
            }
        };
        mockAnimalFilter = {
            filter: filterStub
        };

        animalGenie = animalGenieWithMocks();
        // animalGenie = new AnimalGenie();
    });

    function animalGenieWithMocks() {
        return new (proxyquire('./animal_genie', {
            './services/animal_repo': mockAnimalRepo,
            './services/DbService': mockDbService,
            'dialogflow-fulfillment': {WebhookClient: mockWebhookClient},
            './services/question_selector': mockQuestionSelector,
            './models/response_to_api_ai': mockResponseToApiAi,
            './services/animal_filter': mockAnimalFilter,
            './services/glossary_repo': mockGlossaryRepo
        }))(getFullAnimalList());
    }

    function getFullAnimalList() {
        return JSON.parse(fs.readFileSync('app/data/test-animals.json'));
    }

    function createEvent(sessionId, action, answer, context) {
        return {
            sessionId: sessionId,
            result: {
                contexts: context || [],
                action: action,
                parameters: {
                    answer: answer
                }
            }
        };
    }

    const createStartGameWebhookRequest = () => {
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

        return createWebhookRequest("test game reset", "startgame", {}, outputContexts, intent);
    };

    const createWebhookRequest = (queryText, action, parameters, outputContexts, intent) => {
        return {
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
        };
    };
});