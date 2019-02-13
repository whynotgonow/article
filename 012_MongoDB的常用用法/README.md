# 1 通过配置项启动数据库
## 1.1 准备配置文件
> mongo.conf 
```
dbpath=/Users/**/Documents/**/mongodb/data
port=3000
```

## 1.2 启动服务器
> 命令行输入
```
mongod --config mongo.conf
```

## 1.3 启动客户端
> 命令行输入
```
mongo --port 3000
```

# 2 导入导出数据
## 2.1 语法
- 导入数据 `mongoimport`
- 导出数据 `mongoexport`

|参数|含义|
|:-|:-|
|-h [ --host ]	|连接的数据库|
|--port	|端口号|
|-u	|用户名|
|-p	|密码|
|-d	|导出的数据库|
|-c	|指定导出的集合|
|-o	|导出的文件存储路径|
|-q	|进行过滤|
## 2.2 举个栗子
### 2.2.1 数据库中的原始数据
> 数据库实例`school`下的`grade1`集合
```
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abd6"), "name" : "Lucy_1", "age" : 1 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abd7"), "name" : "Lucy_2", "age" : 2 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abd8"), "name" : "Lucy_3", "age" : 3 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abd9"), "name" : "Lucy_4", "age" : 4 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abda"), "name" : "Lucy_5", "age" : 5 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abdb"), "name" : "Lucy_6", "age" : 6 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abdc"), "name" : "Lucy_7", "age" : 7 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abdd"), "name" : "Lucy_8", "age" : 8 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abde"), "name" : "Lucy_9", "age" : 9 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abdf"), "name" : "Lucy_10", "age" : 10 }
```

### 2.2.2 将原始数据导出
> 将`127.0.0.1`host下的`3000`端口的`school`数据库下的`grade1`集合中的数据导出到`students.bak`文件下
```js
$ mongoexport -h 127.0.0.1 --port 3000 -d school -c grade1 -o students.bak
// 2018-05-03T21:20:17.838+0800	connected to: 127.0.0.1:3000
// 2018-05-03T21:20:17.844+0800	exported 10 records
```

### 2.2.3 删除原始数据

- 删除数据
```js
db.grade1.remove({})
// WriteResult({ "nRemoved" : 10 })
```

- 检查grade1集合是否已经被删除- 
```js
db.grade1.count()
//0
```
### 2.2.4 导入之前的记录
- 导入
```js
$ mongoimport -h 127.0.0.1 --port 3000 -d school -c grade1 --file students.bak
// 2018-05-03T21:33:20.503+0800	connected to: 127.0.0.1:3000
// 2018-05-03T21:33:20.512+0800	imported 10 documents
```

- 检查数据是否已经导入
```
db.grade1.find({})
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abd6"), "name" : "Lucy_1", "age" : 1 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abd9"), "name" : "Lucy_4", "age" : 4 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abd7"), "name" : "Lucy_2", "age" : 2 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abd8"), "name" : "Lucy_3", "age" : 3 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abda"), "name" : "Lucy_5", "age" : 5 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abdc"), "name" : "Lucy_7", "age" : 7 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abdb"), "name" : "Lucy_6", "age" : 6 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abdd"), "name" : "Lucy_8", "age" : 8 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abde"), "name" : "Lucy_9", "age" : 9 }
{ "_id" : ObjectId("5aeb05dc6cebbe7c6012abdf"), "name" : "Lucy_10", "age" : 10 }
```
# 3 备份与恢复
## 3.1 语法
> 备份(`mongodump`) + 恢复(`mongorestore`)
### 3.1.1 备份
在Mongodb中我们使用mongodump命令来备份MongoDB数据。该命令可以导出所有数据到指定目录中。
```
mongodump -h dbhost -d dbname -o dbdirectory
```
- `-h` MongDB所在服务器地址，例如：127.0.0.1，当然也可以指定端口号：127.0.0.1:27017
- `-d` 需要备份的数据库实例，例如：test
- `-o` 备份的数据存放位置

