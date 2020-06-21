## 组合模式
### 1 定义 
**组合模式**允许你将对象组合成树状结构来表现“整体/部分”层次结构。组合能让客户以一直的方式处理个别对象以及对象组合。

### 2 组合模式的用途
**(1) 表示树形结构**。组合模式可以非常方便地描述对象部分-整体层次结构。

**(2) 利用对象多态性统一对待组合对象和单个对象**。在组合模式中，客户将统一地使用组合结构中的所有对象，而不需要关心它究竟是组合对象还是单个对象。

```js
var Command = function () {
  return {
    commandList: [],
    add: function (command) {
      this.commandList.push(command)
    },
    execute: function () {
      for (let i = 0, command; command = this.commandList[i++];) {
        command.execute()
      }
    }
  }
}


var commandA = {
  execute: function(){
    console.log("A")
  }
}


var commandB = {
  execute: function(){
    console.log("B")
  }
}

var commandC = {
  execute: function(){
    console.log("C")
  }
}

var command_1 = Command()
command_1.add(commandB)
command_1.add(commandC)



var commandD = {
  execute: function(){
    console.log("D")
  }
}

var commandE = {
  execute: function(){
    console.log("E")
  }
}

var command_2 = Command()
command_2.add(commandD)
command_2.add(commandE)

let superCommand = Command()
superCommand.add(commandA)
superCommand.add(command_1)
superCommand.add(command_2)

superCommand.execute()


/* 
       superCommand
       /    |     \
      A     1      2
           / \    / \
          B   C  D   E
*/


```
每当对最上层的对象进行一次请求时，实际上是在对整个树进行**深度优先**的搜索。


### 3 何时clear使用组合模式
- 表示对象的部分-整体层次结构
- 客户希望统一对待树中的所有对象
  


然而，组合模式并不是完美的，它可能会产生一个这样的系统：系统中的每个对象看起来都与其他对象差不多。他们的区别只有在运行的时候才会显现出来，这会使代码难以理解。此外，如果通过组合模式创建了太多的对象，那么这些对象可能会让系统负担不起。