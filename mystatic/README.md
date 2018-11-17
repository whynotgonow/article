# mystatic
可以在任意目录下启动一个静态文件服务器，并且把当前目录 做为静态文件根目录

# install
```
$ npm install mystatic-now -g
```


# 用法
```
$ mystatic -d/--root 指定静态文件根目录 -p/--port 指定端口号 -o/--host 指定监听的主机 
```

- e.g.
```
$ mystatic -d public -p 8080 -o localhost
```
即静态文件的根目录为 /public，监听的主机为localhost，端口为8080



# 服务器实现的功能
- 显示目录下面的文件列表和返回内容
- 实现压缩的功能
- 实现缓存
- 获取部分数据

# 注意
- 本项目使用的node版本为 8.9.4

# NPM
- [mystatic](https://www.npmjs.com/package/mystatic-now)