### 3.1.2 恢复
mongodb使用 mongorestore 命令来恢复备份的数据。

- 恢复数据库所有的集合;
```
mongorestore -h dbhost --port 3000 data.bmp
```
- 恢复数据库中的某一个集合：
```
mongorestore -h dbhost --port 3000 data.bmp/dbname
```
- `--host` MongoDB所在服务器地址
- `-d` 需要恢复的数据库实例
- 最后的一个参数，设置备份数据所在位置

## 3.2 举个栗子
### 3.2.1 备份
- 命令行输入
```js
mongodump -h 127.0.0.1 --port 3000 -d school -o data.dmp

/*
2018-05-04T23:56:37.693+0800	writing school.grade3 to
2018-05-04T23:56:37.694+0800	writing school.grade1 to
2018-05-04T23:56:37.695+0800	writing school.grade2 to
2018-05-04T23:56:37.696+0800	done dumping school.grade3 (0 documents)
2018-05-04T23:56:37.697+0800	done dumping school.grade1 (9 documents)
2018-05-04T23:56:37.697+0800	done dumping school.grade2 (0 documents)
*/
```

- 删除数据
```js
db.grade1.remove({})
// WriteResult({ "nRemoved" : 10 })
```

- 检查grade1集合是否已经被删除
```js
db.grade1.count()
//0
```
### 3.2.2 恢复
- 命令行输入

```js
$ mongorestore -h 127.0.0.1 --port 3000 data.dmp

/*
2018-05-05T00:07:25.936+0800	preparing collections to restore from
2018-05-05T00:07:25.937+0800	reading metadata for school.grade1 from data.dmp/school/grade1.metadata.json
2018-05-05T00:07:25.937+0800	reading metadata for school.grade2 from data.dmp/school/grade2.metadata.json
2018-05-05T00:07:25.937+0800	reading metadata for school.grade3 from data.dmp/school/grade3.metadata.json
2018-05-05T00:07:25.937+0800	restoring school.grade1 from data.dmp/school/grade1.bson
2018-05-05T00:07:25.938+0800	restoring school.grade3 from data.dmp/school/grade3.bson
2018-05-05T00:07:25.938+0800	restoring school.grade2 from data.dmp/school/grade2.bson
2018-05-05T00:07:25.939+0800	no indexes to restore
2018-05-05T00:07:25.939+0800	finished restoring school.grade2 (0 documents)
2018-05-05T00:07:25.939+0800	no indexes to restore
2018-05-05T00:07:25.939+0800	finished restoring school.grade3 (0 documents)
2018-05-05T00:07:25.940+0800	no indexes to restore
2018-05-05T00:07:25.940+0800	finished restoring school.grade1 (10 documents)
2018-05-05T00:07:25.940+0800	done
*/
```


# 4 直接拷贝数据
最暴力最原始的方法，那就是直接拷贝~

# 5 锁定和解锁数据库 
为了数据的完整性和一致性，导出前要先锁定写入，导出后再解锁。
```js
> use admin;
switched to db admin

// 锁定
> db.runCommand({fsync:1,lock:1});
/*{
	"info" : "now locked against writes, use db.fsyncUnlock() to unlock",
	"lockCount" : NumberLong(1),
	"seeAlso" : "http://dochub.mongodb.org/core/fsynccommand",
	"ok" : 1
}*/


// 已经被锁定 写入操作不能执行
> db.grade1.insert({name:'Lucy_3', age: 3})
// 没有结果，等待中


// 解锁
> db.fsyncUnlock()
//{ "info" : "fsyncUnlock completed", "lockCount" : NumberLong(0), "ok" : 1 }


// 解锁后可以正常进行写入操作
> db.grade1.insert({name:'Lucy_3', age: 3})
// WriteResult({ "nInserted" : 1 })
```

# 6 用户管理
- 用户的操作都需要在admin数据库下面进行操作
- 如果在某个数据库下面执行操作，那么只对当前数据库生效

