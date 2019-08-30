         # 《SOC V3.1 - Web管理端通讯接口规范》 #

`create: 2019-08-12`


## 概述 ##
  本规范定义Web前端页面与平台服务器通讯的交互API接口

  
- **网络协议**  
  HTTP，遵循RESTFul风格约定。

## 1.请求报文规范 ##

- **数据格式**  
  JSON格式，utf-8编码。

- **API请求根路径**

    文中所有api的url，需要在前面加上主机地址：
	`http://xxx.xxx.com/SOC/webclient/api`  


- **HEADER**

	参数名 | 类型 | 必须 | 描述
 	:------|:----:|:-------:|:--------
 	token | string | M | 用户token标识，登录后接口必须穿

- **body**  
  body内容为json文本
  
 
## 2.响应报文规范 ##


- **数据格式** 

    响应内容仍为JSON格式，采用utf-8编码。

- **HEADER** 

    响应内容的Header标识如下：

    `Content-Type:application/json;charset=utf-8`

- **HTTP方法** 

    一般使用 GET、POST、PUT、DELETE 这4个方法。

- **响应**

    依照HTTP协议的响应状态码作为判定标准：
    
     1） `HTTP STATUS=200`，为正确响应状态，按照接口定义返回正常报文内容。 
    
     2） `HTTP STATUS=4xx 或 5xx`，为异常响应状态，则根据返回报文体的错误信息处理。（4xx源于客户端的错误，5xx则源于服务器端的错误。）

     body内容为json文本时，需要通过SessionKey进行加密处理   
 


## 3. 业务接口说明 ##

 
### 3.1 总览 ###

### 3.1.1 获取服务器当前时间   ###

- **url**  

   > `get`  /ss/server/info

- **接口说明**  

  获取服务器上的当前时间

- **url请求**  

- **body请求**

- **响应**

返回对象格式:

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 realtime | long | M | 当前时间
 success | boolean | M | 请求是否成功返回：true 成功；false 失败
 message | string | O | 返回消息
 
 示例：

``` 
 {
  "realtime": 1557989451616,
  "success": true,
  "message": "服务器实时信息-完成"
}
```

### 3.1.2 获取最新的事件数据 ###

- **url**  

   > `get`  /ss/eventdatas/{size}

- **接口说明**  

  获取最新的实时事件数据。

- **url请求**  

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 size | int | M | 记录数 

- **body请求**


- **响应**  

返回对象格式为：

参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 success | boolean | M | 请求是否成功返回：true 成功；false 失败
 message | string | O | 返回消息
 data   | jsonArray | M | 事件对象数组

事件对象格式为：

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
eventTime | string | M | 事件发生时间
sip | string | O | 攻击ip
dip | string | M | 受攻击ip
portSrc | int | O | 攻击端口
portDst | int | M | 受攻击端口
vehicleId | string | M | 车辆唯一标识（VIN）
name | string | M | 攻击类型名称
code | string | M | 设备类型代码
isNew | boolean | M | 是否新事件：true 是新事件；false 不是
modelDeviceName | string | M | 受攻击设备
content | string | M | 事件详情
provinceId | int | O | 省ID
province | string | O | 省名称
cityId | int | O | 城市ID
city | string | O| 地域城市名称 
provinceIdSrc | int | O | 攻击所在省ID
provinceSrc | string | O | 攻击所在省名称
cityIdSrc | int | O | 攻击所在城市ID
citySrc | string | O | 攻击所在城市名称 

### 3.1.3 获取车辆事件当前最新统计数   ###

- **url**  

   > `get`  /ss/dailyStat

- **接口说明**  

  获取事件总数、车辆总数，以及今日注册增加车辆数和今日事件新增数。

- **响应**

 返回对象格式为：

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 success | boolean | M | 请求是否成功返回：true 成功；false 失败
 today   | jsonArray | M | 今日数据统计对象数组
 
 今日数据统计对象格式为：

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 id   | int | M | id
 stateDate | long | M | 统计时间
 total  | int | M | 统计数
 type  | int | M | 统计类型：0 今日事件新增；1 今日车辆新增；2 车辆累计总数；3 事件累计总数

### 3.1.4 获取近几日车辆、事件的每日统计数   ###

- **url**  

   > `get`  /ss/dailyStat

- **接口说明**  

  获取近几日的每日事件总数、车辆总数，增加车辆数和事件新增数。

- **url请求**

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 days | int | M |  时间段天数(默认为7)。值为7，15，30，90.

