
本文是个人笔记~

## 一 观察者模式

### 1 定义
> 又叫发布订阅模式。观察者模式定义了对象之间的一对多的依赖，这样一来，当一个对象改变状态时，它的所有依赖都会受到通知并自动更新。


### 2 要点

#### 1) 观察者模式定义了对象之间一对多的关系
主题和观察者定义了一对多的关系。观察者依赖于此主题，只是主题状态一有变化，观察者就会被通知。根据通知的风格观察者可能因此新值而更新。

利用观察者模式主题是具有状态的对象，并且可以控制这些状态。也就是说，有“一个”具有状态的主题。另一方面，观察者使用这些状态，虽然这些状态并不属于他们。有许多的观察者，依赖主题来告诉他们状态合适改变了。这就产生了一个关系：“一个”主题对“多个”观察者的关系。

#### 2) 观察者和主题之间用松偶合的方式结合，主题不知道观察者的细节，只知道观察者实现了观察者接口

#### 3) 使用此模式，可以从被观察者处推（**push**）或拉（**pull**），更推荐使用推
推模型是只在事件发生时，主题一次性把所有更改的状态都推送给订阅者。拉模型不同的地方是，发布者仅仅通知观察者事件已经发生了，此外主题要提供一些公开的接口供订阅者来主动拉取数据。拉模型的好处是可以让订阅者“按需获取”，但同时有可能让主题变成一个“门户大开”的对象，同时增加了代码量和负责度。



### 3 观察者模式在JS中的使用
- 可以广泛的应用于异步编程中，这是一种替代传递回调函数的方案。
- 可以取代对象之间硬编码的通知机制，一个对象不用再显式地调用另外一个对象的某个接口


#### 1) DOM事件
举个例子，DOM节点上绑定事件函数
```js
// 观察者
function test(){console.log("test")}

// 添加观察者
document.body.addEventListener("click", test)

// 删除观察者
document.body.removeEventListener("click", test)
```

#### 2) 自定义事件

### 4 观察者模式的通用实现（JS）
```js
let event = {
  clientList: {},// 存放观察者的缓存列表

  // 添加观察者
  listen: function (key, fn) {
    if (!this.clientList[key]) {// key 为观察者们的命名空间
      this.clientList[key] = []
    }

    this.clientList[key].push(fn)
  },

  // 发布消息通知观察者
  trigger: function () {
    var key = Array.prototype.shift.call(arguments),
      fns = this.clientList[key];

    if (!fns || fns.length === 0) {
      return false
    }

    for (let i = 0, fn; fn = fns[i++];) {
      fn.apply(this, arguments)
    }
  }
}

event.listen("test1", function(){console.log("test1")})
event.listen("test1", function(){console.log("test1-1")})
event.listen("test2", function(){console.log("test2")})

event.trigger("test1")  // test1 test1-1
event.trigger("test2")  // test2

```


### 4 最后
在Java中实现一个自己的观察者模式，通常会把观察者对象自身当成引用传入主题对象中，同时观察者对象还需提供一个名为`update`的方法，供主题对象在合适的时候调用。而在JS中，我们用注册回调函数的形式来代替传统的方式，显得更加优雅和简单。

当然观察者模式也不是完全没有缺点。创建观察者本身要消耗一定的事件和内存，而且当你订阅一个消息后，也许此消息最后都未发生，但是这个观察者始终存在于内存中。另外，观察者模式虽然可以弱化对象之间的联系，但是如果过度使用的话，对象和对象之间的必要联系也将被深埋在背后，会导致程序难以跟踪维护和理解。


## 二 装饰者模式 Decorator
在程序开发中，许多时候并不希望某个类天生就非常庞大，一次性包含很多职责。那么我们可以使用装饰者模式。

### 1 定义
给对象动态地增加职责的方式称为装饰者模式。
装饰者模式能够在不改变对象自身的基础上，在程序运行期间给对象动态地添加职责。跟集成相比，装饰者是一种更轻便灵活的做法，是一种“即付即用”的方式。


### 2 JS模拟面向对象语言的装饰者模式
```js
var Plane = function () {}

Plane.prototype.fire = function (params) {
  console.log("发射普通子弹")
}


// 增加两个装饰类
var MissileDecorator = function(plane){
  this.plane = plane
}

MissileDecorator.prototype.fire = function (params) {
  this.plane.fire()
  console.log("发射导弹")
}

var AtomDecorator = function(plane){
  this.plane = plane
}

AtomDecorator.prototype.fire = function (params) {
  this.plane.fire()
  console.log("发射原子弹")
}

var plane = new Plane()
plane = new MissileDecorator(plane)
plane = new AtomDecorator(plane)

plane.fire()
```

这种给对象动态增加职责的方式，并没有真正地改动对象自身，而是将对象放入另一个对象之中，这些对象以一条链的方式进行引用，形成一个聚合对象。
因为装饰者对象和它所封装的对象用友一致的接口，所以它们对使用该对象的客户来说是透明的，被装饰的对象也不需要了解它曾经被装饰过，这种透明性是的我们可以递归地嵌套任意多个装饰者对象。

从 **功能**上而言，**decorator**能很好的描述这个模式，但是从 **结构**上看，**wrapper的说法更加贴切**。
如下图
![](https://user-gold-cdn.xitu.io/2020/5/17/172225927a7903ec?w=2070&h=1344&f=jpeg&s=118176)


### 3 注意
- 装饰者模式意味着一群装饰者类，这些类是用来包装具体组件
- 装饰者可以在被装饰者的行为前面或后面加上自己的行为，甚至将被装饰者的行为整个取代掉，而达到特定的目的
- 可以用无数个装饰者包装一个组件
- 装饰者会导致设计中出现许多小对象，如果过度使用，会让程序变得很复杂





## 三 参考
- [Head First 设计模式（中文版）](https://item.jd.com/10100236.html)
- [JavaScript 设计模式](https://item.jd.com/36435985732.html)