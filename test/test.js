var Spider = require('../lib/index');

/**
 * @description: filter the html as a callback.
 */
function filter(err, res, $) {
	console.log($('title').text());
	var res = $('a[href]');
	if (res.map != undefined) {
		return res.map(function() {
			return $(this).attr('href');
		});
	}
}

var config = {
	startURLs: ['http://andrewliu.tk/', 'http://wanghuanming.com'],
	filter: filter,
	interval: 4 * 1000,
	log: true
};

var spider = new Spider(config);
spider.start(function() {
	console.log('the spider has been stopped.')
	process.exit();
});
