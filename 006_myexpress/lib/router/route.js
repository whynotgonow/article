let methods = require('methods');
let Layer = require('./layer');

function Route(path) {
    this.path = path;
    this.stack = [];
    this.methods = {};
}

methods.forEach(function (method) {
    Route.prototype[method] = function () {
        // 将arguments类数组 转化为数组
        let handlers = Array.prototype.slice.call(arguments);
        for (let i = 0; i < handlers.length; i++) {
            let layer = new Layer('/', handlers[i]);
            layer.method = method;
            this.stack.push(layer);
        }
        this.methods[method] = true;
        return this;
    }
});

Route.prototype.handle_method = function (method) {
    return this.methods[method.toLowerCase()];
};

Route.prototype.dispatch = function (req, res, out) {
    let idx = 0, self = this;
    
    function next(err) {
        if (err) {
            return out(err);
        }
        if (idx >= self.stack.length) {
            return out();
        }
        let layer = self.stack[idx++];
        if (layer.method == req.method.toLowerCase()) {
            layer.handle_request(req, res, next);
        } else {
            next();
        }
    }
    
    next();
};

module.exports = Route;