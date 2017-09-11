'use strict';

const proxyquire = require('proxyquire').noCallThru(),
    should = require('chai').should(),
    UserSession = require('./models/UserSession'),
    sinon = require('sinon');

describe('index.js', function () {
    let index, allAnimalsSpy, mockDbService, saveSessionSpy, convertAnimalListToAnimalNameListStub;

    beforeEach(function () {
        saveSessionSpy = sinon.spy();
        mockDbService = function() {
            return {saveSession: saveSessionSpy};
        };
        allAnimalsSpy = sinon.spy();
        convertAnimalListToAnimalNameListStub = sinon.stub().returns(['name1', 'name2']);
        const mockAnimalRepo = function () {
                return {
                    allAnimals: allAnimalsSpy,
                    convertAnimalListToAnimalNameList: convertAnimalListToAnimalNameListStub
                };
            };

        index = proxyquire('./index', {
            './services/animal_repo': mockAnimalRepo,
            './services/DbService': mockDbService
        });
    });

    it('should read all animals from data file when "ReadyToPlay" is in Api.ai contexts', function () {
        let event = {sessionId: "123", result: {contexts: ["ReadyToPlay"]}};
        index.myHandler(event);
        allAnimalsSpy.called.should.equal(true);
    });

    it('should not read all animals from data file when "ReadyToPlay" is not in Api.ai contexts', function () {
        let event = {sessionId: "123", result: {contexts: []}};
        index.myHandler(event);
        allAnimalsSpy.called.should.equal(false);
    });

    it('should create new session in DB when "ReadyToPlay" is in Api.ai contexts', function() {
        let event = {sessionId: "123", result: {contexts: ["ReadyToPlay"]}};
        index.myHandler(event);
        mockDbService().saveSession.calledOnce.should.equal(true);
        mockDbService().saveSession.calledWith(new UserSession("123",
            ["name1", "name2"])).should.equal(true);
    });
});