## 6.1 查看角色

```js
 show roles
 /*
 {
	"role" : "dbAdmin",
	"db" : "school",
	"isBuiltin" : true,
	"roles" : [ ],
	"inheritedRoles" : [ ]
}
{
	"role" : "dbOwner",
	"db" : "school",
	"isBuiltin" : true,
	"roles" : [ ],
	"inheritedRoles" : [ ]
}
{
	"role" : "enableSharding",
	"db" : "school",
	"isBuiltin" : true,
	"roles" : [ ],
	"inheritedRoles" : [ ]
}
{
	"role" : "read",
	"db" : "school",
	"isBuiltin" : true,
	"roles" : [ ],
	"inheritedRoles" : [ ]
}
{
	"role" : "readWrite",
	"db" : "school",
	"isBuiltin" : true,
	"roles" : [ ],
	"inheritedRoles" : [ ]
}
{
	"role" : "userAdmin",
	"db" : "school",
	"isBuiltin" : true,
	"roles" : [ ],
	"inheritedRoles" : [ ]
}
 */
```

## 6.2 创建用户

```js
> db.createUser({user:'mytest', pwd:'123', roles:[{role:'readWrite', db: 'school'}, 'read']})

/*
添加一个
Successfully added user: {
	"user" : "mytest",
	"roles" : [// 用户的权限配置
		{
			"role" : "readWrite",
			"db" : "school"
		},
		"read"
	]
}*/
```


## 6.3 查看用户权限

```js
>  db.runCommand({usersInfo:'mytest', showPrivileges: true})
/*{
	"users" : [
		{
			"_id" : "school.mytest",
			"user" : "mytest",
			"db" : "school",
			"roles" : [
				{
					"role" : "readWrite",
					"db" : "school"
				},
				{
					"role" : "read",
					"db" : "school"
				}
			],
			"inheritedRoles" : [
				{
					"role" : "read",
					"db" : "school"
				},
				{
					"role" : "readWrite",
					"db" : "school"
				}
			],
			"inheritedPrivileges" : [
				...
			]
		}
	],
	"ok" : 1
}*/
```

## 6.4 服务器启动权限认证
添加了一个用户之后,再重新启动mongodb服务器并添加权限

```js
// 添加--auth 参数
mongod --dbpath=./data --auth
```

## 6.5 用户登录和修改密码
- 验证用户权限
> `db.auth(username, password)` 或者 `db.auth({ user: username, pwd: password })`

```js
> db.auth('mytest', '123');
/*
验证通过时：
    1
*/
/* 验证不通过时：
    Error: Authentication failed.
    0
*/
```

- 修改用户名密码
> `db.changeUserPassword(username, password)`

```js
> db.changeUserPassword('mytest', '456')

> db.auth('mytest', '456')
// 1
```

## 6.6 修改个人信息

```js
> db.runCommand({updateUser:'mytest', pwd: '456',customData:{name:'测试'}})
// { "ok" : 1 }
```
添加的用户信息可以通过`runCommand({usersInfo: 'mytest', showPrivileges: true})`命令查看。

# 7 数据库高级命令
## 7.1 `distinct`
### 7.1.1 作用

在单个集合中查找指定字段的不同值，即不重复的值。返回一个数组，数组包含的是不同的值。

### 7.1.2 语法

```
{
  distinct: "<collection>",
  key: "<field>",
  query: <query>,
  readConcern: <read concern document>,
  collation: <collation document>
}
```

### 7.1.3 举个栗子

