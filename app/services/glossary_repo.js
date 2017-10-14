'use strict';

const fs = require('fs'),
    _ = require('lodash'),
    path = require('path');

function GlossaryRepo(datafile) {
    this.datafile = !datafile ? path.join(__dirname, '../data/glossary.json') : datafile;
    this.glossariesLoadedFromFile = JSON.parse(fs.readFileSync(this.datafile));
}

GlossaryRepo.prototype.getDefinition = function (term) {
    if (!term) {
        return null;
    }

    let matchedGlossary = _.find(this.glossariesLoadedFromFile, function(thisGlossaryItem) {
        return thisGlossaryItem.term.toLowerCase() === term.toLowerCase();
    });
    return matchedGlossary ? matchedGlossary.definition : null;
};

module.exports = GlossaryRepo;