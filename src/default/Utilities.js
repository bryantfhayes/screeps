var Utilities = {};

Utilities.extend = function(target, source) {
    for (var n in source) {
        if (!source.hasOwnProperty(n)) {
            continue;
        }
        if (target.hasOwnProperty(n)) {
            continue;
        }
        target[n] = source[n];
    }
}

Utilities.garbageCollection = function() {
    var counter = 0;
    for(var n in Memory.creeps) {
        var c = Game.creeps[n];
        if (c) {
            if (Memory.creeps[n].id == undefined) {
                Memory.creeps[n].id = c.id;
            }
        }
        if(!c) {
            Utilities.scrub(Memory.creeps[n].id)
            delete Memory.creeps[n];
            counter++;
        }
    }
}

Utilities.save = function(key, value) {
    try {
        Utilities._save(key, value, Memory);
    } catch(err) {
        console.log(err);
        return false;
    }
    return true;
}

// Underlying save function
Utilities._save = function(key, value, obj) {
    var keyArr = key.split(".");

    if (obj == undefined) {
        obj = {};
    }

    if (key == "") {
        return value;
    }

    var result = Utilities._save(keyArr.slice(1).join('.'), value, obj[keyArr[0]]);
    
    // Attempt to parse returned value. If primitive skip on fail
    try {
        result = JSON.parse(result);
    } catch (err) {

    }

    obj[keyArr[0]] = result;

    return(JSON.stringify(obj));
}

Utilities.load = function(key) {
    return Utilities._load(key, Memory)
}

Utilities._load = function(key, obj) {
    var keyArr = key.split(".");
    var retval = obj;

    for (var i = 0; i < keyArr.length; i++) {
        if (retval == undefined) {
            return undefined;
        }
        retval = retval[keyArr[i]]
    }

    return retval;
}

Utilities.scrub = function(thisId) {
    try {
        var subscriptionsPath = ["Subscriptions"].join(".");
        var thisToPath = ["Subscriptions", thisId, "subscribedTo"].join(".");
        var subscribedTo = Utilities.load(thisToPath);

        // For each object this object is subscribbed to...remove
        for(var id in subscribedTo) {
            var targetByPath = ["Subscriptions", id, "subscribedBy"].join(".");
            var targetSubscribedBy = Utilities.load(targetByPath);
            if (targetSubscribedBy) {
                if (targetSubscribedBy[thisId]) {
                    delete targetSubscribedBy[thisId];
                    Utilities.save(targetByPath, targetSubscribedBy);
                }
            }    

            var targetToPath = ["Subscriptions", id, "subscribedTo"].join(".");
            var targetSubscribedTo = Utilities.load(targetToPath);
            if (targetSubscribedTo) {
                if (targetSubscribedTo[id]) {
                    delete targetSubscribedTo[id];
                    Utilities.save(targetByPath, targetSubscribedBy);
                } 
            }    
        }

        // Clear this item from all subscriptions to save memory
        subscriptions = Utilities.load(subscriptionsPath);
        if (subscriptions) {
            if (subscriptions[thisId]) {
                delete subscriptions[thisId];
            }
        }
        Utilities.save(subscriptionsPath, subscriptions);
        
    } catch(err) {
        console.log(err);
    }
}

// Adds a subscriber to target RoomObject
RoomObject.prototype.subscribe = function(target) {
    try {

        if (this.id == undefined || target.id == undefined) {
            console.log("UNDEFINED!");
            console.log(JSON.stringify(target));
            console.log(JSON.stringify(this));
            return
        }

        var targetToPath = ["Subscriptions", target.id, "subscribedTo"].join(".")
        var targetByPath = ["Subscriptions", target.id, "subscribedBy"].join(".")
        var thisToPath = ["Subscriptions", this.id, "subscribedTo"].join(".")
        var thisByPath = ["Subscriptions", this.id, "subscribedBy"].join(".")

        // Add this.id to target's subscribedBy field
        var targetSubscribers = Utilities.load(targetByPath);
        
        if (targetSubscribers) {
            targetSubscribers[this.id] = true;
            Utilities.save(targetByPath, targetSubscribers);
        } else {
            Utilities.save(targetByPath, {[this.id] : true})
        }
        
        // Add target.id to this objects SubscribedTo field
        var thisSubscriptions = Utilities.load(thisToPath);
        if (thisSubscriptions) {
            thisSubscriptions[target.id] = true;
            Utilities.save(thisToPath, thisSubscriptions);
        } else {
            Utilities.save(thisToPath, {[target.id] : true});
        }
       
    } catch(err) {
        console.log(err);
    }
    
}

// Removes all subscribedBy and subscribedTo links
RoomObject.prototype.scrub = function() {
    Utilities.scrub(this.id);
}

RoomObject.prototype.unsubscribe = function(target) {
    try {
        // Remove subscribe to field from this.object
        var thisToPath = ["Subscriptions", this.id, "subscribedTo"].join(".");
        var subscribedTo = Utilities.load(thisToPath);
        if (subscribedTo) {
            if (subscribedTo[target.id]) {
                delete subscribedTo[target.id];
                Utilities.save(thisToPath, subscribedTo);
            }
        }

        // Remove subscribedBy reference on target
        var targetByPath = ["Subscriptions", target.id, "subscribedBy"].join(".");
        var subscribedBy = Utilities.load(targetByPath);
        if (subscribedBy) {
            if (subscribedBy[this.id]) {
                delete subscribedBy[this.id];
                Utilities.save(targetByPath, subscribedBy);
            }
        }

    } catch(err) {
        console.log(err)
    }
}

RoomObject.prototype.subscribers = function() {
    var subscribers = Utilities.load(["Subscriptions", this.id, "subscribedBy"].join('.'));
    return subscribers;
}

RoomObject.prototype.subscriptions = function() {
    var subscriptions = Utilities.load(["Subscriptions", this.id, "subscribedTo"].join('.'));
    return subscriptions;
}

RoomObject.prototype.subscriptionsCount = function() {
    var subscriptions = Utilities.load(["Subscriptions", this.id, "subscribedTo"].join('.'));
    if (subscriptions == undefined) {
        return 0;
    }
    return Object.keys(subscriptions).length
}

RoomObject.prototype.subscribersCount = function() {
    var subscribers = Utilities.load(["Subscriptions", this.id, "subscribedBy"].join('.'));
    if (subscribers == undefined) {
        return 0;
    }
    return Object.keys(subscribers).length;
}

RoomObject.prototype.subscribersOfType = function(type) {
    try {
        var idArr = Object.keys(this.subscribers()).filter(function(id){
            try {
                if(Game.getObjectById(id).memory.role == type) {
                    return true;
                } else {
                    return false;
                }
            } catch(err) {
                return false;
            }
        });
        return idArr.length;
    } catch(err) {
        console.log(err);
        return 0;
    }
}

Utilities.getCreepsOfType = function(type) {
    var retval = Game.rooms['W7N4'].find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return(creep.memory.role == type);
        }
    })
    return retval;
}
module.exports = Utilities;