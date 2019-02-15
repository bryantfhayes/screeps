// Helpers
var Utilities = require('Utilities');

// Creep Types
var BasicCreep = require('BasicCreep');
var MinerCreep = require('MinerCreep');

function CreepFactory(roomManager) {
	this.roomManager = roomManager;
} 

CreepFactory.prototype.load = function(creep) {
	var loadedCreep = null;
	var role = creep.memory.role;

	if (role == undefined) {
		creep.suicide();
	}

	switch(role) {
		case 'MinerCreep':
			loadedCreep = new MinerCreep(creep, this.roomManager);
			break;
	}

	if(!loadedCreep) {
		return false;
	}

	Utilities.extend(loadedCreep, BasicCreep);
	loadedCreep.init();

	return loadedCreep;
}

CreepFactory.prototype.new = function(type, spawn) {
	var parts = [];
	var level = 1;
	
	// PRICES
	// ------------------
	// TOUGH          10
	// MOVE           50
	// CARRY          50
	// ATTACK         80
	// WORK           100
	// RANGED_ATTACK  150
	// HEAL           200

	switch(type) {
		case 'MinerCreep':
			if(level <= 1) {
				parts = [CARRY, MOVE, WORK];
			} else
			if(level <= 2) {
				parts = [CARRY, MOVE, WORK, WORK, WORK, WORK];
			} else
			if(level <= 3) {
				parts = [CARRY, MOVE, WORK, WORK, WORK, WORK, WORK, WORK];
			} else
			if(level <= 4) {
				parts = [CARRY, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY];
			}
		break;	
	}

	var canBuild = spawn.canCreateCreep(
		parts,
		undefined,
		{
			role: type
		}
	);
	if(canBuild !== OK) {
		console.log("Spawner can't build that right now")
		return false;
	}

	console.log('Spawn LV ' + level + ' ' + type);
	spawn.createCreep(parts, undefined, {role: type});
}

module.exports = CreepFactory;