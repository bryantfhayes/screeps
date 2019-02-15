var MinerCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

MinerCreep.prototype.init = function() {
	this.remember('role', 'MinerCreep');
}

MinerCreep.prototype.doAction = function() {
	if(this.creep.carry.energy < this.creep.carryCapacity) {

        var source = undefined;
        var sources = []

        if (this.remember("source")) {
            source = Game.getObjectById(this.remember("source"));
        }

        if (source == undefined) {
            if (this.creep.subscriptions() != undefined) {
                sources = Object.keys(this.creep.subscriptions()).filter(function(id){
                try {
                    if(Game.getObjectById(id).energy !== undefined) {
                        return true;
                    } else {
                        return false;
                    }
                } catch(err) {
                    return false;
                }
                });
            }
        }

        if ((sources.length > 0) && (source == undefined)) {
            source = sources[0];
            this.remember("source", source);
        }

        // Save structure if found, otherwise go on break.
        if (source) {
            if(this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(source);
            }
        } else {
            this.creep.moveTo(Game.flags['breakroom']);
        }
    } else {
        // Drop all ythe energy that has been harvested
        // this.creep.drop(RESOURCE_ENERGY, this.creep.carry.energy);
        if(this.creep.transfer(this.roomManager.spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(this.roomManager.spawn);
        }
    }
}

module.exports = MinerCreep;