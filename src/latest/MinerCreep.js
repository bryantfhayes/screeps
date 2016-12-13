var MinerCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

MinerCreep.prototype.init = function() {
	this.save('role', 'MinerCreep');
    this.mode = undefined;
}

MinerCreep.prototype.determineMode = function() {
    // TODO: determine mode for miner
}

MinerCreep.prototype.mine = function() {
    var source = undefined;
    var sources = []

    // Use target source, or find target source if miner doesn't have one in memory
    if (this.load("source")) {
        source = Game.getObjectById(this.load("source"));
    } else {
       sources = this.roomManager.room.find(FIND_SOURCES, {
            filter: (source) => {
                return ((source.subscribersOfType("MinerCreep") < 1));
            }
        }); 
        if ((sources.length > 0) && (source == undefined)) {
            source = sources[0];
            this.creep.subscribe(source);
            this.save("source", source.id);
        }
    }

    if (source) {
        if(this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(source);
        }
    } else {
        this.creep.moveTo(Game.flags['breakroom']);
    }
}

MinerCreep.prototype.mineAsHarvester = function() {
    var target = this.roomManager.getPrefferedEnergyDropOff();
    if (target == undefined) {
        console.log(this.creep.name + " the miner doesn't know where to drop of energy!");
        return
    }

    if (this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(target);
    }
}

MinerCreep.prototype.mineWithTransport = function() {
    this.creep.drop(RESOURCE_ENERGY, this.creep.carry.energy);
}

// Miner should transfer collected energy to the nearby Link
MinerCreep.prototype.mineWithLink = function() {
    var link = this.creep.pos.findClosestByRange(STRUCTURE_LINK);
    if (link != undefined) {
        if (this.creep.transfer(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(link);
        }
    }
}

MinerCreep.prototype.doAction = function() {

    this.determineMode();
    
    // Creep isn't at full energy yet, mine!
    if (this.creep.carry.energy < this.creep.carryCapacity) {
        this.mine();
    } else {
        // Creep needs to get rid of the energy he has.
        switch(this.mode) {
            case(CREEP_MODE_MINE_AS_HARVESTER):
                this.mineAsHarvester();
                break;
            case(CREEP_MODE_MINE_WITH_TRANSPORT):
                this.mineWithTransport();
                break;
            case(CREEP_MODE_MINE_WITH_LINK):
                this.mineWithLink();
                break;
            default:
                this.mineAsHarvester();
        }
    }
}

module.exports = MinerCreep;