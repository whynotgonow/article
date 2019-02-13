let express = require('../lib/express');
let app = express();
app.listen(8080, () => {
    console.log('started success');
});
app.get('/', function (req, res) {
    res.end('ok');
});
