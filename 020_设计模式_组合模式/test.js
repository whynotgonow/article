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



