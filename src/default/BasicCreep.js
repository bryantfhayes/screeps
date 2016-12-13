var Utilities = require('Utilities');

var BasicCreep = {};

BasicCreep.remember = function(key, value) {
    if (value == undefined) {
    	return Utilities._load(key, this.creep.memory);
    }
    Utilities._save(key, value, this.creep.memory);
};

module.exports = BasicCreep;