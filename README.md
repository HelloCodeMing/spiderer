spiderer
----
## description
A light-weight framework of spider implemented in node.js.

## example
```javascript
var Spider = require('spiderer');

function filter(err, res, $) {
	console.log($('title').html());
	var res = $('[href]');
	if (res.map) {
		return res.map(function() {
				return $(this).attr('href');
		});
	}
}
var config = {
	domains: ['wanghuanming.com'],
	startURLs: ['http://wanghuanming.com'],
	interval: 4 * 1000,
	filter: filter,
	log: true
}

var spider = new Spider(config);
spider.start();
```

## configuration
- filter
	You need to specified a filter, which receive a $ (jquery) and response, return a selector from $. If not provided, spider will crawl all URLs in html. This is the most import function, which should do some valuable jobs.
- domains
	Domains those be allowed.
- startURLs
	spider will start from there URLs.
- interval
	spider working interval. Default to be 2 * 1000.
- workerNum
	Num of spiders. Default to be 4.
- log	
	Log or not, if true, log infos will be stored in log/file.
