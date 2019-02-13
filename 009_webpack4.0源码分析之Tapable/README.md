# 1 `Tapable`简介
`webpack`本质上是一种事件流的机制，它的工作流程就是将各个插件串联起来，而实现这一切的核心就是`Tapable`，`webpack`中最核心的负责编译的`Compiler`和负责创建bundles的`Compilation`都是`Tapable`的实例。本文主要介绍一下Tapable中的钩子函数。

tapable包暴露出很多钩子类，这些类可以用来为插件创建钩子函数，主要包含以下几种：


```javascript
const {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook
 } = require("tapable");
```


所有钩子类的构造函数都接收一个可选的参数，这个参数是一个由字符串参数组成的数组，如下：

```javascript
const hook = new SyncHook(["arg1", "arg2", "arg3"]);
```
下面我们就详细介绍一下钩子的用法，以及一些钩子类实现的原理。

# 2 hooks概览
常用的钩子主要包含以下几种，分为同步和异步，异步又分为并发执行和串行执行，如下图：
![hooks](https://user-gold-cdn.xitu.io/2018/3/31/1627c9c828c20aa1?w=1280&h=605&f=webp&s=21072)
首先，整体感受下钩子的用法，如下

| 序号 | 钩子名称 | 执行方式 | 使用要点 |
| :--:| :-------- | --------:| :--: |
| 1 | SyncHook | 同步串行 | 不关心监听函数的返回值  |
| 2 | SyncBailHook | 同步串行 | 只要监听函数中有一个函数的返回值不为 `null`，则跳过剩下所有的逻辑 |
| 3 | SyncWaterfallHook | 同步串行 | 上一个监听函数的返回值可以传给下一个监听函数 |
| 4 | SyncLoopHook | 同步循环 | 当监听函数被触发的时候，如果该监听函数返回`true`时则这个监听函数会反复执行，如果返回 `undefined` 则表示退出循环 |
| 5 | AsyncParallelHook | 异步并发 | 不关心监听函数的返回值 |
| 6 | AsyncParallelBailHook | 异步并发 | 只要监听函数的返回值不为 `null`，就会忽略后面的监听函数执行，直接跳跃到`callAsync`等触发函数绑定的回调函数，然后执行这个被绑定的回调函数 |
| 7 | AsyncSeriesHook | 异步串行 | 不关系`callback()`的参数 |
| 8 | AsyncSeriesBailHook | 异步串行 | `callback()`的参数不为`null`，就会直接执行`callAsync`等触发函数绑定的回调函数 |
| 9 | AsyncSeriesWaterfallHook | 异步串行 | 上一个监听函数的中的`callback(err, data)`的第二个参数,可以作为下一个监听函数的参数 |

# 3 钩子

## sync* 钩子
### 同步串行
#### (1) `SyncHook`
不关心监听函数的返回值
- usage
```js
const { SyncHook } = require("tapable");
let queue = new SyncHook(['name']); //所有的构造函数都接收一个可选的参数，这个参数是一个字符串的数组。

// 订阅
queue.tap('1', function (name, name2) {// tap 的第一个参数是用来标识订阅的函数的
    console.log(name, name2, 1);
    return '1'
});
queue.tap('2', function (name) {
    console.log(name, 2);
});
queue.tap('3', function (name) {
    console.log(name, 3);
});

// 发布
queue.call('webpack', 'webpack-cli');// 发布的时候触发订阅的函数 同时传入参数

// 执行结果:
/* 
webpack undefined 1 // 传入的参数需要和new实例的时候保持一致，否则获取不到多传的参数
webpack 2
webpack 3
*/
```
- 原理

```js
class SyncHook_MY{
    constructor(){
        this.hooks = [];
    }

    // 订阅
    tap(name, fn){
        this.hooks.push(fn);
    }

    // 发布
    call(){
        this.hooks.forEach(hook => hook(...arguments));
    }
}
```

#### (2) `SyncBailHook`
只要监听函数中有一个函数的返回值不为 `null`，则跳过剩下所有的逻辑

- usage

```js
const {
    SyncBailHook
} = require("tapable");

let queue = new SyncBailHook(['name']); 

queue.tap('1', function (name) {
    console.log(name, 1);
});
queue.tap('2', function (name) {
    console.log(name, 2);
    return 'wrong'
});
queue.tap('3', function (name) {
    console.log(name, 3);
});

queue.call('webpack');

// 执行结果:
/* 
webpack 1
webpack 2
*/
```
- 原理
```js
class SyncBailHook_MY {
    constructor() {
        this.hooks = [];
    }

    // 订阅
    tap(name, fn) {
        this.hooks.push(fn);
    }

    // 发布
    call() {
        for (let i = 0, l = this.hooks.length; i < l; i++) {
            let hook = this.hooks[i];
            let result = hook(...arguments);
            if (result) {
                break;
            }
        }
    }
}
```

#### (3) `SyncWaterfallHook`
上一个监听函数的返回值可以传给下一个监听函数
- usage
```
const {
    SyncWaterfallHook
} = require("tapable");

let queue = new SyncWaterfallHook(['name']);

// 上一个函数的返回值可以传给下一个函数
queue.tap('1', function (name) {
    console.log(name, 1);
    return 1;
});
queue.tap('2', function (data) {
    console.log(data, 2);
    return 2;
});
queue.tap('3', function (data) {
    console.log(data, 3);
});

queue.call('webpack');

// 执行结果:
/* 
webpack 1
1 2
2 3
*/
```

- 原理

```js
class SyncWaterfallHook_MY{
    constructor(){
        this.hooks = [];
    }
    
    // 订阅
    tap(name, fn){
        this.hooks.push(fn);
    }

    // 发布
    call(){
        let result = null;
        for(let i = 0, l = this.hooks.length; i < l; i++) {
            let hook = this.hooks[i];
            result = i == 0 ? hook(...arguments): hook(result); 
        }
    }
}
```

#### (4) `SyncLoopHook`
当监听函数被触发的时候，如果该监听函数返回`true`时则这个监听函数会反复执行，如果返回 `undefined` 则表示退出循环
- usage

```js
const {
    SyncLoopHook
} = require("tapable");

let queue = new SyncLoopHook(['name']); 

let count = 3;
queue.tap('1', function (name) {
    console.log('count: ', count--);
    if (count > 0) {
        return true;
    }
    return;
});

queue.call('webpack');

// 执行结果:
/* 
count:  3
count:  2
count:  1
*/
```

- 原理

```js
class SyncLoopHook_MY {
    constructor() {
        this.hook = null;
    }

    // 订阅
    tap(name, fn) {
        this.hook = fn;
    }

    // 发布
    call() {
        let result;
        do {
            result = this.hook(...arguments);
        } while (result)
    }
}
```


## async* 钩子
### 异步并行
#### (1) `AsyncParallelHook`
不关心监听函数的返回值。

有三种注册/发布的模式，如下：

|异步订阅|调用方法|
|-|-|
|tap|callAsync|
|tapAsync|callAsync|
|tapPromise|promise|

- usage - tap

```js
const {
    AsyncParallelHook
} = require("tapable");

let queue1 = new AsyncParallelHook(['name']);
console.time('cost');
queue1.tap('1', function (name) {
    console.log(name, 1);
});
queue1.tap('2', function (name) {
    console.log(name, 2);
});
queue1.tap('3', function (name) {
    console.log(name, 3);
});
queue1.callAsync('webpack', err => {
    console.timeEnd('cost');
});

// 执行结果
/* 
webpack 1
webpack 2
webpack 3
cost: 4.520ms
*/
```

- usage - tapAsync

```js
let queue2 = new AsyncParallelHook(['name']);
console.time('cost1');
queue2.tapAsync('1', function (name, cb) {
    setTimeout(() => {
        console.log(name, 1);
        cb();
    }, 1000);
});
queue2.tapAsync('2', function (name, cb) {
    setTimeout(() => {
        console.log(name, 2);
        cb();
    }, 2000);
});
queue2.tapAsync('3', function (name, cb) {
    setTimeout(() => {
        console.log(name, 3);
        cb();
    }, 3000);
});

queue2.callAsync('webpack', () => {
    console.log('over');
    console.timeEnd('cost1');
});

// 执行结果
/* 
webpack 1
webpack 2
webpack 3
over
time: 3004.411ms
*/
```


- usage - promise
 ```js
let queue3 = new AsyncParallelHook(['name']);
console.time('cost3');
queue3.tapPromise('1', function (name, cb) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => {
            console.log(name, 1);
            resolve();
        }, 1000);
    });
});

queue3.tapPromise('1', function (name, cb) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => {
            console.log(name, 2);
            resolve();
        }, 2000);
    });
});

queue3.tapPromise('1', function (name, cb) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => {
            console.log(name, 3);
            resolve();
        }, 3000);
    });
});

queue3.promise('webpack')
    .then(() => {
        console.log('over');
        console.timeEnd('cost3');
    }, () => {
        console.log('error');
        console.timeEnd('cost3');
    });
/* 
webpack 1
webpack 2
webpack 3
over
cost3: 3007.925ms
*/
```

#### (2) `AsyncParallelBailHook`
只要监听函数的返回值不为 `null`，就会忽略后面的监听函数执行，直接跳跃到`callAsync`等触发函数绑定的回调函数，然后执行这个被绑定的回调函数。
- usage - tap

```js
let queue1 = new AsyncParallelBailHook(['name']);
console.time('cost');
queue1.tap('1', function (name) {
    console.log(name, 1);
});
queue1.tap('2', function (name) {
    console.log(name, 2);
    return 'wrong'
});
queue1.tap('3', function (name) {
    console.log(name, 3);
});
queue1.callAsync('webpack', err => {
    console.timeEnd('cost');
});
// 执行结果:
/* 
webpack 1
webpack 2
cost: 4.975ms
 */

```
- usage - tapAsync

```js
let queue2 = new AsyncParallelBailHook(['name']);
console.time('cost1');
queue2.tapAsync('1', function (name, cb) {
    setTimeout(() => {
        console.log(name, 1);
        cb();
    }, 1000);
});
queue2.tapAsync('2', function (name, cb) {
    setTimeout(() => {
        console.log(name, 2);
        return 'wrong';// 最后的回调就不会调用了
        cb();
    }, 2000);
});
queue2.tapAsync('3', function (name, cb) {
    setTimeout(() => {
        console.log(name, 3);
        cb();
    }, 3000);
});

queue2.callAsync('webpack', () => {
    console.log('over');
    console.timeEnd('cost1');
});

// 执行结果:
/* 
webpack 1
webpack 2
webpack 3
*/
```
- usage - promise
```js
let queue3 = new AsyncParallelBailHook(['name']);
console.time('cost3');
queue3.tapPromise('1', function (name, cb) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => {
            console.log(name, 1);
            resolve();
        }, 1000);
    });
});

queue3.tapPromise('2', function (name, cb) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => {
            console.log(name, 2);
            reject('wrong');// reject()的参数是一个不为null的参数时，最后的回调就不会再调用了
        }, 2000);
    });
});

queue3.tapPromise('3', function (name, cb) {
    return new Promise(function (resolve, reject) {
        setTimeout(() => {
            console.log(name, 3);
            resolve();
        }, 3000);
    });
});

queue3.promise('webpack')
    .then(() => {
        console.log('over');
        console.timeEnd('cost3');
    }, () => {
        console.log('error');
        console.timeEnd('cost3');
    });

// 执行结果:
/* 
webpack 1
webpack 2
error
cost3: 2009.970ms
webpack 3
*/
```


### 异步串行
#### (1) `AsyncSeriesHook`
不关系`callback()`的参数
- usage - tap

```js
const {
    AsyncSeriesHook
} = require("tapable");

// tap
let queue1 = new AsyncSeriesHook(['name']);
console.time('cost1');
queue1.tap('1', function (name) {
    console.log(1);
    return "Wrong";
});
queue1.tap('2', function (name) {
    console.log(2);
});
queue1.tap('3', function (name) {
    console.log(3);
});
queue1.callAsync('zfpx', err => {
    console.log(err);
    console.timeEnd('cost1');
});
// 执行结果
/* 
1
2
3
undefined
cost1: 3.933ms
*/
```

- usage - tapAsync
```js
let queue2 = new AsyncSeriesHook(['name']);
console.time('cost2');
queue2.tapAsync('1', function (name, cb) {
    setTimeout(() => {
        console.log(name, 1);
        cb();
    }, 1000);
});
queue2.tapAsync('2', function (name, cb) {
    setTimeout(() => {
        console.log(name, 2);
        cb();
    }, 2000);
});
queue2.tapAsync('3', function (name, cb) {
    setTimeout(() => {
        console.log(name, 3);
        cb();
    }, 3000);
});

queue2.callAsync('webpack', (err) => {
    console.log(err);
    console.log('over');
    console.timeEnd('cost2');
}); 
// 执行结果
/* 
webpack 1
webpack 2
webpack 3
undefined
over
cost2: 6019.621ms
*/
```

- usage - promise
```js
let queue3 = new AsyncSeriesHook(['name']);
console.time('cost3');
queue3.tapPromise('1',function(name){
   return new Promise(function(resolve){
       setTimeout(function(){
           console.log(name, 1);
           resolve();
       },1000)
   });
});
queue3.tapPromise('2',function(name,callback){
    return new Promise(function(resolve){
        setTimeout(function(){
            console.log(name, 2);
            resolve();
        },2000)
    });
});
queue3.tapPromise('3',function(name,callback){
    return new Promise(function(resolve){
        setTimeout(function(){
            console.log(name, 3);
            resolve();
        },3000)
    });
});
queue3.promise('webapck').then(err=>{
    console.log(err);
    console.timeEnd('cost3');
});

// 执行结果
/* 
webapck 1
webapck 2
webapck 3
undefined
cost3: 6021.817ms
*/
```

- 原理
```js
class AsyncSeriesHook_MY {
    constructor() {
        this.hooks = [];
    }

    tapAsync(name, fn) {
        this.hooks.push(fn);
    }

    callAsync() {
        var slef = this;
        var args = Array.from(arguments);
        let done = args.pop();
        let idx = 0;

        function next(err) {
            // 如果next的参数有值，就直接跳跃到 执行callAsync的回调函数
            if (err) return done(err);
            let fn = slef.hooks[idx++];
            fn ? fn(...args, next) : done();
        }
        next();
    }
}
```

#### (2) `AsyncSeriesBailHook`
`callback()`的参数不为`null`，就会直接执行`callAsync`等触发函数绑定的回调函数
- usage - tap
```js
const {
    AsyncSeriesBailHook
} = require("tapable");

// tap
let queue1 = new AsyncSeriesBailHook(['name']);
console.time('cost1');
queue1.tap('1', function (name) {
    console.log(1);
    return "Wrong";
});
queue1.tap('2', function (name) {
    console.log(2);
});
queue1.tap('3', function (name) {
    console.log(3);
});
queue1.callAsync('webpack', err => {
    console.log(err);
    console.timeEnd('cost1');
});

// 执行结果:
/* 
1
null
cost1: 3.979ms
*/
```

- usage - tapAsync

```js
let queue2 = new AsyncSeriesBailHook(['name']);
console.time('cost2');
queue2.tapAsync('1', function (name, callback) {
    setTimeout(function () {
        console.log(name, 1);
        callback();
    }, 1000)
});
queue2.tapAsync('2', function (name, callback) {
    setTimeout(function () {
        console.log(name, 2);
        callback('wrong');
    }, 2000)
});
queue2.tapAsync('3', function (name, callback) {
    setTimeout(function () {
        console.log(name, 3);
        callback();
    }, 3000)
});
queue2.callAsync('webpack', err => {
    console.log(err);
    console.log('over');
    console.timeEnd('cost2');
});
// 执行结果

/* 
webpack 1
webpack 2
wrong
over
cost2: 3014.616ms
*/
```

- usage - promise

```js
let queue3 = new AsyncSeriesBailHook(['name']);
console.time('cost3');
queue3.tapPromise('1', function (name) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            console.log(name, 1);
            resolve();
        }, 1000)
    });
});
queue3.tapPromise('2', function (name, callback) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            console.log(name, 2);
            reject();
        }, 2000)
    });
});
queue3.tapPromise('3', function (name, callback) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log(name, 3);
            resolve();
        }, 3000)
    });
});
queue3.promise('webpack').then(err => {
    console.log(err);
    console.log('over');
    console.timeEnd('cost3');
}, err => {
    console.log(err);
    console.log('error');
    console.timeEnd('cost3');
});
// 执行结果：
/* 
webpack 1
webpack 2
undefined
error
cost3: 3017.608ms
*/
```

#### (3) `AsyncSeriesWaterfallHook`
上一个监听函数的中的`callback(err, data)`的第二个参数,可以作为下一个监听函数的参数
- usage - tap

```
const {
    AsyncSeriesWaterfallHook
} = require("tapable");

// tap
let queue1 = new AsyncSeriesWaterfallHook(['name']);
console.time('cost1');
queue1.tap('1', function (name) {
    console.log(name, 1);
    return 'lily'
});
queue1.tap('2', function (data) {
    console.log(2, data);
    return 'Tom';
});
queue1.tap('3', function (data) {
    console.log(3, data);
});
queue1.callAsync('webpack', err => {
    console.log(err);
    console.log('over');
    console.timeEnd('cost1');
});

// 执行结果:
/* 
webpack 1
2 'lily'
3 'Tom'
null
over
cost1: 5.525ms
*/
```

- usage - tapAsync

```js
let queue2 = new AsyncSeriesWaterfallHook(['name']);
console.time('cost2');
queue2.tapAsync('1', function (name, callback) {
    setTimeout(function () {
        console.log('1: ', name);
        callback(null, 2);
    }, 1000)
});
queue2.tapAsync('2', function (data, callback) {
    setTimeout(function () {
        console.log('2: ', data);
        callback(null, 3);
    }, 2000)
});
queue2.tapAsync('3', function (data, callback) {
    setTimeout(function () {
        console.log('3: ', data);
        callback(null, 3);
    }, 3000)
});
queue2.callAsync('webpack', err => {
    console.log(err);
    console.log('over');
    console.timeEnd('cost2');
});
// 执行结果：
/* 
1:  webpack
2:  2
3:  3
null
over
cost2: 6016.889ms
*/
```


- usage - promise

```js
let queue3 = new AsyncSeriesWaterfallHook(['name']);
console.time('cost3');
queue3.tapPromise('1', function (name) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            console.log('1:', name);
            resolve('1');
        }, 1000)
    });
});
queue3.tapPromise('2', function (data, callback) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log('2:', data);
            resolve('2');
        }, 2000)
    });
});
queue3.tapPromise('3', function (data, callback) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log('3:', data);
            resolve('over');
        }, 3000)
    });
});
queue3.promise('webpack').then(err => {
    console.log(err);
    console.timeEnd('cost3');
}, err => {
    console.log(err);
    console.timeEnd('cost3');
});
// 执行结果：
/* 
1: webpack
2: 1
3: 2
over
cost3: 6016.703ms
*/
```

- 原理

```js
class AsyncSeriesWaterfallHook_MY {
    constructor() {
        this.hooks = [];
    }

    tapAsync(name, fn) {
        this.hooks.push(fn);
    }

    callAsync() {
        let self = this;
        var args = Array.from(arguments);

        let done = args.pop();
        console.log(args);
        let idx = 0;
        let result = null;

        function next(err, data) {
            if (idx >= self.hooks.length) return done();
            if (err) {
                return done(err);
            }
            let fn = self.hooks[idx++];
            if (idx == 1) {

                fn(...args, next);
            } else {
                fn(data, next);
            }
        }
        next();
    }
}
```