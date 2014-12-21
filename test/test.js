var Spider = require('../lib/index');

/**
 * @description: filter the html as a callback.
 */
function filter(err, res, $) {
	console.log($('title').html());
	var res = $('a[href]');
	if (res.map != undefined) {
		return res.map(function() {
			return $(this).attr('href');
		});
	}
}

var config = {
	domains: ['www.ruanyifeng.com'],
	startURLs: ['http://www.ruanyifeng.com'],
	filter: filter,
	interval: 2* 1000,
	log: true
};

var spider = new Spider(config);
spider.start(function() {
	console.log('the spider has been stopped.')
	process.exit();
});
