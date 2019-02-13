let pathToRegexp = require('path-to-regexp');

function Layer(path, handler) {
    this.path = path;
    this.handler = handler;
    this.keys = [];
    this.regexp = pathToRegexp(this.path, this.keys);
    
    //this.params
}

Layer.prototype.match = function (path) {
    if (path == this.path) {
        return true;
    }
    if (!this.route) {
        if (this.path == '/') {
            return true
        }
        return path.startsWith(this.path + '/');
    }
    
    if (this.route) {
        let matches = this.regexp.exec(path);
        this.params = {};
        if (matches) {
            for (let i = 1; i < matches.length; i++) {
                let key = this.keys[i - 1].name;
                let val = matches[i];
                this.params[key] = val;
            }
            return true;
        }
    }
    return false;
};

Layer.prototype.handle_request = function (req, res, next) {
    this.handler(req, res, next);
};
Layer.prototype.handle_error = function (err, req, res, next) {
    if (this.handler.length != 4) {//this.handler中传入的参数中没有err,就直接走下一层
        return next(err);
    }
    this.handler(err, req, res, next);
};

module.exports = Layer;