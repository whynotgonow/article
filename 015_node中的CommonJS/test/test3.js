/* 
  exports仅仅是module.exports的一个地址引用。
  nodejs只会导出module.exports的指向，如果exports指向变了，那就仅仅是exports不在指向module.exports，于是不会再被导出
*/

let counter = 0;
exports.printNextCount = function () {
  counter += 2;
  console.log(counter);
}

module.exports = function () {
  counter += 10;
  this.printNextCount = function () {
    console.log(counter)
  }
}

console.log(exports);
console.log(module.exports);
console.log(exports === module.exports);
/* 
  { printNextCount: [Function] }
  [Function]
  false
*/