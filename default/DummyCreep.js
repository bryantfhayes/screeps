var DummyCreep = function(creep, roomManager) {
    this.creep = creep;
    this.roomManager = roomManager;
}

DummyCreep.prototype.init = function() {
    this.remember('role', 'DummyCreep');
}

DummyCreep.prototype.doAction = function() {

	if (this.creep.pos.roomName == Game.flags['waypoint-1'].pos.roomName && this.creep.pos.x == Game.flags['waypoint-1'].pos.x && this.creep.pos.y == Game.flags['waypoint-1'].pos.y) {
		this.remember('waypoint-1', true);
	}
	if (this.creep.pos == Game.flags['waypoint-3'].pos) {
		this.remember('waypoint-3', true);
	}

	if (this.remember('waypoint-1') != true) {
		this.creep.moveTo(Game.flags['waypoint-1']);
	} else if (this.remember('waypoint-3') != true) {
		this.creep.moveTo(Game.flags['waypoint-3']);
	} else {

		this.creep.moveTo(Game.flags['waypoint-3']);

	}

    //this.creep.moveTo(Game.flags['w7n4-bottom-entrance']);
    // var closestHostile = this.creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    // if(closestHostile) {
    //     this.creep.attack(closestHostile);
    // }
}

module.exports = DummyCreep;