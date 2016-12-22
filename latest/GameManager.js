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

GameManager.status = function() {
    for (var n in roomManagers) {
        var roomManager = roomManagers[n];
        var status = roomManager.getStatus();
        if (status != undefined) {
            console.log(roomManager.room.name + " +" + status.energy_in + "/-" + status.energy_out + " = net: " + (status.energy_in - status.energy_out));
        }
    }
}

GameManager.calculateEfficiency = function() {
    for (var n in roomManagers) {
        var roomManager = roomManagers[n];
        var status = roomManager.getStatus();
        if (status != undefined) {
            var net = (status.energy_in - status.energy_out)
            console.log(roomManager.room.name + " +" + status.energy_in + "/-" + status.energy_out + " = net: " + net);
            
            var lastNetEnergy = roomManager.load('lastNetEnergy');
            if (lastNetEnergy != undefined) { 
                var currentEfficiency = net - lastNetEnergy;
                roomManager.save('1000-tick-net', currentEfficiency);
                roomManager.save('energy-per-tick', currentEfficiency / 1000);
            }
            roomManager.save('lastNetEnergy', net);
        }
    }
}

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

GameManager.spawnCreep = function(name, type, level) {
    var roomManager = GameManager.get(name);
    if (roomManager == undefined) {
        return false;
    }
    var spawn = roomManager.getAvailableSpawn();
    if (spawn == undefined) {
        return false;
    }
    roomManager.creepFactory.new(type, spawn, level);
}

GameManager.performSpecialCreepActions = function() {
    if (Game.creeps[SC_CHRISTOPHER_COLUMBUS.name] != undefined) {
        this.christopher_columbus();
    }
}

module.exports = GameManager;