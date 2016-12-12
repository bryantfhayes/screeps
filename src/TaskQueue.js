var Utilities = require('Utilities');
var firstBy = require('FirstBy');

var tasks = [];
var tasksPath = ""

// Constructor
// root: location in memory to start [Tasks]
// ex) "MyRooms.w7n4"
// would create: Memory.MyRooms.w7n4.Tasks = []
function TaskQueue(root) {
	if (root == undefined) {
		tasksPath = "GlobalTasks.Tasks"
	} else {
		tasksPath = root + ".Tasks";
	}
	if (Utilities.load(tasksPath) == undefined) {
		Utilities.save(tasksPath, []);
	}
} 

// Returns bool which says whether or not a new task
// should be added.
TaskQueue.prototype.canAddTask = function(newTask) {
	if (newTask.poster_id == undefined || newTask.poster_id == TASK_UNDEFINED) {
		return false;
	}
	tasks = Utilities.load(tasksPath);
	tasksWithId = tasks.filter(function(t) {
		return (t.poster_id == newTask.poster_id);
	});

	if (tasksWithId == undefined || tasksWithId.length == 0) {
		return true;
	} else {
		return false;
	}
}

TaskQueue.prototype.addTask = function(task) {
	// A task is a javascript object containing everything
	// about the job.
	tasks = Utilities.load(tasksPath)
	tasks.push(task);
	Utilities.save(tasksPath, tasks);
}

TaskQueue.prototype.getTaskList = function() {
	tasks = Utilities.load(tasksPath)
	return tasks;
}

TaskQueue.prototype.markTaskAsDoneForId = function(id) {
	tasks = Utilities.load(tasksPath);
	
	var tasksWithoutId = tasks.filter(function(t) {
		return (t.poster_id != id);
	});

	var tasksWithId = tasks.filter(function(t) {
		return (t.poster_id == id);
	});

	if (tasksWithId == undefined || tasksWithId.length != 1) {
		return false;
	}

	var task = tasksWithId[0];
	task.done = true;

	tasksWithoutId.push(task);
	Utilities.save(tasksPath, tasksWithoutId);
	return true
}

TaskQueue.prototype.claimTaskForId = function(id) {
	tasks = Utilities.load(tasksPath);
	
	var tasksWithoutId = tasks.filter(function(t) {
		return (t.poster_id != id);
	});

	var tasksWithId = tasks.filter(function(t) {
		return (t.poster_id == id);
	});

	if (tasksWithId == undefined || tasksWithId.length != 1) {
		return false;
	}

	var task = tasksWithId[0];
	task.responders += 1;

	tasksWithoutId.push(task);
	Utilities.save(tasksPath, tasksWithoutId);
	return true
}

TaskQueue.prototype.newTask = function() {
	return {
		poster_id: TASK_UNDEFINED,
		type: TASK_UNDEFINED,
		subtype: TASK_UNDEFINED,
		duration: TASK_UNDEFINED,
		priority: TASK_UNDEFINED,
		responders: 0,
		max_responders: TASK_UNDEFINED,
		done: false,
		created_time: Game.time,
		requirements: {}
	}
}

TaskQueue.prototype.removeDoneTasks = function() {
	tasks = Utilities.load(tasksPath);
	var temp = tasks.filter(function(t) {
		return (t.done == false);
	})
	tasks = temp;
	Utilities.save(tasksPath, tasks);
}

TaskQueue.prototype.getPriorityTaskOfType = function(type) {
		tasks = Utilities.load(tasksPath);

	    // Filter for TASK_NEED_CREEP
        var filteredTasks = tasks.filter(function(t) {
            return ((t.done == false) && (t.responders < t.max_responders) && (t.type == type));
        });

        // Sort by priority, then time
        filteredTasks.sort(
            firstBy(function(v){return(v.priority)}, -1)
            .thenBy(function(v){return(v.created_time)}));

        return filteredTasks;
}


// EXAMPLE USAGE
// var testTask = this.taskQueue.newTask();
// testTask.priority = TASK_PRIORITY_MEDIUM;
// testTask.requirements = {hits: 10000};
// testTask.max_responders = 2;
// if (this.taskQueue.canAddTask(testTask)) {
//     console.log("Adding new task...");
//     this.taskQueue.addTask(testTask);
// }

module.exports = TaskQueue;