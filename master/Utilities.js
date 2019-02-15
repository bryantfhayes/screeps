var Utilities = {};

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

Utilities.getCreepsOfType = function(type) {
    var retval = Game.rooms['W7N4'].find(FIND_MY_CREEPS, {
        filter: (creep) => {
            return(creep.memory.role == type);
        }
    })
    return retval;
}

Utilities.hashString = function(string) {
  var hash = 0, i, chr;
  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i++) {
    chr   = string.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0;
  }

  return hash.toString(16);
};

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
};

module.exports = Utilities;