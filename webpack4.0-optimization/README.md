# webpack4.0优化那些事儿
## 一 缩小文件搜索范围
### 1 include & exclude
#### 1) action
- 限制编译范围

#### 2) useage
```
module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader?cacheDirectory'],
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/
            }
        ]
    }
```

> 'babel-loader?cacheDirectory'

You can also speed up babel-loader by as much as 2x by using the cacheDirectory option. This will cache transformations to the filesystem.

#### QA
##### 命令行warning

> [BABEL] Note: The code generator has deoptimised the styling of "/Users/xxx/Documents/xxx/webpack_test/test3/node_modules/lodash/lodash.js" as it exceeds the max of "500KB".

加上exclude限制范围就不会报错了


### 2 resolve.modules
#### 1) action
- Tell webpack what directories should be searched when resolving modules.

#### 2) useage
```
resolve: {
    modules: [path.resolve('node_modules'), path.resolve('lib')]
}
```

#### 3) note
- Absolute and relative paths can both be used, but be aware that they will behave a bit differently.

- A relative path will be scanned similarly to how Node scans for node_modules, by looking through the current directory as well as it's ancestors (i.e. ./node_modules, ../node_modules, and on).

- With an absolute path, it will only search in the given directory.
- If you want to add a directory to search in that takes precedence over node_modules/:(即是有先后顺序的)

```
modules: [path.resolve(__dirname, "src"), "node_modules"]
```

#### 4) QA
> Module not found: Error: Can't resolve 'ajax' in '/Users/xxx/Documents/xxx/webpack_test/test3/src'

当你需要指定除node_modules之外的其它模块目录的时候可以在数组中添加属性


### 3 resolve.mainFields
#### 1) action
- Webpack 配置中的 resolve.mainFields 用于配置第三方模块使用哪个入口文件。


安装的第三方模块中都会有一个 package.json文件,用于描述这个模块的属性，其中有些字段用于描述入口文件在哪里，resolve.mainFields 用于配置采用哪个字段作为入口文件的描述。

可以存在多个字段描述入口文件的原因是因为有些模块可以同时用在多个环境中，针对不同的运行环境需要使用不同的代码。 以 isomorphic-fetch API 为例，它是 Promise的一个实现，但可同时用于浏览器和 Node.js 环境。

#### 2) useage
为了减少搜索步骤，在你明确第三方模块的入口文件描述字段时，你可以把它设置的尽量少。 由于大多数第三方模块都采用 main字段去描述入口文件的位置，可以这样配置 Webpack：

```
module.exports = {
  resolve: {
    // 只采用 main 字段作为入口文件描述字段，以减少搜索步骤
    mainFields: ['main'],
  },
};
```


### 4 resolve.alias 
#### 1) action
- 配置项通过别名来把原导入路径映射成一个新的导入路径 
- 此优化方法会影响使用Tree-Shaking去除无效代码

#### 2) useage

```javascrip
alias: {
    "bootstrap": "bootstrap/dist/css/bootstrap.css"
}
```


### 5 resolve.extensions
#### 1) action
- 在导入语句没带文件后缀时，Webpack会自动带上后缀后去尝试询问文件是否存在 -
- 默认后缀是 extensions: ['.js', '.json']


#### 2) useage

#### 3) note 
- 后缀列表尽可能小
- 频率最高的往前方
- 导出语句里尽可能带上后缀


### 6 module.noParse
#### 1) action
- module.noParse 配置项可以让 Webpack 忽略对部分没采用模块化的文件的递归解析处理

#### 2) useage
```
module: {
    noParse: [/react\.min\.js/]
}
```

#### 2) note
> 被忽略掉的文件里不应该包含 import 、 require 、 define 等模块化语句

## 二 DLL
### 1 action
dll 为后缀的文件称为动态链接库，在一个动态链接库中可以包含给其他模块调用的函数和数据

- 把基础模块独立出来打包到单独的动态连接库里
- 当需要导入的模块在动态连接库里的时候，模块不能再次被打包，而是去动态连接库里获取

### 2 usage
> 定义插件(DLLPlugin) ---> 引用插件(DllReferencePlugin)

