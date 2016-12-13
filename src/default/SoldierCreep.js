var SoldierCreep = function(creep, roomManager) {
    this.creep = creep;
    this.roomManager = roomManager;
}

SoldierCreep.prototype.init = function() {
    this.remember('role', 'SoldierCreep');
}

SoldierCreep.prototype.doAction = function() {
	if (this.creep.pos.roomName == Game.flags['Flag2'].pos.roomName && this.creep.pos.x == Game.flags['Flag2'].pos.x && this.creep.pos.y == Game.flags['Flag2'].pos.y) {
		this.remember('Flag2', true);
	}
// 	if (this.creep.pos.roomName == Game.flags['waypoint-1'].pos.roomName && this.creep.pos.x == Game.flags['waypoint-1'].pos.x && this.creep.pos.y == Game.flags['waypoint-1'].pos.y) {
// 		this.remember('waypoint-1', true);
// 	}
// 	if (this.creep.pos.roomName == Game.flags['waypoint-2'].pos.roomName && this.creep.pos.x == Game.flags['waypoint-2'].pos.x && this.creep.pos.y == Game.flags['waypoint-2'].pos.y) {
// 		this.remember('waypoint-2', true);
// 	}
//      if (this.creep.pos.roomName == Game.flags['bens-room'].pos.roomName && this.creep.pos.x == Game.flags['bens-room'].pos.x && this.creep.pos.y == Game.flags['bens-room'].pos.y) {
//          this.remember('bens-room', true);
//      }
    if (this.remember('Flag2') != true) {
 		this.creep.moveTo(Game.flags['Flag2']);
 	}
// 	if (this.remember('waypoint-1') != true) {
// 		this.creep.moveTo(Game.flags['waypoint-1']);
// 	} else if (this.remember('waypoint-2') != true) {
// 		this.creep.moveTo(Game.flags['waypoint-2']);
// 	} else if (this.remember('bens-room') != true) {
//          this.creep.moveTo(Game.flags['bens-room']);
//      }

     else {
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
    

    // this.creep.moveTo(Game.flags['w7n4-bottom-entrance']);
    // var closestHostile = this.creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    // if(closestHostile) {
    //     this.creep.attack(closestHostile);
    // }
}

module.exports = SoldierCreep;