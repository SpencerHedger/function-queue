function-queue
==============

Create a queue of functions and run them with a callback when all report in that they are complete.

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
                an error object by the task)
