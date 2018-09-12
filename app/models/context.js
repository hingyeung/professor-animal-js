"use strict";

function Context(name, lifespan) {
    this.name = name;
    this.lifespan = lifespan;
    this.parameters = {};
}

module.exports = Context;