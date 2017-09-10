'use strict';

const proxyquire = require('proxyquire').noCallThru(),
    should = require('chai').should(),
    sinon = require('sinon');

describe('index.js', function () {
    let index, allAnimalsSpy;

    beforeEach(function () {
        allAnimalsSpy = sinon.spy();
        const mockAnimalRepo = function () {
                return {allAnimals: allAnimalsSpy};
            },
            mockDbService = {};

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
});