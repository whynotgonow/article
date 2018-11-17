let url = require('url');
module.exports = function (req, res, next) {
    let {pathname, query} = url.parse(req.url, true);
    req.path = pathname;
    req.query = query;
    
    res.json = function (obj) {
        res.setHeader('Content-Type', 'application/json;charset=utf8');
        const str = JSON.stringify(obj);
        res.end(str);
    };
    
    res.render = function (filepath, options, callback) {
        let self = this;
        let done = function (err, html) {
            res.setHeader('Content-Type', 'text.html;charset=utf-8');
            res.end(html);
        };
        res.app.render(filepath, options, callback || done);
    };
    
    next();
};