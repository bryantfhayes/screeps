var UpgraderCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

UpgraderCreep.prototype.init = function() {
	this.save('role', 'UpgraderCreep');
}

UpgraderCreep.prototype.doAction = function() {
	if(this.load('upgrading') && (this.creep.carry.energy == 0)) {
        this.save('upgrading', false);
        this.creep.say('collect');
    }
    if(!this.load('upgrading') && (this.creep.carry.energy == this.creep.carryCapacity)) {
        this.save('upgrading', true);
        this.creep.say('upgrade');
    }

    if(this.load('upgrading')) {

        if(this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(this.creep.room.controller);
        }

    } else {

        var sources = this.roomManager.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_CONTAINER) && (structure.store[RESOURCE_ENERGY]) > 0);
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


    

module.exports = UpgraderCreep;