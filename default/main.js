var Utilities = require('Utilities');
var GameManager = require('GameManager');
var RoomManager = require('RoomManager');

//console.log(Game.cpu.getUsed())

// Init rooms
for(var n in Game.rooms) {
	if (["W7N4"].indexOf(Game.rooms[n].name) > -1) {
		var roomManager = new RoomManager(Game.rooms[n], GameManager);
    	GameManager.set(Game.rooms[n].name, roomManager);
	}  
};

// Load rooms
var roomManagers = GameManager.getRoomManagers();
for(var n in roomManagers) {
    var roomManager = roomManagers[n];
    roomManager.loadCreeps();
    roomManager.populate();
    roomManager.performCreepActions();
    roomManager.performTowerActions();
};

Utilities.garbageCollection();
