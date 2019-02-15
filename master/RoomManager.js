var Population = require('Population')
var JobBoard = require('JobBoard')
var CreepFactory = require('CreepFactory');
var Utilities = require('Utilities');

function RoomManager(room, gameManager) {
	this.room = room;
	this.gameManager = gameManager;
	this.creeps = [];
	this.structure = [];
	this.level = 0

	this.jobBoard = undefined
	this.population = undefined
	this.creepFactory = undefined

	// Set spawn for room
	for (var n in Game.spawns) {
		if (Game.spawns[n].room == this.room) {
			this.spawn = Game.spawns[n];
		}
	}

	// Initialize everything in this room using memory
	this.init();

	// Start figuring out what jobs need to get done.
	this.planCreepProduction()
	this.planHarvestResources()
	this.planRoads()

	// Start assigning jobs to all the important things in the room
	this.processSpawn()
	this.processSources()
	this.processCreeps()
	this.processRoads()
};

RoomManager.prototype.processRoads = function() {
	job = this.jobBoard.getAvailableJobOfType(this.jobBoard.jobTypes.BUILD_ROAD);
	if (job != undefined) {
		this.jobBoard.startJobByHash(job.hash)
		var path = PathFinder.search(job.args.pos1, job.args.pos2);
		for (var j = 0; j < path.path.length; j++) {
			this.room.createConstructionSite(path.path[j].x, path.path[j].y, STRUCTURE_ROAD);
		}

		// Road construction jobs are never deleted, so that way they won't attempt to re-build them again
	}
}

RoomManager.prototype.planRoads = function() {
	// Need to add a job for making a road to all major structures
	var structures = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (true);
            }
    });

	// Also build roads between SOURCES and CONTROLLER
    var sources = this.room.find(FIND_SOURCES);
	var targets = structures.concat(sources);

    for (var i in targets) {
    	for (var j in targets) {
    		if (i == j) {
    			continue;
    		}
    		this.jobBoard.addJob(this.jobBoard.jobTypes.BUILD_ROAD, 5, {pos1: targets[i].pos, pos2: targets[j].pos})
    	}
    }
};

RoomManager.prototype.processSources = function() {
	// To complete this job, a miner needs to be found and subscribed to
	// the specified source
	job = this.jobBoard.getAvailableJobOfType(this.jobBoard.jobTypes.HARVEST_REQUEST);
	if (job != undefined) {
		availableCreeps = this.room.find(FIND_MY_CREEPS, {
			filter: (creep) => {
				// Find free miners who aren't subscribed to any other source
				return ((creep.memory.role == "MinerCreep") && (creep.subscriptionsCount() == 0))
			}
		});

		if (availableCreeps.length > 0) {
			source = Game.getObjectById(job.args.sourceId);
			availableCreeps[0].subscribe(source);
			this.jobBoard.removeJobByHash(job.hash)
		}
	}
};

RoomManager.prototype.planHarvestResources = function() {
	// Iterate of each available resource
	resources = this.room.find(FIND_SOURCES)
	for (var n in resources) {
		resource = resources[n]
		subscribers = resource.subscribersOfType("MinerCreep")
		if (subscribers < 3) {
			this.jobBoard.addJob(this.jobBoard.jobTypes.HARVEST_REQUEST, 80, {sourceId: resource.id})
		}
	}
};

RoomManager.prototype.planCreepProduction = function() {
	distribution = this.population.getCreepDistribution(this.level)
	for (var type in distribution) {
		// For each type of creep, see if we need to make a new job
		count = Utilities.getCreepsOfType(this.room, type)
		creepInfo = distribution[type]
		if (count.length < creepInfo.total) {
			// Make a job request
			this.jobBoard.addJob(this.jobBoard.jobTypes.BUILD_CREEP, creepInfo.priority, {type: creepInfo.name, level: creepInfo.level})
		}
	}
}

RoomManager.prototype.processCreeps = function() {
	for (var n in this.creeps) {
		this.creeps[n].doAction()
	}
}

RoomManager.prototype.processSpawn = function() {
	// Check if this spawn has a job already
	job = this.jobBoard.getJobForAssignee(this.spawn.id)
	if (job) {
		if (job.started !== false) {
			// Job is already started, check to see if it is done
			if (this.spawn.spawning != null) {
				// We are working on it now. So just wait.
			} else {
				// Spawning must be done, mark the job as done.
				this.jobBoard.removeJobByHash(job.hash)
			}
		} else {
			// Start the assigned job
			status = this.creepFactory.new(job.args.type, this.spawn)
			if (status) {
				this.jobBoard.startJobByHash(job.hash)
			}
		}
	} else {
		// Otherwise, we don't even have a job yet, so lets 
		// call dibs on one.
		job = this.jobBoard.getAvailableJobOfType(this.jobBoard.jobTypes.BUILD_CREEP);
		if (job != undefined) {
			// Sign up for this task
			this.jobBoard.assignJobByHash(job.hash, this.spawn.id)
		}
	}
}

RoomManager.prototype.init = function() {
	// Get the level of the room
	this.level = this.getRoomLevel()

	// A few things are changed based on the current level
	// 1. The number of each type of creep to make
	// 2. The priority of each of these creeps (Make harvester before upgrader, etc.)
	this.population = new Population(this.room, this.level)

	this.jobBoard = new JobBoard(this.room)

	this.creepFactory = new CreepFactory(this);

	this.loadCreeps()
}

/**
 * Gets the level of the current room based on
 * a variety of metrics.
 */
RoomManager.prototype.getRoomLevel = function() {
	return 0;
}

/**
 * Iterates over all existing creeps and assigns them
 * to be the correct type of creep based on memory.
 */
RoomManager.prototype.loadCreeps = function() {
	var creeps = this.room.find(FIND_MY_CREEPS);
	for(var n in creeps) {
		var c = this.creepFactory.load(creeps[n]);
		if(c) {
			this.creeps.push(c);
		}
	}
};

module.exports = RoomManager;