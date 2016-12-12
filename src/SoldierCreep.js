var SoldierCreep = function(creep, roomManager) {
    this.creep = creep;
    this.roomManager = roomManager;
}

SoldierCreep.prototype.init = function() {
    this.save('role', 'SoldierCreep');
}

SoldierCreep.prototype.doAction = function() {
    console.log(this.creep.name + " is a soldier.")
}

module.exports = SoldierCreep;