## 一 状态模式
### 1 定义
**允许一个对象在其内部状态改变时改变它的行为，对象看起来似乎修改了它的类。**
前半句的意思是，将状态封装成独立的类，并将请求委托给当前的状态对象，当对象的内部状态改变时，会带来不同的行为变化。
后半句的意思是，从客户的角度来看，我们使用的是对象，在不同的状态下具有截然不同的行为，这个对象看起来是从不同的类中实例化而来的，实际上这是使用了委托的效果。



### 2 状态模式设计
```js
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
  
  this.init()
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

var light = new Light()
```

### 3 状态模式优缺点
#### 1) 优点
- 状态模式定义了状态与行为之间的关系，并将它们封装在一个类里。通过增加新的状态类，很容易增加新的状态和转换。
- 避免Context无限膨胀，状态切换的逻辑被分布在状态类中，也去掉了Context中原本过多的条件分支。
- 用对象代替字符串来记录当前状态，使得状态的切换更加一目了然。
- Context中的请求动作和状态类中封装的行为可以非常容易地独立变化而互不影响。


#### 2) 缺点
- 会在系统中定义许多状态类
- 由于逻辑分散在状态类中，虽然避开了不受欢迎的条件分支语句，但也造成了逻辑分散的问题，我们无法在一个地方就看出整个状态的逻辑。


### 4 状态模式和策略模式的关系
#### 1) 相同点
它们都有一个上下文、一些策略或者状态类，上下文把请求委托给这些类来执行。

#### 2) 区别
策略模式中的各个策略类之间是平等又平行的，它们之间没有任何联系，所以客户必须熟知这些策略类的作用，以便客户可以随时主动切换算法。
状态模式中，状态和状态对应的行为是早已被封装好的，状态之间的切换也早被规定万年城，“改变行为”这件事情发生在状态模式内部。对客户来说，并不需要了解这些细节。

## 二 代理模式
### 1 定义
代理模式是为一个对象提供一个代用品或占位符，以便控制对它的访问。

### 2 代理方式
**保护代理** 代理B可以帮助A过滤掉一些请求。用于控制不同权限的对象对目标对象的访问。

**虚拟代理** 虚拟代理把一些开销很大的对象，延迟到真正需要它的时候才会去创建。

**缓存代理** 缓存代理可以为一些开销大的运算结果提供暂时的存储，在下次运算时，如果传递进来的参数跟之前一致，则可以直接返回前面存储的运算结果。

**防火墙代理** 控制网络资源的访问，保护主题不让“坏人”接近。

**远程代理** 为一个对象在不同的地址空间提供局部代表。

**智能引用代理** 取代了简单的指针，它在访问对象时执行一些附加操作，比如计算一个对象的被引用次数。

**写时复制代理** 通常用于复制一个庞大对象的情况。写时复制代理延迟了复制的过程，当对象被真正修改时，才对它进项复制操作。写时复制代理是虚拟代理的一种变体。

JavaScript 开发中最常用的是虚拟代理和缓存代理。



