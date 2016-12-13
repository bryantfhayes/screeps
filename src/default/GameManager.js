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


module.exports = GameManager;