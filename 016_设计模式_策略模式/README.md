# 策略模式 Strategy Pattern

## 1 定义
- 定义算法族，分别封装起来，让它们之间可以相互替换，此模式让算法的变化独立于使用算法的客户。

一个基于策略模式的程序至少由两部分组成。第一个部分是一组策略类，策略类封装了具体的算法，并负责具体的计算过程。第二部分是环境类Context，Context接受客户的请求，随后把请求委托给某一个策略类。

策略模式的实现并不复杂，关键是如何从策略模式的实现背后，找到 **封装变化**、**委托**和 **多态性**这些思想的价值。



## 2 设计原则
#### 找出应用中可能需要变化之处，把它们独立出来，不要和那些不需要变化的代码混在一起
把会变化的本分取出并“封装”，好让其他部分不会受到影响。这样代码变化引起的不精益后果变少，系统变得更有弹性。

#### 针对接口编程，而不是针对实现编程
关键在于**多态**。利用**多态**，程序可以针对超类型编程，执行时会根据实际状态执行到真正的行为，不会被绑死在超类型的行为上。

#### 多用组合少用继承
使用组合建立系统具有很大的弹性




## 3 一个例子
在这里举例了一个<JavaScript 设计模式与开发实践>一书中的一个例子
### 策略模式重构前
```html
<form action="xxx" id="registerForm" method="POST">
  用户名： <input type="text" name="userName" /> 
  密码：<input type="text" name="passWord" /> 
  手机号：<input type="text" name="phoneNumber" />
  <button>提交</button>
</form>
```
```js
let registerForm = document.getElementById("registerForm")

registerForm.onsubmit = function () {
  if (registerForm.userName.value === "") {
    alert("用户名不得为空！")
    return false
  }

  if (registerForm.passWord.value.length < 6) {
    alert("密码长度不能少于6位！")
    return false
  }

  if (!/^1[3456789]\d{9}$/.test(registerForm.phoneNumber.value)) {
    alert("手机号码格式不正确！")
    return false
  }

}
```

这样写有很多缺点，如下：
- `registerForm.onsubmit`函数比较庞大，且包含了许多 `if-else` 语句,这些语句要覆盖所有的校验规则
- `registerForm.onsubmit`函数缺乏弹性，如果增加新的校验规则要深入`registerForm.onsubmit` 函数的内部实现
- 复用性差


### 策略模式重构后
```js
let Validator = function () {
  this.cache = [] //保存校验规则
}

Validator.prototype.add = function (dom, rule, errorMsg) {
  let ary = rule.split(":");

  this.cache.push(function () {
    let stragegy = ary.shift()
    ary.unshift(dom.value)
    ary.push(errorMsg)

    return strategies[stragegy].apply(dom, ary)
  })

}

Validator.prototype.start = function () {
  for (let i = 0, validatorFunc; validatorFunc = this.cache[i++];) {
    let msg = validatorFunc()
    if (msg) {
      return msg
    }
  }

}

let strategies = {
  isNoEmpty: (value, errorMsg) => {
    if (value === "") {
      return errorMsg
    }
  },
  minLength: (value, length, errorMsg) => {
    if (value.length < length) {
      return errorMsg
    }
  },
  isMobile: (value, errorMsg) => {
    if (!/^1[3456789]\d{9}$/.test(value)) {
      return errorMsg
    }
  }
}

let registerForm = document.getElementById("registerForm")

let validataFunc = function () {
  let validator = new Validator();

  // 添加一些校验规则
  // 多态性的体现，也实现了“他们可以互换的”目的
  validator.add(registerForm.userName, "isNoEmpty", "用户名不得为空！")
  validator.add(registerForm.passWord, "minLength:6", "密码长度不能少于6位！")
  validator.add(registerForm.phoneNumber, "isMobile", "手机号码格式不正确！")

  // 获得校验结果
  let errorMsg = validator.start()

  // 返回校验结果
  return errorMsg

}

registerForm.onsubmit = function () {
  let errorMsg = validataFunc();
  if (errorMsg) {
    alert(errorMsg)
    return false
  }

}

```

使用策略模式重构后，我们仅仅通过“配置”的方式就可以完成一个表单的校验，这些校验规则也可以复用在程序的任何地方，还可以作为插件的形式，方便地被移植到其他项目中。

## 4 总结
在以类为中心的传统面向对象的语言中，不同的算法或者行为被封装在各个策略类中，Context将请求委托给这些策略对象，这些策略对象会根据请求返回不同的执行结果，这样便能表现出对象的多态性。

有人说过：“**在函数作为一等对象的语言中，策略模式是隐形的。Strage就是值为函数的变量。**”在 JS 中，除了使用类来封装算法和行为之外，使用函数当然也是一种选择。这些“算法”可以被封装到函数中并且四处传递，也就是我们常说的 **“高阶函数”**。实际上在JS中，策略模式已经融入到了语言本身当中，我们经常用高阶函数类封装不同的行为，并且把它传递到领另一个函数中。当我们对这些函数发出“调用”的消息时，不同的函数会返回不同的执行结果。在JS中，“函数对象的多态性”来的更加简单。


