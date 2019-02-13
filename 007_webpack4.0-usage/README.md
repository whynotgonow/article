# webpack4.0实战那些事儿
webpack4.0刚刚发布，官网自称4.0最大的特点就是零配置。本文就详细介绍一下webpack4.0实战那些事儿。
## 1 什么是WebPack
> 打包机

WebPack可以看做是模块打包机：它做的事情是，分析你的项目结构，找到JavaScript模块以及其它的一些浏览器不能直接运行的拓展语言（Scss，TypeScript等），并将其打包为合适的格式以供浏览器使用。

> 构建

构建就是把源代码转换成发布到线上的可执行 JavaScrip、CSS、HTML 代码，包括如下内容。

- 代码转换：TypeScript 编译成 JavaScript、SCSS 编译成 CSS 等。
- 文件优化：压缩 JavaScript、CSS、HTML 代码，压缩合并图片等。
- 代码分割：提取多个页面的公共代码、提取首屏不需要执行部分的代码让其异步加载。
- 模块合并：在采用模块化的项目里会有很多个模块和文件，需要构建功能把模块分类合并成一个文件。
- 自动刷新：监听本地源代码的变化，自动重新构建、刷新浏览器。
- 代码校验：在代码被提交到仓库前需要校验代码是否符合规范，以及单元测试是否通过。
- 自动发布：更新完代码后，自动构建出线上发布代码并传输给发布系统。

构建其实是工程化、自动化思想在前端开发中的体现，把一系列流程用代码去实现，让代码自动化地执行这一系列复杂的流程。 构建给前端开发注入了更大的活力，解放了我们的生产力。

## 2 快速配置
### 1 核心概念
- Entry：入口，Webpack 执行构建的第一步将从 Entry 开始，可抽象成输入。
- Module：模块，在 Webpack 里一切皆模块，一个模块对应着一个文件。Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
- Chunk：代码块，一个 Chunk 由多个模块组合而成，用于代码合并与分割。
- Loader：模块转换器，用于把模块原内容按照需求转换成新内容。
- Plugin：扩展插件，在 Webpack 构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。
- Output：输出结果，在 Webpack 经过一系列处理并得出最终想要的代码后输出结果。

### 2 webpack的工作流程

- 1 Webpack 启动后会从Entry里配置的Module开始递归解析 Entry 依赖的所有 Module。 
- 2 每找到一个 Module， 就会根据配置的Loader去找出对应的转换规则，对 Module 进行转换后，再解析出当前 Module 依赖的 Module。 
- 3 这些模块会以 Entry 为单位进行分组，一个 Entry 和其所有依赖的 Module 被分到一个组也就是一个 Chunk。
- 4 最后 Webpack 会把所有 Chunk 转换成文件输出。 在整个流程中 Webpack 会在恰当的时机执行 Plugin 里定义的逻辑。

### 3 配置webpack
#### 1) 初始化npm

```
npm init -y
```
在要进行打包的目录下初始化npm, 在控制台执行以上命令后会生成一个`package.json`的文件。
#### 2) install

```
npm install webpack webpack-cli -D
```
因为从4.0开始，webpack拆分开两个包分别是`webpack`和`webpack-cli`

#### 3) 配置文件`webpack.config.js`

```javascript
module.exports = {
    entry：配置入口文件的地址
    output：配置出口文件的地址
    module：配置模块,主要用来配置不同文件的加载器
    plugins：配置插件
    devServer：配置开发服务器
}
```
接下来我们就一一介绍一下它们的配置。

## 3 配置开发服务器
### 1 install
```
npm install webpack-dev-server -D
```

### 2 配置参数

```javascript
devServer:{
    contentBase:path.resolve(__dirname,'dist'),// 配置开发服务运行时的文件根目录
    host:'localhost',// 开发服务器监听的主机地址
    compress:true,   // 开发服务器是否启动gzip等压缩
    port:8080        // 开发服务器监听的端口
}
```

### 3 配置启动参数

```
"scripts": {
    "dev": "webpack-dev-server --open --mode development "
}
```

