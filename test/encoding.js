var request = require('request');
var iconv = require('iconv-lite');

var config = {
    url: 'http://blog.codingnow.com',
    encoding: null
};
request(config, function(err, res, body) {
    if (!err && res.statusCode == 200)
        console.log(iconv.decode(body, 'gb2312').toString());
    else
        console.log(err);
});
