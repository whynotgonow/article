/* 
  直接传给module.exports
  --> 那exports就说明都没有
  --> 二者不相等了
*/
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