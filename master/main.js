var GameManager = require('GameManager');
var RoomManager = require('RoomManager');

var myRooms = ["W7N3"]

// Init rooms
for(var n in Game.rooms) {
	if (myRooms.indexOf(Game.rooms[n].name) > -1) {
		var roomManager = new RoomManager(Game.rooms[n], GameManager);
    	GameManager.set(Game.rooms[n].name, roomManager);
	}  
};
