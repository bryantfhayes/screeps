var Tower = function(tower, roomManager) {
	this.tower = tower;
	this.roomManager = roomManager;
}

Tower.prototype.init = function() {

}

Tower.prototype.doAction = function() {
    var closestHostile = this.tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(closestHostile) {
        this.tower.attack(closestHostile);
    }
    
    if (this.tower.energy > this.tower.energyCapacity * 0.5) {
        var closestDamagedStructure = this.tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return(((structure.structureType == STRUCTURE_ROAD) && (structure.hits < structure.hitsMax*0.75)) ||
                         ((structure.structureType == STRUCTURE_RAMPART) && (structure.hits < 100000)) ||
                         ((structure.structureType == STRUCTURE_CONTAINER) && (structure.hits < 100000)));
            }
        });
        //var storageCs = Game.getObjectById("f00bb59e64ddabf");
        if(closestDamagedStructure) {
            this.tower.repair(closestDamagedStructure);
        }
    }
}

module.exports = Tower;