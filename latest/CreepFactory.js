// Helpers
var Utilities = require('Utilities');

// Creep classes
var BuilderCreep = require('BuilderCreep');
var TransportCreep = require('TransportCreep');
var UpgraderCreep = require('UpgraderCreep');
var MaintenanceCreep = require('MaintenanceCreep');
var SoldierCreep = require('SoldierCreep');
var MinerCreep = require('MinerCreep');
var TowerMasterCreep = require('TowerMasterCreep');
var SpawnMaintenanceCreep = require('SpawnMaintenanceCreep');
var ContainerMaintenanceCreep = require('ContainerMaintenanceCreep');

var BasicCreep = require('BasicCreep');

function CreepFactory(roomManager) {
	this.roomManager = roomManager;
} 

CreepFactory.prototype.load = function(creep) {
	var loadedCreep = null;
	var role = creep.memory.role;

	if (role == undefined) {
		//creep.suicide();
	}

	switch(role) {
		case 'BuilderCreep':
			loadedCreep = new BuilderCreep(creep, this.roomManager);
			break;
		case 'TransportCreep':
			loadedCreep = new TransportCreep(creep, this.roomManager);
			break;
		case 'UpgraderCreep':
			loadedCreep = new UpgraderCreep(creep, this.roomManager);
			break;
		case 'MaintenanceCreep':
			loadedCreep = new MaintenanceCreep(creep, this.roomManager);
			break;
		case 'SoldierCreep':
			loadedCreep = new SoldierCreep(creep, this.roomManager);
			break;
		case 'MinerCreep':
			loadedCreep = new MinerCreep(creep, this.roomManager);
			break;
		case 'TowerMasterCreep':
			loadedCreep = new TowerMasterCreep(creep, this.roomManager);
			break;
		case 'SpawnMaintenanceCreep':
			loadedCreep = new SpawnMaintenanceCreep(creep, this.roomManager);
			break;
		case 'ContainerMaintenanceCreep':
			loadedCreep = new ContainerMaintenanceCreep(creep, this.roomManager);
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
	if (this.roomManager.population.getTotalPopulation() >= this.roomManager.population.getMaxPopulation() * 0.75) {
		level = 4;
	} else if (this.roomManager.population.getTotalPopulation() >= this.roomManager.population.getMaxPopulation() * 0.5) {
		level = 3;
	}
	

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
		
		case 'UpgraderCreep':
			if(level <= 1) {
				parts = [WORK, CARRY, MOVE];
			} else
			if(level <= 2) {
				parts = [WORK, WORK, CARRY, MOVE];
			} else
			if(level <= 3) {
				parts = [WORK, WORK, WORK, CARRY, MOVE];
			} else
			if(level <= 4) {
				parts = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE];
			}
		break;
		case 'TransportCreep':
		case 'SpawnMaintenanceCreep':
		case 'ContainerMaintenanceCreep':
		case 'TowerMasterCreep':
			if(level <= 1) {
				parts = [MOVE, CARRY];
			} else
			if(level <= 2) {
				parts = [MOVE, CARRY, MOVE, CARRY];
			} else
			if(level <= 3) {
				parts = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY];
			} else
			if(level <= 4) {
				parts = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
			}
		break;
		case 'MaintenanceCreep':
		case 'BuilderCreep':
			if(level <= 1) {
				parts = [WORK, CARRY, MOVE];
			} else
			if(level <= 2) {
				parts = [WORK, CARRY, CARRY, MOVE];
			} else
			if(level <= 3) {
				parts = [WORK, WORK, CARRY, MOVE, MOVE];
			} else
			if(level <= 4) {
				parts = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
			}
		break;
		case 'SoldierCreep':
			if(level <= 1) {
				parts = [ATTACK, MOVE];
			} else
			if(level <= 2) {
				parts = [ATTACK, MOVE];
			} else
			if(level <= 3) {
				parts = [ATTACK, TOUGH, MOVE, MOVE];
			} else 
			if(level <= 4) {
			    //parts = [ATTACK, MOVE];
				parts = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
			}
		break;
		case 'MinerCreep':
			if(level <= 1) {
				parts = [CARRY, MOVE, WORK];
			} else
			if(level <= 2) {
				parts = [CARRY, MOVE, WORK, WORK];
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
		return;
	}

	console.log('Spawn LV ' + level + ' ' + type);
	spawn.createCreep(parts, undefined, {role: type, srcRoom: this.roomManager.room.name});
}

module.exports = CreepFactory;