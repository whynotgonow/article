## 1 express的一些常用功能
我们在开发的过程中，或多或少会用到Node.js，比如用Node.js在本地起一个静态文件服务器等。但是Node.js 的 API 对开发者来说并不是非常友好。例如，如果我们想从服务器发送一个 JPEG 图片的话，可能需要至少 四五 行代码才行。创建可复用 HTML 模版则更复杂。另外，Node.js 的 HTTP 模块虽然强大，但是仍然缺少一些实用特性。
Express 的出现就是为了解决这些问题，让我们能够高效的使用 Node.js 来编写 Web 应用。

从大的方面来说，Express 为 Node.js 的 HTTP 模块带来了两大特性：
- 通过提供大量易用接口，简化了程序的复杂度。
- 它允许对请求处理函数进行拆分，将其重构为很多负责特定请求的小型请求处理函数。便于模块化和后期维护。

下面我们说几个express的几个常用api:
#### 1) app[method](path, function(req, res){})
> 根据请求路径来处理客户端发出的GET等各种请求。第一个参数path为请求的路径，
第二个参数为处理请求的回调函数。
```javascript
let express = require('express');
let app = express();
app.listen(8080, () => {
    console.log('started success');
});
app.get('/', function (req, res) {
    res.end('ok');
});
```

#### 2) app.use([path], function(req, res){})
> 中间件就是处理HTTP请求的函数，用来完成各种特定的任务，比如检查用户是否登录、检测用户是否有权限访问等。

app.use中放入的函数称为中间件函数，一般有三个特点：
- 一个中间件处理完请求和响应可以把相应数据再传递给下一个中间件。
- 回调函数的next参数,表示接受其他中间件的调用，函数体中的next(),表示将请求数据继续传递。
- 可以根据路径来区分返回执行不同的中间件。

```javascript
const express = require('../lib/express');
const app = express();

app.use(function (req, res, next) {
    console.log('Ware1:', Date.now());
    next('wrong');
});
app.get('/', function (req, res, next) {
    res.end('1');
});
const user = express.Router();
user.use(function (req, res, next) {
    console.log('Ware2', Date.now());
    next();
});
user.use('/2', function (req, res, next) {
    res.end('2');
});
app.use('/user', user);
app.use(function (err, req, res, next) {
    res.end('catch ' + err);
});
app.listen(3000, function () {
    console.log('server started at port 3000');
});
```

#### 3) app.listen(port, callback)
> 监听客户端向服务器发送请求的函数

#### 4) app.param(paramName, callback)
> 批量处理相同参数

```javascript
const express = require('../lib/express');
const app = express();
app.param('uid',function(req,res,next,val,name){
    req.user = {id:1,name:'Lucy'};
    console.log('1');
    next();
})
app.param('uid',function(req,res,next,val,name){
    req.user.name = 'Tom';
    next();
})
app.get('/user/:uid',function(req,res){
    console.log(req.user);
    res.end('user');
});
app.listen(3000);
```
#### 5) app.set(key, val)
> 设置参数，比如渲染模板的时候我们会经常使用到。

```javascript
app.set('views', path.resolve(path.join(__dirname, 'views')));
app.set('view engine', 'html');
```
#### 6) app.engine()
> 规定何种文件用何种方法来渲染
```javascript
app.engine('html', html);
```

简单的介绍了集中常用api的用法，接下来就要开始进入主题了，那就是根据express源码，模拟express框架,实现上述的集中api。

## 2 实现express的逻辑图和相应的介绍
本次模拟实现的api有`app.get()`、`app.use()`、`app.listen()`、`app.param()`、 `app.render()`、`app.set()`、`app.engine()`。

项目结构如下：
```
lib/
|
| - middle/
|   | - init.js     内置中间件
|
| - route/
|   | - index.js    路由系统
|   | - layer.js    层
|   | - route.js    路由
|
| - application.js  应用
| - html.js         模板引擎
| - express.js      入口
|
test/               这里放入的是测试用例
|
```

