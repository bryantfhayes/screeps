var kStructureStrength = 100000;
var kRampartStrength = 10000000;
//console.log("sdf");
var MaintenanceCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

MaintenanceCreep.prototype.init = function() {
	this.save('role', 'MaintenanceCreep');
}

MaintenanceCreep.prototype.doAction = function() {
	if(this.load('working') && this.creep.carry.energy == 0) {
        this.save('working', false);
        this.creep.say('energy');
    }
    if(!this.load('working') && this.creep.carry.energy == this.creep.carryCapacity) {
        this.save('working', true);
        this.creep.say('working');
    }

    if(this.load('working')) {
        var target = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
           filter: (object) => {
          
               if((object.structureType == STRUCTURE_ROAD) && (object.hits < (object.hitsMax * 0.90))) {
                return true;
               }
               if((object.structureType == STRUCTURE_WALL) && object.hits < kStructureStrength) {
                return true;
               }
               if((object.structureType == STRUCTURE_CONTAINER) && object.hits < 100000) {
                return true;
               }
               if((object.structureType == STRUCTURE_RAMPART) && object.hits < kRampartStrength) {
                return true;
               }

               return false;
            } 
        });
        if(target) {
            if(this.creep.repair(target) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            }
        } else {
          this.creep.moveTo(Game.flags['breakroom']);
        }
    }
    else {
        var sources = this.roomManager.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_STORAGE) && (structure.store[RESOURCE_ENERGY] > 0));
            }
        });

        // Save structure if found, otherwise go on break.
        if (sources.length > 0) {
            if(this.creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(sources[0]);
            }
        } else {
            this.creep.moveTo(Game.flags['breakroom']);
        }
    }
}

module.exports = MaintenanceCreep;