## 1 什么是Promise
### 1.1 Promise 解决的问题
#### 1.1.1 回调地狱

我们在做项目的时候经常遇到多个回调函数嵌套在一起的情况，一层套一层，代码不够直观并且不容易维护，就是所谓的回调地狱。Promise 就很好的解决了这个问题。


#### 1.1.2 并行结果
如果几个异步操作之间并没有前后顺序之分,但需要等多个异步操作都完成后才能执行后续的任务，无法实现并行节约时间。
 
### 1.2 Promise的简介
 Promise是抽象异步处理对象以及对其进行各种操作的组件。在 ES6 Promises 标准中定义的API还不是很多。目前大致有下面三种类型。
 
#### 1.2.1 Constructor
 
```JavaScript
//要想创建一个promise对象、可以使用new来调用Promise的构造器来进行实例化。
var promise = new Promise(function(resolve, reject) {
    // 异步处理
    // 处理结束后、调用resolve 或 reject
});
```
 
#### 1.2.2 Instance Method
 
```JavaScript
// 对通过new生成的promise对象为了设置其值在成功/失败时调用的回调函数 可以使用promise.then() 实例方法。
// resolve(成功)时onFulfilled 会被调用
// reject(失败)时onRejected 会被调用

promise.then(onFulfilled, onRejected)
```
  
#### 1.2.3 Static Method
 
```JavaScript
// 一些对Promise进行操作的辅助方法，包括 Promise.all() 、Promise.race() 、Promise.resolve()、Promise.reject()  等
```
 
 
## 2 Promise常用的API
### 2.1 Promise.all
- **参数**：接受一个数组，数组内都是Promise实例
- **返回值**：返回一个Promise实例，这个Promise实例的状态转移取决于参数的Promise实例的状态变化。当参数中所有的实例都处于resolve状态时，返回的Promise实例会变为resolve状态。如果参数中任意一个实例处于reject状态，返回的Promise实例变为reject状态。
Promise.all([p1, p2]).then(function (result) {
  console.log(result); // [ '2.txt', '2' ]
});
> 不管两个promise谁先完成，Promise.all 方法会按照数组里面的顺序将结果返回

### 2.2 Promise.race
- **参数**：接受一个数组，数组内都是Promise实例
- **返回值**：返回一个Promise实例，这个Promise实例的状态转移取决于参数的Promise实例的状态变化。当参数中任何一个实例处于resolve状态时，返回的Promise实例会变为resolve状态。如果参数中任意一个实例处于reject状态，返回的Promise实例变为reject状态。

```JavaScript
Promise.race([p1, p2]).then(function (result) {
  console.log(result); // [ '2.txt', '2' ]
});
```

### 2.3 Promise.resolve 
- 返回一个Promise实例，这个实例处于resolve状态。
- 根据传入的参数不同有不同的功能：值(对象、数组、字符串等) 会 作为resolve传递出去的值; Promise实例：原封不动返回。


### 2.4 Promise.reject
- 返回一个Promise实例，这个实例处于reject状态。
- 参数一般就是抛出的错误信息。


## 3 Promise源码的实现
  
  之前接触过Promise，但是对Promise的调用和状态变化一直很模糊，死记硬背后过了一段时间就忘记了，很痛苦，一直想要从根本上弄懂Promise。最近直接根据Promise/A+规范，自己实现了一个简单版本的Promise库。废话不多说，上干货。
  
  
### 3.1 Promise的初始化
  
```JavaScript
// Promise 有三种状态(pending, fulfilled, rejected)，初始值为pending。
// Promise 有两个执行函数来改变状态的值，成功的时候执行resolve，失败的时候执行reject。
```


```JavaScript
//构造函数中
function Promise(executor) {
    let self = this;
    
    /*初始化status*/
    self.status = 'pending';
    /*初始化value*/
    self.value = undefined;
    /*订阅事件的数组*/
    self.onResolvedCallBacks = [];
    self.onRejectedCallBacks = [];
    
    /*此函数将Promise实例的状态由pending 转化为 fulfilled*/
    function resolve(value) {
         if (value instanceof Promise) {
            return value.then(resolve, reject);
        }
        setTimeout(function () {
            if (self.status === 'pending') {
                self.status = 'fulfilled';
                self.value = value;
                /*发布已经订阅过的事件*/
                self.onResolvedCallBacks.forEach(item => item(self.value))
            }
        }, 0)
    }
    /*此函数将Promise实例的状态由pending 转化为 rejected*/
    function reject(reason) {
        setTimeout(function () {
            if (self.status === 'pending') {
                self.status = 'rejected';
                self.value = reason;
                /*发布已经订阅过的事件*/
                self.onRejectedCallBacks.forEach(item => item(self.value))
            }
        }, 0)
    }
    
    // new Promise 的时候，执行器（executor）的代码会立即执行
    try {
        executor(resolve, reject);
    } catch (e) {
        reject(e);
    }
    
}
```
  
