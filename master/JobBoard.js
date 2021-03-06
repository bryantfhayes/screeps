var Utilities = require('Utilities')

function JobBoard(room) {
	this.room = room
	this.jobTypes = {
		BUILD_CREEP: "Build a creep",
		HARVEST_REQUEST: "Miners requested at source",
		BUILD_ROAD: "Build a road"
	}
	this.jobs = {};

	this.init()
};

JobBoard.prototype.init = function() {
	this.jobs = Utilities.load("JobBoard", this.jobs);
	if (this.jobs == undefined) {
		this.jobs = {};
	}
};

JobBoard.prototype.addJob = function(jobtype, jobpriority, jobargs) {
	// Create a new job
	job = {
		type: jobtype,
		priority: jobpriority,
		args: jobargs
	}

	json = JSON.stringify(job)
	hash = Utilities.hashString(json)

	// Add job to the list if it isn't already there
	if (hash in this.jobs) {
		
	} else {
		console.log("ADDED JOB - " + JSON.stringify(job))
		job.hash = hash
		job.started = false
		job.assignee = undefined
		this.jobs[hash] = job
	}

	// Save jobs
	Utilities.save("JobBoard", this.jobs);
};

JobBoard.prototype.removeJob = function(jobtype, jobpriority, jobargs) {
	// Create a new job object to hash (need to get the hash to find it)
	job = {
		type: jobtype,
		priority: jobpriority,
		args: jobargs
	}

	json = JSON.stringify(job)
	hash = Utilities.hashString(json)

	console.log("REMOVE JOB - " + JSON.stringify(job))

	self.removeJobByHash(hash)
};

JobBoard.prototype.startJobByHash = function(hash) {
	this.jobs[hash].started = true
	Utilities.save("JobBoard", this.jobs);
}

JobBoard.prototype.assignJobByHash = function(hash, id) {
	if (hash in this.jobs) {
		//console.log("Assigning job to: " + id + " for job " + hash)
		this.jobs[hash].assignee = id
		Utilities.save("JobBoard", this.jobs);
	} else {
		//console.log("Attempting to assign to unknown job: " + hash)
	}
	
}

JobBoard.prototype.getJobForAssignee = function(assignee) {
	for (var hash in this.jobs) {
		job = this.jobs[hash]
		if (job.assignee == assignee) {
			return job
		}
	}

	return undefined
}

JobBoard.prototype.removeJobByHash = function(hash) {
	// Add job to the list if it isn't already there
	if (hash in this.jobs) {
		console.log("FINISHED JOB - " + JSON.stringify(this.jobs[hash]))
		delete this.jobs[hash]
	} else {
		console.log("Job not found, cannot delete!")
	}

	// Save jobs
	Utilities.save("JobBoard", this.jobs);
}

/**
 * Iterate over all jobs and return the highest priority job that meets the specified type
 */
JobBoard.prototype.getAvailableJobOfType = function(type) {
	selectedJob = undefined
	for (var hash in this.jobs) {
		job = this.jobs[hash]
		if (job.type == type && job.assignee == undefined && job.started !== true) {
			// if no other candidate, return this one, otherwise compare priority
			if (selectedJob == undefined) {
				selectedJob = job
			} else {
				if (selectedJob.priority < job.priority) {
					selectedJob = job
				}
			}
		}
	}

	// Either return an applicable job, or undefined
	return selectedJob
}

module.exports = JobBoard;
