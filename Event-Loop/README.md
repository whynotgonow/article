## 1 JS运行机制详解
### 1.1 单线程的JS
javascript是一门单线程语言，在最新的HTML5中提出了Web-Worker，但javascript是单线程这一核心仍未改变。所以一切javascript版的"多线程"都是用单线程模拟出来的，一切javascript多线程都是纸老虎！


### 1.2 Event Loop
既然js是单线程,后一个任务会等前一个任务执行完成后才会执行，如果前一个任务执行时间过长后面的任务一直得不到执行，就会引起阻塞。那么问题来了，假如我们想浏览新闻，但是新闻包含的超清图片加载很慢，难道我们的网页要一直卡着直到图片完全显示出来？因此我们会将任务分为两类：

- 同步任务
- 异步任务

当我们打开网站时，网页的渲染过程就是一大堆同步任务，比如页面骨架和页面元素的渲染。而像加载图片音乐之类占用资源大耗时久的任务，就是异步任务。具体逻辑见下面的导图：
![js执行机制](https://user-gold-cdn.xitu.io/2017/11/21/15fdd88994142347?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

> 文字描述
- 同步和异步任务分别进入不同的执行"场所"，同步的进入主线程，异步的进入Event Table并注册函数。
- 当指定的事情完成时，Event Table会将这个函数移入Event Queue。
- 主线程内的任务执行完毕为空，会去Event Queue读取对应的函数，进入主线程执行。
- 上述过程会不断重复，也就是常说的Event Loop(事件循环)。准确的讲，event loop是实现异步的一种机制。

上图中Event Queue 包括 macro task queue 和 micro task queue，下一小节我们会详细解释一下。
上代码我们体会一下这个流程：

```JavaScript
console.log('1');
setTimeout(function () {
    console.log('timeout');
});
console.log('2');
```
> 上面的代码解释
-  `console.log('1');`和`console.log('2');`是同步任务会放到主线程中，`setTimeout`声明的回调函数会放到Event Table。主线程内的任务(`console.log('1');console.log('2');`)执行完毕为空，会去Event Queue读取`console.log('timeout');`，进入主线程执行。所以执行的结果为`1 2 timeout`。


### 1.3 Evnet Loop 中的macro task 和 micro task
#### 1.3.1 定义 
- macro-task(宏任务)：包括整体代码script，setTimeout，setInterval, setImmediate(node环境下)。
- micro-task(微任务)：Promise，process.nextTick


下面两张图为Event Loop 和 macro-task 及 micro-task的关系 

![event loop & macro task & micro task1](https://user-gold-cdn.xitu.io/2017/11/21/15fdcea13361a1ec?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

![event loop & macro task & micro task2](https://user-gold-cdn.xitu.io/2018/1/20/161122277eea36f0?w=1024&h=768&f=png&s=961768)

> 导图解释

- 不同类型的任务会进入对应的Event Queue，比如setTimeout和setInterval会进入macro task Queue, Promise 会进入 micro task Queue。
- 事件循环的顺序，决定js代码的执行顺序。
- 进入整体代码(宏任务)后，开始第一次循环。接着执行所有的微任务。然后再次从宏任务开始，找到其中一个任务队列执行完毕，再执行所有的微任务。


#### 1.3.2 e.g.
看到这么多的定义和导图，我们来段代码屡一下：

```JavaScript
console.log('1');

setTimeout(function () {
    console.log('2');
    process.nextTick(function () {
        console.log('3');
    });
    new Promise(function (resolve) {
        console.log('4');
        resolve();
    }).then(function () {
        console.log('5')
    })
})
process.nextTick(function () {
    console.log('6');
})
new Promise(function (resolve) {
    console.log('7');
    resolve();
}).then(function () {
    console.log('8')
})
```

- 整体script作为第一个宏任务进入主线程，遇到console.log，输出1。
- 遇到setTimeout，其回调函数被分发到 macro task Queue中。
- 遇到process.nextTick()，其回调函数被分发到micro task Queue中。我们记为process1。
- 遇到Promise，new Promise直接执行，输出7。then被分发到micro task Queue中。我们记为then1。

|macro task Queue|macro task Queue|
|:-:|:-:|
|setTimeout|process1|
|-|then1|

- 我们发现了process1和then1两个微任务。
- 执行process1,输出6。
- 执行then1，输出8。
- 好了，第一轮事件循环正式结束，这一轮的结果是输出1，7，6，8。那么第二轮时间循环从setTimeout宏任务开始：
- 遇到console.log，输出2。
- 遇到process.nextTick()，同样将其分发到micro task Queue中，记为process2。new Promise立即执行输出4，then也分发到macro task Queue中，记为then2。


|macro task Queue|macro task Queue|
|:-:|:-:|
|-|process2|
|-|then2|

- 我们发现了process2和then2两个微任务。
- 执行process2,输出3。
- 执行then2，输出5。
- 好了，第一轮事件循环正式结束，这一轮的结果是输出2,4,3,5。循环结束。最终的结果为`1 7 6 8 2 4 3 5`。
 


### 1.4 总结
- javascript是一门单线程语言
- 事件循环是js实现异步的一种方法，也是js的执行机制。


## 2 Node中的Event Loop

### 2.1 node中Event Loop执行顺序

#### 2.1.1 node中Event Loop的执行顺序的简单介绍
下图为node中Event Loop的执行顺序的简略图
![node中Event Loop执行顺序的简略图](https://user-gold-cdn.xitu.io/2018/1/20/16112510d3b533c8?w=1024&h=768&f=jpeg&s=552568)
> note
- **timers**: 执行被setTimeout() 和 setInterval()注册的回调函数.
- **I/O callbacks**: 执行除了 close事件的回调、 被 timers和setImmediate()注册的回调. 
- **idle, prepare**: node内部执行
- **poll**: 轮询获取新的 I/O 事件; node有可能会在这个地方阻塞.
- **check**: 在这里调用setImmediate() 注册的回调.
- **close**: 执行close事件的回调

#### 2.1.2 详解poll阶段
> 1.poll阶段的功能
- 执行刚刚过期的计时器的脚本。
- 在轮询队列中处理事件。


> 2.poll阶段的处理流程

下面我用if else的方式描述一下poll阶段的处理逻辑，如下：
```JavaScript

if ('事件循环进入到 poll 阶段 ' && '没有timers注册的scripts') {
    if ('poll 队列 不为空') {
        console.log('循环遍历它的回调队列，以同步执行它们，直到队列耗尽，或者达到系统依赖的最大值');
    } else {
        if ('存在setImmediate()注册的scripts') {
            console.log('结束poll phase 进入到check phase 执行这些注册的scripts');
        } else {
            console.log('事件循环将等待被添加到队列中的回调，然后立即执行它们');
        }
    }
}
console.log('一旦轮询队列为空，事件循环将检查有无到期的计时器。如果有一个或多个计时器准备就绪，事件循环将返回到计时器阶段，以执行这些计时器的回调。');
```


> 3.比较setImmediate() 和 setTimeout()

`setImmediate()` 和 `setTimeout()`很相似的，它们何时被调用，决定了它们的行为方式的不同。
- `setImmediate` 用于在当前轮询阶段完成后执行脚本
- `setTimeout`用于把注册的脚本在最小阈值结束后运行。

它们执行的顺序将根据调用它们的上下文而变化。如果两个都是从主模块中调用，那么它们将受到进程性能的约束(这可能会受到其他应用程序的影响)。

例如，如果我们运行的脚本不是在I/O循环中(即主模块)，那么执行两个定时器的顺序是不确定的，因为它受过程性能的约束:

```javascript
setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});
// 打印结果的先后顺序是不确定的，有时`timeout`在前，有时'immediate'在前
```

但是，如果把这段代码放到I/O循环的回调中，`immediate`总是先被打印出来，如下：
```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  setImmediate(() => {
    console.log('immediate');
  });
});
// 在一个I/O周期内，在任何计时器的情况下，setImmediate的回调，因为在一个I/O周期内，I/O callback 的下一个阶段为setImmediate的回调。
```


### 2.2 node的Event Loop实现

如下图：

![node中的EventLoop](https://user-gold-cdn.xitu.io/2018/1/18/16109e54b46036d1?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

> 说明

- 1. Node的Event Loop分阶段，阶段有先后，依次是：

    - expired timers and intervals，即到期的setTimeout/setInterval
    - I/O events，包含文件，网络等等
    - immediates，通过setImmediate注册的函数
    - close handlers，close事件的回调，比如TCP连接断开


- 2. 同步任务及每个阶段之后都会清空microtask队列
    - 优先清空next tick queue，即通过process.nextTick注册的函数
    - 再清空other queue，常见的如Promise


- 3. node会清空当前所处阶段的队列，即执行所有task


我们在回头看一下，下面的代码:
```javascript
setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});
```
可以看出由于两个setTimeout延时相同，被合并入了同一个expired timers queue，而一起执行了。所以，只要将第二个setTimeout的延时改成超过2ms（1ms无效，因为最小间隔为1s），就可以保证这两个setTimeout不会同时过期，也能够保证输出结果的一致性。

我们在回头看一下，上面提到的另外一段代码:
```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  setImmediate(() => {
    console.log('immediate');
  });
});
```
为何这样的代码能保证setImmediate的回调优先于setTimeout的回调执行呢？因为当两个回调同时注册成功后，当前node的Event Loop正处于I/O queue阶段，而下一个阶段是immediates queue，所以能够保证即使setTimeout已经到期，也会在setImmediate的回调之后执行。

## 3 补充
由于水平有限，理解的程度可能会有偏差，欢迎大家指正。



## 4 参考文章
- [这一次，彻底弄懂 JavaScript 执行机制](https://juejin.im/post/59e85eebf265da430d571f89)
- [Event Loop的规范和实现](https://juejin.im/post/5a6155126fb9a01cb64edb45)
- [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#poll)
- [JavaScript 运行机制详解：再谈Event Loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html)
