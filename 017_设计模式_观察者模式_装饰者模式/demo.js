let event = {
  clientList: {},// 存放观察者的缓存列表

  // 添加观察者
  listen: function (key, fn) {
    if (!this.clientList[key]) {// key 为观察者们的命名空间
      this.clientList[key] = []
    }

    this.clientList[key].push(fn)
  },

  // 发布消息通知观察者
  trigger: function () {
    var key = Array.prototype.shift.call(arguments),
      fns = this.clientList[key];

    if (!fns || fns.length === 0) {
      return false
    }

    for (let i = 0, fn; fn = fns[i++];) {
      fn.apply(this, arguments)
    }
  }
}

event.listen("test1", function(){console.log("test1")})
event.listen("test1", function(){console.log("test1-1")})
event.listen("test2", function(){console.log("test2")})

event.trigger("test1")
event.trigger("test2")



var Plane = function () {}

Plane.prototype.fire = function (params) {
  console.log("发射普通子弹")
}


// 增加两个装饰类
var MissileDecorator = function(plane){
  this.plane = plane
}

MissileDecorator.prototype.fire = function (params) {
  this.plane.fire()
  console.log("发射导弹")
}

var AtomDecorator = function(plane){
  this.plane = plane
}

AtomDecorator.prototype.fire = function (params) {
  this.plane.fire()
  console.log("发射原子弹")
}

var plane = new Plane()
plane = new MissileDecorator(plane)
plane = new AtomDecorator(plane)

plane.fire()

