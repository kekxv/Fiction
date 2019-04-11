# 在线小说学习项目

该项目为学习研究项目，不做任何用途，也请勿使用在除学习外的任意用途。

## 书源问题

自行设置：

1.  代理地址
1.  插件地址
1.  插件变量

自动填充代码：

    http://localhost/Fiction/index.html?ProxyUrl={代理地址}&Model={书源变量}&ModelUrl={书源脚本地址}
    
例如

    http://localhost/Fiction/index.html?ProxyUrl=http://127.0.0.1/ProxyCrossDomain/index.php&Model=huanyue123&ModelUrl=http://127.0.0.1/Fiction/JavaScript/model/huanyue123.js
  
   
## 代理地址格式

### ProxyCrossDomain

PHP 跨域代理

#### 用法

`GET` 请求以及 `PUSH` 请求对应代理的请求

> 参数说明
> 1. `url` 请求地址
> 1. `data` 请求数据
> 1. `isJson` 是否是Json格式数据，仅 POST 有效
> 1. `refererUrl` 跳转地址
> 

#### 返回

`JSON` 格式

> 返回说明
> 1. `Code` 结果代码
> 1. `Message` 结果信息
> 1. `Result:` 结果内容


## Demo 

> 书源 ： huanyue123
> 
> ![测试网站](images/Qr_huanyue123.png)

> 书源 ： biquguan
>
> ![测试网站](images/Qr_biquguan.png)