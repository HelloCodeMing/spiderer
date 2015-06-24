var Spider = require('../lib/index');

/**
 * @description: filter the html as a callback.
 */
function filter(err, response, $) {
	console.log($('title').text());
	var links = $('a[href]');
	if (links.map !== undefined) {
		return links.map(function() {
			return $(this).attr('href');
		});
	}
}

var config = {
    startURLs: ['http://wanghuanming.com'],
	filter: filter,
	interval: 2 * 1000,
	log: 'logs/spider.log'
};

var spider = new Spider(config);
spider.start(function() {
	console.log('the spider stopped.');
	process.exit();
});
