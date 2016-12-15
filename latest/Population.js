function Population(room) {
	this.room = room;
	this.population = 0;
	this.creeps = [];
	this.populationLevelMultiplier = 8;

	this.typeDistribution = {
		SpawnMaintenanceCreep: {
			total: 0,
			currentPercentage: 0,
			max: 0,
			minExtensions: 0
		},
		MinerCreep: {
			total: 0,
			currentPercentage: 0,
			max: this.room.find(FIND_SOURCES).length,
			minExtensions: 0
		},
		TransportCreep: {
			total: 0,
			currentPercentage: 0,
			max: 4,
			minExtensions: 0
		},
		ContainerMaintenanceCreep: {
			total: 0,
			currentPercentage: 0,
			max: 0,
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
			max: 1,
			minExtensions: 0
		}, 
		BuilderCreep: {
			total: 0,
			currentPercentage: 0,
			max: 2,
			minExtensions: 0
		},
		SoldierCreep: {
			total: 0,
			currentPercentage: 0,
			max: 0,
			minExtensions: 0
		},
		TowerMasterCreep: {
			total: 0,
			currentPercentage: 0,
			max: 0,
			minExtensions: 0
		}
	};

	try{
		this.creeps = this.room.find(FIND_MY_CREEPS, {
			filter: (creep) => {
				return (creep.memory.srcRoom == this.room.name);
			}
		});
		for(var i = 0; i < this.creeps.length; i++) {
			var creepType = this.creeps[i].memory.role;
			this.typeDistribution[creepType].total++;
		}

		for(var name in this.typeDistribution) {
			var curr = this.typeDistribution[name];
			this.typeDistribution[name].currentPercentage = curr.total / this.getMaxPopulation();
		}
	} catch(err) {
		console.log("LINE #58 in Population.js: " + err);
	}
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
	return this.creeps.length;
};

Population.prototype.getMaxPopulation = function() {
	var population = 0;
	for(var n in this.typeDistribution) {
		population += this.typeDistribution[n].max;
	}
	return population;
};

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