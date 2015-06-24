spiderer
----
## description
A light-weight framework of spider implemented in node.js.

You could crawl many pages at the same time, to make full use of the network IO. But you have to be careful with the minimum interval, if too small, your IP address may be blocked.

## example
```javascript
var Spider = require('spiderer');

function filter(err, res, $) {
	console.log($('title').text());
	var links = $('a[href]');
	if (links) {
		return links.map(function() {
			return $(this).attr('href');
		});
	}
}
var config = {
	startURLs: ['http://wanghuanming.com'],
	interval: 4 * 1000,
	filter: filter,
	logfile: 'logs/spider.log'
}

var spider = new Spider(config);
spider.start();
```

## configuration
- filter
	You need to specified a filter, which receive a $ (jquery) and response, return a selector from $. If not provided, spider will crawl all URLs in html. This is the most import function, which should do some valuable jobs.
- startURLs
	spider will start from these URLs.
- interval
	spider working interval. Default to be 2 * 1000.
- log	
	Log or not, if true, log infos will be stored in log/file.
- timeout
	request timeout.
