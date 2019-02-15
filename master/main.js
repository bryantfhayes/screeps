var GameManager = require('GameManager');
var RoomManager = require('RoomManager');
var FlagFuncs = require('FlagFuncs')
var Utilities = require('Utilities')

var myRooms = ["W7N3"]

// Init rooms
for(var n in Game.rooms) {
	if (myRooms.indexOf(Game.rooms[n].name) > -1) {
		var roomManager = new RoomManager(Game.rooms[n], GameManager);
    	GameManager.set(Game.rooms[n].name, roomManager);
	}  
};

// Custom commands using flags
for (var flag in Game.flags) {
	if (flag == "genecide") {
		FlagFuncs.Genecide(GameManager)
		Game.flags[flag].remove()
	}
}

Utilities.garbageCollection()
//console.log(Game.cpu.getUsed())