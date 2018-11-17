let methods = require('methods');
let Router = require('./router/index.js');
let http = require('http');
let path = require('path');

function Application() {
    this.settings = {}; // 保存参数
    this.engines = {} // 保存文件扩展名 + 渲染函数的函数
}

Application.prototype.set = function (key, val) {
    //一个参数表示获取， 两个参数表示设置
    if (arguments.length == 1) {
        return this.settings[key];
    }
    this.settings[key] = val;
};

// 规定 何种文件 用 何种方法来渲染
Application.prototype.engine = function (ext, render) {
    let extension = ext[0] == '.' ? ext : '.' + ext;
    this.engines[extension] = render;
};

// 模板引擎
Application.prototype.render = function (name, options, callback) {
    let type = '.' + this.get('view engine');
    name = name.includes('.') ? name : name + type;
    
    let render = this.engines[type];
    
    let file = path.join(this.get('views'), name);
    
    render(file, options, callback);
};

// 懒加载Router的实例
Application.prototype.lazyrouter = function () {
    if (!this._router) {
        this._router = new Router()
    }
};


// 路由
methods.forEach(function (method) {
    Application.prototype[method] = function () {
        if (method == 'get' && arguments.length == 1) {
            return this.set(arguments[0]);
        }
        this.lazyrouter();
        this._router[method].apply(this._router, Array.prototype.slice.call(arguments));
        return this;
    }
});


// 中间件
Application.prototype.use = function (path, handler) {
    if (typeof handler != 'function') {
        handler = path;
        path = '/';
    }
    this.lazyrouter();
    this._router.use(path, handler);
    return this;
};

// 客户端发起请求时，监听的函数
Application.prototype.listen = function () {
    let self = this;
    let server = http.createServer(function (req, res) {
        function done() {
            res.end(`cannot ${req.method} ${req.url}`);
        }
        
        
        res.app = self;
        self._router.handle(req, res, done);
    });
    server.listen(...arguments);
};

// 批量设置相同参数的回调函数
Application.prototype.param = function () {
    this.lazyrouter();
    this._router.param.apply(this._router, arguments);
    return this;
};


module.exports = Application;