```js
// 原始数据
{ "_id" : ObjectId("5af416dd7d5233c02aeb0058"), "name" : "Tom1", "age" : 2, "province" : "山东", "city" : "德州" }
{ "_id" : ObjectId("5af416dd7d5233c02aeb0059"), "name" : "Tom2", "age" : 3, "province" : "山东", "city" : "青岛" }
{ "_id" : ObjectId("5af416dd7d5233c02aeb005a"), "name" : "Tom3", "age" : 3, "province" : "北京", "city" : "北京" }
{ "_id" : ObjectId("5af416dd7d5233c02aeb005b"), "name" : "Tom4", "age" : 2, "province" : "山西", "city" : "大同" }
{ "_id" : ObjectId("5af416dd7d5233c02aeb005c"), "name" : "Tom5", "age" : 1, "province" : "安徽", "city" : "合肥" }
{ "_id" : ObjectId("5af416dd7d5233c02aeb005d"), "name" : "Tom6", "age" : 3, "province" : "安徽", "city" : "合肥" }
```



```js
// 对 ‘grade2’集合进行操作，筛选条件为 age > 2
> db.runCommand({distinct: 'grade2', key: 'province', query: {age: {$gt: 2}}})
// { "values" : [ "山东", "北京", "安徽" ], "ok" : 1 }
```
## 7.2 `group`分组

### 7.2.1 语法
```
db.runCommand({
        group:{
                ns:集合名称，
                key:分组的键,
                initial:初始值,
                $reduce:分解器
                query:条件,
                finalize:完成时的处理器
        }
});
```

### 7.2.2 举个栗子

```js
// 原始数据
{ "_id" : ObjectId("5af416dd7d5233c02aeb0058"), "name" : "Tom1", "age" : 2, "province" : "山东", "city" : "德州" }
{ "_id" : ObjectId("5af416dd7d5233c02aeb0059"), "name" : "Tom2", "age" : 3, "province" : "山东", "city" : "青岛" }
{ "_id" : ObjectId("5af416dd7d5233c02aeb005a"), "name" : "Tom3", "age" : 3, "province" : "北京", "city" : "北京" }
{ "_id" : ObjectId("5af416dd7d5233c02aeb005b"), "name" : "Tom4", "age" : 2, "province" : "山西", "city" : "大同" }
{ "_id" : ObjectId("5af416dd7d5233c02aeb005c"), "name" : "Tom5", "age" : 1, "province" : "安徽", "city" : "合肥" }
{ "_id" : ObjectId("5af416dd7d5233c02aeb005d"), "name" : "Tom6", "age" : 3, "province" : "安徽", "city" : "合肥" }
```

- 根据省份进行分组 （筛选条件为 `age > 1` ）
```js
db.runCommand({
    group: {
        ns: 'grade2',
        key: {
            province: 1
        },
        initial: {
            total: 0
        },
        $reduce: function(doc, result) {
            result.total += doc.age;
        },
        query: {
            age: {
                $gt: 1
            }
        },
        finalize: function(result) {
            result.output = '年龄总和为： ' + result.total
        }
    }
})

// 运行结果为：共处理 5（count）条数据，分为 4 组
{
	"retval" : [
		{
			"province" : "山东",
			"total" : 5,
			"output" : "年龄总和为： 5"
		},
		{
			"province" : "北京",
			"total" : 3,
			"output" : "年龄总和为： 3"
		},
		{
			"province" : "山西",
			"total" : 2,
			"output" : "年龄总和为： 2"
		},
		{
			"province" : "安徽",
			"total" : 3,
			"output" : "年龄总和为： 3"
		}
	],
	"count" : NumberLong(5),
	"keys" : NumberLong(4),
	"ok" : 1
}
```

- 根据 省份 + 城市 进行分组（筛选条件为 `age > 1` ）

```js
// 运行命令
db.runCommand({
    group: {
        ns: 'grade2',
        key: {
            province: 1,
            city: 1
        },
        initial: {
            total: 0
        },
        $reduce: function(doc, result) {
            result.total += doc.age;
        },
        query: {
            age: {
                $gt: 1
            }
        }
    }
})

// 运行结果为：共处理 5 条数据，分为 5 组
{
	"retval" : [
		{
			"province" : "山东",
			"city" : "德州",
			"total" : 2
		},
		{
			"province" : "山东",
			"city" : "青岛",
			"total" : 3
		},
		{
			"province" : "北京",
			"city" : "北京",
			"total" : 3
		},
		{
			"province" : "山西",
			"city" : "大同",
			"total" : 2
		},
		{
			"province" : "安徽",
			"city" : "合肥",
			"total" : 3
		}
	],
	"count" : NumberLong(5),
	"keys" : NumberLong(5),
	"ok" : 1
}
```


