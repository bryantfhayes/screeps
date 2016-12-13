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
    
    //var nextController = Game.getObjectById("0f430773646b814");
    //var targetRoom = 'W5N3'

    //var chris = Game.creeps["Christopher Columbus"]

    // if (nextController != undefined) {
    //     if (chris.claimController() != OK) {
    //         chris.moveTo(nextController)
    //     }
    // } 
    // else {
    //     var exitDir = chris.room.findExitTo(targetRoom);
    //     var exit = chris.pos.findClosestByRange(exitDir);
    //     if (exit != undefined) {
    //         //chris.moveTo(exit);
    //     }
    // }

  let creep = Game.creeps["Christopher Columbus"];

  let goals = [RoomPosition(37, 9, 'W5N3')];
  
  let ret = PathFinder.search(
    creep.pos, goals,
    {
      // We need to set the defaults costs higher so that we
      // can set the road cost lower in `roomCallback`
      plainCost: 2,
      swampCost: 10,
      
      roomCallback: function(roomName) {

        let room = Game.rooms[roomName];
        // In this example `room` will always exist, but since PathFinder 
        // supports searches which span multiple rooms you should be careful!
        if (!room) return;
        let costs = new PathFinder.CostMatrix;

        room.find(FIND_STRUCTURES).forEach(function(structure) {
          if (structure.structureType == STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(structure.pos.x, structure.pos.y, 1);
          } else if (structure.structureType == STRUCTURE_WALL || 
                     (structure.structureType == STRUCTURE_RAMPART &&
                      !structure.my)) {
            // Can't walk through non-walkable buildings
            costs.set(structure.pos.x, structure.pos.y, 0xff);
          }
        });

        return costs;
      },
    }
  );
  
  let pos = ret.path[0];
  console.log(pos)
  creep.move(creep.pos.getDirectionTo(pos));
}

GameManager.performSpecialCreepActions = function() {
    if (Game.creeps[SC_CHRISTOPHER_COLUMBUS.name] != undefined) {
        //this.christopher_columbus();
    }
}

module.exports = GameManager;