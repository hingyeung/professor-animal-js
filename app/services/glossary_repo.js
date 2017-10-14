'use strict';

const fs = require('fs'),
    _ = require('lodash'),
    path = require('path');

function GlossaryRepo(datafile) {
    this.datafile = !datafile ? path.join(__dirname, '../data/glossary.json') : datafile;
    this.glossariesLoadedFromFile = JSON.parse(fs.readFileSync(this.datafile));
}

GlossaryRepo.prototype.getDefinition = function (term) {
    let matchedGlossary = _.find(this.glossariesLoadedFromFile, { 'term': term });
    return matchedGlossary ? matchedGlossary.definition : null;
};

module.exports = GlossaryRepo;