var CreepFactory = require('CreepFactory');
var Population = require('Population');
var Utilities = require('Utilities');
var Tower = require('Tower');

function RoomManager(room, gameManager) {
	this.room = room;
	this.gameManager = gameManager;
	this.creeps = [];
	this.structure = [];

	// Set spawn for room
	for (var n in Game.spawns) {
		if (Game.spawns[n].room == this.room) {
			this.spawn = Game.spawns[n];
		}
	}
	
	this.population = new Population(this.room);
	this.creepFactory = new CreepFactory(this);
	
	// Locate all room towers
	this.towers = [];
	var towerArr = this.room.find(FIND_MY_STRUCTURES, {
    	filter: (structure) => { 
        	return(structure.structureType == STRUCTURE_TOWER);
        }
    });

    for (var n in towerArr) {
    	var tower = new Tower(towerArr[n], this);
    	this.towers.push(tower)
    }

    // Get room storage
    var storages = this.room.find(FIND_MY_STRUCTURES, {
    	filter: (structure) => {
    		return(structure.structureType == STRUCTURE_STORAGE);
    	}
    });
    this.storage = undefined;
    if(storages.length > 0) {
    	this.storage = storages[0];
    }

	this.init();
};

RoomManager.prototype.init = function() {
	if (this.load('roadsBuilt') != true) {
		console.log("build roads!");

		var structures = this.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTROLLER ||
                            structure.structureType == STRUCTURE_TOWER);
                }
        });

        var sources = this.room.find(FIND_SOURCES);

        var targets = structures.concat(sources).concat(this.room.controller);

		for (var i = 0; i < targets.length; i++) {
			var path = this.room.findPath(this.spawn.pos, targets[i].pos);
			for (var j = 0; j < path.length; j++) {
				this.room.createConstructionSite(path[j].x, path[j].y,STRUCTURE_ROAD);
				this.room.createConstructionSite(path[j].x, path[j].y-1,STRUCTURE_ROAD);
				this.room.createConstructionSite(path[j].x, path[j].y+1,STRUCTURE_ROAD);
			}
		}
		
		this.save('roadsBuilt', true);
	}
}

RoomManager.prototype.save = function(key, value) {
	Utilities.save(['Rooms', this.room.name, key].join('.'), value);
};

RoomManager.prototype.load = function(key) {
	return Utilities.load(['Rooms', this.room.name, key].join('.'));
};

RoomManager.prototype.populate = function() {
	for (var n in Game.spawns) {
		var spawn = Game.spawns[n];
		var types = this.population.getTypes();
		for (var i = 0; i < types.length; i++) {
			var ctype = this.population.getType(types[i]);
			if (ctype.total < ctype.max) {
				this.creepFactory.new(types[i], spawn);
				break;
			}
		}
	}
};

RoomManager.prototype.loadCreeps = function() {
	// Find creeps this room controls
	var creeps = Game.creeps;
	// var controlledCreeps = creeps.filter(function(c) {
	// 	return (c.memory.srcRoom == this.room.name);
	// });
	var controlledCreeps = creeps;

	for(var n in controlledCreeps) {
		var c = this.creepFactory.load(controlledCreeps[n]);
		if(c) {
			this.creeps.push(c);
		}
	}
};

RoomManager.prototype.performCreepActions = function() {
	for (var n in this.creeps) {
		this.creeps[n].doAction()
	}
}

RoomManager.prototype.performTowerActions = function() {
	for (var n in this.towers) {
		this.towers[n].doAction()
	}
}

RoomManager.prototype.performLinkActions = function() {
	var fromLinks = this.room.find(FIND_MY_STRUCTURES, {
		filter: (structure) => {
			return (structure.structureType == STRUCTURE_LINK &&
				    structure.subscribersOfType("MinerCreep") > 0);
		}
	});

	var toLinks = this.room.find(FIND_MY_STRUCTURES, {
		filter: (structure) => {
			return (structure.structureType == STRUCTURE_LINK &&
				    structure.subscribersOfType("MinerCreep") < 1);
		}
	});

	if (toLinks == undefined || toLinks.length < 1) {
		console.log("WARNING: no to links!")
		return false
	}

	for (var n in fromLinks) {
		if (fromLinks[n].energy >= fromLinks[n].energyCapacity * 0.25) {
			//console.log("SUCCESS: transfer from " + fromLinks[n].id)
			fromLinks[n].transferEnergy(toLinks[0]);
		}
	}
}

RoomManager.prototype.getPrefferedEnergyPickUp = function(ignore) {
	if (ignore == undefined) {
		ignore = {}
		ignore.storage = false
		ignore.spawn = false
	}
	// FIRST: check for a storage unit
	var storages = this.room.find(FIND_MY_STRUCTURES, {
		filter: (structure) => {
			return (structure.structureType == STRUCTURE_STORAGE &&
				    structure.store[RESOURCE_ENERGY] > 0);
		}
	});
	if ((storages != undefined || storages.length > 0) && (ignore.storage != true)) {
		return storages;
	}

	// SECOND: if no storages, try non-full spawn or extensions
	var spawns_and_extensions = this.room.find(FIND_MY_STRUCTURES, {
		filter: (structure) => {
			return(((structure.structureType == STRUCTURE_SPAWN) ||
				    (structure.structureType == STRUCTURE_EXTENSION)) &&
					(structure.energy > 0));
		}
	});
	if ((spawns_and_extensions != undefined && spawns_and_extensions.length > 0) && (ignore.spawn != true)) {
		return spawns_and_extensions;
	}

	// THIRD: nothing is available
	return undefined;
}

// returns the object that energy should be brought to
// based on structures available in the current room.
RoomManager.prototype.getPrefferedEnergyDropOff = function() {
	// FIRST: check for a storage unit
	var storages = this.room.find(FIND_MY_STRUCTURES, {
		filter: (structures) => {
			return (structures.structureType == STRUCTURE_STORAGE);
		}
	});
	if (storages != undefined || storages.length > 0) {
		return storages;
	}

	// SECOND: if no storages, try non-full spawn or extensions
	var spawns_and_extensions = this.room.find(FIND_MY_STRUCTURES, {
		filter: (structures) => {
			return(((structures.structureType == STRUCTURE_SPAWN) ||
				    (structures.structureType == STRUCTURE_EXTENSION)) &&
					(structures.energy < structures.energyCapacity));
		}
	});
	if (spawns_and_extensions != undefined && spawns_and_extensions.length > 0) {
		return spawns_and_extensions;
	}

	// THIRD: nothing is available
	return undefined;
}

module.exports = RoomManager;