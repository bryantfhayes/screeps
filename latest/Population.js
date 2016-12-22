function Population(roomManager) {
	this.roomManager = roomManager
	this.room = roomManager.room;
	this.population = 0;
	this.creeps = [];
	this.populationLevelMultiplier = 8;

	this.typeDistribution = {
		MinerCreep: {
			total: 0,
			currentPercentage: 0,
			max: this.room.find(FIND_SOURCES).length, //+ this.room.find(FIND_STRUCTURES, {filter:(structure)=>{return(structure.structureType == STRUCTURE_EXTRACTOR)}}).length,
			minExtensions: 0
		},
		TransportCreep: {
			total: 0,
			currentPercentage: 0,
			max: 4,
			minExtensions: 0
		},
		UpgraderCreep: {
			total: 0,
			currentPercentage: 0,
			max: 1,
			minExtensions: 0
		},
		MaintenanceCreep: {
			total: 0,
			currentPercentage: 0,
			max: 0,
			minExtensions: 0
		}, 
		BuilderCreep: {
			total: 0,
			currentPercentage: 0,
			max: 0,
			minExtensions: 0
		},
		SoldierCreep: {
			total: 0,
			currentPercentage: 0,
			max: 0,
			minExtensions: 0
		},
		RemoteMinerCreep: {
			total: 0,
			currentPercentage: 0,
			max: 2,
			minExtensions: 0
		}
	};
};

Population.prototype.goalsMet = function() {
	for(var n in this.typeDistribution) {
		var type = this.typeDistribution[n];
		if(type.total >= type.max){
			return false;
		}
	}

	return true;
};

Population.prototype.getType = function(type) {
	return this.typeDistribution[type];
};

Population.prototype.getTypes = function() {
	var types = [];
	for(var n in this.typeDistribution) {
		types.push(n);
	}
	return types;
};

Population.prototype.getTotalPopulation = function() {
	return this.roomManager.creeps.length;
};

Population.prototype.getMaxPopulation = function() {
	var population = 0;
	for(var n in this.typeDistribution) {
		population += this.typeDistribution[n].max;
	}
	return population;
};

Population.prototype.updatePopulation = function() {
	try{
		for(var n in this.roomManager.creeps) {
			var creepType = this.roomManager.creeps[n].creep.memory.role;
			this.typeDistribution[creepType].total++;
		}

		for(var name in this.typeDistribution) {
			var curr = this.typeDistribution[name];
			this.typeDistribution[name].currentPercentage = curr.total / this.getMaxPopulation();
		}
	} catch(err) {
		console.log("LINE #58 in Population.js: " + err);
	}
}

module.exports = Population;

// Private

// function createTypeDistribution(type) {
// 	return {
// 		total: 0,
// 		goalPercentage: 0.1,
// 		currentPercentage: 0,
// 		max: 5
// 	};
// };