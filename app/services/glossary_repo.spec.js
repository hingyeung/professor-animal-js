'use strict';

const should = require('chai').should(),
    GlossaryRepo = require('./glossary_repo');

let glossaryRepo;

describe('GlossaryRepo', function () {
    before(function () {
        glossaryRepo = new GlossaryRepo('app/data/test-glossary.json');
    });

    ['A', 'B', 'C'].forEach(function (term) {
        it(`should return glossary definition for ${term}`, function () {
            glossaryRepo.getDefinition(term).should.equal(`definition for ${term}`);
        });
    });

    it('should return null for unknown term', function() {
        should.not.exist(glossaryRepo.getDefinition('unknown'));
    });
});