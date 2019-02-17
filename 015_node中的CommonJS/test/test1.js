/* 
  通过exports导出的方法
  --> 会传递给module.exports
  --> 二者没区别
*/

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