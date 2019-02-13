## 1 索引
- 索引通常能够极大的提高查询的效率，如果没有索引，MongoDB在读取数据时必须扫描集合中的每个文件并选取那些符合查询条件的记录。
- 这种扫描全集合的查询效率是非常低的，特别在处理大量的数据时，查询可以要花费几十秒甚至几分钟，这对网站的性能是非常致命的。
- 索引是特殊的数据结构，索引存储在一个易于遍历读取的数据集合中，索引是对数据库表中一列或多列的值进行排序的一种结构

## 2 建立索引
## 2.1 创建匿名索引
### 2.1.1 准备数据
- 向`users`数据库中的`classOne`集合中添加 1000000 条文档
```js
> use user
> for (var i = 1; i<= 1000000;i++) {
    users.push({name: 'Lily_' + i, num: i })
}
> db.classOne.insert(users);
/*
BulkWriteResult({
	"writeErrors" : [ ],
	"writeConcernErrors" : [ ],
	"nInserted" : 1000000,
	"nUpserted" : 0,
	"nMatched" : 0,
	"nModified" : 0,
	"nRemoved" : 0,
	"upserted" : [ ]
})*/
```

### 2.1.2 查找`{num: 1000000}`文档的过程分析

```
> db.classOne.find({num: 1000000}).explain(true)
{
	"queryPlanner" : {
		"plannerVersion" : 1,
		"namespace" : "user.classOne",
		"indexFilterSet" : false,
		"parsedQuery" : {...},
		"winningPlan" : {
			"stage" : "COLLSCAN",   // 扫描所有的数据 
			"filter" : {...},
			"direction" : "forward"
		},
		"rejectedPlans" : [ ]
	},
	"executionStats" : {
		"executionSuccess" : true,
		"nReturned" : 1,
		"executionTimeMillis" : 365,    // 本次查找执行时间的毫秒数
		"totalKeysExamined" : 0,
		"totalDocsExamined" : 1000000,
		"executionStages" : {
			...
		},
		"allPlansExecution" : [ ]
	},
	"serverInfo" : {
		...
	},
	"ok" : 1
}
```
从这个过程的解析对象中，我们得知查找`{num: 1000000}`文档，是通过`COLLSCAN`方式扫描的，执行的时间为 `365ms`

### 2.1.3 创建匿名索引
在经常按照文档的倒序查找的应用场景中，我们可以通过建立索引来进行查找，以节约我们的查找时间。

```
db.collection.ensureIndex(keys, options)
```
- 建立索引
```js
> db.classOne.ensureIndex({num: 1})
/*
{
	"createdCollectionAutomatically" : false,
	"numIndexesBefore" : 1, // 添加本次索引之前的索引数
	"numIndexesAfter" : 2,  // 添加本次索引之后的索引数
	"ok" : 1
}
*/
```
- 建立索引后再次查找

```js
> db.classOne.find({num: 1000000}).explain(true)
/*
{
	"queryPlanner" : {
		...
		"winningPlan" : {
			"stage" : "FETCH",
			"inputStage" : {
				"stage" : "IXSCAN", // 通过扫描索引进行查找
				"keyPattern" : {
					"num" : 1
				},
				"indexName" : "num_1",  // 如果没有指定索引名称的话， 默认格式为 ‘字段_1’ 或者 ‘字段_-1’ , 1 代表正序， -1 代表 倒序
				"isMultiKey" : false,
				"multiKeyPaths" : {
					"num" : [ ]
				},
				...
			}
		},
		...
	},
	"executionStats" : {
		"executionSuccess" : true,
		"nReturned" : 1,
		"executionTimeMillis" : 6,  // 本次执行时间的毫秒数为 6ms !!!
		...
	},
	"serverInfo" : {...},
	"ok" : 1
}
*/
```
建立索引之前用时 `365 ms` , 建立索引之后查找用时需要 `6 ms`, 用时大大的减少了。




## 2.2 创建命名索引
如果没有指定索引名称的话， 默认格式为 `fieldName_1` 或者 `fieldName_-1`，如果想要自定义索引名称的话，可以在创建的时候指定名称，如下：

```js
> db.classOne.ensureIndex({name: 1}, {name:' myIndexName'})
/*
{
	"createdCollectionAutomatically" : false,
	"numIndexesBefore" : 2,
	"numIndexesAfter" : 3,
	"ok" : 1
}
*/
```

