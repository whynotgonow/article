// 1 定义State接口，在这个接口中，每个动作都有一个对相应的方法
function OffLightState (light) {
  this.light = light
}
OffLightState.prototype.buttonWasPressed = function () {
  console.log("转换为 弱光")
  this.light.setState(this.light.weakLightState)
}

function WeakLightState (light) {
  this.light = light
}
WeakLightState.prototype.buttonWasPressed = function () {
  console.log("转换为 强光")
  this.light.setState(this.light.strongLightState)
}

function StrongLightState (light) {
  this.light = light
}

StrongLightState.prototype.buttonWasPressed = function () {
  console.log("转换为 关闭")


  this.light.setState(this.light.offLightState)
}



function Light () {
  // 2 在Context中为每个状态实现状态类，这些类负责在对应的状态下进行转换
  this.offLightState = new OffLightState(this)
  this.weakLightState = new WeakLightState(this)
  this.strongLightState = new StrongLightState(this)
  this.button = null
}

Light.prototype.init = function () {
  var button = document.createElement("button"),
    self = this;

  this.button = document.body.appendChild(button)
  this.button.innerHTML = "开关"

  this.currentState = this.offLightState

  this.button.onclick = function () {
    // 3 将动作委托到状态类
    self.currentState.buttonWasPressed()
  }

}

Light.prototype.setState = function (newState) {
  this.currentState = newState

}





