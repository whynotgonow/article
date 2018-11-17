const express = require('../lib/express.js');
const app = express();

const path = require('path');
const html = require('../lib/html.js');


app.set('views', path.resolve(path.join(__dirname, 'views')));
app.set('view engine', 'html');
app.engine('html', html);

app.get('/', function (req, res, next) {
    res.render('index', {title: 'hello', users: [{name: 'Lucy'}, {name: 'LiLei'}, {name: 'Tom'}]});
});
app.listen(3000);