var Utilities = require("Utilities");

var UpgraderCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

UpgraderCreep.prototype.init = function() {
	this.save('role', 'UpgraderCreep');
}

UpgraderCreep.prototype.doAction = function() {
	if(this.load('upgrading') && (this.creep.carry.energy == 0)) {
        this.save('upgrading', false);
        Utilities.exclaim(this.creep, "U.collect");
    }
    if(!this.load('upgrading') && (this.creep.carry.energy == this.creep.carryCapacity)) {
        this.save('upgrading', true);
        Utilities.exclaim(this.creep, "U.upgrade");
    }

    if(this.load('upgrading')) {

        if(this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(this.creep.room.controller);
        }

    } else {

        var sources = this.roomManager.getPrefferedEnergyPickUp();

        // Save structure if found, otherwise go on break.
        if (sources != undefined && sources.length > 0) {
            var source = sources[0];
            if(this.creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(source);
            }
        } else {
            this.creep.moveTo(Game.flags['breakroom']);
        }
    }
}

module.exports = UpgraderCreep;