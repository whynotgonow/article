let methods = require('methods');
let Layer = require('./layer');
let Route = require('./route');
let url = require('url');
let init = require('../middle/init');

function Router() {
    function router(req, res, next) {
        router.handle(req, res, next);//派发到子路由中
    }
    
    Object.setPrototypeOf(router, proto);
    router.stack = [];
    router.paramCallbacks = {};
    router.use(init);
    return router;
}

let proto = Object.create(null);

proto.route = function (path) {
    let route = new Route(path);
    let layer = new Layer(path, route.dispatch.bind(route));
    layer.route = route;
    this.stack.push(layer);
    return route;
};

methods.forEach(function (method) {
    proto[method] = function (path) {
        let route = this.route(path);
        route[method].apply(route, Array.prototype.slice.call(arguments, 1));
        return this;
    }
});

proto.use = function (path, handler) {
    if (typeof handler != 'function') {
        handler = path;
        path = '/';
    }
    let layer = new Layer(path, handler);
    layer.route = undefined;
    this.stack.push(layer);
    return this;
};


proto.handle = function (req, res, out) {
    let idx = 0,
        self = this,
        removed = '',
        slashAdded = false;
    let {pathname} = url.parse(req.url, true);
    
    function next(err) {
        if (slashAdded) {
            req.url = '';
            slashAdded = false;
        }
        if (removed.length > 0) {
            req.url = removed + req.url;
            removed = '';
        }
        if (idx >= self.stack.length) {
            return out(err);
        }
        let layer = self.stack[idx++];
        
        if (layer.match(pathname)) {
            if (err) {
                layer.handle_error(err, req, res, next);
            } else {
                if (!layer.route) {// 中间件 层
                    removed = layer.path;
                    req.url = req.url.slice(removed.length);
                    if (req.url == '') {
                        req.url = '/';
                        slashAdded = true;
                    }
                    layer.handle_request(req, res, next);
                    
                } else if (layer.route.handle_method(req.method)) {// 路由层
                    req.params = layer.params;
                    self.process_param(layer, req, res, function () {
                        layer.handle_request(req, res, next);
                    });
                } else {
                    next();
                }
            }
        } else {
            next(err);
        }
    }
    
    next();
};

proto.param = function (name, handler) {
    if (!this.paramCallbacks[name]) {
        this.paramCallbacks[name] = [];
    }
    this.paramCallbacks[name].push(handler);
};

proto.process_param = function (layer, req, res, done) {
    if (!layer.keys || layer.keys.length == 0) {
        return done();
    }
    
    let keyIndex = 0, key, name, val, callbacks;
    let self = this;
    
    function param() {
        if (keyIndex >= layer.keys.length) {
            return done();
        }
        key = layer.keys[keyIndex++];
        name = key.name;
        val = req.params[name];
        callbacks = self.paramCallbacks[name];
        execCallback()
    }
    
    let callbackIndex = 0;
    
    function execCallback() {
        let cb = callbacks[callbackIndex++];
        if (!cb) {
            return param();
        }
        cb(req, res, execCallback, val, name);
    }
    
    param();
};


module.exports = Router;