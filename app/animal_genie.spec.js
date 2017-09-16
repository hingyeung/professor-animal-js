'use strict';

const proxyquire = require('proxyquire').noCallThru(),
    should = require('chai').should(),
    UserSession = require('./models/UserSession'),
    sinonPromise = require('sinon-promise'),
    Question = require('./models/question'),
    fs = require('fs'),
    sinon = require('sinon');

describe('AnimalGenie', function () {
    let mockAnimalRepo, mockDbService, getSessionStub, AnimalGenie, animalGenie, nextQuestionStub, mockResponseToApiAi,
        fullAnimalListFromFile, listOfAnimalsRestoredFromSession, convertAnimalNameListToAnimalListStub,
        allAnimalsStub, saveSessionSpy, convertAnimalListToAnimalNameListStub, mockQuestionSelector, nextQuestion,
        userSession, filterStub, mockAnimalFilter;

    beforeEach(function () {
        sinonPromise(sinon);
        userSession = new UserSession("123", ["Lion", "Eagle"]);
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
        saveSessionSpy = sinon.spy();
        nextQuestion = new Question("types", ["A", "B"], "A");
        nextQuestionStub = sinon.stub().returns(nextQuestion);
        filterStub = sinon.stub().returns(listOfAnimalsRestoredFromSession);

        mockDbService = function () {
            return {
                saveSession: saveSessionSpy,
                getSession: getSessionStub
            };
        };
        allAnimalsStub = sinon.stub();
        convertAnimalListToAnimalNameListStub = sinon.stub().returns(['name1', 'name2']);
        convertAnimalNameListToAnimalListStub = sinon.stub().returns(listOfAnimalsRestoredFromSession);
        mockAnimalRepo = function () {
            return {
                allAnimals: allAnimalsStub.returns(fullAnimalListFromFile),
                convertAnimalListToAnimalNameList: convertAnimalListToAnimalNameListStub,
                convertAnimalNameListToAnimalList: convertAnimalNameListToAnimalListStub
            };
        };
        mockQuestionSelector = {
            nextQuestion: nextQuestionStub
        };
        mockResponseToApiAi = {
            fromQuestion: sinon.spy()
        };
        mockAnimalFilter = {
            filter: filterStub
        };

        AnimalGenie = proxyquire('./animal_genie', {
            './services/animal_repo': mockAnimalRepo,
            './services/DbService': mockDbService,
            './services/question_selector': mockQuestionSelector,
            './models/response_to_api_ai': mockResponseToApiAi,
            './services/animal_filter': mockAnimalFilter
        });
        animalGenie = new AnimalGenie();
    });

    it('should read all animals from data file when Api.ai action is "startgame"', function () {
        let event = createEvent("123", "startgame", "yes");
        animalGenie.play(event);
        allAnimalsStub.called.should.equal(true);
    });

    it('should not read all animals from data file Api.ai action is "answer_question', function () {
        let event = createEvent("123", "answer_question", "yes");
        animalGenie.play(event);
        allAnimalsStub.called.should.equal(false);
    });

    it('should create new session in DB when Api.ai action is "startgame"', function () {
        let event = createEvent("123", "startgame", "yes");
        animalGenie.play(event);
        saveSessionSpy.calledOnce.should.equal(true);
        saveSessionSpy.calledWith(new UserSession("123",
            ["name1", "name2"])).should.equal(true);
        getSessionStub.called.should.equal(false);
    });

    it('should get next question with QuestionSelector with full animal list from file when Api.ai action is "startgame"', function () {
        let event = createEvent("123", "startgame", "yes");
        animalGenie.play(event);
        nextQuestionStub.calledOnce.should.equal(true);
        nextQuestionStub.calledWith(fullAnimalListFromFile).should.equal(true);
    });

    it('should load existing session in DB when Api.ai action is "answer_question"', function () {
        let event = createEvent("123", "answer_question", "yes");
        animalGenie.play(event);
        getSessionStub.calledOnce.should.equal(true);
        getSessionStub.calledWith("123").should.equal(true);
        saveSessionSpy.called.should.equal(false);
    });

    it('should get next question with QuestionSelector with animal list restored from session when Api.ai action is "answer_question"', function () {
        let event = createEvent("123", "answer_question", "yes");
        animalGenie.play(event);
        nextQuestionStub.calledOnce.should.equal(true);
        nextQuestionStub.calledWith(listOfAnimalsRestoredFromSession).should.equal(true);
    });

    it('should convert next question to Api.ai resposne', function () {
        let event = createEvent("123", "answer_question", "yes");
        animalGenie.play(event);
        mockResponseToApiAi.fromQuestion.calledWith(nextQuestion, [{name: "ingame", lifespan: 1}]).should.equal(true);
    });

    it('should use AnimalFilter to filter out unmatched animal when user answer is "yes"', function () {
        let event = createEvent("123", "answer_question", "yes");
        animalGenie.play(event);
        filterStub.calledWith(listOfAnimalsRestoredFromSession, true, userSession.field, userSession.chosenValue).should.equal(true);
    });

    it('should use AnimalFilter to filter out unmatched animal when user answer is "no"', function () {
        let event = createEvent("123", "answer_question", "no");
        animalGenie.play(event);
        filterStub.calledWith(listOfAnimalsRestoredFromSession, false, userSession.field, userSession.chosenValue).should.equal(true);
    });
});

function createEvent(sessionId, action, answer) {
    return {
        sessionId: sessionId,
        result: {
            action: action
        },
        parameters: {
            answer: answer
        }
    };
}