var ContainerMaintenanceCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

ContainerMaintenanceCreep.prototype.init = function() {
	this.remember('role', 'ContainerMaintenanceCreep');
}

ContainerMaintenanceCreep.prototype.doAction = function() {
	var storage = this.roomManager.storage;
	if (storage == undefined) {
		this.creep.moveTo(Game.flags["breakroom"]);
	}

    if(this.remember('filling') && (this.creep.carry.energy == 0)) {
        this.remember('filling', false);
        this.creep.say('collect');
    }
    if(!this.remember('filling') && (this.creep.carry.energy == this.creep.carryCapacity)) {
        this.remember('filling', true);
        this.creep.say('fill');
    }

    if(!this.remember('filling')) {
        if(this.creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(storage);
        }
    } else {
    	// Fill spawn and extensions
         var source = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function(structure){
                    return ((structure.structureType == STRUCTURE_CONTAINER) && (structure.store[RESOURCE_ENERGY] < structure.storeCapacity));
                }
        });

        // Save structure if found, otherwise go on break.
        if (source) {
            if (this.creep.transfer(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            	this.creep.moveTo(source);
            }
        }
    }
}

module.exports = ContainerMaintenanceCreep;