## 一 工厂模式
工厂模式是用来创建对象的一种最常用的设计模式。我们不暴露创建对象的具体逻辑，而是将将逻辑封装在一个函数中，那么这个函数就可以被视为一个工厂。工厂模式根据抽象程度的不同可以分为：简单工厂，工厂方法和抽象工厂。

### 1 简单工厂
**不是一个真正的模式**
但是和工厂方法和抽象工厂模式一样，它经常用于封装创建对象的代码。
简单工厂模式又叫静态工厂模式，由一个工厂对象决定创建某一种产品对象类的实例。主要用来创建同一类对象。

举个栗子：
```js
let UserFactory = function (role) {
  function User(opt) {
    this.name = opt.name;
    this.viewPage = opt.viewPage;
  }

  switch (role) {
    case 'superAdmin':
      return new User({ name: '超级管理员', viewPage: ['首页', '通讯录', '发现页', '应用数据', '权限管理'] });
      break;
    case 'admin':
      return new User({ name: '管理员', viewPage: ['首页', '通讯录', '发现页', '应用数据'] });
      break;
    case 'user':
      return new User({ name: '普通用户', viewPage: ['首页', '通讯录', '发现页'] });
      break;
    default:
      throw new Error('参数错误, 可选参数:superAdmin、admin、user')
  }
}

//调用
let superAdmin = UserFactory('superAdmin');
let admin = UserFactory('admin') 
let normalUser = UserFactory('user')
```

### 2 工厂方法
**工厂方法模式**
定义了一个创建对象的接口，但由子类决定实例化的类是哪一个。工厂方法让类把实例化推迟到子类。

工厂方法模式的本意是将实际创建对象的工作推迟到子类中，这样核心类就变成了抽象类。但是在JavaScript中很难像传统面向对象那样去实现创建抽象类。所以在JavaScript中我们只需要参考它的核心思想即可。我们可以将工厂方法看作是一个实例化对象的工厂类。

在简单工厂模式中，我们每添加一个构造函数需要修改两处代码。现在我们使用工厂方法模式改造上面的代码，刚才提到，工厂方法我们只把它看作是一个实例化对象的工厂，它只做实例化对象这一件事情！ 我们采用安全模式创建对象。

举个栗子：
```js
//安全模式创建的工厂方法函数
let UserFactory = function(role) {
  if(this instanceof UserFactory) {
    var s = new this[role]();
    return s;
  } else {
    return new UserFactory(role);
  }
}

//工厂方法函数的原型中设置所有对象的构造函数
UserFactory.prototype = {
  SuperAdmin: function() {
    this.name = "超级管理员",
    this.viewPage = ['首页', '通讯录', '发现页', '应用数据', '权限管理']
  },
  Admin: function() {
    this.name = "管理员",
    this.viewPage = ['首页', '通讯录', '发现页', '应用数据']
  },
  NormalUser: function() {
    this.name = '普通用户',
    this.viewPage = ['首页', '通讯录', '发现页']
  }
}

//调用
let superAdmin = UserFactory('SuperAdmin');
let admin = UserFactory('Admin') 
let normalUser = UserFactory('NormalUser')
```


### 3 抽象工厂
**抽象工厂模式**
提供一个接口，用于创建相关或依赖对象的家族，而不需要明确指定具体类。

上面介绍了简单工厂模式和工厂方法模式都是直接生成实例，但是抽象工厂模式不同，抽象工厂模式并不直接生成实例， 而是用于对产品类簇的创建。

上面例子中的superAdmin，admin，user三种用户角色，其中user可能是使用不同的社交媒体账户进行注册的，例如：wechat，qq，weibo。那么这三类社交媒体账户就是对应的类簇。在抽象工厂中，类簇一般用父类定义，并在父类中定义一些抽象方法，再通过抽象工厂让子类继承父类。所以，抽象工厂其实是实现子类继承父类的方法。

上面提到的抽象方法是指声明但不能使用的方法。在其他传统面向对象的语言中常用abstract进行声明，但是在JavaScript中，abstract是属于保留字，但是我们可以通过在类的方法中抛出错误来模拟抽象类。

