# 体育器材共享：提供给IoT设备开发者的文档

## 一些小概念的定义
1. prefix. 目前取作`/inshare`
2. device_id. 设备id，一个字符串，应该是唯一的

## 订阅
设备需要订阅(QoS=2)：
1. `${prefix}/server`
1. `${prefix}/server/${device_id}`

比如，`prefix`为`/inshare`，`device_id`为`sim1`的时候，需要订阅：
1. `/inshare/server`
1. `/inshare/server/sim1`

## 信息请求与响应
设备需要向`${prefix}/client/${device_id}`以QoS=2发送消息，
以大端（高位在前）模式传输

除了响应服务器主动发送的请求之外，设备也应当在刚刚启动的时候，以及数据变化之后主动发送相关的信息。

#### 位置
请求：`0xA2`\
响应：`0x42[x][y]`，x和y是32位浮点数（有修改），其中西经和南纬用负数表示（当然我想只要GPS没坏，也不会有西经和南纬的数据就是了。。。）
#### 工作时间
请求：`0xA2`\
响应：`0x43[t]`，t是表示时间的32位无符号整数
#### 门情况
请求：`0xA2`\
响应：`0x43[n][b1,b2,...,bn,00...0]`，n是门总量，后面跟着3字节数据，其中前面n位有效，0表示门关着，1表示门开着。
（括号不是实际要传输的数据，只是一个标记。实际要传输的数据和“程序指导”里面说的是一样的）
#### 器材情况
请求：`0xA2`\
响应：`0x44[n][(a1,b1,c1),...,(an,bn,an)]`，n是器材数量，后面跟着3n字节的数据，a1,b1,c1各占一个字节，存储一个无符号整数，分别表示器材类型ID，器材总量，器材余量（和“程序指导”一致）


## 控制请求与响应
引入了token的概念。每次请求借用或归还的时候，服务器都会发送一个1字节的token，用来标记这一次请求。IoT设备响应的时候，将这个token发回给服务器，服务器就指导IoT设备正在响应哪个请求了。

#### 借用
请求：`0xB1[typeid][token]`，typeid表示想要借用的器材类型的ID\
响应：`0x51[token][1/2][d]` （1表示成功，2表示失败），d位1字节无符号整数，表示为这次请求打开的门的编号。如果打开失败，那随意返回一个数字即可。

#### 归还
请求：`0xB2[typeid][token]`，typeid表示想要借用的器材类型的ID\
响应：`0x52[token][1/2][d]`（1表示成功，2表示失败），d位1字节无符号整数，表示为这次请求打开的门的编号。如果打开失败，那随意返回一个数字即可。

#### 验证码
请求（服务器发送）：`0xC1[captcha]`，其中captcha是ASCII编码的验证码字符串，希望IoT设备予以显示。目前，captcha是一个三位10进制数字构成的字符串。

## 主动退网
发送：`0x00`
设备主动发送`0x00`，可以主动向服务器说明自己将不再工作。

## 错误信息
发送：`0x61[str]`，str是可选的。其中str是ASCII码字符串。