本次例子用jquery举例
#### 1) 定义DLL
- 用于打包出一个个动态连接库
- 需要单独build
> webpack.jquery.config.js
```javascript
module.exports = {
    entry: ["jquery"],
    output: {
        filename: "vendor.js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: 'var',// 打包的方式，hou
        library: "vendor_lib_vendor"// DLL的名字
    },
    plugins: [
        new webpack.DllPlugin({
            name: "vendor_lib_vendor",// 定义DLL
            path: path.resolve(__dirname, "dist/vendor-manifest.json")
        })
    ]
};
```

> package.json 的scripts添加
```
"dll": "webpack --config webpack.jquery.config.js --mode development"
```

配置好上述的文件后，在终端运行 `npm run dll`,时候会在dist目录下生成两个文件，分别是`vendor.js` 和 `vendor-manifest.json`。`vendor.js`包含的就是打包后的`jquery`文件代码，`vendor-manifest.json`是用来做关联的。DLL定义好了，接下来就是应用打包好的DLL了。

#### 2) 引用DLL
> webpack.config.js 配置文件中引入DllPlugin插件打包好的动态连接库

```
plugins: [
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require("./dist/vendor-manifest.json")
        })
    ],
```

#### 3) 使用DLL
> app.html
在app.html的底部添加

```javascript
<script src="./vendor.js"></script>
```

### 3 note
> `libraryTarget` 和 `library`

当用 Webpack 去构建一个可以被其他模块导入使用的库时需要用到它们。

- output.libraryTarget 配置以何种方式导出库。
- output.library 配置导出库的名称。 它们通常搭配在一起使用。

output.libraryTarget 是字符串的枚举类型，支持以下配置。
#### 1) var (默认)
编写的库将通过 var 被赋值给通过 library 指定名称的变量。

假如配置了 output.library='LibraryName'，则输出和使用的代码如下：


```
// Webpack 输出的代码
var LibraryName = lib_code; //其中 lib_code 代指导出库的代码内容，是有返回值的一个自执行函数。

// 使用库的方法
LibraryName.doSomething();
```

#### 2) commonjs2
编写的库将通过 CommonJS 规范导出。

假如配置了 output.library='LibraryName'，则输出和使用的代码如下：


```
// Webpack 输出的代码
exports['LibraryName'] = lib_code;

// 使用库的方法
require('library-name-in-npm')['LibraryName'].doSomething();
// 其中 library-name-in-npm 是指模块发布到 Npm 代码仓库时的名称。
```


#### 3) commonjs2
编写的库将通过 CommonJS2 规范导出，输出和使用的代码如下：


```
// Webpack 输出的代码
module.exports = lib_code;

// 使用库的方法
require('library-name-in-npm').doSomething();
```


CommonJS2 和 CommonJS 规范很相似，差别在于 CommonJS 只能用 exports 导出，而 CommonJS2 在 CommonJS 的基础上增加了 module.exports 的导出方式。
在 output.libraryTarget 为 commonjs2 时，配置 output.library 将没有意义。

#### 4) this
编写的库将通过 this 被赋值给通过 library 指定的名称，输出和使用的代码如下：


```
// Webpack 输出的代码
this['LibraryName'] = lib_code;

// 使用库的方法
this.LibraryName.doSomething();
```


#### 5) window
编写的库将通过 window 被赋值给通过 library 指定的名称，即把库挂载到 window 上，输出和使用的代码如下：


```
// Webpack 输出的代码
window['LibraryName'] = lib_code;

// 使用库的方法
window.LibraryName.doSomething();
```


#### 6) global
编写的库将通过 global 被赋值给通过 library 指定的名称，即把库挂载到 global 上，输出和使用的代码如下：


```
// Webpack 输出的代码
global['LibraryName'] = lib_code;

// 使用库的方法
global.LibraryName.doSomething();
```


## 三 HappyPack
### 1 action
HappyPack就能让Webpack把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程。 


### 2 usage
> install

由于webpack 4.0 刚刚发布，响应的插件还没有更新完，不过可以在后面加一个`@next`来安装即将发布的版本

