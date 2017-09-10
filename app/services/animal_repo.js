'use strict';

const fs = require('fs');

function AnimalRepo(datafile) {
    this.datafile = !datafile ? 'data/animals.json' : datafile;
}

AnimalRepo.prototype.allAnimals = function() {
    return JSON.parse(fs.readFileSync(this.datafile));
};

module.exports = AnimalRepo;
