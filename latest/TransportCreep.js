var Utilities = require('Utilities');

var TransportCreep = function(creep, roomManager) {
	this.creep = creep;
	this.roomManager = roomManager;
}

TransportCreep.prototype.init = function() {
	this.save('role', 'TransportCreep');
    this.mode = this.load('mode');
}

TransportCreep.prototype.determineMode = function() {

    // FIRST: attempt to transport for miners if no link
    var links = this.roomManager.room.find(FIND_MY_STRUCTURES, {
        filter: (structures) => {
            return (structures.structureType == STRUCTURE_LINK);
        }
    });
    if (links == undefined || links.length < 1) {
        var minersInNeed = this.roomManager.room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return ((creep.memory.role == "MinerCreep") &&
                        (creep.subscribersOfType("TransportCreep") < MAX_TRANSPORTS_PER_MINER));
            }
        });
        if (minersInNeed != undefined && minersInNeed.length > 0) {
            var miner = minersInNeed[0];
            this.creep.subscribe(miner);
            this.save('tasks.targetMiner', miner.id);
            return CREEP_MODE_TRANSPORT_MINER_TO_STORAGE;
        }
    }

    // SECOND: transfers to spawn if needed. Also responsible for extensions.
    var spawns = this.roomManager.room.find(FIND_MY_STRUCTURES, {
        filter: (structures) => {
            return (structures.structureType == STRUCTURE_SPAWN &&
                    structures.energy < structures.energyCapacity &&
                    structures.subscribersOfType("TransportCreep") < MAX_TRANSPORTS_PER_SPAWN);
        }
    });
    if (spawns != undefined && spawns.length > 0) {
        var spawn = spawns[0];
        this.creep.subscribe(spawn);
        this.save('tasks.targetSpawn', spawn.id);
        return CREEP_MODE_TRANSPORT_STORAGE_TO_SPAWN;
    }

    // THIRD: transfer to towers if they need it
    var towers = this.roomManager.room.find(FIND_STRUCTURES, {
        filter: (structures) => {
            return (structures.structureType == STRUCTURE_TOWER &&
                    structures.energy < structures.energyCapacity * MIN_TOWER_REPAIR_RATIO &&
                    structures.subscribersOfType("TransportCreep") < MAX_TRANSPORTS_PER_TOWER);
        }
    });
    if (towers != undefined && towers.length > 0) {
        var tower = towers[0];
        this.creep.subscribe(tower);
        this.save('tasks.targetTower', tower.id);
        return CREEP_MODE_TRANSPORT_STORAGE_TO_TOWER;
    }

    // FOURTH: transports links to storage
    var links = this.roomManager.room.find(FIND_MY_STRUCTURES, {
        filter: (structures) => {
            return (structures.structureType == STRUCTURE_LINK &&
                    structures.energy > 0 &&
                    structures.subscribersOfType("MinerCreep") < 1 &&
                    structures.subscribersOfType("TransportCreep") < MAX_TRANSPORTS_PER_LINK);
        }
    });
    if (links != undefined && links.length > 0) {
        var link = links[0];
        //console.log("MINERS: " + link.subscribersOfType("MinerCreep"))
        this.creep.subscribe(link);
        this.save('tasks.targetLink', link.id);
        return CREEP_MODE_TRANSPORT_LINK_TO_STORAGE;
    }

    // FIFTH: transports storage to containers surrounding the controller
    var controllers = this.roomManager.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return ((structure.structureType == STRUCTURE_CONTROLLER) &&
                    (structure.subscribersOfType("TransportCreep") < MAX_TRANSPORTS_FOR_CONTAINERS));
        }
    });

    // Make sure there are containers to begin with
    var containers = this.roomManager.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store[RESOURCE_ENERGY] < structure.storeCapacity &&
                    structure.subscribersOfType("MinerCreep") < 1);
        }
    })

    if (containers != undefined && containers.length > 0 && controllers != undefined && controllers.length > 0) {
        var controller = controllers[0];
        this.creep.subscribe(controller);
        this.save('tasks.targetController', controller.id);
        return CREEP_MODE_TRANSPORT_STORAGE_TO_CONTAINERS;
    }

    // SIXTH: Look for RemoteMiners that don't have a transporter
    var remoteMiners = this.roomManager.creeps.filter(function(c) {
        return (c.creep.memory.role == "RemoteMinerCreep" &&
                c.creep.subscribersOfType("TransportCreep") < 1);
    })
    if (remoteMiners != undefined && remoteMiners.length > 0) {
        var remoteMiner = remoteMiners[0];
        this.creep.subscribe(remoteMiner.creep);
        this.save("tasks.targetRemoteMiner", remoteMiner.creep.id);
        return CREEP_MODE_TRANSPORT_REMOTE_MINER_TO_STORAGE;
    }

    // No tasks available right now
    return CREEP_MODE_UNKNOWN;
}