## 7.3 `drop` 删除集合
- 语法
```
db.runCommand({
    drop: 集合名称
})
```

- 举个栗子

```js
> show collections
/*
grade1
grade2
grade3
*/

// 删除 grade3 集合
> db.runCommand({drop: 'grade3'})
// { "ns" : "school.grade3", "nIndexesWas" : 1, "ok" : 1 }

> show collections
/*grade1
grade2*/
```


## 7.4 `db.runCommand()` 常用命令
- `buildInfo` - 返回当前mongd 的构建摘要


```js
> db.runCommand({buildInfo: 1})
/*{
	"version" : "3.4.7",
	"gitVersion" : "cf38c1b8a0a8dca4a11737581beafef4fe120bcd",
	"modules" : [ ],
	"allocator" : "system",
	"javascriptEngine" : "mozjs",
	...
	"ok" : 1
}*/
```

- `getLastError` - 获取前一次的错误信息

```js
> db.grade1.insert({name: 'Lucy_4', age: 4, _id: 1})
//WriteResult({ "nInserted" : 1 })

> db.grade1.insert({name: 'Lucy_4', age: 4, _id: 1})
/*
报错：
WriteResult({
	"nInserted" : 0,
	"writeError" : {
		"code" : 11000,
		"errmsg" : "E11000 duplicate key error collection: school.grade1 index: _id_ dup key: { : 1.0 }"
	}
})*/

> db.runCommand({getLastError: 'school'})
/*
捕获到前一次的错误信息
{
	"connectionId" : 1,
	"err" : "E11000 duplicate key error collection: school.grade1 index: _id_ dup key: { : 1.0 }",
	"code" : 11000,
	"codeName" : "DuplicateKey",
	"n" : 0,
	"ok" : 1
}*/
>
```


# 8 固定集合
MongoDB 固定集合（Capped Collections）是性能出色且有着固定大小的集合，对于大小固定，我们可以想象其就像一个环形队列，当集合空间用完后，再插入的元素就会覆盖最初始的头部元素。

