'use strict';

const expect = require('chai').expect,
    sinon = require('sinon'),
    UserSession = require('../models/UserSession'),
    proxyquire = require('proxyquire');

const SECONDS_IN_A_DAY = 24 * 60 * 60,
    MILLISECONS_IN_SECOND = 1000,
    FAKE_TIME = 10000;

let mockAws, DbService, getSpy, putSpy, clock;

describe('DBService', function () {
    beforeEach(function () {
        // call arg[1] as callback function with arguments (null, {id:"123"}). e.g. get("id", callback).
        getSpy = sinon.stub().callsArgWith(1, null, {Item: {id: "123"}});
        putSpy = sinon.stub().callsArgWith(1, null, {Item: {id: "123"}});
        mockAws = {
            config: {
                loadFromPath: function (configFile) {
                }
            },
            DynamoDB: {
                DocumentClient: function (config) {
                    return {
                        get: getSpy,
                        put: putSpy
                    };
                }
            }
        };

        DbService = proxyquire('./DbService', {'aws-sdk': mockAws});
        // fake the time to Epoch time
        clock = sinon.useFakeTimers(FAKE_TIME);
    });

    after(function () {
        clock.restore();
    });

    it('saveSession should called put() in dynamodb driver', function (done) {
        let dbService = new DbService(),
            session = new UserSession("id", ["A", "B"]);

        // session.creationTime = new Date();
        dbService.saveSession(session).then(function () {
            expect(putSpy.calledOnce).to.equal(true);
            done();
        });
    });

    it('saveSession should set creationTime when it is not already set', function (done) {
        let dbService = new DbService(),
            session = new UserSession("id", ["A", "B"]);

        dbService.saveSession(session).then(function () {
            expect(putSpy.calledWith(sinon.match(function (dataToSave) {
                return dataToSave.Item.creationTime === FAKE_TIME / MILLISECONS_IN_SECOND &&
                    dataToSave.Item.lastUpdatedTime === FAKE_TIME / MILLISECONS_IN_SECOND &&
                    dataToSave.Item.expirationTime === FAKE_TIME / MILLISECONS_IN_SECOND + SECONDS_IN_A_DAY;
            }))).to.equal(true);
            done();
        });
    });

    it('saveSession should set creationTime when it is already set', function (done) {
        let dbService = new DbService(),
            session = new UserSession("id", ["A", "B"]);

        session.creationTime = 0;
        dbService.saveSession(session).then(function () {
            expect(putSpy.calledWith(sinon.match(function (dataToSave) {
                return dataToSave.Item.creationTime === 0 &&
                    dataToSave.Item.lastUpdatedTime === FAKE_TIME / MILLISECONS_IN_SECOND &&
                    dataToSave.Item.expirationTime === FAKE_TIME / MILLISECONS_IN_SECOND + SECONDS_IN_A_DAY;
            }))).to.equal(true);
            done();
        });
    });

    it('getSession should called get() in dynamodb driver', function (done) {
        let dbService = new DbService();
        dbService.getSession("sessionId", null).then(function () {
            expect(getSpy.called).to.equal(true);
            done();
        });
    });
});