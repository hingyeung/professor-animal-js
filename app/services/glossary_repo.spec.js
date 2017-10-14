'use strict';

const should = require('chai').should(),
    GlossaryRepo = require('./glossary_repo');

let glossaryRepo;

describe('GlossaryRepo', function () {
    before(function () {
        glossaryRepo = new GlossaryRepo('app/data/test-glossary.json');
    });

    [
        {term: 'aAA', expectedTerm: 'AAA'},
        {term: 'BbB', expectedTerm: 'BBB'},
        {term: 'CCc', expectedTerm: 'CCC'}
    ].forEach(function (using) {
        it(`should return glossary definition for ${using.term} in mixed case`, function () {
            glossaryRepo.getDefinition(using.term).should.equal(`definition for ${using.expectedTerm}.`);
        });
    });

    it('should return null for unknown term', function () {
        should.not.exist(glossaryRepo.getDefinition('unknown'));
    });
});