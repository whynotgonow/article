## 1 JS模块化的不足
对于JS本身而言，他的规范是薄弱的，具有以下不足：
- 没有模块系统，不支持封闭的作用域和依赖管理
- 没有标准库，没有文件系统和IO流API
- 也没有包管理系统

## 2 CommonJS的功能
- 封装功能
- 封闭作用域
- 可能解决依赖问题
- 工作效率更高，重构方便

## 3 CommonJS的模块规范
**CommonJS** 是一种使用广泛的JavaScript模块化规范，核心思想是通过**require**方法来同步地加载依赖的其他模块，通过 **module.exports** 导出需要暴露的接口。

### 3.1 模块引用
在CommonJS规范中，存在`require()`方法，这个方法接受**模块标识**，以此引入一个模块的API到当前上下文中。
模块引用的示例代码如下：
```js
const path = require("path");
```

### 3.2 模块定义
上下文提供了`exports`对象用于导出当前模块的方法或者变量，并且它是唯一导出的出口。

在模块中，还存在一个`module`对象，它代表模块自身，而`exports`是`module`的属性。

在Node中，一个文件就是一个模块，将方法挂载在`exports`对象作为属性即可定义导出的方式，如下：
```js
// math.js
exports.add = function(){
  var sum = 0,
    i = 0,
    args = arguments,
    l = args.length;

  while(i < l){
    sum += args[i++]
  }
  return sum;
}
```

在另外一个文件中，我们通过`require()`方法引入模块后，就能调用定义的属性或方法：
```js
var math = require("math");
exports.increment = function(val){
  return math.add(val, 1)
}
```

### 3.3 模块标识
模块标识其实就是传递给`require()`方法的参数，他必须是符合小驼峰命名的字符串，或者以`.`、`..`开头的相对路径，或者绝对路径。

CommonJS的构建的这套模块导出和引入机制使得用户完全不考虑变量污染，命名空间等方案与此相比相形见绌。


## 4 Node的模块实现
### 4.1 在Node中引入模块的步骤
- (1) 路径分析
- (2) 文件定位
- (3) 编译执行

### 4.2 模块分类
#### 4.2.1 原生模块

`http`、`fs`、`path`、`events`等模块,是Node提供的模块，这些模块在Node源代码的编译过程中被编译成二进制。在Node进程启动时，部分原生代码就被直接加载进内存中，所以原生模块引入时，文件定位和编译执行这个两个步骤可以省略掉，并且在路径分析中优先判断, 所以加载速度最快。原生模块通过名称来加载。

#### 4.2.2 文件模块

在硬盘的某个位置，在运行时动态加载，需要完成的路径分析、文件定位、编译执行过程，速度比原生模块慢。

文件模块通过名称或路径来加载，文件模块的后缀有三种，如下

- .js   -- 需要先读入内存再运行
- .json -- fs 读入内存 转化成JSON对象
- .node -- 经过编译后的二进制C/C++扩展模块文件,可以直接使用


#### 4.2.3 第三方模块
- 如果`require`函数只指定名称则视为从`node_modules`下面加载文件，这样的话你可以移动模块而不需要修改引用的模块路径
- 第三方模块的查询路径包括`module.paths`和全局目录
- 加载最慢

> 全局目录

window如果在环境变量中设置了`NODE_PATH`变量，并将变量设置为一个有效的磁盘目录，require在本地找不到此模块时向在此目录下找这个模块。 

UNIX操作系统中会从 `$HOME/.node_modules` `$HOME/.node_libraries`目录下寻找


### 4.3 加载策略
#### 4.3.1 优先从缓存加载
Node对引入过的模块都会进行缓存，以减少二次引入时的开销,与前端浏览器缓存静态脚本不同，浏览器仅缓存文件，而Node缓存的是编译和执行后的对象。

不论是原生模块还是文件模块等, `require()`方法对相同模块的加载都一律采用**缓存优先**的方式，这是第一优先级的。