## 2.3 查看索引

```
> db.classOne.getIndexes()
/*
[
	{
		"v" : 2,
		"key" : {
			"_id" : 1
		},
		"name" : "_id_",    // 原始的 根据 _id 字段 生成的索引 
		"ns" : "user.classOne"
	},
	{
		"v" : 2,
		"key" : {
			"num" : 1
		},
		"name" : "num_1",   // 根据 num 字段 升序 创建的索引 
		"ns" : "user.classOne"
	},
	{
		"v" : 2,
		"key" : {
			"name" : 1
		},
		"name" : " myIndexName",   // 自己命名创建的索引
		"ns" : "user.classOne"
	}
]
*/
```

## 2.4 指定需要使用的索引

```
> db.classOne.find({num: "500000"}).hint({num:1}).explain(true)
```

## 2.5 删除索引

```
db.collectionName.dropIndex(IndexName)  删除指定的索引（IndexName）

db.collecitonName.dropIndex('*');       删除所有索引
```

## 2.6 在后台创建索引

```
db.collection.ensureIndex(keys, {background: true})
```

## 2.7 建立多键索引
mongodb可以自动对数组进行索引
```
> db.classOne.insert({hobby:['basketball','football','pingpang']});
> db.classOne.ensureIndex({hobby:1});
> db.classOne.find({hobby:'football'},{hobby:1,_id:0}).explain(true);
```

## 2.8 复合索引
查询的条件不止一个，需要用复合索引
```
db.collection.ensureIndex({name:1,num:1});
```

## 2.9 过期索引
在一定的时间后会过期，过期后相应数据数据被删除,比如session、日志、缓存和临时文件
```
> db.classTwo.insert({time:new Date()});
> db.classTwo.ensureIndex({time:1},{expireAfterSeconds:10});
```
> note
- 索引字段的值必须Date对象，不能是其它类型比如时间戳
- 删除时间不精确，每60秒跑一次。删除也要时间，所以有误差。

## 2.10 全文索引
大篇幅的文章中搜索关键词,MongoDB为我们提供了全文索引

### 2.10.1 创建全文索引
```
db.colleciton.ensureIndex({field: 'text'})
```
> note: `text`- 创建全文索引，`1` - 升序索引，`2` - 降序索引

### 2.10.2 usage
#### 语法
- `$text`: 表示要在全文索引中查东西
- `$search`: 后边跟查找的内容, 默认全部匹配


#### 举个栗子
- 1 准备数据
```js
// 原始数据
{ "_id" : ObjectId("5afa93eae82637e49ce12077"), "name" : "Lily", "content" : "I am a girl" }
{ "_id" : ObjectId("5afa93f6e82637e49ce12078"), "name" : "Tom", "content" : "I am a boy" }
{ "_id" : ObjectId("5afa9561e82637e49ce12079"), "name" : "Carl", "content" : "I do not know boy girl" }
```

- 2 创建全文索引
根据`content`字段创建一个全文索引
```
db.classThree.ensureIndex({content: 'text'})
```

- 3 根据索引查询数据

```js
// 查找包含 ‘girl’ 的文档
> db.classThree.find({$text: {$search: 'girl'}})
// { "_id" : ObjectId("5afa93eae82637e49ce12077"), "name" : "Lily", "content" : "I am a girl" }


// 查找包含 ‘boy’ 的文档
> db.classThree.find({$text: {$search: 'boy'}})
// { "_id" : ObjectId("5afa93f6e82637e49ce12078"), "name" : "Tom", "content" : "I am a boy" }


// 查找包含 ‘girl’ 或者 ‘boy’ 的文档（多次查找是 与 的关系）
> db.classThree.find({$text: {$search: 'boy girl'}})
/*
{ "_id" : ObjectId("5afa93eae82637e49ce12077"), "name" : "Lily", "content" : "I am a girl" }
{ "_id" : ObjectId("5afa9561e82637e49ce12079"), "name" : "Carl", "content" : "I do not know boy girl" }
{ "_id" : ObjectId("5afa93f6e82637e49ce12078"), "name" : "Tom", "content" : "I am a boy" }
*/


// 查找仅包含‘girl’ 不包含‘boy’的文档
> db.classThree.find({$text: {$search: 'girl -boy'}})
// { "_id" : ObjectId("5afa93eae82637e49ce12077"), "name" : "Lily", "content" : "I am a girl" }


// 就是要查找包含 ‘girl boy’ 字符的文档（需要转义）
> db.classThree.find({$text: {$search: '\"boy girl\"'}})
// { "_id" : ObjectId("5afa9561e82637e49ce12079"), "name" : "Carl", "content" : "I do not know boy girl" }
```


