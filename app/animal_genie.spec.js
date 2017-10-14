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
    sinon = require('sinon');

describe('AnimalGenie', function () {
    let mockAnimalRepo, mockDbService, getSessionStub, AnimalGenie, animalGenie, nextQuestionStub, mockResponseToApiAi,
        fullAnimalListFromFile, listOfAnimalsRestoredFromSession, convertAnimalNameListToAnimalListStub,
        allAnimalsStub, saveSessionStub, mockQuestionSelector, nextQuestion, apiAiForGiveUpMessage,
        apiAiForRepeatingSpeech, apiAiForAnswerForGlossaryEnquirySpeech, mockGlossaryRepo,
        userSession, filterStub, mockAnimalFilter, callbackSpy, apiAiResponseForFilterBasedQuestion,
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
        allAnimalsStub = sinon.stub();
        convertAnimalNameListToAnimalListStub = sinon.stub().returns(listOfAnimalsRestoredFromSession);
        mockAnimalRepo = function () {
            return {
                allAnimals: allAnimalsStub.returns(fullAnimalListFromFile),
                convertAnimalListToAnimalNameList: (new AnimalRepo()).convertAnimalListToAnimalNameList,
                convertAnimalNameListToAnimalList: convertAnimalNameListToAnimalListStub
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

    it('shouild call callback', function () {
        let event = createEvent("123", "startgame", "yes");
        animalGenie.play(event, callbackSpy);
        callbackSpy.calledWith(null, apiAiResponseForFilterBasedQuestion).should.equal(true);
    });

    it('should read all animals from data file when Api.ai action is "startgame"', function () {
        let event = createEvent("123", "startgame", "yes");
        animalGenie.play(event, callbackSpy);
        allAnimalsStub.called.should.equal(true);
    });

    it('should not read all animals from data file Api.ai action is "answer_question', function () {
        let event = createEvent("123", "answer_question", "yes");
        animalGenie.play(event, callbackSpy);
        allAnimalsStub.called.should.equal(false);
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
        let event = createEvent("123", "answer_question", "yes");
        animalGenie.play(event, callbackSpy);
        getSessionStub.calledOnce.should.equal(true);
        getSessionStub.calledWith("123").should.equal(true);
    });

    it('should save updated session to DB with field-attributeValue to ignore in next round when Api.ai action is "answer_question and user answer is "yes"', function () {
        let event = createEvent("123", "answer_question", "yes");
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
        let event = createEvent("123", "answer_question", "no", 'speech');
        animalGenie.play(event, callbackSpy);
        // the field and chosenValue in the incoming session should not be added to the ignore list when the user answer is "no",
        // which trigger inclusive filter
        saveSessionStub.calledWith(
            new UserSession("123", ["Lion", "Eagle"], "diet", "A", [], 'Does it eat A?')
        ).should.equal(true);
    });

    it('should save updated session when computer is ready to guess the animal', function (done) {
        let event = createEvent("123", "answer_question", "yes");

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
        let event = createEvent("123", "answer_question", "yes");
        animalGenie.play(event, callbackSpy);
        nextQuestionStub.calledOnce.should.equal(true);
        nextQuestionStub.calledWith(listOfAnimalsRestoredFromSession).should.equal(true);
    });

    it('should convert next question to Api.ai resposne', function (done) {
        let event = createEvent("123", "answer_question", "yes");
        animalGenie.play(event, function () {
            mockResponseToApiAi.fromQuestion.calledWith(nextQuestion).should.equal(true);
            done();
        });
    });

    it('should return "ready-to-guess" question, when only one animal left', function (done) {
        let event = createEvent("123", "answer_question", "yes");

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
        let event = createEvent("123", "answer_question", "yes");
        animalGenie.play(event, function () {
            filterStub.calledWith(listOfAnimalsRestoredFromSession, true, "types", userSession.chosenValue).should.be.true;
            done();
        });
    });

    it('should use AnimalFilter to filter out unmatched animal when user answer is "no"', function (done) {
        let event = createEvent("123", "answer_question", "no");
        animalGenie.play(event, function () {
            filterStub.calledWith(listOfAnimalsRestoredFromSession, false, "types", userSession.chosenValue).should.be.true;
            done();
        });
    });

    it('should return give-up api.ai response when it cannot determine the next question to ask and confident guess cannot be made', function (done) {
        let event = createEvent("123", "answer_question", "no");
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
        let firstEvent = createEvent("123", "answer_question", "yes");
        animalGenie.play(firstEvent, function (err, firstResponseToApiAi) {
            let secondEvent = createEvent("123", "answer_question_repeat");
            animalGenie.play(secondEvent, function (err, secondResponseToApiAi) {
                secondResponseToApiAi.should.equal(apiAiForRepeatingSpeech);
                done();
            });
        });
    });

    it('should explain definition of a word in glossary during game', function (done) {
        let event = createEvent("123", "answer_question_glossary_enquiry");
        animalGenie.play(event, function (err, responseToApiAi) {
            responseToApiAi.should.equal(apiAiForAnswerForGlossaryEnquirySpeech);
            done();
        });
    });

    it('should response properly when definition of a word is unknown during game', function (done) {
        let event = createEvent("123", "answer_question_glossary_enquiry");
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
            './services/question_selector': mockQuestionSelector,
            './models/response_to_api_ai': mockResponseToApiAi,
            './services/animal_filter': mockAnimalFilter,
            './services/glossary_repo': mockGlossaryRepo
        }))();
    }

    function createEvent(sessionId, action, answer) {
        return {
            sessionId: sessionId,
            result: {
                contexts: [],
                action: action,
                parameters: {
                    answer: answer
                }
            }
        };
    }
});