```js
let AccountAbstractFactory = function(subType, superType) {
  //判断抽象工厂中是否有该抽象类
  if(typeof AccountAbstractFactory[superType] === 'function') {
    //缓存类
    function F() {};
    //继承父类属性和方法
    F.prototype = new AccountAbstractFactory[superType] ();
    //将子类的constructor指向子类
    subType.constructor = subType;
    //子类原型继承父类
    subType.prototype = new F();

  } else {
    throw new Error('抽象类不存在!')
  }
}

//微信用户抽象类
AccountAbstractFactory.WechatUser = function() {
  this.type = 'wechat';
}
AccountAbstractFactory.WechatUser.prototype = {
  getName: function() {
    return new Error('抽象方法不能调用');
  }
}

//qq用户抽象类
AccountAbstractFactory.QqUser = function() {
  this.type = 'qq';
}
AccountAbstractFactory.QqUser.prototype = {
  getName: function() {
    return new Error('抽象方法不能调用');
  }
}

//新浪微博用户抽象类
AccountAbstractFactory.WeiboUser = function() {
  this.type = 'weibo';
}
AccountAbstractFactory.WeiboUser.prototype = {
  getName: function() {
    return new Error('抽象方法不能调用');
  }
}
```
AccountAbstractFactory就是一个抽象工厂方法，该方法在参数中传递子类和父类，在方法体内部实现了子类对父类的继承。对抽象工厂方法添加抽象类的方法我们是通过点语法进行添加的。

下面我们来定义普通用户的子类:

```js
//普通微信用户子类
function UserOfWechat(name) {
  this.name = name;
  this.viewPage = ['首页', '通讯录', '发现页']
}
//抽象工厂实现WechatUser类的继承
AccountAbstractFactory(UserOfWechat, 'WechatUser');
//子类中重写抽象方法
UserOfWechat.prototype.getName = function() {
  return this.name;
}

//普通qq用户子类
function UserOfQq(name) {
  this.name = name;
  this.viewPage = ['首页', '通讯录', '发现页']
}
//抽象工厂实现QqUser类的继承
AccountAbstractFactory(UserOfQq, 'QqUser');
//子类中重写抽象方法
UserOfQq.prototype.getName = function() {
  return this.name;
}

//普通微博用户子类
function UserOfWeibo(name) {
  this.name = name;
  this.viewPage = ['首页', '通讯录', '发现页']
}
//抽象工厂实现WeiboUser类的继承
AccountAbstractFactory(UserOfWeibo, 'WeiboUser');
//子类中重写抽象方法
UserOfWeibo.prototype.getName = function() {
  return this.name;
}
```

上述代码我们分别定义了UserOfWechat，UserOfQq，UserOfWeibo三种类。这三个类作为子类通过抽象工厂方法实现继承。特别需要注意的是，调用抽象工厂方法后不要忘记重写抽象方法，否则在子类的实例中调用抽象方法会报错。

我们来分别对这三种类进行实例化，检测抽象工厂方法是实现了类簇的管理。

```js
//实例化微信用户
let wechatUserA = new UserOfWechat('微信小李');
console.log(wechatUserA.getName(), wechatUserA.type); //微信小李 wechat
let wechatUserB = new UserOfWechat('微信小王');
console.log(wechatUserB.getName(), wechatUserB.type); //微信小王 wechat

//实例化qq用户
let qqUserA = new UserOfQq('QQ小李');
console.log(qqUserA.getName(), qqUserA.type); //QQ小李 qq
let qqUserB = new UserOfQq('QQ小王');
console.log(qqUserB.getName(), qqUserB.type); //QQ小王 qq

//实例化微博用户
let weiboUserA =new UserOfWeibo('微博小李');
console.log(weiboUserA.getName(), weiboUserA.type); //微博小李 weibo
let weiboUserB =new UserOfWeibo('微博小王');
console.log(weiboUserB.getName(), weiboUserB.type); //微博小王 weibo
```

## 二 单例模式
确保一个类只有一个实例，并提供一个全局访问点
```js
var Singleton = function (name) {
}

Singleton.prototype.getInstance = (function () {
  var instance = null;
  return function () {
    if (!instance) {
      instance = new Singleton(arguments)
    }
    return instance
  }
})()

```

单例模式是一种简单但非常实用的模式，特别是惰性单例技术，在合适的时候才创建对象，并且只创建唯一的一个。
全局变量比单件模式差，是因为，单例模式的目的是确保类只有一个实例并提供全局访问。全局变量可以提供全局访问，但是不能确保只有一个实例。


## 三 参考
- [Head First 设计模式（中文版）](https://item.jd.com/10100236.html)
- [从ES6重新认识JavaScript设计模式(二): 工厂模式](https://www.jianshu.com/p/11918dd0f694)