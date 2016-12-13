var TowerMasterCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

TowerMasterCreep.prototype.init = function() {
	this.remember('role', 'TowerMasterCreep');
}

TowerMasterCreep.prototype.doAction = function() {
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
    	// Repair tower
        var source = undefined;
        var sources = []

        if (this.remember("towerEnergySource")) {
            source = Game.getObjectById(this.remember("towerEnergySource"));
        }

        if (source == undefined) {
            sources = this.creep.room.find(FIND_STRUCTURES, {
                filter: function(structure){
                    return ((structure.structureType == STRUCTURE_TOWER) && (structure.subscribersOfType("TowerMasterCreep") < 1));
                }
            });
        }
        
        if ((sources.length > 0) && (source == undefined)) {
            source = sources[0];
            this.creep.subscribe(source);
            this.remember("towerEnergySource", source.id);
        }

        // Save structure if found, otherwise go on break.
        if (source) {
            if (this.creep.transfer(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            	this.creep.moveTo(source);
            }
        } else {
            this.creep.moveTo(Game.flags['breakroom']);
        }
    }
}

module.exports = TowerMasterCreep;