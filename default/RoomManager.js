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
	if (this.remember('roadsBuilt') != true) {
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
		
		this.remember('roadsBuilt', true);
	}
}

RoomManager.prototype.remember = function(key, value) {
	if (Memory.Rooms == undefined) {
		Memory.Rooms = {};
	}

	if (Memory.Rooms[this.room.name] == undefined) {
		Memory.Rooms[this.room.name] = {};
	}

    if (value == undefined) {
        return Memory.Rooms[this.room.name][key];
    }
    Memory.Rooms[this.room.name][key] = value;
};

RoomManager.prototype.forget = function(key) {
    delete this.creep.memory[key];
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
	//var creeps = Utilities.load(["Rooms", this.room.name, "creeps"].join('.'))
	//var creeps = this.room.find(FIND_MY_CREEPS);
	var creeps = Game.creeps;
	for(var n in creeps) {
		var c = this.creepFactory.load(creeps[n]);
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

module.exports = RoomManager;