### 3.2 Promise的then方法的实现和Promise的链式调用
每次调用then方法后都会返回一个新的Promise实例
```JavaScript
Promise.prototype.then = function (onFulfilled, onRejected) {
    /*当没有函数传递进来的时候，添加默认函数*/
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (value) {
        return value
    };
    onRejected = typeof onRejected === 'function' ? onRejected : function (err) {
        throw err
    };
    
    let self = this;
    /*由于要实现链式调用，所以每次执行then方法的时候都会返回一个新的Promise实例*/
    let promise2;
    if (self.status === 'fulfilled') {
        promise2 = new Promise(function (resolve, reject) {
            setTimeout(function () {
                try {
                    /*将onFulfilled函数执行的结果resolve掉*/
                    let x = onFulfilled(self.value);
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e);
                }
            }, 0)
        })
    }
    
    if (self.status === 'rejected') {
        promise2 = new Promise(function (resolve, reject) {
            setTimeout(function () {
                try {
                    /*将onRejected函数执行的结果reject掉*/
                    let x = onRejected(self.value);
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e);
                }
            }, 0)
        })
    }
    
    if (self.status === 'pending') {
        promise2 = new Promise(function (resolve, reject) {
            /*订阅事件*/
            self.onResolvedCallBacks.push(function () {
                try {
                    let x = onFulfilled(self.value);
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e);
                }
            });
            
            self.onRejectedCallBacks.push(function () {
                try {
                    let x = onRejected(self.value);
                    resolvePromise(promise2, x, resolve, reject)
                } catch (e) {
                    reject(e);
                }
            });
        })
    }
    return promise2;
};

/*辅助函数 --> 解决多层嵌套情况*/
function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject(new TypeError('循环引用'))
    }
    let then, called;
    if (x != null && (typeof x === 'function' || typeof x === 'object')) {
        try {
            then = x.then;
            if (typeof then === 'function') {
                then.call(x, function (data) {
                    if (called) return;
                    called = true;
                    resolvePromise(promise2, data, resolve, reject)
                }, function (err) {
                    if (called) return;
                    called = true;
                    reject(err);
                })
            } else {
                resolve(x);
            }
        } catch (e) {
            if (called) return;
            called = true;
            reject(e);
        }
    } else {
        resolve(x);
    }
}
```
  
### 3.3 Promise.catch的实现
  
```JavaScript
<!--其实就是then的变形-->
Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
};

/*
测试Promise/A+规范的方法
npm i -g promises-aplus-tests
promises-aplus-tests Promise.js
*/
```
  
 
  
## 4 自己实现Promise的几种常用方法
### 4.1 Promise.all
```JavaScript
Promise.all = function (promises) {
    return new Promise(function (resolve, reject) {
        let count = 0;
        let result = [];
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(function (data) {
                result[i] = data;
                if (++count === promises.length) {
                    resolve(result);
                }
            }, function (err) {
                reject(err);
            });
        }
    })
};
```
### 4.2 Promise.race
```JavaScript
Promise.race = function (promises) {
    return new Promise(function (resolve, reject) {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(resolve, reject)
        }
    })
};
```


### 4.3 Promise.resolve
```JavaScript
Promise.resolve = function (value) {
    return new Promise(function (resolve, reject) {
        resolve(value);
    })
};
```

### 4.4 Promise.reject
```JavaScript
Promise.reject = function (reason) {
    return new Promise(function (resolve, reject) {
        reject(reason);
    })
};
```

## 5 自己的感想
费了九牛二虎之力，终于勉强实现了Promise的功能。给我最直接的感觉就是，看似难懂的东西只要弄懂了后面是怎么实现的，用法就很简单了。当然在弄懂源码逻辑道路确实不容易，但是一遍不行两遍，两遍不行三遍。。。依次次类推，每次都有不同的收获，我想这就是传说中的‘读书百遍，其义自见’吧。
  

