var Utilities = require('Utilities');

var BasicCreep = {};

BasicCreep.save = function(key, value) {
    Utilities._save(key, value, this.creep.memory);
};

BasicCreep.load = function(key) {
	return Utilities._load(key, this.creep.memory);
}

module.exports = BasicCreep;