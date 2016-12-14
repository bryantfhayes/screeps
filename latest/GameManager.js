var rooms = [];
var roomManagers = {};

var GameManager = {};
GameManager.set = function(name, roomManager) {
    rooms.push(name);
    roomManagers[name] = roomManager;
};

GameManager.get = function(name) {
    if(this.isOurRoom(name)) {
        return roomManagers[name];
    }
    return false;
};

GameManager.isOurRoom = function(name) {
    if(rooms.indexOf(name) == -1) {
        return false;
    }
    return true;
};

GameManager.getRoomManagers = function() {
    return roomManagers;
};

GameManager.loadSpecialCreeps = function() {
    for (var n in Game.spawns) {
        if (Game.spawns[n].canCreateCreep(SC_CHRISTOPHER_COLUMBUS.parts, SC_CHRISTOPHER_COLUMBUS.name) == OK) {
            
            // Conquerer of new lands: Christopher Columbus!
            if (Game.creeps[SC_CHRISTOPHER_COLUMBUS.name] == undefined) {
                Game.spawns[n].createCreep(SC_CHRISTOPHER_COLUMBUS.parts, SC_CHRISTOPHER_COLUMBUS.name);
                console.log("Christopher Columbus was born in room: " + Game.spawns[n].room.name)
            }
        } else {
            //console.log(Game.spawns[n].room.name + "'s spawn cant produce!")
        }
    }
}

GameManager.christopher_columbus = function() {
    var creep = Game.creeps[SC_CHRISTOPHER_COLUMBUS.name];
    var flag = Game.flags["columbus"];
    if (flag != undefined && creep != undefined) {
        creep.moveTo(flag);        
    }
}

GameManager.performSpecialCreepActions = function() {
    if (Game.creeps[SC_CHRISTOPHER_COLUMBUS.name] != undefined) {
        this.christopher_columbus();
    }
}

module.exports = GameManager;