> note

从4.0开始，运行webpack时一定要加参数 `--mode development` 或者`--mode production`,分别对应开发环境和生产环境。


## 4 配置`module`
### 1 什么是`loader`
`module`主要用来配置不同文件的加载器。谈到加载就离不开`loader`,那什么是`loader`呢？
> loader的概念

通过使用不同的Loader，Webpack可以要把不同的文件都转成JS文件,比如CSS、ES6/7、JSX等。

- `test`：匹配处理文件的扩展名的正则表达式
- `use`：loader名称，就是你要使用模块的名称
- `include/exclude`:手动指定必须处理的文件夹或屏蔽不需要处理的文件夹
- `query`：为loaders提供额外的设置选项

> `loader`的三种写法
- use
- loader
- use+loader


### 2 支持加载css文件
> install

```
npm install style-loader css-loader -D
```
> 配置加载器

```javascript
module: {
    rules:[
       {
            test:/\.css$/,
            use:['style-loader','css-loader'],
            include:path.join(__dirname,'./src'),
            exclude:/node_modules/
       }        
    ]
}
```

> note

**注意：**加载器的加载顺序为从右至左。即先用`css-loader`解析然后用`style-loader`将解析后的`css`文件添加到`Head`标签中。






### 3 支持图片
> install 

```
npm install file-loader url-loader html-withimg-loader -D
```
- `file-loader` 解决CSS等文件中的引入图片路径问题
- `url-loader` 当图片较小的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝


> 配置加载器

```javascript
{
    test: /\.(png|jpg|gif|svg|bmp|eot|woff|woff2|ttf)$/,
    loader: {
        loader: 'url-loader',
        options: {
            limit: 5 * 1024,// 图片大小 > limit 使用file-loader, 反之使用url-loader
            outputPath: 'images/'// 指定打包后的图片位置
        }
    }
}
```


> usage - 手动添加图片

```javascript
let logo = require('./images/logo.png');
let img = new Image();
img.src = logo;
document.body.appendChild(img);
```


> usage - 在CSS中引入图片

```javascript
.img-bg{
    background: url(./images/logo.png);
    width:173px;
    height:66px;
}
```

> usage - 在HTML中使用图片

```javascript
{
    test:/\.(html|html)$/,
    use:'html-withimg-loader',
    include:path.join(__dirname,'./src'),
    exclude:/node_modules/
}
```



### 4 编译less 和 sass
#### 1) install

```
npm install less less-loader node-sass sass-loader -D
```
#### 2) 配置加载器
> 把编译好的代码放到head里面
```javascript
{
    test: /\.css$/,
    loader: ['style-loader', 'css-loader']
}, {
    test: /\.less$/,
    loader: ['style-loader', 'css-loader']
}, {
    test: /\.scss$/,
    loader: ['style-loader', 'css-loader']
}
```

> 把编译好的代码放到单独的文件里面

```javascript
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
let cssExtract = new ExtractTextWebpackPlugin('css.css');
let lessExtract = new ExtractTextWebpackPlugin('less.css');
let sassExtract = new ExtractTextWebpackPlugin('sass.css');
...
{
    test: /\.css$/,
    loader: cssExtract.extract({
        use: ['css-loader?minimize']
    })
}, {
    test: /\.less$/,
    loader: lessExtract.extract({
        use: ['css-loader?minimize', 'less-loader']
    })
}, {
    test: /\.scss$/,
    loader: sassExtract.extract({
        use: ['css-loader?minimize', 'sass-loader']
    })
}
```

### 5 处理CSS3属性前缀
为了浏览器的兼容性，有时候我们必须加入-webkit,-ms,-o,-moz这些前缀

- Trident内核：主要代表为IE浏览器, 前缀为-ms
- Gecko内核：主要代表为Firefox, 前缀为-moz
- Presto内核：主要代表为Opera, 前缀为-o
- Webkit内核：产要代表为Chrome和Safari, 前缀为-webkit

> install

```
npm install postcss-loader autoprefixer -D
```

> usage

