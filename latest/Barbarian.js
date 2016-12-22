var Utilities = require("Utilities");

var enemy_players = ["SophiaBot", "Lapitz"];

var Barbarian = function(creep, roomManager) {
    this.creep = creep;
    this.roomManager = roomManager;
}

Barbarian.prototype.init = function() {
    this.save('role', 'Barbarian');
    this.state = this.load('state');
}

Barbarian.prototype.determineState = function() {
	return BARBARIAN_STATE_WAIT_FOR_HEALER;
}

Barbarian.prototype.waitForHealer = function() {
	var flag = Game.flags["breakroom-" + this.creep.room.name];
	if (flag == undefined) {
		return;
	}
	this.creep.moveTo(flag);

	if (this.creep.subscribersOfType("Monk") > 0) {
		this.state = BARBARIAN_STATE_FOLLOW_FLAG;
		this.save('state', this.state);
	}
}

Barbarian.prototype.followFlag = function() {
	var currentFlag = this.load('tasks.flag');
	if (currentFlag == undefined) {
		currentFlag = 0;
		this.save('tasks.flag', currentFlag)
	}

	var flag = Game.flags[this.creep.name];
	if (flag == undefined) {
		return
	}
	this.creep.moveTo(flag);
	//console.log("MOVETO!: " + Game.time)

	var enemies = this.creep.room.find(FIND_CREEPS, {
		filter: (creep) => {
			return (enemy_players.indexOf(creep.owner.username) != -1 ||
				    creep.id == "37445b65dfa1c71");
		}
	})
	if (enemies != undefined && enemies.length > 0) {
		this.state = BARBARIAN_STATE_FIGHT;
		this.save('state', this.state);
	}
}

Barbarian.prototype.fight = function() {
	var target_id = this.load('tasks.target_id');
	var target = undefined
	if (target_id == undefined) {
		target = this.creep.pos.findClosestByRange(FIND_CREEPS, {
			filter: (creep) => {
				return (enemy_players.indexOf(creep.owner.username) != -1 ||
				    creep.id == "37445b65dfa1c71")
			}
		})
		if (target != undefined) {
			this.save('tasks.target_id', target.id);
		} else {
			// NO targets available, go back to flag following
			this.save('tasks', {});
			this.state = BARBARIAN_STATE_FOLLOW_FLAG;
			this.save('state', this.state);
			return
		}
	} else {
		target = Game.getObjectById(target_id);
		if (target == undefined) {
			this.save('tasks', {});
			this.state = BARBARIAN_STATE_FOLLOW_FLAG;
			this.save('state', this.state);
		}
	}

	// We have a target if we've made it this far
	this.creep.moveTo(target);
	this.creep.attack(target);
}

Barbarian.prototype.doAction = function() {
	if (this.state == undefined || this.state == STATE_IDLE) {
		console.log("determine state!")
		this.state = this.determineState();
		this.save('state', this.state);
	}

	switch(this.state) {
		case(BARBARIAN_STATE_WAIT_FOR_HEALER):
			this.waitForHealer();
			break;
		case(BARBARIAN_STATE_FOLLOW_FLAG):
			this.followFlag();
			break;
		case(BARBARIAN_STATE_FIGHT):
			this.fight();
			break;
		default:
			Utilities.log(INFO, this.creep.name + " the BARBARIAN is confused!");
			break;
	}
}

module.exports = Barbarian;