- **响应**

 返回对象格式为：

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 success | boolean | M | 请求是否成功返回：true 成功；false 失败
 message | string | O | 返回消息
 todya   | jsonArray | M | 今日数据统计对象数组
 
 今日数据统计对象格式为：

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 id   | int | M | id
 stateDate | long | M | 统计时间
 total  | int | M | 统计数
 type  | int | M | 统计类型：0 今日事件新增；1 今日车辆新增；2 车辆累计总数；3 事件累计总数

 

### 3.1.5 获取近几日事件类型统计数   ###

- **url**  

   > `get`  /ss/eventdataStatCategory/{days}

- **接口说明**  

  按时间段（近7日、近15日、近30日、近90日）获取事件类型的事件统计数据。

- **url请求**

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 days | int | M |  时间段天数(默认为7)。值为7，15，30，90.
  
- **body请求**  
  
  
- **响应**

 返回对象格式为：

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 success | boolean | M | 请求是否成功返回：true 成功；false 失败
 message | string | O | 返回消息
 data   | jsonArray | M | 事件类型统计数据对象数组
    
 事件类型统计数据对象格式为:

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 eventCategoryId  | int | M | 事件类型ID
 total  | int | M | 事件数
 eventCategory | jsonObj | M | 事件类型对象

 事件类型对象格式为:  
 
 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 id | int | M | id
 name | string | M | 事件类型名称
 code | string | M | 事件类型代码
 grade | number | M | 安全等级

### 3.1.6 获取近几日的按省事件统计数   ###

- **url**  

   > `get`  /ss/eventdataStatProvince/{days}

- **接口说明**  

  按时间段（近7日、近15日、近30日、近90日）获取按省的事件统计数。

- **url请求**

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 days | int | M |  时间段天数(默认为7)。值为7，15，30，90.
  
- **body请求**  
  
  
- **响应**

 返回对象格式为：

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 success | boolean | M | 请求是否成功返回：true 成功；false 失败
 message | string | O | 返回消息
 data   | jsonArray | M | 省统计数据对象数组
    
 省统计数据对象格式为:

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 id  | int | M | id
 province | string | M | 省名称
 total  | int | M | 事件数
 stateDate | long | M | 统计时间

### 3.1.7 获取近几日的按城市事件统计数   ###

- **url**  

   > `get`  /ss/eventdataStatCity/{days}?provinceId={provinceId}

- **接口说明**  

  按时间段（近7日、近15日、近30日、近90日）获取某省按城市的事件统计数。

- **url请求**

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 provinceId | int | M |  省ID
 days | int | M |  时间段天数(默认为7)。值为7，15，30，90.
  
- **body请求**  
  
  
- **响应**

 返回对象格式为：

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 success | boolean | M | 请求是否成功返回：true 成功；false 失败
 message | string | O | 返回消息
 data   | jsonArray | M | 城市统计数据对象数组
    
 城市统计数据对象格式为:

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 id  | int | M | id
 city | string | M | 城市名称
 total  | int | M | 事件数
 stateDate | long | M | 统计时间
 
 省ID和名称对应关系为：
 ```
 '1', '黑龙江省'  
'3', '吉林省'  
'5', '辽宁省'
'7', '河北省'
'9', '山东省'
'11', '山西省'
'13', '河南省'
'15', '云南省'
'17', '重庆市'
'19', '四川省'
'21', '湖南省'
'23', '湖北省'
'25', '贵州省'
'27', '安徽省'
'29', '江西省'
'31', '江苏省'
'33', '福建省'
'35', '海南省'
'37', '青海省'
'39', '甘肃省'
'41', '陕西省'
'43', '广东省'
'45', '台湾省'
'47', '北京市'
'49', '天津市'
'51', '上海市'
'55', '新疆维吾尔自治区'
'57', '内蒙古自治区'
'59', '宁夏回族自治区'
'61', '广西壮族自治区'
'63', '西藏藏族自治区'
'65', '香港特别行政区'
'67', '澳门特别行政区'
```

### 3.1.8 获取近几日的按设备类型事件统计数   ###

- **url**  

   > `get`  /ss/eventdataStatDeviceType/{days}

- **接口说明**  

  按时间段（近7日、近15日、近30日、近90日）获取按设备类型的事件统计数。

- **url请求**

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 days | int | M |  时间段天数(默认为7)。值为7，15，30，90.
  
- **body请求**  
  
  
- **响应**

 返回对象格式为：

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 success | boolean | M | 请求是否成功返回：true 成功；false 失败
 message | string | O | 返回消息
 data   | jsonArray | M | 设备类型统计数据对象数组
    
 设备类型统计数据对象格式为:

 参数名 | 类型 | 必须 | 描述
 :-----|:----:|:---:|:--------
 id  | int | M | id
 name | string | M | 设备类型名称
 total  | int | M | 事件数
 stateDate | long | M | 统计时间


