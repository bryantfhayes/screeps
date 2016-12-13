var TransportCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

TransportCreep.prototype.init = function() {
	this.save('role', 'TransportCreep');
}

TransportCreep.prototype.doAction = function() {
	var spawn = this.roomManager.spawn

    if(this.load('returning') && (this.creep.carry.energy == 0)) {
        this.save('returning', false);
        this.creep.say('collect');
    }
    if(!this.load('returning') && (this.creep.carry.energy == this.creep.carryCapacity)) {
        this.save('returning', true);
        this.creep.say('return');
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
        // if(this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
        //     this.creep.moveTo(this.creep.room.controller);
        // }

    } else {
        var source = undefined;
        var sources = []

        if (this.load("energySource")) {
            source = Game.getObjectById(this.load("energySource"));
        }

        if (source == undefined) {
            sources = this.creep.room.find(FIND_MY_CREEPS, {
                filter: function(creep){
                    return ((creep.memory.role == "MinerCreep") && (creep.subscribersOfType("TransportCreep") < 2));
                }
            });
        }
        
        if ((sources.length > 0) && (source == undefined)) {
            source = sources[0];
            this.creep.subscribe(source);
            this.save("energySource", source.id);
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
            this.creep.moveTo(Game.flags['breakroom']);
        }
    }
}

module.exports = TransportCreep;