缓存优先策略，如下图：
![缓存优先策略](https://raw.githubusercontent.com/whynotgonow/article/master/images/common_1.png)

#### 4.3.2 路径分析和文件定位
##### `module.paths` 模块路径
```js
console.log(module.paths)

[ '/Users/**/Documents/framework/article/node中的CommonJS/node_modules',
  '/Users/****/Documents/framework/article/node_modules',
  '/Users/**/Documents/framework/node_modules',
  '/Users/**/Documents/node_modules',
  '/Users/**/node_modules',
  '/Users/node_modules',
  '/node_modules' ]

```

在加载过程中，Node会逐个尝试`module.paths`中的路径，直到找到目标文件为止。所以当前文件的路径约深，模块查找耗时越多。所以第三方模块加载速度最慢。


##### 文件定位
- (1) 文件扩展名
扩展名顺序： .js > .node > .json

尝试过程中需要调用fs模块同步阻塞判断文件是否存在，因为是单线程，会引起性能问题。

诀窍是： 如果是.node和.json文件，传递时带上扩展名.

- (2) 目录分析和包
`require()`分析文件扩展名之后，可能没有查找到对应文件，但却得到一个目录，此时Node会将该目录当做一个包来处理。

首先，Node会在当前目录下查找`package.json`,从中取出`main`属性指定的文件进行定位。
如果文件缺少扩展名，将会进入扩展名分析的步骤。
如果`main`属性指定的文件名错误，或者根本没有`package.json`，Node会将`index`当做默认文件名，然后依次查找`index.js`、`index.json`、`index.node`。

如果在目录分析中没有定位成功任何文件，则进入下一个模块路径进行查找。如果模块路径数组都被遍历完毕，依然没有查找到目标文件，则会抛出查找失败的异常。


#### 4.3.3 文件模块查找规则总结
如下图：
![文件模块查找规则](https://raw.githubusercontent.com/whynotgonow/article/master/images/common_2.png)


## 5 模块编译(文件模块)
### 5.1 `module`的属性
在Node中，每个文件模块都是一个对象，定义如下：
```js
console.log(module)
/* 
Module {
  id: '.',
  exports: {},
  parent: null,
  filename: '/Users/.../article/015_node中的CommonJS/tempCodeRunnerFile.js',
  loaded: false,
  children: [],
  paths: 
   [ '/Users/.../article/015_node中的CommonJS/node_modules',
     '/Users/.../article/node_modules',
     '/Users/.../node_modules',
     '/Users/.../node_modules',
     '/Users/.../node_modules',
     '/Users/node_modules',
     '/node_modules' ] }
*/
```

编译和执行是引入文件模块的最后一个阶段。定位到具体文件后，Node会建一个模块对象，然后根据路径载入并编译。对于不同的文件扩展名，载入的方法也不同，具体如下所示：
- **.js 文件**。通过 **fs** 模块同步读取文件后编译执行。
- **.node 文件**。这是用 **C/C++**编写的扩展文件，通过**dlopen()**方法加载最后编译生成的文件。
- **.json 文件**。通过 **fs** 模块同步读取文件后，用`JSON.parse()`解析返回结果。
- **其余扩展名文件**。他们都被当做**.js**文件载入

### 5.2 js模块的编译
在编译过程中，Node对获取的JS文件内容进行了头尾包装，这样，每个文件模块之间都进行了作用域隔离。如下：
```js
(function(exports, require, module, __filename, __dirname){
  
})
```

> 模拟`require`方法的原理，如下：
```js
// b.js
console.log('b.js')
exports.name = "b"


// a.js
let fs = require('fs');
let path = require('path')

let b = require2('./b.js')

function require2(mod) {
  let filename = path.join(__dirname, mod);
  let content = fs.readFileSync(filename, 'utf8');
  let fn = new Function('exports', 'require', 'module', '__filename', '__dirname', content + "\n return module.exports")

  let module = {
    exports: {}
  }

  return fn(module.exports, require2, module, __filename, __dirname)
}
// b.js

```

## 6 `exports` VS `module.exports`
通过`exports`和`module.exports`对外公开的方法都可以访问，但有区别。

### 6.1 联系
`exports` 仅仅是 `module.exports` 的一个地址引用。

nodejs 只会导出 `module.exports` 的指向，如果 `exports` 指向变了，那就仅仅是 exports 不在指向 `module.exports` ，于是不会再被导出。

举个栗子，如下：

```js

// test3.js
let counter = 0;
exports.printNextCount = function () {
  counter += 2;
  console.log(counter);
}

module.exports = function () {
  counter += 10;
  this.printNextCount = function () {
    console.log(counter)
  }
}

console.log(exports);
console.log(module.exports);
console.log(exports === module.exports);
/* 
  { printNextCount: [Function] }
  [Function]
  false
*/


// test3_require.js
let Counter = require('./test3.js')

let counterObj = new Counter();
counterObj.printNextCount();
/* 
  10
*/

```


### 6.2 区别
#### 6.2.1 根本区别
- **exports** 返回的是模块函数
- **module.exports** 返回的是模块对象本身，返回的是一个类

举个栗子，入下：
```js
// test1.js
let counter = 0;
exports.temp = function () {
  counter += 10;
  this.printNextCount = function () {
    console.log(counter);
  }
}

console.log(exports);
console.log(module.exports);
console.log(exports === module.exports);
/* 
{ temp: [Function] }  // 是一个函数可以直接调用
{ temp: [Function] }  // 是一个函数可以直接调用
true
*/

// test1_require.js
// 无论是直接调用，还是new一个对象再调用，都报错
let counter = require('./test1')

// 直接调用
console.log(counter)          // { temp: [Function] }
counter.printNextCount();     // TypeError: counter.printNextCount is not a function

// new一个对象再调用
let obj = new counter()       // TypeError: counter is not a constructor
obj.printNextCount();
```

#### 6.2.2 使用区别
- **exports** 的方法可以直接调用
- **module.exports** 需要new对象之后才可以调用

> 使用这样的好处是**exports**只能对外暴露单个函数，但是**module.exports**却能暴露一个类


举个栗子，如下：
```js
// test2.js
let counter = 0;
module.exports = function () {
  counter += 10;
  this.printNextCount = function () {
    console.log(counter);
  }
}

console.log(exports);
console.log(module.exports);
console.log(exports === module.exports);
/* 
{}
[Function]  // 是一个类，需要new才能调用
false
*/


// test2_require.js
let Counter = require('./test2');

// 直接调用报错
// console.log(Counter.printNextCount())   // TypeError: Counter.printNextCount is not a function

// new一个对象再调用
let counterObj = new Counter();
counterObj.printNextCount();
/* 
  10
*/
```

### 6.3 使用建议
- 最好别分别定义`module.exports`和`exports`
- 导出对象用`module.exports`,导出多个方法和变量用`exports`