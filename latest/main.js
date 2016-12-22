var Utilities = require('Utilities');
var GameManager = require('GameManager');
var RoomManager = require('RoomManager');
var Constants = require('Constants');

var myRooms = ['W7N4'];

// Spawn all special screeps
//GameManager.loadSpecialCreeps();

// Init rooms
for(var n in myRooms) {
	var roomManager = new RoomManager(Game.rooms[myRooms[n]], GameManager);
	GameManager.set(Game.rooms[myRooms[n]].name, roomManager);
	GameManager.performSpecialCreepActions();
};

// Load rooms
var roomManagers = GameManager.getRoomManagers();
for(var n in roomManagers) {
    var roomManager = roomManagers[n];
    roomManager.loadCreeps();
    roomManager.populate();
    roomManager.performLinkActions();
    roomManager.performCreepActions();
    roomManager.performTowerActions();
};

if (Game.time % 1000 == 0) {
	GameManager.calculateEfficiency();
}

Utilities.garbageCollection();