形状如下图：
![固定集合](https://user-gold-cdn.xitu.io/2018/5/10/1634a19384c20175?w=259&h=291&f=png&s=69637)


## 8.1 特性
- 没有索引
- 插入和查询速度速度非常快 不需要重新分配空间
- 特别适合存储日志

## 8.2 创建固定集合
- 通过createCollection来创建一个固定集合，且capped选项设置为true：

```js
db.createCollection('logs', {
    size: 5,      // 整个集合空间大小，单位为【KB】
    max: 3,       // 集合文档个数上线，单位是【个】
    capped: true    // 设置为true, 表示创建的是固定集合
})
```

- 如果空间大小到达上限，则插入下一个文档时，会覆盖第一个文档；如果文档个数到达上限，同样插入下一个文档时，会覆盖第一个文档。两个参数上限判断取的是【与】的逻辑。

```js
> db.logs.insert([{time: 1}, {time: 2}, {time: 3}, {time: 4}])

> db.logs.find({})
/*
{ "_id" : ObjectId("5af441247d5233c02aeb0061"), "time" : 2 }
{ "_id" : ObjectId("5af441617d5233c02aeb0062"), "time" : 3 }
{ "_id" : ObjectId("5af441687d5233c02aeb0063"), "time" : 4 }
*/
```

- 判断集合是否为固定集合: `db.logs.isCapped()`

```js
> db.logs.isCapped()
// true
> db.grade1.isCapped()
// false
```

## 8.3 非固定集合转为固定集合

```js
db.runCommand({convertToCapped: 'logs', size: 6})
// { "ok" : 1 }
```

# 9 gridfs
## 9.1 介绍
- gridfs是mongodb自带的文件系统，使用二进制存储文件。
- mongodb可以以BSON格式保存二进制对象。
- 但是BSON对象的体积不能超过4M。所以mongodb提供了mongofiles。它可以把一个大文件透明地分割成小文件（256K），从而保存大体积的数据。
- GridFS 用于存储和恢复那些超过16M（BSON文件限制）的文件(如：图片、音频、视频等)。
- GridFS 用两个集合来存储一个文件：fs.files与fs.chunks。
- 每个文件的实际内容被存在chunks(二进制数据)中,和文件有关的meta数据(filename,content_type,还有用户自定义的属性)将会被存在files集合中。
- 

## 9.2 文件操作

### 9.2.1 上传文件 `put`
```js
mongofiles -d dbname put 文件名
```


```js
> mongofiles --port 3000 -d myfiles put 1.txt
/*
2018-05-10T21:14:50.170+0800	connected to: localhost:3000
added file: 1.txt
*/

// 会生成两个集合
> show collections
/*
fs.chunks
fs.files
*/


// fs.files 存储的doc
{
    "_id" : ObjectId("5af445cac3666e928f286c5a"),
    "chunkSize" : 261120,
    "uploadDate" : ISODate("2018-05-10T13:14:50.203Z"),
    "length" : 12,
    "md5" : "a2ef74a76b2bfcfe14817a27c511759c",
    "filename" : "1.txt"
}


// fs.chunks 存储的 doc
{
    "_id" : ObjectId("5af445cac3666e928f286c5b"),
    "files_id" : ObjectId("5af445cac3666e928f286c5a"),
    "n" : 0,
    "data" : { "$binary" : "MTIzCjQ1Ngo3ODkK", "$type" : "00" }
}

```

- 如果上传一个大文件的时候，会分为多个chunks 存储
```js
// (bigFile.zip 大小为 85.6MB)
> mongofiles --port 3000 -d myfiles put bigFile.zip
/*
2018-05-10T21:29:23.425+0800	connected to: localhost:3000
added file: bigFile.zip
*/

// 1.txt 和 bigFile.zip 总共占用了 333 个网格
> db.fs.chunks.count()
333
```


### 9.2.2 下载文件 `get`

```js
> mongofiles --port 3000 -d myfiles get 1.txt
/*
2018-05-10T21:36:24.889+0800	connected to: localhost:3000
finished writing to 1.txt
*/
```

### 9.2.3 查看所有文件 `list`

```js
> mongofiles --port 3000 -d myfiles list
/*
2018-05-10T21:37:21.424+0800	connected to: localhost:3000
1.txt	12
bigFile.zip	86493501
*/
```

### 9.2.4 删除文件 `delete`

```js
> mongofiles --port 3000 -d myfiles delete 1.txt
/*
2018-05-10T21:38:42.324+0800	connected to: localhost:3000
successfully deleted all instances of '1.txt' from GridFS
*/
```
### 9.3 eval 服务器端脚本 
- 执行JS语句
- 定义JS全局变量
- 定义函数
- Stored JavaScript
 

```js
// 执行JS语句
> db.eval("return 'hello'");
WARNING: db.eval is deprecated
hello

// 定义JS全局变量
> db.system.js.insert({_id:'myname', value: 'Lily'})
// WriteResult({ "nInserted" : 1 })
> db.eval("return myname");
/*
WARNING: db.eval is deprecated
Lily
*/


// 定义函数
> db.system.js.insert({_id:'sayHello', value: function(){return 'hello'}})
// WriteResult({ "nInserted" : 1 })

> db.eval("sayHello()");
/*
WARNING: db.eval is deprecated
hello
*/
```

定义的函数在客户端的显示如下图:
![function](https://user-gold-cdn.xitu.io/2018/5/10/1634a5cd291be2de?w=656&h=308&f=jpeg&s=26926)
