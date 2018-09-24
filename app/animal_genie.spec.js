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

    // it('shouild call callback', function () {
    //     let event = createEvent("123", "startgame", "yes");
    //     animalGenie.play(event, callbackSpy);
    //     callbackSpy.calledWith(null, apiAiResponseForFilterBasedQuestion).should.equal(true);
    // });

    it("should reply player", () => {
        let webhookRequest = createStartGameWebhookRequest();
        animalGenie.playByIntent(webhookRequest, {}, null);
        handleRequestSpy.called.should.equal(true);
        console.dir(handleRequestSpy.args);
    });

    it('should create new session in DB when Api.ai action is "startgame"', function () {
        let event = createEvent("123", "startgame", "yes");
        animalGenie.play(event, callbackSpy);
        saveSessionStub.calledOnce.should.equal(true);
        sinon.assert.calledWithExactly(saveSessionStub,
            new UserSession("123",
                ["Lion", "Elephant", "Chameleon", "Shark", "Penguin", "Eagle"],
                "diet", "A", [], "filter_based_speech"));
        getSessionStub.called.should.equal(false);
    });

    it('should get next question with QuestionSelector with full animal list from file when Api.ai action is "startgame"', function () {
        let event = createEvent("123", "startgame", "yes");
        animalGenie.play(event, callbackSpy);
        nextQuestionStub.calledOnce.should.equal(true);
        nextQuestionStub.calledWith(fullAnimalListFromFile).should.equal(true);
    });

    it('should load existing session in DB when Api.ai action is "answer_question"', function () {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "yes");
        animalGenie.play(event, callbackSpy);
        getSessionStub.calledOnce.should.equal(true);
        getSessionStub.calledWith("123").should.equal(true);
    });

    it('should save updated session to DB with field-attributeValue to ignore in next round when Api.ai action is "answer_question and user answer is "yes"', function () {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "yes");
        animalGenie.play(event, callbackSpy);
        // the field and chosenValue in the incoming session should be added to the ignore list when the user answer is "yes",
        // which trigger inclusive filter
        saveSessionStub.calledWith(
            new UserSession("123", ["Lion", "Eagle"], "diet", "A", [{
                field: "types",
                attributeValue: "A"
            }], 'Does it eat A?')
        ).should.equal(true);
    });

    it('should save updated session to DB without field-attributeValue to ignore in next round when Api.ai action is "answer_question" and user answer is "no"', function () {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "no", 'speech');
        animalGenie.play(event, callbackSpy);
        // the field and chosenValue in the incoming session should not be added to the ignore list when the user answer is "no",
        // which trigger inclusive filter
        saveSessionStub.calledWith(
            new UserSession("123", ["Lion", "Eagle"], "diet", "A", [], 'Does it eat A?')
        ).should.equal(true);
    });

    it('should save updated session to DB with field-attributeValue to ignore in next round when Api.ai action is "answer_question and user answer is "not_sure"', function() {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "not_sure", 'speech');
        animalGenie.play(event, callbackSpy);
        // the field and chosenValue in the incoming session should be added to the ignore list when the user answer is "not_sure"
        saveSessionStub.calledWith(
            new UserSession("123", ["Lion", "Eagle"], "diet", "A", [{
                field: "types",
                attributeValue: "A"
            }], 'Does it eat A?')
        ).should.equal(true);
    });

    it('should not use remove any animal using filter when Api.ai action is "answer_question and user answer is "not_sure"', function (done) {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "not_sure", 'speech');
        mockAnimalFilter.filter = sinon.spy();
        animalGenie = animalGenieWithMocks();
        animalGenie.play(event, function (err, responseToApiAi) {
            mockAnimalFilter.filter.called.should.equal(false);
            done();
        });
    });

    it('should save updated session when computer is ready to guess the animal', function (done) {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "yes");

        // forcing mockAnimalFilter is reloaded with the updated filterStub
        filterStub = sinon.stub().returns([{name: "correct animal"}]);
        mockAnimalFilter.filter = filterStub;
        animalGenie = animalGenieWithMocks();
        animalGenie.play(event, function (err, responseToApiAi) {
            userSession.speech.should.equal("It is a correct animal. Am I right?");
            sinon.assert.calledWithExactly(saveSessionStub, userSession);
            done();
        });
    });

    it('should get next question with QuestionSelector with animal list restored from session when Api.ai action is "answer_question"', function () {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "yes");
        animalGenie.play(event, callbackSpy);
        nextQuestionStub.calledOnce.should.equal(true);
        nextQuestionStub.calledWith(listOfAnimalsRestoredFromSession).should.equal(true);
    });

    it('should convert next question to Api.ai resposne', function (done) {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "yes");
        animalGenie.play(event, function () {
            mockResponseToApiAi.fromQuestion.calledWith(nextQuestion).should.equal(true);
            done();
        });
    });

    it('should return "ready-to-guess" question, when only one animal left', function (done) {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "yes");

        // forcing mockAnimalFilter is reloaded with the updated filterStub
        filterStub = sinon.stub().returns([{name: "correct animal"}]);
        mockAnimalFilter.filter = filterStub;
        animalGenie = animalGenieWithMocks();

        animalGenie.play(event, function (err, responseToApiAi) {
            should.not.exist(err);
            responseToApiAi.should.equal(apiAiResponseForReadyToGuessQuestion);
            done();
        });
    });

    it('should use AnimalFilter to filter out unmatched animal when user answer is "yes"', function (done) {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "yes");
        animalGenie.play(event, function () {
            filterStub.calledWith(listOfAnimalsRestoredFromSession, true, "types", userSession.chosenValue).should.be.true;
            done();
        });
    });

    it('should use AnimalFilter to filter out unmatched animal when user answer is "no"', function (done) {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "no");
        animalGenie.play(event, function () {
            filterStub.calledWith(listOfAnimalsRestoredFromSession, false, "types", userSession.chosenValue).should.be.true;
            done();
        });
    });

    it('should return give-up api.ai response when it cannot determine the next question to ask and confident guess cannot be made', function (done) {
        let event = createEvent("123", ActionType.ANSWER_QUESTION, "no");
        nextQuestionStub = sinon.stub().returns(new Question(null, null, null, Question.GIVE_UP_MESSAGE));
        mockQuestionSelector.nextQuestion = nextQuestionStub;
        animalGenie = animalGenieWithMocks();
        animalGenie.play(event, function (err, responseToApiAi) {
            responseToApiAi.should.equals(apiAiForGiveUpMessage);
            done();
        });
    });

    it('should repeat the previous question when Api.ai action is "answer_question_repeat" during "startgame" stage', function (done) {
        let firstEvent = createEvent("123", "startgame", "yes");
        animalGenie.play(firstEvent, function (err, firstResponseToApiAi) {
            let secondEvent = createEvent("123", "answer_question_repeat");
            animalGenie.play(secondEvent, function (err, secondResponseToApiAi) {
                secondResponseToApiAi.should.equal(apiAiForRepeatingSpeech);
                done();
            });
        });
    });

    it('should repeat the previous question when Api.ai action is "answer_question_repeat" during "answer_question" stage', function (done) {
        let firstEvent = createEvent("123", ActionType.ANSWER_QUESTION, "yes");
        animalGenie.play(firstEvent, function (err, firstResponseToApiAi) {
            let secondEvent = createEvent("123", "answer_question_repeat");
            animalGenie.play(secondEvent, function (err, secondResponseToApiAi) {
                secondResponseToApiAi.should.equal(apiAiForRepeatingSpeech);
                done();
            });
        });
    });

    it('should explain definition of a word in glossary during game', function (done) {
        let event = createEvent("123", ActionType.ANSWER_QUESTION_GLOSSARY_ENQUIRY);
        animalGenie.play(event, function (err, responseToApiAi) {
            responseToApiAi.should.equal(apiAiForAnswerForGlossaryEnquirySpeech);
            done();
        });
    });

    it('should response properly when definition of a word is unknown during game', function (done) {
        let event = createEvent("123", ActionType.ANSWER_QUESTION_GLOSSARY_ENQUIRY);
        mockGlossaryRepo = function () {
            return {
                getDefinition: glossaryGetDefinitionStub.returns(null)
            };
        };
        // force mockGlossaryRepo to use the updated getDefinition()
        animalGenie = animalGenieWithMocks();

        animalGenie.play(event, function (err, responseToApiAi) {
            responseToApiAi.should.equal(apiAiForAnswerForUnknownGlossaryEnquirySpeech);
            done();
        });
    });

    it('should explain definition of the chosen value of the current question during game', (done) => {
        const contextWithCurrentQuestionFieldAndChosenValue = [new Context('question.field:FIELD', 1), new Context('question.chosenValue:VALUE', 1)];
        let event = createEvent("123", ActionType.ANSWER_QUESTION_GLOSSARY_ENQIRY_OF_THE_CURRENT_QUESTION_VALUE, null, contextWithCurrentQuestionFieldAndChosenValue);
        animalGenie.play(event, function (err, responseToApiAi) {
            glossaryGetDefinitionStub.calledOnce.should.equal(true);
            glossaryGetDefinitionStub.calledWith('VALUE').should.equal(true);
            responseToApiAi.should.equal(apiAiForAnswerForGlossaryEnquirySpeech);
            done();
        });
    });

    it('should respond properly chosenValue of the current question is not in the context', (done) => {
        let event = createEvent("123", ActionType.ANSWER_QUESTION_GLOSSARY_ENQIRY_OF_THE_CURRENT_QUESTION_VALUE, "yes");
        mockGlossaryRepo = function () {
            return {
                getDefinition: glossaryGetDefinitionStub.returns(null)
            };
        };
        // force mockGlossaryRepo to use the updated getDefinition()
        animalGenie = animalGenieWithMocks();

        animalGenie.play(event, function (err, responseToApiAi) {
            responseToApiAi.should.equal(apiAiForAnswerForUnknownGlossaryEnquirySpeech);
            done();
        });
    });

    it('should respond properly when definition of the chosenValue in context is unknown', function (done) {
        const contextWithCurrentQuestionFieldAndChosenValue = [new Context('question.field:FIELD', 1), new Context('question.chosenValue:VALUE', 1)];
        const event = createEvent("123", ActionType.ANSWER_QUESTION_GLOSSARY_ENQIRY_OF_THE_CURRENT_QUESTION_VALUE, null, contextWithCurrentQuestionFieldAndChosenValue);
        mockGlossaryRepo = function () {
            return {
                getDefinition: glossaryGetDefinitionStub.returns(null)
            };
        };
        // force mockGlossaryRepo to use the updated getDefinition()
        animalGenie = animalGenieWithMocks();

        animalGenie.play(event, function (err, responseToApiAi) {
            responseToApiAi.should.equal(apiAiForAnswerForUnknownGlossaryEnquirySpeech);
            done();
        });
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