const express = require('express');
const path = require('path');
//const html = require('../lib/html');
const app = express();
const fs = require('fs');
console.log(path.resolve('views'));

app.set('views',path.resolve(path.join(__dirname, 'views')));
app.set('view engine','html');
app.engine('html',require('ejs').__express);

app.get('/',function(req,res,next){
    res.render('index',{title:'hello',user:{name:'lucy'}});
});
app.listen(3000);