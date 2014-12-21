var request = require('request');
var cheerio = require('cheerio');
var oftype  = require('oftype');
var color   = require('colors');
var URL		= require('url');
var log4js  = require('log4js');


var config = { };
var logger = {};
var taskQueue = [];
var urlDB = [];

function insertNoRepeat(container, item) {
	if (container.indexOf(item) == -1)
		container.push(item);
}
function fetch(url) {
	insertNoRepeat(urlDB, url);
	request(url, function(err, res, body) {
		if (err || res.statusCode != 200) {
			logger.warn("" + res.statusCode + "\t" + url);
		} else {
			logger.info("" + res.statusCode + "\t" + url);
			$ = cheerio.load(body);
			var nextTasks = config.filter(err, res, $);
			var urlObj = URL.parse(url);
			var prefix = urlObj.protocol + '//' + (urlObj.host || urlObj.hostname);
			if (nextTasks != null ) {
				for (var i = 0; i < nextTasks.length; i++) {
					var innerLink = nextTasks[i].split('/').some(function(item) { return item.indexOf('#') != -1} );
					if (!innerLink) {
						var task = URL.resolve(prefix, nextTasks[i]);
						insertNoRepeat(taskQueue, task);
					}
				}
			}
		}
	});
}

function start(end) {
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
			logger.info('All tasks has been finished.');
			if (end)
				end();
		}
	}, config.interval);
}


function initialize(options) {
	if (!options.startURLs) {
		logger.error('At least one URL must be specified!');
		return -1;
	}
	if (!options.filter) {
		logger.error('Filter must be specified!');
		return -1;
	}
	config.filter = options.filter;
	config.domains = options.domains || [];
	config.startURLs = options.startURLs;
	config.interval = options.interval || 2 * 1000;
	config.workerNum = options.workerNum || 4;
	config.silent = options.silent || false;
	config.log = options.log || true;
	// log or not 
	log4js.configure({
		appenders: [
			{ type: 'console', category: 'console'},
			{ type: 'dateFile', 
				filename: 'logs/spider.log', 
				pattern: 'yyyy-MM-dd',
				category: 'default'
			} 
		],
		replaceConsole: true
	});
	if (config.log)  {
		logger = log4js.getLogger('default');
	}
	else 
		logger = log4js.getLogger('console');
}

module.exports = function(options) {
	this.start = start;
	this.config = config;
	initialize(options);
}
