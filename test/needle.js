var needle = require('needle');

needle.get('http://blog.codingnow.com', function(err, res, body) {
        if (!err && res.statusCode == 200)
        console.log(body);
});
