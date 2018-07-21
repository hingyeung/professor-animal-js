const should = require('chai').should(),
    sinon = require('sinon'),
    sinonPromise = require('sinon-promise'),
    proxyquire = require('proxyquire').noPreserveCache();

let index, mockAnimalGenie, mockAnimalRepo, mockEvent, mockLoadAnimals, mockPlay, fullAnimalList;

describe('index', function () {
    beforeEach(() => {
        sinonPromise(sinon);

        fullAnimalList = [];
        mockLoadAnimals = sinon.promise().resolves(fullAnimalList);
        mockPlay = sinon.spy(function(event, callback) {
            callback();
        });

        mockAnimalGenie = sinon.spy(function (fullAnimalData) {
            return {
                play: mockPlay
            };
        });
        mockAnimalRepo = function () {
            return {
                loadAnimals: mockLoadAnimals
            };
        };
        mockEvent = {
            result: {
                action: '',
                contexts: '',
                parameters: ''
            }
        };

        index = proxyquire('./index', {
            './animal_genie': mockAnimalGenie,
            './services/animal_repo': mockAnimalRepo
        });
    });

    it('should read all animals definition"', function () {
        index.myHandler(mockEvent);
        mockLoadAnimals.calledOnce.should.equal(true);
    });

    it('should call instantiate AnimalGenie to play', function(done) {
        index.myHandler(mockEvent, {}, function() {
            mockAnimalGenie.calledOnce.should.equal(true);
            mockPlay.calledOnce.should.equal(true);
            done();
        });
    });
});