```
npm i happypack@next -D
```

> webpack.config.js

```javascript
module: {
        rules: [
            {
                test: /\.css$/,
                use: 'happypack/loader?id=css',
                //把对.js文件的处理转交给id为babel的HappyPack实例
                //用唯一的标识符id来代表当前的HappyPack是用来处理一类特定文件
                include: path.resolve('./src'),
                exclude: /node_modules/
            },
            {
                test: /\.js/,
                use: 'happypack/loader?id=babel',
                include: path.resolve('./src'),
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/index.html'
        }),
        new HappyPack({
            id: 'babel',
            loaders: ['babel-loader']// 和rules里的配置相同
        }),
        new HappyPack({
            id: 'css',
            loaders: ['style-loader', 'css-loader']// 和rules里的配置相同
        }),
    ]
```

## 四 ParallelUglifyPlugin
### 1.action
- 可以把对JS文件的串行压缩变为开启多个子进程并行执行

### 2 usage
> insatll

```
npm install webpack-parallel-uglify-plugin -D
```
> webpackage.config.js

```javascript
new ParallelUglifyPlugin({
            workerCount: os.cpus().length - 1,//开启几个子进程去并发的执行压缩。默认是当前运行电脑的 CPU 核数减去1
            uglifyJS: {
                output: {
                    beautify: false, //不需要格式化
                    comments: true, //不保留注释
                },
                compress: {
                    warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
                    drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
                    collapse_vars: true, // 内嵌定义了但是只用到一次的变量
                    reduce_vars: true, // 提取出出现多次但是没有定义成变量去引用的静态值
                }
            }
        })
```

## 五 服务器自动刷新
### 1 文件监听
#### 1) action
- 可以监听文件变化，当文件发生变化的时候重新编译

#### 2) useage

```
watch: true, 
watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300, 
    poll: 1 
}
```

#### 3) note
> watch

只有在开启监听模式时(watch为true)，watchOptions才有意义

> aggregateTimeout

监听到变化发生后等300(ms)再去执行动作，防止文件更新太快导致编译频率太高

> poll

通过不停的询问文件是否改变来判断文件是否发生变化，默认每秒询问1000次

> 文件监听流程

webpack定时获取文件的更新时间，并跟上次保存的时间进行比对，不一致就表示发生了变化,poll就用来配置每秒问多少次。

当检测文件不再发生变化，会先缓存起来，等等待一段时间后之后再通知监听者，这个等待时间通过aggregateTimeout配置。

webpack只会监听entry依赖的文件
我们需要尽可能减少需要监听的文件数量和检查频率，当然频率的降低会导致灵敏度下降。


### 2 自动刷新浏览器
#### 1) use
```
devServer: {
    inline: true
},
```

#### 2) note
webpack负责监听文件变化，webpack-dev-server负责刷新浏览器。这些文件会被打包到chunk中，它们会代理客户端向服务器发起WebSocket连接



### 3 模块热替换
#### 1) action
- 模块热替换(Hot Module Replacement)的技术可在不刷新整个网页的情况下只更新指定的模块. 
-  原理是当一个源码发生变化时，只重新编译发生变化的模块，再用新输出的模块替换掉浏览器中对应的老模块

#### 2) 优点
- 反应更快，时间更短
- 不刷新网页可以保留网页运行状态
- 监听更少的文件
- 忽略掉 node_modules 目录下的文件

#### 2) use
> webpack.config.js

```
devServer: {
   hot:true//将hot设置为true
},

// 需要的插件
plugins: [
    new webpack.NamedModulesPlugin(),//显示模块的相对路径
    new webpack.HotModuleReplacementPlugin()// 启动热加载功能
]
```


> code

```javascript
if (module.hot) {
    module.hot.accept('./hot.js', () => {
        let hot = require('./hot');
        document.getElementById('app2').innerHTML = hot + '1';
    })
}
```


#### 3 note
> 需要热加载的模块需要在初始化的时候引入到模块中，否则不会触发HMR。


