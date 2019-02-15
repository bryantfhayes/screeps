var SpawnMaintenanceCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

SpawnMaintenanceCreep.prototype.init = function() {
	this.remember('role', 'SpawnMaintenanceCreep');
}

SpawnMaintenanceCreep.prototype.doAction = function() {
	var storage = this.roomManager.storage;
	if (storage == undefined) {
		this.creep.moveTo(Game.flags["breakroom"]);
        //return;
	}

    if(this.remember('repairing') && (this.creep.carry.energy == 0)) {
        this.remember('repairing', false);
        this.creep.say('collect');
    }
    if(!this.remember('repairing') && (this.creep.carry.energy == this.creep.carryCapacity)) {
        this.remember('repairing', true);
        this.creep.say('repair');
    }

    if(!this.remember('repairing')) {
        if(this.creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(storage);
        }
    } else {
    	// Fill spawn and extensions
         var source = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function(structure){
                    return (((structure.structureType == STRUCTURE_EXTENSION) || (structure.structureType == STRUCTURE_SPAWN)) && (structure.energy < structure.energyCapacity));
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

module.exports = SpawnMaintenanceCreep;