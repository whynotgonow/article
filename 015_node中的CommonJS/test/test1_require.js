/* 
  引用test1.js
  --> 无论是直接调用，还是new一个对象再调用，都报错
*/
let counter = require('./test1')

// 直接调用
console.log(counter)          // { temp: [Function] }
counter.temp.printNextCount();     // TypeError: counter.temp.printNextCount is not a function

// new一个对象再调用
let obj = new counter()       // TypeError: counter is not a constructor
obj.printNextCount();
