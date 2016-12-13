var TransportCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

TransportCreep.prototype.init = function() {
	this.save('role', 'TransportCreep');
    this.mode = this.load('mode');
}

TransportCreep.prototype.determineMode = function() {
    
}

TransportCreep.prototype.transportMinerToStorage = function() {
    

    if(this.load('returning')) {
        var targets = this.creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE);
                }
        });
        if(targets.length > 0) {
            if(this.creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(targets[0]);
            }
        }
    }


    var source = undefined;
    var sources = []

    if (this.load("tasks.targetMiner")) {
        source = Game.getObjectById(this.load("tasks.targetMiner"));
    } else {
        sources = this.creep.room.find(FIND_MY_CREEPS, {
            filter: function(creep){
                return ((creep.memory.role == "MinerCreep") && (creep.subscribersOfType("TransportCreep") < 2));
            }
        });
    }
    
    // If source isn;t already set...
    if ((sources.length > 0) && (source == undefined)) {
        source = sources[0];
        this.creep.subscribe(source);
        this.save("tasks.targetMiner", source.id);
    }

    // Save structure if found, otherwise go on break.
    if (source) {
        var energy = source.pos.findInRange(FIND_DROPPED_ENERGY, 2);

        if (energy.length > 0) {
            if(this.creep.pickup(energy[0]) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(energy[0]);
            }
        } else {
            this.creep.moveTo(source);
        }
    } else {
        this.save('mode', CREEP_MODE_UNKNOWN);
    }
}

TransportCreep.prototype.transportStorageToTower = function() {
    
}

TransportCreep.prototype.transportStorageToSpawn = function() {
    
}

TransportCreep.prototype.transportStorageToContainer = function() {
    
}

TransportCreep.prototype.transportLinkToStorage = function() {
    
}

TransportCreep.prototype.doAction = function() {
    
    if (this.mode == undefined || this.mode == CREEP_MODE_UNKNOWN) {
        this.mode = this.determineMode();
        this.save('mode', this.mode);
    }

    if(this.load('fill') && (this.creep.carry.energy == 0)) {
        this.save('fill', false);
        this.creep.say('gather');
    }
    if(!this.load('fill') && (this.creep.carry.energy == this.creep.carryCapacity)) {
        this.save('fill', true);
        this.creep.say('fill');
    }
    
     // Creep needs to get rid of the energy he has.
    switch(this.mode) {
        case(CREEP_MODE_TRANSPORT_MINER_TO_STORAGE):
            this.transportMinerToStorage();
            break;
        case(CREEP_MODE_TRANSPORT_STORAGE_TO_TOWER):
            this.transportStorageToTower();
            break;
        case(CREEP_MODE_TRANSPORT_STORAGE_TO_SPAWN):
            this.transportStorageToSpawn();
            break;
        case(CREEP_MODE_TRANSPORT_STORAGE_TO_CONTAINER):
            this.transportStorageToContainer();
            break;
        case(CREEP_MODE_TRANSPORT_LINK_TO_STORAGE):
            this.transportLinkToStorage();
            break;
        default:
            console.log(this.creep.name + " has nothing to do!");
    }

    if(this.load('returning')) {
        var targets = this.creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE);
                }
        });
        if(targets.length > 0) {
            if(this.creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(targets[0]);
            }
        }
    } else {
        
    }
}

module.exports = TransportCreep;