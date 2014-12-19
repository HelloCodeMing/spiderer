var request = require('request');
var cheerio = require('cheerio');
var oftype  = require('oftype');
var color   = require('colors');
var URL		= require('url');

var config = { };
var taskQueue = [];
var urlDB = [];

function log(str) {
	if (!config.silent) {
		console.log(str);
	}
}

function insertNoRepeat(container, item) {
	if (container.indexOf(item) == -1)
		container.push(item);
}
function fetch(url) {
	insertNoRepeat(urlDB, url);
	request(url, function(err, res, body) {
		if (err || res.statusCode != 200) {
			log(("" + res.statusCode + "\t" + url).red);
		} else {
			log(("" + res.statusCode + "\t" + url).green);
			$ = cheerio.load(body);
			var nextTasks = config.filter(err, res, $);
			var urlObj = URL.parse(url);
			var prefix = urlObj.protocol + '//' + (urlObj.host || urlObj.hostname);
			if (nextTasks != null ) {
				for (var i = 0; i < nextTasks.length; i++) {
					var task = URL.resolve(prefix, nextTasks[i]);
					insertNoRepeat(taskQueue, task);
				}
			}
		}
	});
}

function start() {
	taskQueue = taskQueue.concat(config.startURLs);
	var intervalID = setInterval(function() {
		if (taskQueue.length != 0) {
			var tasks = taskQueue.splice(0, config.workerNum);
			tasks.forEach(function(url) {
				var host = URL.parse(url).host;
				if (config.domains.indexOf(host) != -1 && urlDB.indexOf(url) == -1) 
					fetch(url);
			});
		} else {
			clearInterval(intervalID);
			console.log('All tasks has been finished.');
		}
	}, config.interval);
}


function initialize(options) {
	if (!options.startURLs) {
		console.err('At least one URL must be specified!');
		return -1;
	}
	if (!options.filter) {
		console.error('Filter must be specified!');
		return -1;
	}
	config.filter = options.filter;
	config.domains = options.domains || [];
	config.startURLs = options.startURLs;
	config.interval = options.interval || 2 * 1000;
	config.workerNum = options.workerNum || 4;
	config.silent = options.silent || false;
}

module.exports = function(options) {
	this.start = start;
	this.config = config;
	initialize(options);
}
