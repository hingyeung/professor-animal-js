'use strict';

const proxyquire = require('proxyquire').noCallThru(),
    should = require('chai').should(),
    UserSession = require('./models/UserSession'),
    sinonPromise = require('sinon-promise'),
    fs = require('fs'),
    sinon = require('sinon');

describe('AnimalGenie', function () {
    let mockAnimalRepo, mockDbService, getSessionStub, AnimalGenie, animalGenie, nextQuestionSpy, mockResponseToApiAi,
        fullAnimalListFromFile, listOfAnimalsRestoredFromSession, convertAnimalNameListToAnimalListStub,
        allAnimalsStub, saveSessionSpy, convertAnimalListToAnimalNameListStub, mockQuestionSelector;

    beforeEach(function () {
        sinonPromise(sinon);
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
        getSessionStub = sinon.promise().resolves(new UserSession("123", ["Lion", "Eagle"]));
        saveSessionSpy = sinon.spy();
        nextQuestionSpy = sinon.spy();
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
            nextQuestion: nextQuestionSpy
        };
        mockResponseToApiAi = {
            fromQuestion: sinon.spy()
        };

        AnimalGenie = proxyquire('./animal_genie', {
            './services/animal_repo': mockAnimalRepo,
            './services/DbService': mockDbService,
            './services/question_selector': mockQuestionSelector,
            './models/response_to_api_ai': mockResponseToApiAi
        });
        animalGenie = new AnimalGenie();
    });

    it('should read all animals from data file when Api.ai action is "startgame"', function () {
        let event = {sessionId: "123", result: {action: "startgame"}};
        animalGenie.play(event);
        allAnimalsStub.called.should.equal(true);
    });

    it('should not read all animals from data file Api.ai action is not "startgame"', function () {
        let event = {sessionId: "123", result: {action: ''}};
        animalGenie.play(event);
        allAnimalsStub.called.should.equal(false);
    });

    it('should create new session in DB when Api.ai action is "startgame"', function () {
        let event = {sessionId: "123", result: {action: "startgame"}};
        animalGenie.play(event);
        saveSessionSpy.calledOnce.should.equal(true);
        saveSessionSpy.calledWith(new UserSession("123",
            ["name1", "name2"])).should.equal(true);
        getSessionStub.called.should.equal(false);
    });

    it('should get next question with QuestionSelector with full animal list from file when Api.ai action is not "startgame"', function () {
        let event = {sessionId: "123", result: {action: "startgame"}};
        animalGenie.play(event);
        nextQuestionSpy.calledOnce.should.equal(true);
        nextQuestionSpy.calledWith(fullAnimalListFromFile).should.equal(true);
    });

    it('should load existing session in DB when Api.ai action is not "startgame"', function () {
        let event = {sessionId: "123", result: {action: ''}};
        animalGenie.play(event);
        getSessionStub.calledOnce.should.equal(true);
        getSessionStub.calledWith("123").should.equal(true);
        saveSessionSpy.called.should.equal(false);
    });

    it('should get next question with QuestionSelector with animal list restored from session when Api.ai action is not "startgame"', function () {
        let event = {sessionId: "123", result: {action: ''}};
        animalGenie.play(event);
        nextQuestionSpy.calledOnce.should.equal(true);
        nextQuestionSpy.calledWith(listOfAnimalsRestoredFromSession).should.equal(true);
    });

    it('should convert next question to Api.ai resposne', function () {
        let event = {sessionId: "123", result: {action: ''}};
        animalGenie.play(event);
        mockResponseToApiAi.fromQuestion.called.should.equal(true);
    });
});