## 六 区分环境
### 1 action
在开发网页的时候，一般都会有多套运行环境，例如,在开发过程中方便开发调试的环境。发布到线上给用户使用的运行环境。

线上的环境和开发环境区别主要有以下不同：
- 线上的代码被压缩
- 开发环境可能会打印只有开发者才能看到的日志
- 开发环境和线上环境后端数据接口可能不同

### 2 usage
> package.json
- `cross-env`跨平台设置环境变量(后面没有&&)
```javascript
"scripts": {
    "build-dev": "cross-env NODE_ENV=development webpack --mode development",
    "build-prod": "cross-env NODE_ENV=production webpack --mode production"
}
```

> webpack.config.js
- 根据环境变量区分生产环境还是开发环境，然后和`webpack.base.config.js`合并，生产环境（或者开发环境）的优先级高于`webpack.base.config.js`的配置。
```javascript
let merge = require('webpack-merge');
let base = require('./webpack.base.config');
let other = null;
if (process.env.NODE_ENV === 'development') {
    other = require('./webpack.dev.config');
} else {
    other = require('./webapack.prod.config');
}
module.exports = merge(base, other);
```

> webpack.base.config.js
- 基本配置
- `webpack.DefinePlugin` 定义环境变量
```javascript
基本配置...
plugins: [
    new webpack.DefinePlugin({
        __isDevelopment__: JSON.stringify(process.env.NODE_ENV == 'development')
    })
]
```
> webpack.dev.config.js
- 以`output`举例,如果开发和生产环境的参数不同，就会覆盖`webpack.base.config.js`里面的配置
```javascript
const path = require('path');
module.exports = {
    output: {
        path: path.resolve('./dist'),
        filename: "[name].dev.[hash:2].js"
    }
};
```
> webpack.prod.config.js
- （以`output`举例）
```javascript
const path = require('path');
module.exports = {
    output: {
        path: path.resolve('./dist'),
        filename: "[name].prod.[hash:8].js"
    }
};
```

> base.js
- 配置文件中的`webpack.DefinePlugin`定义的变量（`__isDevelopment__`），在入口文件和入口文件引用的其他文件中都可以获取到`__isDevelopment__`的值
```javascript
let env = null;
if (__isDevelopment__) {
    env = 'dev';
} else {
    env = 'prod';
}
module.exports = env;
```


> index.js

```javascript
let env = require('./base.js');
if (__isDevelopment__) {
    console.log('dev');
} else {
    console.log('prod');
}
console.log('env', env);

/*
prod
env prod
*/
```

### 3 note
> webpack.DefinePlugin

定义环境变量的值时用 JSON.stringify 包裹字符串的原因是环境变量的值需要是一个由双引号包裹的字符串，而 JSON.stringify('production')的值正好等于'"production"'

## 七 CDN
CDN 又叫内容分发网络，通过把资源部署到世界各地，用户在访问时按照就近原则从离用户最近的服务器获取资源，从而加速资源的获取速度。

- HTML文件不缓存，放在自己的服务器上，关闭自己服务器的缓存，静态资源的URL变成指向CDN服务器的地址
- 静态的JavaScript、CSS、图片等文件开启CDN和缓存，并且文件名带上HASH值
- 为了并行加载不阻塞，把不同的静态资源分配到不同的CDN服务器上

## 八 Tree Shaking
### 1 action
tree Shaking 可以用来剔除JavaScript中用不上的死代码。

### 2 useage
- 它依赖静态的ES6模块化语法，例如通过import和export导入导出
- 不要编译ES6模块
```javascript
use: {
    loader: 'babel-loader',
    query: {
        presets: [
            [
                "env", {
                    modules: false //含义是关闭 Babel 的模块转换功能，保留原本的 ES6 模块化语法
                }
            ],
            "react"
        ]
    }
},
```

### 3 note
需要注意的是它依赖静态的ES6模块化语法，例如通过import和export导入导出。也就是说如果项目代码运行在不支持es6语法的环境上，Tree Shaking也就没有意义了。

## 九 提取公共代码
### 1 为什么需要提取公共代码
大网站有多个页面，每个页面由于采用相同技术栈和样式代码，会包含很多公共代码，如果都包含进来会有问题

