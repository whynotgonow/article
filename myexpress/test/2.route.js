const express = require('../lib/express');
const app = express();


app.get('/', function (req, res, next) {
    console.log(1);
    next();
}, function (req, res, next) {
    console.log(11);
    next();
}).get('/', function (req, res, next) {
    console.log(2);
    next();
}).get('/', function (req, res, next) {
    console.log(3);
    res.end('ok');
}).get('/', function (err, req, res, next) {
    res.end('catch: ' + err);
});
app.listen(3000);