`postcss-loader` 需要配置 `postcss.config.js`文件,postcss.config.js 内容如下：

```javascript
 module.exports = {
    plugins: [
        require('autoprefixer')
    ]
}
```


```javascript
// 把 post-laoder push 到css的loader数组中
 {
    test: /\.css$/,
    loader: ['style-loader', 'css-loader', 'postcss-loader']
}, {
    test: /\.less$/,
    loader: ['style-loader', 'css-loader', 'less-loader']
}, {
    test: /\.scss$/,
    loader: ['style-loader', 'css-loader', 'sass-loader']
}
```
  

### 6 转义ES6/ES7/JSX
Babel其实是一个编译JavaScript的平台,可以把ES6/ES7,React的JSX转义为ES5。

> install

```
npm i babel-core babel-loader babel-preset-env babel-preset-stage-0 babel-preset-react -D
```


> 配置加载器
```
{
    test:/\.jsx?$/,
    use: {
        loader: 'babel-loader',
        options: {
            presets: ["env","stage-0","react"]// env --> es6, stage-0 --> es7, react --> react
        }
    },
    include:path.join(__dirname,'./src'),
    exclude:/node_modules/
}
```


## 5 配置`plugins`
配置插件
### 1 自动产出html
我们希望自动能产出HTML文件，并在里面引入产出后的资源。
> install 

```
npm install html-webpack-plugin -D
```
> usage

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
plugins: [
    new HtmlWebpackPlugin({
        template: './src/index.html',   // 指定产出的模板
        filename: 'base.html',          // 产出的文件名
        chunks: ['common', 'base'],     // 在产出的HTML文件里引入哪些代码块
        hash: true,                     // 名称是否哈希值
        title: 'base',                  // 可以给模板设置变量名，在html模板中调用 htmlWebpackPlugin.options.title 可以使用
        minify: {                       // 对html文件进行压缩
            removeAttributeQuotes: true // 移除双引号
        }
    })
]
```


### 2 分离CSS
因为CSS的下载和JS可以并行,当一个HTML文件很大的时候，我们可以把CSS单独提取出来加载
> install

```
npm install extract-text-webpack-plugin@next -D
```
> usage

```javascript
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
let cssExtract = new ExtractTextWebpackPlugin('css.css');
let lessExtract = new ExtractTextWebpackPlugin('less.css');
let sassExtract = new ExtractTextWebpackPlugin('sass.css');

...

module: {
    rules: [
         {
            test: /\.css$/,
            loader: cssExtract.extract({
                use: ['css-loader?minimize']
            })
        }, {
            test: /\.less$/,
            loader: lessExtract.extract({
                use: ['css-loader?minimize', 'less-loader']
            })
        }, {
            test: /\.scss$/,
            loader: sassExtract.extract({
                use: ['css-loader?minimize', 'sass-loader']
            })
        }
    ]
}

...

plugins: [
    cssExtract,
    lessExtract,
    sassExtract
]
```

> 处理图片路径问题

```javascript
const PUBLIC_PATH='/';