相同的资源被重复的加载，浪费用户的流量和服务器的成本；
每个页面需要加载的资源太大，导致网页首屏加载缓慢，影响用户体验。 如果能把公共代码抽离成单独文件进行加载能进行优化，可以减少网络传输流量，降低服务器成本

### 2 如何提取
#### 1) 分类
不同类型的文件，打包后的代码块也不同：
- 基础类库，方便长期缓存
- 页面之间的公用代码
- 各个页面单独生成文件



#### 2) usage
> webpack.config.js

```
 optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {// 页面之间的公用代码
                    chunks: 'initial',
                    minChunks: 2,
                    maxInitialRequests: 5, // The default limit is too small to showcase the effect
                    minSize: 0 // This is example is too small to create commons chunks
                },
                vendor: {// 基础类库
                    chunks: 'initial',
                    test: /node_modules/,
                    name: "vendor",
                    priority: 10,
                    enforce: true
                }
            }
        }
    },
```
> ./src/pageA.js

```javascript
require('./utils/utility1.js');
require('./utils/utility2.js');
require('react');
```

> ./src/pageB.js
```javascript
require('./utils/utility2.js');
require('./utils/utility3.js');
```

> ./src/pageC.js
```javascript
require('./utils/utility2.js');
require('./utils/utility3.js');
```

> utils/utility1.js
```javascript
module.exports = 1;
```


> utils/utility2.js
```javascript
module.exports = 2;
```

> utils/utility3.js
```javascript
module.exports = 3;
```


> 打包后的结果

上述三种代码的生成的结果，如下图：
![提取公共代码](https://user-gold-cdn.xitu.io/2018/3/27/16267742b8067eab?w=2262&h=380&f=jpeg&s=259156)


## 十 Scope Hoisting
### 1 action
Scope Hoisting 可以让 Webpack 打包出来的代码文件更小、运行的更快， 它又译作 "作用域提升"，是在 Webpack3 中新推出的功能。

- 代码体积更小，因为函数申明语句会产生大量代码
- 代码在运行时因为创建的函数作用域更少了，内存开销也随之变小 hello.js

### 2 useage
> package.json
```
 "build": "webpack  --display-optimization-bailout --mode development",
```

> webpack.config.js

```
plugins: [
    new ModuleConcatenationPlugin()
    ],
```

> ./h.js

```javascript
export default 'scope hoist'
```
> ./index.js

```javascript
import str from './h.js'
console.log(str);
```


### 3 note
> 必须使用ES6语法，否则不起作用（`--display-optimization-bailout` 参数会提示）


## 十一 代码分离
代码分离是 webpack 中最引人注目的特性之一。此特性能够把代码分离到不同的 bundle 中，然后可以按需加载或并行加载这些文件。 有三种常用的代码分离方法：

- 入口起点：使用 entry 配置手动地分离代码。
- 防止重复：使用 splitChunks 去重和分离 chunk。
- 动态导入：通过模块的内联函数调用来分离代码。

入口起点和防止重复上面已经提到了，下面我们重点讲一下动态导入
### 1 action
用户当前需要用什么功能就只加载这个功能对应的代码，也就是所谓的按需加载 在给单页应用做按需加载优化时，一般采用以下原则：

- 对网站功能进行划分，每一类一个chunk
- 对于首次打开页面需要的功能直接加载，尽快展示给用户
- 某些依赖大量代码的功能点可以按需加载
- 被分割出去的代码需要一个按需加载的时机

### 2 usage
- 使用`import(module)`的语法
- import 异步 加载 模块是一个es7的语法
- 在webpack里import是一个天然的分割点
```javascript
document.getElementById('play').addEventListener('click',function(){
    import('./vedio.js').then(function(video){
        let name = video.getName();
        console.log(name);
    });
});
```


## 参考文档
- [webpack官方文档](https://webpack.js.org/concepts/)
- [webpack官方文档中文版](https://doc.webpack-china.org/concepts/)
- [webpackGitHub](https://github.com/webpack/webpack)
