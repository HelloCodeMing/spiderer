var needle  = require('needle');
var cheerio = require('cheerio');
var oftype  = require('oftype');
var color   = require('colors');
var URL		= require('url');
var log4js  = require('log4js');
var iconv   = require('iconv-lite');


var config = {};
var logger = {};
var taskQueues = [];
var urlDB = [];

function insertNoRepeat(container, item) {
	if (container.indexOf(item) == -1)
		container.push(item);
}

function fetch(url) {
	insertNoRepeat(urlDB, url);
	var encodedURL = '';
	if (url.indexOf('%') == -1) {
		encodedURL = encodeURI(url);
	}
	else {
		encodedURL = url;
		url = decodeURI(url);
	}
	var req = {
		url: url,
		timeout: config.timeout,
	};
	needle.get(req.url, req, function(err, res, body) {;
		if (err || res.statusCode != 200) {
			if (err)
				logger.error("" + err + url);
			else
				logger.warn("" + res.statusCode + "\t" + url);
		} else {
			logger.info("" + res.statusCode + "\t" + url);
			var $ = cheerio.load(body);
			var nextTasks = config.filter(err, res, $);
			var urlObj = URL.parse(url);
			var prefix = urlObj.protocol + '//' + (urlObj.host || urlObj.hostname);
			if (nextTasks != null ) {
				for (var i = 0; i < nextTasks.length; i++) {
					var innerLink = nextTasks[i].split('/').some(function(item) { return item.indexOf('#') != -1} );
					if (!innerLink) {
						var task = URL.resolve(prefix, nextTasks[i]);
						var host = URL.parse(task).host;
						var taskQueue = taskQueues.filter(function(queue) {
							return queue.name === host;
						})[0];
						if (taskQueue)
							insertNoRepeat(taskQueue.tasks, task);
					}
				}
			}
		}
	});
}

function start(end) {
	var intervalID = setInterval(function() {
		// drop empty queue
		taskQueues = taskQueues.filter(function(queue) {
			return queue.tasks.length != 0;
		});
		if (taskQueues.length != 0) {
			var tasks = taskQueues.map(function(queue) {
				return queue.tasks.splice(0, 1)[0];
			});
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
	config.startURLs = options.startURLs;
	config.domains = options.startURLs.map(function(url) {
		return URL.parse(url).host;
	})
	config.interval = options.interval || 2 * 1000;
	config.silent = options.silent || false;
	config.log = options.log || true;
	config.domains.forEach(function(host) {
		taskQueues[host] = [];
	});
	config.timeout = options.timeout || 10 * 1000;
	// push all URLs into taskQueues
	config.startURLs.forEach(function(url) {
		var urlObj = URL.parse(url);
		var queue = new TaskQueue(urlObj.host);
		queue.tasks.push(url);
		taskQueues.push(queue);
	});
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

function TaskQueue(host) {
	this.name = host;
	this.tasks = [];
}

module.exports = function(options) {
	this.start = start;
	this.config = config;
	initialize(options);
}
