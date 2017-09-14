'use strict';

const expect = require('chai').expect,
    sinon = require('sinon'),
    UserSession = require('../models/UserSession'),
    proxyquire = require('proxyquire');

let mockAws, DbService, getSpy, putSpy;

describe('DBService', function () {
    before(function () {
        // call arg[1] as callback function with arguments (null, {id:"123"}). e.g. get("id", callback).
        getSpy = sinon.stub().callsArgWith(1, null, {id:"123"});
        putSpy = sinon.stub().callsArgWith(1, null, {id: "123"});
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
    });

    it('saveSession should called put() in dynamodb driver', function (done) {
        let dbService = new DbService();
        // dbService.saveSession({id: "sessionId"}, null);
        // expect(putSpy.called).to.equal(true);
        // done();
        dbService.saveSession(new UserSession("id", ["A", "B"])).then(function() {
            expect(putSpy.calledOnce).to.equal(true);
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