- 4 note

> 多次查找，多个关键字为或的关系,中间以空格隔开

> 支持转义符的,用\斜杠来转义

## 3 二维索引
mongodb提供强大的空间索引可以查询出一定落地的地理坐标
### 3.1 创建 `2d` 索引
```
db.collection.ensureIndex({field:'2d'}, options)
```

## 3.2 举个栗子
- 1 准备数据

```
{ "_id" : ObjectId("5afaa078e82637e49ce1207a"), "gis" : [ 1, 1 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207b"), "gis" : [ 1, 2 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207c"), "gis" : [ 1, 3 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207d"), "gis" : [ 2, 1 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207e"), "gis" : [ 2, 2 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207f"), "gis" : [ 2, 3 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce12080"), "gis" : [ 3, 1 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce12081"), "gis" : [ 3, 2 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce12082"), "gis" : [ 3, 3 ] }
```
如下图：
![2d索引](https://user-gold-cdn.xitu.io/2018/5/15/16362fad75a923b4?w=416&h=398&f=jpeg&s=30400)

- 2 创建 2d 索引
```js
> db.map.ensureIndex({gis:'2d'})
/*
{
	"createdCollectionAutomatically" : false,
	"numIndexesBefore" : 1,
	"numIndexesAfter" : 2,
	"ok" : 1
}
*/
```

- 3 查询距离`[1,1]`最近的四个点
```js
> db.map.find({gis:{$near: [1,1]}}).limit(4)
/*
{ "_id" : ObjectId("5afaa078e82637e49ce1207a"), "gis" : [ 1, 1 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207b"), "gis" : [ 1, 2 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207d"), "gis" : [ 2, 1 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207e"), "gis" : [ 2, 2 ] }
*/
```
查询结果如下图：
![near](https://user-gold-cdn.xitu.io/2018/5/15/1636319d4a3b77b8?w=378&h=378&f=jpeg&s=33783)
- 4 查询以点`[1,2]`和点`[3,3]`为对角线的正方形中的所有的点

```js
> db.map.find({gis: {$within:{$box: [[1,2],[3,3]]}}})
/*
{ "_id" : ObjectId("5afaa078e82637e49ce1207b"), "gis" : [ 1, 2 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207e"), "gis" : [ 2, 2 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207c"), "gis" : [ 1, 3 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207f"), "gis" : [ 2, 3 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce12081"), "gis" : [ 3, 2 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce12082"), "gis" : [ 3, 3 ] }
*/
```
查询结果如下图：
![box](https://user-gold-cdn.xitu.io/2018/5/15/1636319ad7cfb32d?w=378&h=376&f=jpeg&s=34896)

- 5 查出以`[2,2]`为圆心，以` 1` 为半径为规则下圆心面积中的点

```js
> db.map.find({gis: {$within:{$center: [[2,2],1]}}})
/*
{ "_id" : ObjectId("5afaa078e82637e49ce1207b"), "gis" : [ 1, 2 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207d"), "gis" : [ 2, 1 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207e"), "gis" : [ 2, 2 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce1207f"), "gis" : [ 2, 3 ] }
{ "_id" : ObjectId("5afaa078e82637e49ce12081"), "gis" : [ 3, 2 ] }
*/
```
查询结果如下图：
![center](https://user-gold-cdn.xitu.io/2018/5/15/1636319c2dbdfc52?w=436&h=420&f=jpeg&s=37344)

> note: `[1,1]`等角落里的坐标与`[2,2]`的坐标距离是`√2`

## 4 索引使用的注意事项
- `1`为正序 `-1`为倒序
- 索引虽然可以提升查询性能，但会降低插件性能，对于插入多查询少不要创索引
- 数据量不大时不需要使用索引。性能的提升并不明显，反而大大增加了内存和硬盘的消耗。
- 查询数据超过表数据量30%时，不要使用索引字段查询
- 排序工作的时候可以建立索引以提高排序速度
- 数字索引，要比字符串索引快的多




