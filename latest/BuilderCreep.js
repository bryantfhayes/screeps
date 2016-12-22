var BuilderCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

BuilderCreep.prototype.init = function() {
	this.save('role', 'BuilderCreep');
	this.save('energySource', undefined);
}

BuilderCreep.prototype.work = function() {
    var target = this.creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
    if(target) {
        if(this.creep.build(target) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
    } else {
        this.creep.moveTo(Game.flags['breakroom']);
    }
}

BuilderCreep.prototype.getEnergy = function() {
    var sources = this.roomManager.getPrefferedEnergyPickUp()

    // Save structure if found, otherwise go on break.
    if (sources && sources.length > 0) {
        var source = sources[0];
        var priorEnergy = this.creep.carry.energy
        var result = this.creep.withdraw(source, RESOURCE_ENERGY)
        if(result == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(source);
        } else if (result == OK) {
            this.roomManager.energyTransaction(-(this.creep.carry.energy - priorEnergy))
        }
    } else {
        this.creep.moveTo(Game.flags['breakroom']);
    }
}

// Main action loop, executed each tick.
BuilderCreep.prototype.doAction = function() {
    // If working and runs out of energy...
	if(this.load('working') && (this.creep.carry.energy == 0)) {
        this.save('working', false);
        this.creep.say('collect');
    }

    // If not working, but gets full energy...
    if(!this.load('working') && (this.creep.carry.energy == this.creep.carryCapacity)) {
        this.save('working', true);
        this.creep.say('working');
    }

    // working...
    if(this.load('working')) {
        this.work();
    // need energy...
    } else {
        this.getEnergy();
    }
}

module.exports = BuilderCreep;