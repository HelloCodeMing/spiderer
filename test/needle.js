var needle = require('needle');

needle.get('https://www.byvoid.com', function(err, res) {
        if (!err && res.statusCode == 200)
            console.log(typeof res.body == 'string');
});
