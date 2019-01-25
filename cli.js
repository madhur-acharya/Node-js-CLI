/*
A simple CLI (Command Line Interface) that displays system stats and other information
It works be setting user defined key words that the CLI can recognize. 
whenever a pirticular keyword is entered into the command line,
the CLI triggers an event which then can be used to start certain processes and operations

to add a new keyword, just update the "inputs" array in the "cli.process_input" function,
create an event by calling cli_events.on('<YOUR_KEY_WORD>', (<INPUT_VARIABLES>) => cli.responders.<YOUR_KEY_WORD>());
and then create a responder function and bind it to that event
*/

const readline= require('readline');//used to read string off of the commadn line
const events= require('events');//create and handle custom events
const os = require('os');//used to get the Operating system stats(not required for the CLI)
const v8 = require('v8');//used to get server stats (not required for the CLI)

class _events extends events{};
var cli_events= new _events();
var cli= {};
cli.responders= {};

//event responder functions-----------------------------------------------------------------------------------------------
//these functions are triggered when cretain keywords are entered.
cli.responders.kill= () => process.exit(0); //kills the server
cli.responders.hello= () => console.log("Hello, how are you!");//friendly greeting
cli.responders.test= (parameters) => {//prints back the variable entered. can also take in multiple parameters
	let v= parameters.split('--');
	for(let j= 1; j < v.length; j++)
		console.log(v[j]);
};
cli.responders.help= function()//displays all acceptable commands
{
	let commands= {
		"help" : "displays all acceptable commands with a brief discription",
		"hello" : "friendly greeting",
		"kill" : "kills the server",
		"stats" : "Get statistics on the underlying operating system and resource utilization",
		"test --{parameters}" : "prints back the variable entered. can also take in multiple parameters"
		//example "test --apples" will print put apples.
		//"test --apples --oranges" will print out apples \n oranges.
	};
	//display information onm the command line keys will be in white, values will be  in yellow
	for(var key in commands)
	{
		if(commands.hasOwnProperty(key))
		{//below are just some instructions to make the looging look pretty
			var value = commands[key];
			var line = '\x1b[33m '+key+'\x1b[0m';
			var padding = 60 - line.length;
			for (i = 0; i < padding; i++) 
				line+=' ';
			line+=value;
			console.log(line);//display information
		}
	}
}

cli.responders.stats = function()//Get statistics on the underlying operating system and resource utilization
{
	// Compile an object of stats
	var stats = 
	{
		'Load Average' : os.loadavg().join(' '),
		'CPU Count' : os.cpus().length,
		'Free Memory' : os.freemem(),
		'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
		'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
		'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
		'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
		'Uptime' : os.uptime()+' Seconds'
	};
	console.log('SYSTEM STATISTICS');
	for(var key in stats)
	{//below are just some instructions to make the looging look pretty
		if(stats.hasOwnProperty(key))
		{
			var value = stats[key];
			var line = '\x1b[33m '+key+'\x1b[0m';
			var padding = 60 - line.length;
			for (i = 0; i < padding; i++) 
			    line+= ' ';
			line+= value;
			console.log(line);//display information
		}
	}
};

//responder events------------------------------------------------------------------------------------
//functions that are called when a used defined key word is entered
cli_events.on('hello', () => cli.responders.hello());
cli_events.on('help', () => cli.responders.help());
cli_events.on('kill', () => cli.responders.kill());
cli_events.on('stats', () => cli.responders.stats());
cli_events.on('test', (parameters) => cli.responders.test(parameters));

//enent binder-----------------------------------------------------------------------------------------------------
cli.process_input= function(string)
{
	string= typeof(string) === "string" && string.trim().length > 0 ? string.trim() : false;
	if(string)
	{
		//codify strings and handle them.
		var inputs= ["help", "hello", "kill", "stats", "test"], flag= false;
		inputs.some(function(i)
		{
			if(string.toLowerCase().indexOf(i) > -1)
			{
				flag= true;
				cli_events.emit(i, string);
				return 1;
			}
		});
		if(!flag) console.log("Whoops, invalid keyword!");
	}
}

//initialize the CLI-------------------------------------------------------------------------------------------------
cli.init= function()
{
	console.log('\x1b[36m%s\x1b[0m', "CLI running... ");
	var interface= readline.createInterface({//create interface
		input: process.stdin,//read string from the command line
		output: process.stdout,//print string to the command line
		prompt: ">>"//the characters used to signify that the command line is active(can be any set of characters you want)
	});
	interface.prompt();//start the prompt
	interface.on('line', function(str)//handle interface instructions
	{
		cli.process_input(str);//re-initialize prompt
		interface.prompt();//handler to kill process
	});
	interface.on('close', () => process.exit(0));
}

module.exports= cli;