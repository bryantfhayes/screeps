var UpgraderCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

UpgraderCreep.prototype.init = function() {
	this.remember('role', 'UpgraderCreep');
}

UpgraderCreep.prototype.doAction = function() {
	if(this.remember('upgrading') && (this.creep.carry.energy == 0)) {
        this.remember('upgrading', false);
        this.creep.say('collect');
    }
    if(!this.remember('upgrading') && (this.creep.carry.energy == this.creep.carryCapacity)) {
        this.remember('upgrading', true);
        this.creep.say('upgrade');
    }

    if(this.remember('upgrading')) {

        if(this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(this.creep.room.controller);
        }

    } else {

        var sources = this.roomManager.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_STORAGE) && (structure.store[RESOURCE_ENERGY]) > 0);
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