/*
   FuncQueue by Spencer Hedger.
   
   Queue up a series of functions and run them all consecutively, with an optional callback when
   all functions report that they are complete.
   
   Each function must report when it is finished by calling a "complete" function which is
   passed when the task is called by the queue. The complete function accepts an optional
   data result object.
   An "error" function is also passed as a second argument so that a function can report to
   the queue that something has gone wrong (along with an optional error object).
   
   To run the queued functions, call "run" on the queue. A success function can be specified
   as an argument, this will be called when all tasks have reported in as completed and
   is passed an array containing an entry for each task in the queue. This array is
   guaranteed to be in the same order as tasks were added to the queue, no matter what
   order tasks completed in (or even if they didn't complete at all).
   Any task that does not report data will have a null entry in the array.
   If any of the queued functions call their error function, the success function will not
   be called, unless the queue was created with the ignoreErrors parameter set to true.
   
   Params object can be passed to the "create" function:
    ignoreErrors	If true, call success function even if some functions report errors
    timeout			Time in ms to allow before completion is considered to have failed
    onTimeout		Function to call if timeout occurs
    onError			Function to call if an error occurs (function is optionally passed
*/
var FuncQueue = function() {
	function create(params) {
		var _q = [];
		var _c = null;
		var _timeoutEvent = null;
		var _ignoreErrors = false;
		
		function done(task, data) {
			task.ready = true;
			task.data = data;
			
			var ready_count = 0;
			for(var i = 0; i < _q.length; i++) {
				if(_q[i].ready) { ready_count++; }
				else return;
			}
		
			if(ready_count == _q.length) {
				if(_timeoutEvent != null) clearTimeout(_timeoutEvent); // Cancel the timeout
				if(_c != null) {
					var results = [];
					
					for(var i = 0; i < _q.length; i++) {
						results.push(_q[i].data);
					}
					
					_c(results); // Call the success function, passing any results
				}
			}
		}
	
		function error(t, message) {
			if(!_ignoreErrors) _c = null; // Ensure success callback cannot be called
			
			// Set task ready but data is null 
			t.ready = true;
			t.data = null;
			
			if(params != undefined && params.onError != undefined && params.onError != null) {
				params.onError(message);
			}
		}
	
		function add(task) {
			_q.push({ task: task, ready: false, error: null });
		}
	
		// Create a closure function for success of task
		function createTaskDoneFunction(task) {
			var t = task;
			return function(data) { done(t, (data == undefined)? null : data); };
		}
	
		// Create a closure function for error of task
		function createTaskErrorFunction(task) {
			var t = task;
			return function(message) { error(t, (message == undefined)? null : message); } 
		}
		
		function run(callback) {
			if(callback != undefined) _c = callback;
			else _c = null;
			
			for(var i = 0; i < _q.length; i++) {
				var t = _q[i];
				t.task(createTaskDoneFunction(t), createTaskErrorFunction(t));
			}
		}
	
		if(params != undefined && params != null) {
			// Optionally ignore errors, default is to stop on errors.
			if(params.ignoreErrors == true) _ignoreErrors = true;
			
			// Timeout?
			if(params.timeout != undefined && params.timeout != null) {
				_timeoutEvent = setTimeout(function() {
						_c = null; // Ensure success callback cannot be called
						if(params.onTimeout != undefined && params.onTimeout != null) params.onTimeout(); // Call the timeout function
					}, params.timeout);
			}
		}
	
		return {
			add: add, // Add a new task, function will be called when queue runs and will be passed a callback function
			run: run  // Run the queue of tasks
		};
	}
	
	return {
		create: create // Create a new task queue, parameter object is optional
	};
}();
