# 1 前言
MongoDB是一个基于分布式文件存储的开源数据库系统。


MongoDB 将数据存储为一个文档，数据结构由键值(key=>value)对组成。MongoDB 文档类似于 JSON 对象。字段值可以包含其他文档，数组及文档数组。

# 2 安装(mac)
- 安装homebrew
- 使用brew安装mongodb
```
brew install mongodb
```
- 可视化工具 Robomongo

# 3 mongodb启动与连接(mac)
## 3.1 服务端启动
### 3.1.1 启动步骤
- 1) 在要启动的目录下新建一个目录（如:`data`）
```
mkdir data
```
- 2) 命令行中输入（--dbpath参数指定数据库路径）
```
mongod --dbpath='./data'
```
如果出现`waiting for connections on port 27017`就表示启动成功。

> 注意：这个命令窗体绝对不能关,关闭这个窗口就相当于停止了mongodb服务

### 3.1.2 ` mongod`启动命令mongod参数说明
|选项|	含义|
|-|-|
|--port	|指定服务端口号，默认端口27017|
|--logpath	|指定MongoDB日志文件，注意是指定文件不是目录|
|--logappend|	使用追加的方式写日志|
|--dbpath|	指定数据库路径|
|--directoryperdb|	设置每个数据库将被保存在一个单独的目录|


## 3.2 客户端启动
- 命令行输入
```
mongo
```
也可以设置host
```
mongo --host 127.0.0.1
```

# 4 MongoDB基本概念
- `数据库` MongoDB的单个实例可以容纳多个独立的数据库，比如一个学生管理系统就可以对应一个数据库实例。
- `集合` 数据库是由集合组成的,一个集合用来表示一个实体,如学生集合。
- `文档` 集合是由文档组成的，一个文档表示一条记录,比如一位同学张三就是一个文档

