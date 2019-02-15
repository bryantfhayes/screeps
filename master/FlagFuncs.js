var FlagFuncs = {};

FlagFuncs.Genecide = function(gameManager) {
	console.log("Kill all screeps!")
	rooms = gameManager.getRoomManagers()
	for (var room in rooms) {
		for (var n in rooms[room].creeps) {
			rooms[room].creeps[n].creep.suicide()
		}
	}
	Memory.Subscriptions = undefined
	Memory.JobBoard = undefined
}

module.exports = FlagFuncs;