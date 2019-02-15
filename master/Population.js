function Population(room, level) {
	this.room = room;
	this.level = level;
	this.population = 0;

	this.creepDistribution = {
		0: {
			MinerCreep: {
				name: "MinerCreep",
				total: 6,
				level: 1,
				priority: 100
			}
		}
	};

	this.creeps = this.room.find(FIND_MY_CREEPS);
};

Population.prototype.getCreepDistribution = function() {
	return this.creepDistribution[this.level]
};

Population.prototype.getTotalPopulation = function() {
	return this.creeps.length;
};

module.exports = Population;