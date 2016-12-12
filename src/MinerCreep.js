var MinerCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

MinerCreep.prototype.init = function() {
	this.save('role', 'MinerCreep');
}

MinerCreep.prototype.doAction = function() {
    if(this.creep.carry.energy < this.creep.carryCapacity) {
        var sources = this.creep.room.find(FIND_SOURCES);
        if(this.creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(sources[0]);
        }
    }
    else if(Game.spawns['Spawn1'].energy < Game.spawns['Spawn1'].energyCapacity) {
        if(this.creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(Game.spawns['Spawn1'], {ignoreCreeps: true});
        }
    }
}

module.exports = MinerCreep;