对应关系如下图：
![对应关系](https://user-gold-cdn.xitu.io/2018/4/24/162f76171901eb5a?w=2748&h=814&f=jpeg&s=266810)

# 5 数据库操作
## 5.1 查看所有数据库
```
show dbs
```

返回如下：
```
admin       0.000GB
book        0.000GB
leave       0.000GB
local       0.000GB
page        0.000GB
school        0.000GB
students    0.000GB
``` 

## 5.2 使用数据库
实例 切换到 school数据库下:
```
use school
```

返回如下：
```
switched to db school
``` 
> 注：如果此数据库存在，则切换到此数据库下,如果此数据库还不存在也可以切过来

> 注: 我们刚创建的数据库school如果不在列表内，要显示它，我们需要向school数据库插入一些数据
```
db.school.insert({name:'为民小学',age:10});
```
## 5.3 查看当前使用的数据库

```
db 或 db.getName()
```

## 5.4 删除数据库

```
db.dropDatabase()
```
返回如下：
```
{ "dropped" : "school", "ok" : 1 }
```

# 6 集合操作
## 6.1 查看集合帮助

```
db.school.help()
```
返回如下：
```
BCollection help
	db.school.find().help() - show DBCursor help
	db.school.bulkWrite( operations, <optional params> ) - bulk execute write ...
```
## 6.2 查看数据库下的集合

```
show collections
```
返回如下：

```
grade1
grade2
```


## 6.3 创建集合
- 创建一个空集合(`db.createCollection(collection_Name)`)
```
db.createCollection('grade3')
```
返回如下：

```
{ "ok" : 1 }
```
- 创建集合并插入一个文档(`db.collection_Name.insert(document)`)
```
db.grade1.insert({name: 'Lily', age: 8})
```
返回如下：

```
WriteResult({ "nInserted" : 1 })
```

# 7 文档操作
## 7.1 插入文档
### `insert`
- `db.collection_name.insert(document)`

```
db.grade1.insert({name: 'Tom', age: 9})
```
> note:每当插入一条新文档的时候mongodb会自动为此文档生成一个_id属性,_id一定是唯一的，用来唯一标识一个文档 _id也可以直接指定，但如果数据库中此集合下已经有此_id的话插入会失败。

```
{
    "_id" : ObjectId("5addbfbb163098017a6a72ed"),
    "name" : "Tom",
    "age" : 9.0
}
```

### `save` 
- `db.collection_name.save(document)`

> note:如果不指定 _id 字段 save() 方法类似于 insert() 方法。如果指定 _id 字段，则会更新该 _id 的数据。


```js
// insert
db.grade1.insert({_id: '1',name: 'Han Meimei', age: 8})// WriteResult({ "nInserted" : 1 })

// 存在{_id:1},则更新 _id为1的document
db.grade1.save({_id: '1',name: 'Han Meimei', age: 9})// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })

// 不存在{_id:2},则插入一条新文档
db.grade1.save({_id: '2',name: 'Han Meimei', age: 9})// WriteResult({ "nMatched" : 0, "nUpserted" : 1, "nModified" : 0, "_id" : "2" })
```


> 执行脚本插入
```
mongo exc_js/1.js
> load exc_js/1.js
```
## 7.2 更新文档
### 7.2.1 语法 & 参数说明

```
db.collection.update(
   <query>,
   <updateObj>,
   {
     upsert: <boolean>,
     multi: <boolean>
   }
)
```
- `query` 查询条件,指定要更新符合哪些条件的文档
- `update` 更新后的对象或指定一些更新的操作符
    - `$set`直接指定更新后的值
    - `$inc`在原基础上累加
- `upsert` 可选，这个参数的意思是，如果不存在符合条件的记录时是否插入updateObj. 默认是false,不插入。
- `multi` 可选，mongodb 默认只更新找到的第一条记录，如果这个参数为true,就更新所有符合条件的记录。


### 7.2.2 操作符


#### （1） `$inc` 
> `{ $inc: { <field1>: <amount1>, <field2>: <amount2>, ... } }`
- 在原基础上累加(increment)
```js
// 给 {name: 'Tom'} 的文档的age累加 10
db.grade1.update({name: 'Tom'}, {$inc: {age:10}})
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
```

#### （2） `$push`
> `{ $push: { <field1>: <value1>, ... } }`
- 向数组中添加元素
```js
db.grade1.update({name:'Tom'}, {$push: {'hobby':'reading'} })
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
// { "_id" : ObjectId("5addbfbb163098017a6a72ed"), "name" : "Tom", "hobby" : [ "reading" ] }

// 不会覆盖已有的
db.grade1.update({name:'Tom'}, {$push: {'hobby':'reading'} })
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
// { "_id" : ObjectId("5addbfbb163098017a6a72ed"), "name" : "Tom", "hobby" : [ "reading", "reading" ] }

```
#### （3） `$addToSet`
> `{ $addToSet: { <field1>: <value1>, ... } }`
- 给数组添加或者设置一个值，
- 有 - do nothing, 没有 - 添加


```js
// /第一次没有 huge
db.grade1.update({_id:3}, {$addToSet: {friends:'huge'}})
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })


// 第二次 有 huge
db.grade1.update({_id:3}, {$addToSet: {friends:'huge'}})
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 0 })
```

#### （4） `$pop`
> `{ $pop: { <field>: <-1 | 1>, ... } }`
- 删除数组的第一个或者最后一个元素。
- 传入` 1 `删除最后一个元素
- 传入` -1 `删除第一个元素


```js
db.grade1.update({_id:3}, {$pop:{friends: 1}})
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })

db.grade1.update({_id:3}, {$pop:{friends: -1}})
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
```


#### （5） `$each`
> `{ $addToSet: { <field>: { $each: [ <value1>, <value2> ... ] } } }`
-  Use with the $addToSet operator to add multiple values to an array <field> if the values do not exist in the <field>.

```js
db.grade1.update({_id:3}, {$addToSet:{friends:{$each: ['huangbo','zhangyixing']}}})
//WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })

// 已经有的时候就不会再添加了
db.grade1.update({_id:3}, {$addToSet:{friends:{$each: ['huangbo','zhangyixing']}}})
//WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 0 })
```
> `{ $push: { <field>: { $each: [ <value1>, <value2> ... ] } } }`
- Use with the $push operator to append multiple values to an array <field>.

```js
 db.grade1.update({_id:3}, {$push:{friends:{$each: ['huangbo','zhangyixing']}}})
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
```
> 在`$addToSet`中使用时，若有则忽略，若没有则添加。在`$push`中使用时，不管有没有都会添加。

#### （6） `$ne`
> `{field: {$ne: value} }`
- not equal

```js
// 给 name为'Han Meimei' && hobby中不等于'reading' && _id不等于'2'的文档 的hobby 属性 添加一个 'drinking'
db.grade1.update({name: 'Han Meimei', hobby:{$ne:'reading'}, _id: {$ne:'2'}}, {$push: {hobby: 'drinking'}})
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
```


#### （7）$set
> `{ $set: { <field1>: <value1>, ... } }`

- 设置字段的第一层的值（Set Top-Level Fields）
- 设置嵌套字段的值 （Set Fields in Embedded Documents）
- 修改指定索引元素

```js
/*
原来的数据：
{_id:3, info:{id: '11'}, friends:['liudehua', 'zhourunfa']}
*/
/*设置字段的第一层的值（Set Top-Level Fields）*/ 
db.grade1.update({_id:3}, {$set:{"info11":{id:'11'}}})
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })


/*设置嵌套字段的值 （Set Fields in Embedded Documents）*/
db.grade1.update({_id:3}, {$set:{"info.id":'22'}})
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })

/*修改指定索引元素*/
db.grade1.update({_id:3}, {$set:{"friends.1":'zhangmanyu'}})
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 0 })
```

#### （8） `$unset`
> `{ $unset: { <field1>: "", ... } }`
- 删除指定的键

```js
// 把 {name: 'Tom'} 的文档中的 age 键给删除掉
db.grade1.update({name: 'Tom'}, {$unset:{'age':''}})
// WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
/* {
    "_id" : ObjectId("5addbfbb163098017a6a72ed"),
    "name" : "Tom"
}*/
```

## 7.3 删除文档
- remove方法是用来移除集合中的数据
> 语法

```js
db.collection.remove(
   <query>,
   {
     justOne: <boolean>
   }
)
```
> 参数说明
```
query :（可选）删除的文档的条件。
justOne : （可选）如果设为 true 或 1，则只删除匹配到的多个文档中的第一个。默认为 true
```


```js
/*{justOne:true} 值删除匹配到的第一条文档*/
db.grade1.remove({'name': 'Han Meimei'}, {justOne: true})
// WriteResult({ "nRemoved" : 1 })

/*删除匹配到的所有文档*/
db.grade1.remove({'name': 'Han Meimei'})
// WriteResult({ "nRemoved" : 2 })

```

## 7.4 查询文档
### 7.4.1
> 语法

```
db.collection_name.find(query, projection)；
```

> 参数

```
query       - 使用查询操作符指定选择过滤器
projection  - 指定配到到的文档中的返回的字段。
```


```
/*projection*/
{ field1: <value>, field2: <value> ... }

/*value:*/
1 or true: 在返回的文档中包含这个字段
0 or false：在返回的文档中排除这个字段 
```

> note: `_id`字段默认一直返回，除非手动将`_id`字段设置为`0`或`false`

> 举个栗子

```js
//查询grade1下所有的文档
db.grade1.find()
```


### 7.4.2 findOne()
- 只返回匹配到的第一条文档


### 7.4.3 查询操作符
#### （1） `$in`
- Matches any of the values specified in an array.
- (在数组范围内的)


```
//原始数据()：
{ "_id" : 1, "name" : "Tom1", "age" : 9 }
{ "_id" : 2, "name" : "Tom2", "age" : 15 }
{ "_id" : 3, "name" : "Tom3", "age" : 11 }
```


```js
db.grade1.find({age:{$in:[9,11]}})
// { "_id" : 1, "name" : "Tom1", "age" : 9 }
// { "_id" : 3, "name" : "Tom3", "age" : 11 }
```

#### （2） `$nin`
- Matches none of the values specified in an array.

```
 db.grade1.find({age:{$nin:[9,11]}})
// { "_id" : 2, "name" : "Tom2", "age" : 15 }
```

#### （3） `$not`
- Inverts the effect of a query expression and returns documents that do not match the query expression.

```
db.grade1.find({age:{$not:{$lt:11}}})
//{ "_id" : 2, "name" : "Tom2", "age" : 15 }
//{ "_id" : 3, "name" : "Tom3", "age" : 11 }
```

#### （4） `$gt`
- Matches values that are greater than a specified value.
- 大于

#### （5） `$gte`
- Matches values that are greater than or equal to a specified value.
- 大于等于

#### （6） `$lt`
- Matches values that are less than a specified value.
- 小于


#### （7） `$lte`
- Matches values that are less than or equal to a specified value.
- 小于等于

#### （8）`$ne`
- 	Matches all values that are not equal to a specified value.
- 不等于

```js
db.grade1.find({age:{$ne:9}})
// { "_id" : 2, "name" : "Tom2", "age" : 15 }
// { "_id" : 3, "name" : "Tom3", "age" : 11 }
```


### 7.4.4 数组的用法

```js
// 原始数据
{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }
{ "_id" : 2, "name" : "Tom2", "age" : 15, "friends" : [ "Zhange San", "Li Si" ] }
{ "_id" : 3, "name" : "Tom3", "age" : 11, "friends" : [ "Zhange San", "Lily" ] }
```


```js
db.grade1.find({"friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ]})
// { "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }

db.grade1.find({"friends" : [ "Lily" ]})
// 空

// $all
db.grade1.find({"friends" :{$all: ["Zhang San"]}})
// { "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }

// $in
db.grade1.find({"friends" :{$in: ["Zhang San"]}})
{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }

// $size
db.grade1.find({"friends" :{$size:4}})
//{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }

// $slice
db.collection.find( { field: value }, { array: {$slice: count } } );
> db.grade1.find({"friends" :{$size:4}}, {"friends":{$slice:2}})
//{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs" ] }
```

### 7.4.5 `$where`
- `$where`可以接收两种参数传递给查询系统，一种是包含JavaScript表达式的字符串，另外一种是JavaScript函数。 

- `$where`非常灵活，但是它需要数据库集合中的每一个文档中处理这个JavaScript表达式或者JavaScript函数，所以会比较慢。
- 在JavaScript表达式或者JavaScript函数中引用文档的时候，可是使用`this`或者`obj`。


```js
// 数据库数据
{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }
{ "_id" : 2, "name" : "Tom2", "age" : 15, "friends" : [ "Zhange San", "Li Si" ] }
{ "_id" : 3, "name" : "Tom3", "age" : 11, "friends" : [ "Zhange San", "Lily" ] }

// JS表达式的字符串
> db.grade1.find({$where:'this.name == "Tom1"'})
//{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }

// 函数
> db.grade1.find({$where: function(){return this.age == 9}})
// { "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }

```
### 7.4.6 Cursor Methods
这些方法改变了执行基础查询方式。

包括`cursor.forEach()`、`cursor.map()`、`cursor.limit()`、`cursor.size()`、`cursor.count()`等。


```js
// forEach举例
> var result = db.grade1.find({$where: function(){return this.age >= 9}});
> result.forEach(elem => printjson(elem))
/*{
	"_id" : 1,
	"name" : "Tom1",
	"age" : 9,
	"friends" : [
		"Lily",
		"Jobs",
		"Lucy",
		"Zhang San"
	]
}
{
	"_id" : 2,
	"name" : "Tom2",
	"age" : 15,
	"friends" : [
		"Zhange San",
		"Li Si"
	]
}
{
	"_id" : 3,
	"name" : "Tom3",
	"age" : 11,
	"friends" : [
		"Zhange San",
		"Lily"
	]
}*/
```




# 8 条件操作符
## 8.1 条件操作符
- `$gt` - 大于
- `$gte`- 大于等于
- `$lt` - 小于
- `$lte` - 小于等于



```js
// 大于等于
db.grade1.find({age:{$gte:9}})
/*{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }
{ "_id" : 2, "name" : "Tom2", "age" : 15, "friends" : [ "Zhange San", "Li Si" ] }
{ "_id" : 3, "name" : "Tom3", "age" : 11, "friends" : [ "Zhange San", "Lily" ] }*/

// 大于等于9 并且 小于等于13
db.grade1.find({age:{$gte:9}, age: {$lte:13}})
/*{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }
{ "_id" : 3, "name" : "Tom3", "age" : 11, "friends" : [ "Zhange San", "Lily" ] }*/

```

## 8.2 使用_id进行查询

```js
//原始数据
{ "_id" : ObjectId("5ae1b6e3e4366d57f3307239"), "name" : "Tom4" }

> db.grade1.find({_id: '5ae1b6e3e4366d57f3307239'}).count()
// 0
> db.grade1.find({_id:ObjectId('5ae1b6e3e4366d57f3307239')}).count()
// 1

```
> `count()` 查询结果的条数

## 8.3 正则匹配
> db.collection.find({key:/value/})


```js
// name是以`T`开头的数据
db.grade1.find({name: /^T/})
/*{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }
{ "_id" : 2, "name" : "Tom2", "age" : 15, "friends" : [ "Zhange San", "Li Si" ] }
{ "_id" : 3, "name" : "Tom3", "age" : 11, "friends" : [ "Zhange San", "Lily" ] }
{ "_id" : ObjectId("5ae1b6e3e4366d57f3307239"), "name" : "Tom4" }*/
```

# 9 与和或
## 9.1 and
> db.collection_name.find({field1: value1, field2:value2})
```js
//原始数据
{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }
{ "_id" : 2, "name" : "Tom2", "age" : 15, "friends" : [ "Zhange San", "Li Si" ] }
{ "_id" : 3, "name" : "Tom3", "age" : 11, "friends" : [ "Zhange San", "Lily" ] }
```


```js
// and name是以‘T’开头 并且 age是9 的数据
> db.grade1.find({name: /^T/, age: 9})
// { "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }
```

## 9.2 or
> db.collection_name.find({ $or: [{key1: value1}, {key2:value2} ] })

```js
// name 是Tom1 或者 age是11 的数据
> db.grade1.find({$or:[{name: 'Tom1'}, {age: 11}]})
/*{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }
{ "_id" : 3, "name" : "Tom3", "age" : 11, "friends" : [ "Zhange San", "Lily" ] }*/
```

## 9.3 and 和 all 联合使用

```js
> db.grade1.find({age: 9,$or:[{name: 'Tom1'}, {age: 11}]})
/*{ "_id" : 1, "name" : "Tom1", "age" : 9, "friends" : [ "Lily", "Jobs", "Lucy", "Zhang San" ] }*/
```

# 10 分页查询
## 10.1 `limit`
- 读取指定数量的数据记录 语法
> db.collectoin_name.find().limit(number)

## 10.2 `skip`
- 跳过指定数量的数据
> db.collectoin_name.find().skip(number)

## 10.3 `sort`
-通过参数指定排序的字段，并使用 1 和 -1 来指定排序的方式，其中 1为升序排列，而-1是用于降序排列。 

> db.collectoin_name.find().sort({field:1})

> db.collectoin_name.find().sort({field:-1})

## 10.4 分页

```js
// 原始数据为 1 2 3 4 5 6 7 8 9

> var pageIndex = 3;
> var pageSize = 3;
> var res = db.grade1.find({}).skip((pageIndex - 1) * pageSize).limit(pageSize).sort({username: 1});
> res
/*{ "_id" : ObjectId("5ae1cbc609f3ac9a41442546"), "username" : "Lily_7", "password" : 7 }
{ "_id" : ObjectId("5ae1cbc609f3ac9a41442547"), "username" : "Lily_8", "password" : 8 }
{ "_id" : ObjectId("5ae1cbc609f3ac9a41442548"), "username" : "Lily_9", "password" : 9 }*/

var res1 = db.grade1.find().skip((pageIndex - 1) * pageSize).limit(pageSize).sort({username: -1});
/*{ "_id" : ObjectId("5ae1cbc609f3ac9a41442542"), "username" : "Lily_3", "password" : 3 }
{ "_id" : ObjectId("5ae1cbc609f3ac9a41442541"), "username" : "Lily_2", "password" : 2 }
{ "_id" : ObjectId("5ae1cbc609f3ac9a41442540"), "username" : "Lily_1", "password" : 1 }*/
```

> note: 没有先后顺序


# 11 ObjectId构成
之前我们使用MySQL等关系型数据库时，主键都是设置成自增的。但在分布式环境下，这种方法就不可行了，会产生冲突。为此，MongoDB采用了一个称之为ObjectId的类型来做主键。ObjectId是一个12字节的 BSON 类型字符串。按照字节顺序，一次代表：
- 4字节：UNIX时间戳
- 3字节：表示运行MongoDB的机器
- 2字节：表示生成此_id的进程
- 3字节：由一个随机数开始的计数器生成的值

# 12 参考
- [MongoDB Docs](https://docs.mongodb.com/)