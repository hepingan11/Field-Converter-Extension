来自 Field Converter Chrome Extension

## 功能说明

这是一个Chrome浏览器扩展插件，用于将电商平台产品数据的字段进行转换，利用智谱AI API自动完成字段映射。

## 快速开始

### 1. 获取API密钥

访问 [智谱AI开放平台](https://open.bigmodel.cn/console/apikeys)，获取你的API密钥。

### 2. 安装扩展

1. 打开Chrome浏览器，输入 `chrome://extensions/`
2. 启用右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本项目的 `chrome-extension` 文件夹

### 3. 配置API密钥

1. 点击扩展图标，出现快捷菜单
2. 点击"设置API密钥"按钮
3. 输入你的智谱AI API密钥
4. 选择AI模型（默认：glm-4.7-flash）
5. 点击"保存设置"

### 4. 使用转换工具

1. 点击扩展图标打开弹出窗口
2. 在"输入JSON数据"框中粘贴你的JSON数据（支持单个对象或数组）
3. 点击"转换字段"按钮
4. 转换结果会显示在"转换结果"框中
5. 复制结果到你需要的地方

## 字段映射表

| 淘宝字段 | 新字段 |
|---------|--------|
| id | productId |
| productName | name |
| category | categoryName |
| brand | brandName |
| price | currentPrice |
| originalPrice | marketPrice |
| stock | inventory |
| sales | salesVolume |
| rating | averageRating |
| reviewCount | reviewNumber |
| imageUrl | image |
| description | desc |
| tags | keywords |
| isHot | hot |
| isNew | newArrival |
| status | productStatus |

## 文件结构

```
chrome-extension/
├── manifest.json      # 扩展配置（Manifest V3）
├── popup.html         # 弹出窗口UI
├── popup.js           # 弹出窗口逻辑和AI调用
├── options.html       # 设置页面
├── options.js         # 设置页面逻辑
├── background.js      # 后台服务脚本
├── content.js         # 页面内容脚本
└── README.md          # 说明文档
```

## API调用示例

### 请求格式

```json
{
  "model": "glm-4.7-flash",
  "messages": [
    {
      "role": "user",
      "content": "..." 
    }
  ],
  "max_tokens": 65536,
  "temperature": 1.0
}
```

### 响应格式

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "[{...}]"
      }
    }
  ]
}
```

## 支持的模型

- `glm-4.7-flash` (推荐 - 快速且优质)
- `glm-4-vision`
- `glm-4`

## 常见问题

### Q: API密钥保存在哪里？
A: 密钥存储在Chrome Extension的同步存储中（chrome.storage.sync），安全且跨设备同步。

### Q: 支持哪些数据格式？
A: 支持单个JSON对象或JSON数组。

### Q: 如何删除保存的密钥？
A: 访问设置页面，清空API密钥字段后点击保存即可。

### Q: 转换失败怎么办？
A: 
- 检查API密钥是否正确
- 确认网络连接正常
- 检查JSON格式是否有效
- 查看浏览器控制台的错误信息

## 开发和测试

### 查看调试信息

1. 右键点击扩展图标 > "选项" 或 "管理扩展"
2. 在扩展详情页点击"背景页"查看后台日志
3. 在弹出窗口中使用浏览器开发者工具

### 重新加载扩展

1. 访问 `chrome://extensions/`
2. 找到本扩展，点击刷新按钮

## 许可证

MIT

## 支持

如有问题，请检查：
- [智谱AI API文档](https://open.bigmodel.cn/doc/overview)
- Chrome扩展开发文档：chrome://extensions
