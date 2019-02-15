var Population = require('Population')
var JobBoard = require('JobBoard')
var CreepFactory = require('CreepFactory');
var Utilities = require('Utilities');

function RoomManager(room, gameManager) {
	this.room = room;
	this.gameManager = gameManager;
	this.creeps = [];
	this.structure = [];
	this.level = 1

	// Set spawn for room
	for (var n in Game.spawns) {
		if (Game.spawns[n].room == this.room) {
			this.spawn = Game.spawns[n];
		}
	}

	this.init();

	// Start assigning jobs to all the important things in the room
	this.processSpawn()
	this.processCreeps()
};

RoomManager.prototype.processCreeps = function() {
	for (var n in this.creeps) {
		this.creeps[n].doAction()
	}
}

RoomManager.prototype.processSpawn = function() {
	// Check if this spawn has a job already
	job = this.jobBoard.getJobForAssignee(this.spawn.id)
	if (job) {
		if (job.started) {
			// Job is already started, check to see if it is done
			if (this.spawn.id.spawning != null) {
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
		console.log(JSON.stringify(job))
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

	this.jobBoard.addJob(this.jobBoard.jobTypes.BUILD_CREEP, 1, {type: 'MinerCreep', level: this.level})
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