output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath:PUBLIC_PATH
}
```


### 3 拷贝静态文件
有时项目中没有引用的文件也需要打包到目标目录
> install

```
npm install copy-webpack-plugin -D
```

> usage

```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');
    plugins: [
        new CopyWebpackPlugin([{
            from: path.join(__dirname, 'public'),       // 从哪里复制
            to: path.join(__dirname, 'dist', 'public')  // 复制到哪里
    }])
]
```


### 4 打包前先清空输出目录
> install

```
npm install  clean-webpack-plugin -D
```
> usage

```javascript
const CleanWebpackPlugin = require('clean-webpack-plugin');
plugins: [
    new CleanWebpackPlugin([path.join(__dirname, 'dist')])
]
```


### 5 压缩JS
> install

```
npm install uglifyjs-webpack-plugin -D
```

> usage

```javascript
onst UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
plugins: [
    new UglifyjsWebpackPlugin()
]
```




## 6 如何调试打包后的代码
webapck通过配置可以自动给我们source maps文件，map文件是一种对应编译文件和源文件的方法

> usage
```
devtool:'eval-source-map'
```

> devtool的参数详解
- `source-map` 把映射文件生成到单独的文件，最完整最慢
- `cheap-module-source-map` 在一个单独的文件中产生一个不带列映射的Map
- `eval-source-map` 使用eval打包源文件模块,在同一个文件中生成完整sourcemap
- `cheap-module-eval-source-map` sourcemap和打包后的JS同行显示，没有映射列


## 7 打包第三方类库
### 1 直接引入

```javascript
import _ from 'lodash';
alert(_.join(['a','b','c'],'@'));
```

### 2 插件引入

```javascript
new webpack.ProvidePlugin({
    _:'lodash'
})
```

## 8 watch

当代码发生修改后可以自动重新编译

```javascript
 watch: true,
    watchOptions: {
        ignored: /node_modules/, //忽略不用监听变更的目录
        aggregateTimeout: 500,  // 文件发生改变后多长时间后再重新编译（Add a delay before rebuilding once the first file changed ）
        poll:1000               //每秒询问的文件变更的次数
    }
```


## 9 服务器代理
如果你有单独的后端开发服务器 API，并且希望在同域名下发送 API 请求 ，那么代理某些 URL 会很有用。

```javascript
//请求到 /api/users 现在会被代理到请求 http://localhost:9000/api/users。
proxy: {
    "/api": "http://localhost:9000",
}
```

## 10 resolve解析
### 1 extensions
指定extension之后可以不用在require或是import的时候加文件扩展名,会依次尝试添加扩展名进行匹配

```javascript
resolve: {
    //自动补全后缀，注意第一个必须是空字符串,后缀一定以点开头
   extensions: ["",".js",".css",".json"],
},
```

### 2 alias
配置别名可以加快webpack查找模块的速度

- 每当引入jquery模块的时候，它会直接引入jqueryPath,而不需要从node_modules文件夹中按模块的查找规则查找
- 不需要webpack去解析jquery.js文件


```javascript
const bootstrap = path.join(__dirname,'node_modules/bootstrap/dist/css/bootstrap.css');

resolve: {
    alias: {
        'bootstrap': bootstrap
    }
}
```



## 11 暴露全局对象
> install 

```
npm install expose-loader -D
```

> action

把模块的导出暴露给全局变量，


> usage-1

```javascript
require("expose-loader?libraryName!./file.js");
```
 
> usage-2

```javascript
rules: [{
    test: require.resolve('jquery'),// 注意 这里是require的resolve 方法
    use: {
        loader: "expose-loader",
        options: "$"
    }
}]
```
 
 
## 13 多入口
有时候我们的页面可以不止一个HTML页面，会有多个页面，所以就需要多入口

> usage

```
// 多个入口，可以给每个入口添加html模板
entry: {
    index: './src/index.js',
    main:'./src/main.js'
},
output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js',
    publicPath:PUBLIC_PATH
},

plugins: [
    new HtmlWebpackPlugin({
        minify: {
            removeAttributeQuotes:true
        },
        hash: true,
        template: './src/index.html',
        chunks:['index'],
        filename:'index.html'
    }),
    new HtmlWebpackPlugin({
        minify: {
            removeAttributeQuotes:true
        },
        hash: true,
        chunks:['login'],
        template: './src/login.html',
        filename:'login.html'
    })]
]
   
```

## 14  externals 
如果我们想引用一个库，但是又不想让webpack打包，并且又不影响我们在程序中以CMD、AMD或者window/global全局等方式进行使用，那就可以通过配置externals。

> webpack.config.js
```javascript
externals: {
    jquery: "jQuery"
    //如果要在浏览器中运行，那么不用添加什么前缀，默认设置就是global
},
```

> index.js

```javascript
const $ = require("jquery");
const $ = window.jQuery;
```

## 15 参考文章
- [webpack官方文档](https://webpack.js.org/concepts/)
- [webpack官方文档中文版](https://doc.webpack-china.org/concepts/)
- [webpackGitHub](https://github.com/webpack/webpack)
