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

    // FIRST: check if there is a link in the room
    var links = this.roomManager.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_LINK);
        }
    });
    if (links != undefined && links.length > 0) {
        return CREEP_MODE_MINE_WITH_LINK;
    }

    // SECOND: check to see if transport creep is subscribed to THIS creep
    var subscribers = this.subscribersOfType("TransportCreep");
    if (subscribers == undefined || subscribers > 0) {
        return CREEP_MODE_MINE_WITH_TRANSPORT;
    }

    // THIRD: if no links or transports, work as a harvester
    return CREEP_MODE_MINE_AS_HARVESTER;
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
    this.creep.say("harvest");
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
    this.creep.say("transport");
    this.creep.drop(RESOURCE_ENERGY, this.creep.carry.energy);
}

// Miner should transfer collected energy to the nearby Link
MinerCreep.prototype.mineWithLink = function() {
    this.creep.say("link");
    var link = this.creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (structures) => {
            return (structures.structureType == STRUCTURE_LINK);
        }
    });
    if (link != undefined) {
        console.log("transfer to link")
        if (this.creep.transfer(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(link);
        }
    } else {
        console.log(this.creep.name + " cant find a link!")
    }
}

MinerCreep.prototype.doAction = function() {

    this.mode = this.determineMode();
    
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
                this.mineAsHarvester();
                break;
            default:
                this.mineWithLink();
        }
    }
}

module.exports = MinerCreep;