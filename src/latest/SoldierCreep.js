var SoldierCreep = function(creep, roomManager) {
    this.creep = creep;
    this.roomManager = roomManager;
}

SoldierCreep.prototype.init = function() {
    this.save('role', 'SoldierCreep');
}

SoldierCreep.prototype.doAction = function() {
	if (this.creep.pos.roomName == Game.flags['Flag2'].pos.roomName && this.creep.pos.x == Game.flags['Flag2'].pos.x && this.creep.pos.y == Game.flags['Flag2'].pos.y) {
		this.save('Flag2', true);
	}

    if (this.load('Flag2') != true) {
 		this.creep.moveTo(Game.flags['Flag2']);
 	} else {
        //  var targets = this.creep.room.find(FIND_CREEPS, {
        //      filter: (c) => {
        //          return (c.owner.username != Game.spawns[Object.keys(Game.spawns)[0]].owner.username)
        //      }
        //  });
        if (this.creep.hits < this.creep.hitsMax * 0.5) {
            this.creep.heal(this.creep);
        } else {
            this.creep.moveTo(Game.getObjectById("36d2ed4b529e20b"));
            this.creep.attack(Game.getObjectById("36d2ed4b529e20b"));
        }   
        //  if(targets.length > 0) {
        //      this.creep.moveTo(targets[0]);
        //      this.creep.attack(targets[0]);
        //  }

	}
}

module.exports = SoldierCreep;