let config = require('./config');
let http = require('http');
let chalk = require('chalk');
let path = require('path');
let url = require('url');
let fs = require('fs');
let zlib = require('zlib');
let handlebars = require('handlebars');
let {promisify, inspect} = require('util');
let mime = require('mime');
let stat = promisify(fs.stat);
let readdir = promisify(fs.readdir);
let debug = require('debug')('static:app');


//编译模板，得到一个渲染的方法,然后传入实际数据数据就可以得到渲染后的HTML
function list() {
    let tmpl = fs.readFileSync(path.resolve(__dirname, 'template', 'list.html'), 'utf8');
    return handlebars.compile(tmpl);
}

// 创建一个Server 类
class Server {
    constructor(argv) {
        this.list = list();
        this.config = Object.assign({}, config, argv);
    }
    
    start() {
        let server = http.createServer();
        server.on('request', this.request.bind(this));
        server.listen(this.config.port, () => {
            let url = `http://${this.config.host}:${this.config.port}`;
            debug(`server started at ${chalk.green(url)}`);
        });
    }
    
    //静态文件服务器
    async request(req, res) {
        /*
        1 对比缓存
            client -- if-modified-since --> server
            client <-- Last-Modified -- server
            
         
            client -- if-none-match --> server
            client <-- ETag -- server
            
         2 压缩 
            
            client -- accept-encoding --> server
            client <-- Content-Encoding -- server
            
         3 断点续传
         
            client -- range --> server
            client <-- Accept-Range -- server
            
        */
        
        let {pathname} = url.parse(req.url);
        if (pathname == '/favicon.ico') {
            return this.sendError('not found', req, res);
        }
        let filepath = path.join(this.config.root, pathname);
        try {
            let statObj = await stat(filepath);
            if (statObj.isDirectory()) { //如果是目录的话，显示目录下面的文件列表
                let files = await readdir(filepath);
                files = files.map(file => ({
                    name: file,
                    url: path.join(pathname, file)
                }));
                let html = this.list({
                    title: pathname,
                    files
                });
                res.setHeader('Content-Type', 'text/html;charset=utf8');
                res.end(html);
            } else {
                this.sendFile(req, res, filepath, statObj);
            }
        } catch (e) {
            debug(inspect(e));
            this.sendError(e, req, res);
        }
    }
    
    sendFile(req, res, filepath, statObj) {
        res.setHeader('Content-Type', mime.getType(filepath) + ';charset=utf-8');
        res.setHeader('Content-Encoding', 'gzip');
        // 是否缓存
        if (this.handleCache(req, res, filepath, statObj)) return; //如果走缓存，则直接返回
        
        let encoding = this.getEncoding(req, res);
        
        let rs = this.getStream(req, res, filepath, statObj);
        
        if (encoding) {
            rs.pipe(encoding).pipe(res);
        } else {
            rs.pipe(res);
        }
    }
    
    // 实现缓存
    handleCache(req, res, filepath, statObj) {
        let ifModifiedSince = req.headers['if-modified-since'];
        let isNoneMatch = req.headers['if-none-match'];
        
        let etag = statObj.size;
        res.setHeader('ETag', etag);
        let lastModified = statObj.ctime.toGMTString();
        res.setHeader('Last-Modified', lastModified);
        
        res.setHeader('Cache-Control', 'private,max-age=30');
        res.setHeader('Expires', new Date(Date.now() + 30 * 1000).toGMTString());
        
        if ((ifModifiedSince && ifModifiedSince == lastModified) && (isNoneMatch && isNoneMatch == etag)) {
            res.writeHead(304);
            res.end();
            return true;
        } else {
            return false;
        }
        
        
      
    }
    
    // 实现压缩
    getEncoding(req, res) {
        //Accept-Encoding:gzip, deflate
        let acceptEncoding = req.headers['accept-encoding'];
        if (/\bgzip\b/.test(acceptEncoding)) {
            res.setHeader('Content-Encoding', 'gzip');
            return zlib.createGzip();
            
        } else if (/\bdeflate\b/.test(acceptEncoding)) {
            res.setHeader('Content-Encoding', 'deflate');
            return zlib.createDeflate();
            
        } else {
            return null;
        }
    }
    
    // 实现断点续传
    getStream(req, res, filepath, statObj) {
        let start = 0;
        let end = statObj.size - 1;
        
        let range = req.headers['range'];
        if (range) {
            res.setHeader('Accept-Range', 'bytes');
            res.statusCode = 206;//返回整个内容的一块
            let result = range.match(/bytes=(\d*)-(\d*)/);
            if (result) {
                start = isNaN(result[1]) ? start : parseInt(result[1]);
                end = isNaN(result[2]) ? end : parseInt(result[2]) - 1;
            }
        }
        return fs.createReadStream(filepath, {
            start, end
        });
    }
    
    
    sendError(err, req, res) {
        res.statusCode = 500;
        res.end(`${err.toString()}`);
    }
    
}

module.exports = Server;
