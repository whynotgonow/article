/* 
  引用test2.js
  --> 导出的文件中的函数变成了类，所以要new一个对象，再调用方法
*/
let Counter = require('./test2');

// 直接调用报错
// console.log(Counter.printNextCount())   // TypeError: Counter.printNextCount is not a function

// new一个对象再调用
let counterObj = new Counter();
counterObj.printNextCount(); // 10



/* 
1.最好别分别定义module.exports和exports

2.NodeJs开发者建议导出对象用module.exports,导出多个方法和变量用exports
*/