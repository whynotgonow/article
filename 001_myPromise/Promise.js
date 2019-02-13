function Promise(executor) {
    let self = this;
    self.status = 'pending';
    self.value = undefined;
    self.onResolvedCallBacks = [];
    self.onRejectedCallBacks = [];
    
    function resolve(value) {
        if (value instanceof Promise) {
            return value.then(resolve, reject);
        }
        setTimeout(function () {
            if (self.status === 'pending') {
                self.status = 'fulfilled';
                self.value = value;
                self.onResolvedCallBacks.forEach(item => item(self.value))
            }
        }, 0)
    }
    
    function reject(reason) {
        setTimeout(function () {
            if (self.status === 'pending') {
                self.status = 'rejected';
                self.value = reason;
                self.onRejectedCallBacks.forEach(item => item(self.value))
            }
        }, 0)
    }
    
    try {
        executor(resolve, reject);
    } catch (e) {
        reject(e);
    }
    
}


function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject(new TypeError('循环引用'))
    }
    let then, called;
    // called 有时候Promise会同时执行成功和失败的回调 这时候只允许执行一个
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

Promise.prototype.then = function (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (value) {
        return value
    };
    onRejected = typeof onRejected === 'function' ? onRejected : function (err) {
        throw err
    };
    
    let self = this;
    let promise2;
    if (self.status === 'fulfilled') {
        promise2 = new Promise(function (resolve, reject) {
            setTimeout(function () {
                try {
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

Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
};

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

Promise.race = function (promises) {
    return new Promise(function (resolve, reject) {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(resolve, reject)
        }
    })
};

Promise.deferred = Promise.defer = function () {
    let defer = {};
    defer.promise = new Promise(function (resolve, reject) {
        defer.resolve = resolve;
        defer.reject = reject;
    });
    return defer;
};

Promise.resolve = function (value) {
    return new Promise(function (resolve, reject) {
        resolve(value);
    })
};


Promise.reject = function (reason) {
    return new Promise(function (resolve, reject) {
        reject(reason);
    })
};

module.exports = Promise;