接下来我们一一介绍一下express的实现逻辑。因为express都是通过app来操作的，即express.js文件是express的入口，express.js的代码实现很简单，就是导出一个Application的实例。express把主要的方法放在Application上面了，我们先来张Application的概览图，来直观的感受下，如下图：
![Application的实例](https://user-gold-cdn.xitu.io/2018/3/10/1620e80aa0453d61?w=1674&h=800&f=jpeg&s=124330)
紫色边框左侧的一栏文字是Application上的属性，黑颜色的部分是实例上的属性，红颜色加粗的部分是原型上的属性，下面的图也遵循相同的规则。我们详细说明一下他们：
> Application上的属性
- settings - 保存设置的参数
- engines - 保存文件扩展名和相对应的渲染函数的函数
- _router - 是一个Router的实例（图中箭头指向的灰色背景部分），后面我们会详细介绍
- set - 设置参数的方法
- engine - 设置模板引擎
- render - 渲染模板引擎
- lazyRouter - 懒加载_router属性
- [method] - 路由
- use - 中间件
- param - 批量设置相同的参数
- listen - 监听客户端发来请求的函数

为了便于描述我们将`Application`的实例称为`app`(下同)。`app`是实现express功能的入口，顺着图中第一个箭头的方向，`app._router`属性指向一个`Router`的实例（灰色背景部分），`app._router`是一个路由系统，这个路由系统中会管理客户端发来请求的回调函数的执行。`Router`上的属性也位于左侧的一栏文字中，我们先来解释一下属性（同样的，黑色部分为实例上的属性，红色加粗部分为原型上的属性）。
> Router上的属性
- stack - 指向的是一个数组（黑色边框），里面存放的是一层层的`Layer`的实例（`Layer`下面接着会介绍）
- paramCallbacks - 存放的是处理参数的函数
- route - 返回一个路由实例
- process_params - 处理匹配到的参数
- handle - 处理客户端发来的请求
- param - 订阅我们参数处理函数
- use - 订阅中间件函数
- [method] - 订阅路由函数

在我们处理客户端发来请求的回调函数的过程中，主要靠的是循环`app._router.stack`中的每一层（如图中的layer1、layer2、layer3）来实现，那么每一层到底是什么呢？我个人根据处理的逻辑把layer做了一个分类，包括三类：路由层、中间件层、具有子路由系统的中间件层。我们详细介绍一下这三个类：
##### 1) 路由层

![路由层](https://user-gold-cdn.xitu.io/2018/3/10/1620ec8b2b6a5b21?w=1780&h=826&f=jpeg&s=142095)
> Layer上的属性
- path - 路由的路径，如`/user/getlist`
- route - 返回一个`Route`的实例
- handler - 新建实例时传入的一个函数
- keys - 路由参数的`key`组成的数组
- regexp - 匹配路由参数的正则对象
- params - 存放的是匹配到的路由参数
- match - 匹配当前实例上的`path`是否和请求的url地址匹配
- handle_request - 执行本层`this.handler`属性对应的方法
- handle_error - 处理上一层`next()`函数传来的参数


路由层是通过`app.get(path, handler)`订阅的，该层会通过`app._router.stack.push()`放入到`app._router.stack`中，`app._router.stack`是一个数组，存放的是各种层（layer），包括后面的中间件层也会放到`app._router.stack`中。需要注意的是路由层的route属性指向是一个`Route`的实例,并且在`new Layer`的时候将`Route`的实例上的`dispatch`方法作为第二个参数传递给`Layer`，如下代码：

```javascript
let route = new Route(path);
let layer = new Layer(path, route.dispatch.bind(route));
layer.route = route;
this.stack.push(layer);
```


需要注意的是路由层的`route`属性指向一个`Route`的实例。
> Route的属性
- path - 统一传入一个'/'
- stack - 也是一个数组，存放的也是一个个的层（layer）,如图中的layer_a、 layer_b、layer_c，并且这里的层跟路由层的原型指向同一个构造函数。但是这里的layer的handler属性指的是`app.get(path, handlers)`中handlers中的单个handler。`app._router.stack`中的layer的handler属性指向的是`route.dispatch.bind(route)`
- method - 是一个对象，存放的是订阅到`stack`中的方法的集合
- handle_method - 检测本route是否存在请求中的方法
- dispatch - 路由层的handler是派发到这里
- [method] - 因为路由层上的`[method]`方法最终是派发给`route`中来实现，所以这个方法就是将派发来的`[method]`方法`push`到`stack`中



##### 2) 中间件层
![中间件层](https://user-gold-cdn.xitu.io/2018/3/10/1620e9f2b0cf3ed2?w=1464&h=686&f=jpeg&s=79360)
中间件层是通过`app.use(path, handler)`订阅的，该层也会放入到`app._router.stack`中。需要注意的是该层的`route`属性为`undefined`。

##### 3) 具有子路由系统的中间件层
![具有子路由系统的中间件层](https://user-gold-cdn.xitu.io/2018/3/10/1620ea5ede593009?w=1728&h=818&f=jpeg&s=152540)
该层也是一个中间件层，只是具有独立的子路由系统，这个子路由系统跟上面`app._router`所属的类是同一个类，所以这个子路由系统跟`app._router`具有相同的属性和相同的原型上的方法。这一层也是通过`app.use()`订阅的，但是稍有不同，如下代码：

```javascript
//中间件层 的订阅方式
app.use('/', function (req, res, next) {
    console.log('Ware1:', Date.now());
    next('wrong');
});

// 具有子路由系统的中间件层 的订阅方式
const user = express.Router();
user.use(function (req, res, next) {
    console.log('Ware2', Date.now());
    next();
});
user.use('/2', function (req, res, next) {
    res.end('2');
});
```
当请求函数走到这一层的时候，`this.handler`执行时会进入到图中箭头指向的灰色背景部分，即子路由系统，这个子路由系统中的stack也是存放的是子路由系统中订阅的函数。

介绍了这么多，到底这些`Router`、`Layer`、`Route`等是如何配合工作的？下面我们详细介绍一下。 


## 3 客户端发起请求时的执行逻辑顺序
当客户端发起请求的时候app就会派发给`_router.handle`执行，`_router.handle`的逻辑就是把订阅在`_router.stack`中的handler依次执行，如下图：
![router.stack执行的顺序图](https://user-gold-cdn.xitu.io/2018/3/10/1620ff77843dfc25?w=1572&h=1454&f=jpeg&s=198321)

接下来我把`_router.stack`里面每一个layer时的执行书序逻辑图抽离出来，如下图：
![执行的逻辑图](https://user-gold-cdn.xitu.io/2018/3/10/1620fd90845f45a4?w=2782&h=1534&f=jpeg&s=264396)


## 4 实现模板引擎
express还有一个功能就是可以实现模板引擎，实现的代码逻辑如下：

```JavaScript
let head = "let tpl = ``;\nwith (obj) {\n tpl+=`";
str = str.replace(/<%=([\s\S]+?)%>/g, function () {
    return "${" + arguments[1] + "}";
});
str = str.replace(/<%([\s\S]+?)%>/g, function () {
    return "`;\n" + arguments[1] + "\n;tpl+=`";
});
let tail = "`}\n return tpl; ";
let html = head + str + tail;
let fn = new Function('obj', html);
let result = fn(options);
```

## 5 写在最后
写到这里，express框架的常用api已经介绍完了，本文只是介绍了实现逻辑，具体的项目代码以及测试用例请参见[我的GitHub](https://github.com/whynotgonow/myexpress)。

> 参考文献

- [从express源码中探析其路由机制](从express源码中探析其路由机制)
- [express官网](http://www.expressjs.com.cn/)
