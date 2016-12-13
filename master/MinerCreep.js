var MinerCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

MinerCreep.prototype.init = function() {
	this.save('role', 'MinerCreep');
}

MinerCreep.prototype.doAction = function() {

	if(this.creep.carry.energy < this.creep.carryCapacity) {

        var source = undefined;
        var sources = []

        if (this.load("source")) {
            source = Game.getObjectById(this.load("source"));
        }

        if (source == undefined) {
            sources = this.roomManager.room.find(FIND_SOURCES, {
                filter: (source) => {
                    return ((source.subscribersOfType("MinerCreep") < 1));
                }
            });
        }

        if ((sources.length > 0) && (source == undefined)) {
            source = sources[0];
            this.creep.subscribe(source);
            this.save("source", source.id);
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
        this.creep.drop(RESOURCE_ENERGY, this.creep.carry.energy);
    }
}

module.exports = MinerCreep;
