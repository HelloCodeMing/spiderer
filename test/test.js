var Spider = require('../lib/index');

/**
 * @description: filter the html as a callback.
 */
function filter(err, res, $) {
	console.log($('title').html());
	var res = $('[href]');
	if (res.map != undefined) {
		return res.map(function() {
			return $(this).attr('href');
		});

	}
}

var config = {
	domains: ['wanghuanming.com'],
	startURLs: ['http://wanghuanming.com'],
	filter: filter,
	interval: 2* 1000
};

var spider = new Spider(config);
spider.start();
