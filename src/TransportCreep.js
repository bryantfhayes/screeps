var TransportCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

TransportCreep.prototype.init = function() {
	this.save('role', 'TransportCreep');
}

TransportCreep.prototype.doAction = function() {
	console.log(this.creep.name + " is a transporter.")
}

module.exports = TransportCreep;