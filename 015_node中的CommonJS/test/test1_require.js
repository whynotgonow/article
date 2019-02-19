/* 
  引用test1.js
  --> 只能作为函数调用
*/
let counter = require('./test1')
console.log(counter)  // { temp: [Function] }
counter.temp()        // 只能作为函数调用