// Transports the dropped resources from miners, to the prefferedEnergyStorage 
// location in the room.
TransportCreep.prototype.transportMinerToStorage = function() {
    Utilities.exclaim(this.creep, "T.miner");
    if(this.load('fill')) {
        var target = undefined;
        var targets = this.roomManager.getPrefferedEnergyDropOff();
        
        if (targets != undefined && targets.length > 0) {
            target = targets[0];
        }

        if (target == undefined) {
            ////console.log(this.creep.name + " doesn't have a place to fill");
            return;
        }

        if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
    } else {
        var source = undefined;

        // Load current miner, else find new task
        if (this.load("tasks.targetMiner") != undefined) {
            source = Game.getObjectById(this.load("tasks.targetMiner"));
        } 

        // miner not found
        if (source == undefined) {
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

        var energy = source.pos.findInRange(FIND_DROPPED_ENERGY, 2);
        if (energy.length > 0) {
            if(this.creep.pickup(energy[0]) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(energy[0]);
            }
        } else {
            this.creep.moveTo(source);
        }
    }
}

TransportCreep.prototype.transportRemoteMinerToStorage = function() {
    Utilities.exclaim(this.creep, "T.remote");
    if(this.load('fill')) {
        var target = undefined;
        var targets = this.roomManager.getPrefferedEnergyDropOff();
        
        if (targets != undefined && targets.length > 0) {
            target = targets[0];
        }

        if (target == undefined) {
            ////console.log(this.creep.name + " doesn't have a place to fill");
            return;
        }

        if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
    } else {
        var source = undefined;

        // Load current miner, else find new task
        if (this.load("tasks.targetRemoteMiner") != undefined) {
            source = Game.getObjectById(this.load("tasks.targetRemoteMiner"));
        } 

        // miner not found
        if (source == undefined) {
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

        var energy = source.pos.findInRange(FIND_DROPPED_ENERGY, 2);
        if (energy.length > 0) {
            if(this.creep.pickup(energy[0]) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(energy[0]);
            }
        } else {
            this.creep.moveTo(source);
        }
    }
}

TransportCreep.prototype.transportStorageToTower = function() {
    Utilities.exclaim(this.creep, "T.tower");
    // Transport has energy to fill tower
    if(this.load('fill')) {
        var tower = undefined;
        if(this.load('tasks.targetTower') != undefined) {
            tower = Game.getObjectById(this.load('tasks.targetTower'));
        }
        if (tower == undefined) {
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

        // Once tower is full, quit the job
        if (tower.energy == tower.energyCapacity) {
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

        if (this.creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(tower);
        }

    // Transport is out of energy, go to preffered energy spot for more
    } else {
        var source = undefined;
        var sources = this.roomManager.getPrefferedEnergyDropOff();
        if (sources != undefined && sources.length > 0) {
            source = sources[0];
        } else {
            ////console.log(this.creep.name + " can't find any energy sources!")
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

        if (this.creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(source);
        }
    }
}

TransportCreep.prototype.transportStorageToSpawn = function() {
    Utilities.exclaim(this.creep, "T.spawn");
    // Transport has energy to fill spawns and extensions
    if(this.load('fill')) {
        var spawn = undefined;
        if(this.load('tasks.targetSpawn') != undefined) {
            spawn = Game.getObjectById(this.load('tasks.targetSpawn'));
        }
        if (spawn == undefined) {
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

        // Search for all extensions and spawns in the area and fill one
        //console.log(this.creep.name + " is trying to refill spawn")
        var target = spawn.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structures) => {
                return ((structures.structureType == STRUCTURE_SPAWN || 
                        structures.structureType == STRUCTURE_EXTENSION) && 
                        structures.energy < structures.energyCapacity)
            }
        });

        if (target != undefined) {
            if (this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            }
        } else {
            // No target nearby!
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

    // Transport is out of energy, go to preffered energy spot for more
    } else {
        var source = undefined;
        var sources = this.roomManager.getPrefferedEnergyPickUp({spawn: true});
        if (sources != undefined && sources.length > 0) {
            source = sources[0];
        } else {
            //console.log(this.creep.name + " can't find any energy sources!")
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

        if (this.creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(source);
        }
    }
}

TransportCreep.prototype.transportStorageToContainers = function() {
    Utilities.exclaim(this.creep, "T.container");
    // Transport has energy to fill containers
    if(this.load('fill')) {
        var controller = undefined;
        if(this.load('tasks.targetController') != undefined) {
            controller = Game.getObjectById(this.load('tasks.targetController'));
        }
        if (controller == undefined) {
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

        // Search for all extensions and spawns in the area and fill one
        var target = controller.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structures) => {
                return ((structures.structureType == STRUCTURE_CONTAINER) && 
                        structures.store[RESOURCE_ENERGY] < structures.storeCapacity &&
                        structures.room.name == this.creep.memory.srcRoom &&
                        structure.subscribersOfType("MinerCreep") < 1);
            }
        });

        if (target != undefined) {
            if (this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            }
        } else {
            // No target nearby!
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

    // Transport is out of energy, go to preffered energy spot for more
    } else {
        var source = undefined;
        var sources = this.roomManager.getPrefferedEnergyDropOff();
        if (sources != undefined && sources.length > 0) {
            source = sources[0];
        } else {
            //console.log(this.creep.name + " can't find any energy sources!")
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

        if (this.creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(source);
        }
    }
}

TransportCreep.prototype.transportLinkToStorage = function() {
    Utilities.exclaim(this.creep, "T.link");
    // Transport has energy to fill preffered storage
    if(this.load('fill')) {
        var target = undefined;
        var targets = this.roomManager.getPrefferedEnergyDropOff();
        
        if (targets != undefined && targets.length > 0) {
            target = targets[0];
        }

        if (target == undefined) {
            //console.log(this.creep.name + " doesn't have a place to fill");
            return;
        }

        if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        }
        
    // Transport is out of energy, go to link for more
    } else {
        var link = undefined;
        if(this.load('tasks.targetLink') != undefined) {
            link = Game.getObjectById(this.load('tasks.targetLink'));
        }
        if (link == undefined) {
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

        // Check if link is being used by a miner, if so its the wrong one!
        if (link.subscribersOfType("MinerCreep") > 0) {
            this.save('mode', CREEP_MODE_UNKNOWN);
            return;
        }

        if (this.creep.withdraw(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(link);
        }
    }
}

TransportCreep.prototype.doAction = function() {
    
    if (this.mode == undefined || this.mode == CREEP_MODE_UNKNOWN) {
        console.log(this.creep.name + " is looking for work!");
        this.mode = this.determineMode();
        this.save('mode', this.mode);
    }

    if(this.load('fill') && (this.creep.carry.energy == 0)) {
        this.save('fill', false);
        //Utilities.exclaim(this.creep, 'gather');
    }
    if(!this.load('fill') && (this.creep.carry.energy == this.creep.carryCapacity)) {
        this.save('fill', true);
        //Utilities.exclaim(this.creep, 'fill');
    }
    
     // Creep needs to get rid of the energy he has.
    switch(this.mode) {
        case(CREEP_MODE_TRANSPORT_MINER_TO_STORAGE):
            this.transportMinerToStorage();
            break;
        case(CREEP_MODE_TRANSPORT_STORAGE_TO_TOWER):
            this.transportStorageToTower();
            break;
        case(CREEP_MODE_TRANSPORT_STORAGE_TO_SPAWN):
            this.transportStorageToSpawn();
            break;
        case(CREEP_MODE_TRANSPORT_STORAGE_TO_CONTAINERS):
            this.transportStorageToContainers();
            break;
        case(CREEP_MODE_TRANSPORT_LINK_TO_STORAGE):
            this.transportLinkToStorage();
            break;
        case(CREEP_MODE_TRANSPORT_REMOTE_MINER_TO_STORAGE):
            this.transportRemoteMinerToStorage();
            break;
        default:
            Utilities.exclaim(this.creep, "T.none");
            this.creep.moveTo(Game.flags['breakroom-' + this.roomManager.room.name])
            //console.log(this.creep.name + " has nothing to do!");
    }

    // If no task, wipe memory
    this.mode = this.load('mode');
    if (this.mode == CREEP_MODE_UNKNOWN) {
        this.save('tasks', {});
        this.creep.scrub();
        //console.log(this.creep.name + " lost his job!")
    }
}

module.exports = TransportCreep;