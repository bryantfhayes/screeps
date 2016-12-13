var BuilderCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

BuilderCreep.prototype.init = function() {
	this.remember('role', 'BuilderCreep');
	this.remember('energySource', undefined);
}

BuilderCreep.prototype.doAction = function() {
	if(this.remember('building') && (this.creep.carry.energy == 0)) {
        this.remember('building', false);
        this.creep.say('getting energy');
    }
    if(!this.remember('building') && (this.creep.carry.energy == this.creep.carryCapacity)) {
        this.remember('building', true);
        this.creep.say('building');
    }

    if(this.remember('building')) {
        var target = this.creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        if(target) {
            if(this.creep.build(target) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            }
        } else {
            this.creep.moveTo(Game.flags['breakroom']);
        	//this.remember('role', 'MaintenanceCreep');
        }
    } else {

    	var sources = this.roomManager.room.find(FIND_STRUCTURES, {
            	filter: (structure) => {
            		return ((structure.structureType == STRUCTURE_STORAGE) && (structure.store[RESOURCE_ENERGY] > 0));
                }
    	});
    

    	// Save structure if found, otherwise go on break.
        if (sources && sources.length > 0) {
            if(this.creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(sources[0]);
            }
    	} else {
    		this.creep.moveTo(Game.flags['breakroom']);
    	}
    }
}

module.exports = BuilderCreep;