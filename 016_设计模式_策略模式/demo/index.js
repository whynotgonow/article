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



