## 字段转换工具

原理很简单，直接喂给大模型指定提示词然后结构化输出对应json数据

安装：

![](https://img-hepingan.oss-cn-hangzhou.aliyuncs.com/picgo/20260416191237.png)

先设置密钥，这是使用的glm4.7-flash，可以升级加一个自定义

![](https://img-hepingan.oss-cn-hangzhou.aliyuncs.com/picgo/20260416191328.png)

![](https://img-hepingan.oss-cn-hangzhou.aliyuncs.com/picgo/20260416190853.png)

然后用根目录下的测试数据(taobao-data.json)，目标字段列表使用jingdong.json粘进去再点击转换就行



**另外关于命题1我也有思路：两种方法：**
第一种就是使用云API，比如说百度的OCR文字识别，就是直接识别图片的文字内容。
第二种方法就是使用大模型识别文字内容，识别出文字内容就保存，然后在搜索的时候就可以搜索到图片里的文字内容