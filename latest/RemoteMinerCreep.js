var Utilities = require('Utilities');

var RemoteMinerCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

RemoteMinerCreep.prototype.init = function() {
	this.save('role', 'RemoteMinerCreep');
    this.mode = this.load('mode');
}

RemoteMinerCreep.prototype.determineMode = function() {

    // FIRST: determine if you are in source room, if so, find remote source
    if (this.creep.memory.srcRoom == this.creep.room.name) {
        return CREEP_MODE_FIND_REMOTE_ROOM;
    }

    // SECOND: you are not in source room, so check if you need a source
    var source = this.load('tasks.target-source');
    if (source == undefined) {
        return CREEP_MODE_GOTO_REMOTE_ROOM;
    }

    // THIRD: a source is known to the miner, and it is in the current room
    //        so we need to go to mine the source
    return CREEP_MODE_MINE_REMOTE_SOURCE
}

// Find the target room and travel there.
RemoteMinerCreep.prototype.findRemoteRoom = function() {
    console.log(this.creep.name + " is looking for a remote room!")
    var sources = this.roomManager.getAvailableRemoteSources()
    if (sources != undefined && sources.room != undefined) {
        this.save('tasks.target-room', sources.room);
        this.save('tasks.target-source', sources.source)
        this.creep.subscribeById(sources.source)
        
        // save new mode
        this.mode = CREEP_MODE_GOTO_REMOTE_ROOM;
        this.save('mode', this.mode);
    }
}

// Find an open source and go there
RemoteMinerCreep.prototype.gotoRemoteRoom = function() {
    var targetRoom = this.load('tasks.target-room');
    if (targetRoom == undefined) {
        this.mode = CREEP_MODE_UNKNOWN;
        this.save('mode', this.mode);
    }

    if (this.creep.room.name != targetRoom) {
        var exitDir = this.creep.room.findExitTo(targetRoom);
        var exit = this.creep.pos.findClosestByRange(exitDir);
        this.creep.moveTo(exit);  
    } else {
        // room found!
        this.mode = CREEP_MODE_MINE_REMOTE_SOURCE;
        this.save('mode', this.mode);
    }
}

// Mine target source and drop resources so that someone can take them back
RemoteMinerCreep.prototype.mineRemoteSource = function() {
    var sourceId = this.load('tasks.target-source');
    if (sourceId == undefined) {
        this.mode = CREEP_MODE_UNKNOWN;
        this.save('mode', this.mode);
    }

    var source = Game.getObjectById(sourceId);
    this.creep.moveTo(source);
    this.creep.harvest(source);
}

RemoteMinerCreep.prototype.doAction = function() {

    if (this.mode == undefined || this.mode == CREEP_MODE_UNKNOWN) {
        console.log(this.creep.name + " is looking for work!");
        this.mode = this.determineMode();
        this.save('mode', this.mode);
    }
    
    switch(this.mode) {
        case(CREEP_MODE_FIND_REMOTE_ROOM):
            this.findRemoteRoom();
            break;
        case(CREEP_MODE_GOTO_REMOTE_ROOM):
            this.gotoRemoteRoom();
            break;
        case(CREEP_MODE_MINE_REMOTE_SOURCE):
            this.mineRemoteSource();
            break;
        default:
            break;
    }

    // If no task, wipe memory
    this.mode = this.load('mode');
    if (this.mode == CREEP_MODE_UNKNOWN) {
        this.save('tasks', {});
        this.creep.scrub();
    }
}

module.exports = RemoteMinerCreep;