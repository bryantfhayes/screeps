var Utilities = require("Utilities");

var Monk = function(creep, roomManager) {
    this.creep = creep;
    this.roomManager = roomManager;
}

Monk.prototype.init = function() {
    this.save('role', 'Monk');
    this.state = this.load('state');
}

Monk.prototype.determineState = function() {
	return MONK_STATE_WAIT_FOR_TARGET;
}

Monk.prototype.waitForTarget = function() {
	var flag = Game.flags["breakroom-" + this.creep.memory.srcRoom];
	if (flag == undefined) {
		return;
	}
	this.creep.moveTo(flag);

	var targets = this.creep.room.find(FIND_MY_CREEPS, {
		filter: (creep) => {
			return (creep.memory.role == "Barbarian" &&
				    creep.subscribersOfType("Monk") < 2);
		}
	})
	// If a target is found, subscribe and follow it for life
	if (targets != undefined && targets.length > 0) {
		var target = targets[0];
		this.creep.subscribe(target);
		this.save('tasks.target_id', target.id);

		this.state = MONK_STATE_SERVE_TARGET;
		this.save('state', this.state);
	}

	if (this.creep.hits < this.creep.hitsMax) {
		this.creep.heal(this.creep);
	}
}

Monk.prototype.serveTarget = function() {
	var target_id = this.load('tasks.target_id');

	// If target is undefined, go back to waiting for a target
	if (target_id == undefined) {
		this.save('tasks', {})
		this.state = MONK_STATE_WAIT_FOR_TARGET;
		this.save('state', this.state);
	}
	var target = Game.getObjectById(target_id);
	if (target == undefined) {
		this.save('tasks', {})
		this.state = MONK_STATE_WAIT_FOR_TARGET;
		this.save('state', this.state);
	}

	// You have a target!
	this.creep.moveTo(target);
	if (this.creep.hits < this.creep.hitsMax && this.creep.hits < target.hits) {
		this.creep.heal(this.creep);
	} else {
		this.creep.heal(target);
	}
}

Monk.prototype.doAction = function() {
	if (this.state == undefined || this.state == STATE_IDLE) {
		this.state = this.determineState();
		this.save('state', this.state);
	}

	switch(this.state) {
		case(MONK_STATE_WAIT_FOR_TARGET):
			this.waitForTarget();
			break;
		case(MONK_STATE_SERVE_TARGET):
			this.serveTarget();
			break;
		default:
			Utilities.log(INFO, this.creep.name + " the MONK is confused!");
			break;
	}
}

module.exports = Monk;