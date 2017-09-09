'use strict';

const expect = require('chai').expect,
    sinon = require('sinon'),
    proxyquire = require('proxyquire');

let mockAws, DbService, getSpy, putSpy;

describe('DBService', function () {
    before(function () {
        getSpy = sinon.spy();
        putSpy = sinon.spy();
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
        dbService.saveSession({id: "sessionId"}, null);
        expect(putSpy.called).to.equal(true);
        done();
    });

    it('getSession should called get() in dynamodb driver', function (done) {
        let dbService = new DbService();
        dbService.getSession("sessionId", null);
        expect(getSpy.called).to.equal(true);
        done();
    });
});