var Utilities = require('Utilities');

var FoundingFatherCreep = function(creep, roomManager) {
    this.creep = creep;
    this.roomManager = roomManager;
}

FoundingFatherCreep.prototype.init = function() {
    this.save('role', 'FoundingFatherCreep');
    this.mode = this.load('mode');
}

FoundingFatherCreep.prototype.determineMode = function() {
    // FIRST: Look around for your fearless leader George Warshington
    // Once found, follow them and wait for a command...
    var leader = Game.creeps[SC_GEORGE_WARSHINGTON.name];
    if (leader != undefined) {
        return CREEP_MODE_FOLLOW_LEADER;
    } else {
        return CREEP_MODE_WAIT_FOR_LEADER;
    }
}

FoundingFatherCreep.prototype.waitForLeader = function() {
    // Wait for leader to be born in whatever room you are in's breakroom
    var br = "breakroom-" + this.roomManager.room.name;
    var target = Game.flags[br]; 
    this.creep.moveTo(target);
};

FoundingFatherCreep.prototype.followLeader = function() {
    
}

FoundingFatherCreep.prototype.doAction = function() {
    
    if (this.mode == undefined || this.mode == CREEP_MODE_UNKNOWN) {
        this.mode = this.determineMode();
        this.save('mode', this.mode);
    }
    
     // Creep needs to get rid of the energy he has.
    switch(this.mode) {
        case(CREEP_MODE_WAIT_FOR_LEADER):
            this.waitForLeader()
            break;
        case(CREEP_MODE_FOLLOW_LEADER):
            this.followLeader();
            break;
        default:
            this.waitForLeader();
            break;
    }

    // If no task, wipe memory
    this.mode = this.load('mode');
    if (this.mode == CREEP_MODE_UNKNOWN) {
        this.save('tasks', {});
        this.creep.scrub();
        //console.log(this.creep.name + " lost his job!")
    }
}

module.exports = FoundingFatherCreep;