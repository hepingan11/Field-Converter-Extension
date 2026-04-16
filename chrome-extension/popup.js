// popup.js
let uploadedData = null;
let convertedData = null;

// 页面加载时恢复数据
document.addEventListener('DOMContentLoaded', restoreData);

function restoreData() {
  chrome.storage.session.get(['uploadedData', 'convertedData', 'fileName', 'targetFields'], (items) => {
    if (items.uploadedData) {
      uploadedData = items.uploadedData;
      
      // 恢复文件名显示
      if (items.fileName) {
        document.getElementById('fileName').textContent = `已选择: ${items.fileName}`;
      }
      
      // 恢复字段预览
      const sampleData = Array.isArray(uploadedData) ? uploadedData[0] : uploadedData;
      const originalFields = Object.keys(sampleData || {});
      document.getElementById('fieldPreview').value = `原数据字段 (${originalFields.length}个):\n\n${originalFields.join('\n')}`;
    }
    
    if (items.convertedData) {
      convertedData = items.convertedData;
      document.getElementById('outputJson').value = JSON.stringify(convertedData, null, 2);
      document.getElementById('downloadBtn').style.display = 'block';
    }
    
    if (items.targetFields) {
      document.getElementById('targetFields').value = items.targetFields;
    }
  });
}

// 文件上传处理
document.getElementById('jsonFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById('fileName').textContent = `已选择: ${file.name}`;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const content = event.target.result;
      uploadedData = JSON.parse(content);
      
      // 显示原字段预览
      const sampleData = Array.isArray(uploadedData) ? uploadedData[0] : uploadedData;
      const originalFields = Object.keys(sampleData || {});
      document.getElementById('fieldPreview').value = `原数据字段 (${originalFields.length}个):\n\n${originalFields.join('\n')}`;

      // 保存到storage
      chrome.storage.session.set({
        uploadedData: uploadedData,
        fileName: file.name
      });

      showStatus(`成功加载文件，共${Array.isArray(uploadedData) ? uploadedData.length : 1}条数据`, 'success');
    } catch (error) {
      showStatus(`文件解析失败: ${error.message}`, 'error');
      uploadedData = null;
    }
  };
  reader.readAsText(file);
});

// 转换按钮
document.getElementById('convertBtn').addEventListener('click', async () => {
  if (!uploadedData) {
    showStatus('请先上传JSON文件', 'error');
    return;
  }

  const targetFieldsText = document.getElementById('targetFields').value.trim();
  if (!targetFieldsText) {
    showStatus('请输入目标字段列表', 'error');
    return;
  }

  try {
    showStatus('正在转换中...', 'loading');
    const targetFields = JSON.parse(targetFieldsText);
    if (!Array.isArray(targetFields)) {
      throw new Error('目标字段必须是数组格式，如：["productId", "name"]');
    }
    convertedData = await convertFieldsWithAI(uploadedData, targetFields);
    document.getElementById('outputJson').value = JSON.stringify(convertedData, null, 2);
    document.getElementById('downloadBtn').style.display = 'block';
    
    // 保存转换结果和目标字段到storage
    chrome.storage.session.set({
      convertedData: convertedData,
      targetFields: targetFieldsText
    });
    
    showStatus('转换成功！', 'success');
  } catch (error) {
    showStatus(`转换失败: ${error.message}`, 'error');
  }
});

// 下载按钮
document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!convertedData) return;

  const jsonString = JSON.stringify(convertedData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `converted_${new Date().getTime()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// 设置按钮
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// 重置按钮
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('确定要清除所有数据并重新开始吗？')) {
    uploadedData = null;
    convertedData = null;
    
    // 清空UI
    document.getElementById('jsonFile').value = '';
    document.getElementById('fileName').textContent = '';
    document.getElementById('fieldPreview').value = '';
    document.getElementById('targetFields').value = '';
    document.getElementById('outputJson').value = '';
    document.getElementById('downloadBtn').style.display = 'none';
    
    // 清除storage
    chrome.storage.session.clear();
    
    showStatus('已清除所有数据', 'success');
  }
});

async function convertFieldsWithAI(data, targetFields) {
  const { apiKey, model } = await chrome.storage.sync.get(['apiKey', 'model']);
  if (!apiKey) {
    throw new Error('请先设置智谱AI API密钥');
  }

  const modelName = model || 'glm-4.7-flash';
  const dataArray = Array.isArray(data) ? data : [data];

  // 获取原始数据的第一条作为示例
  const sampleData = dataArray[0];
  const originalFields = Object.keys(sampleData || {});

  const prompt = `你是一个JSON数据转换专家。我需要你将JSON数据按照指定的字段进行筛选和输出。

原始字段：${JSON.stringify(originalFields)}

目标字段列表：${JSON.stringify(targetFields)}

任务：从原始数据中提取目标字段列表中指定的字段，生成新的JSON数组。
- 只保留目标字段列表中的字段
- 字段名称保持目标字段列表中指定的名称
- 如果原始数据中没有某个目标字段，跳过该字段
- 确保返回的是有效的JSON数组

要转换的数据：${JSON.stringify(dataArray)}

要求：
1. 只返回转换后的JSON数组，不要任何其他内容
2. 每条数据只包含目标字段中指定的字段
3. 数据类型和值保持不变
4. 返回有效的、可以直接使用的JSON格式`;

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 65536,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`AI调用失败: ${response.status}`);
  }

  const result = await response.json();
  if (!result.choices || !result.choices[0] || !result.choices[0].message) {
    throw new Error('AI响应格式错误');
  }

  const convertedText = result.choices[0].message.content;
  
  // 尝试提取JSON内容
  const jsonMatch = convertedText.match(/\[\s*[\s\S]*\s*\]/);
  if (!jsonMatch) {
    throw new Error('AI返回的不是有效的JSON数组');
  }

  return JSON.parse(jsonMatch[0]);
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      statusDiv.className = 'status';
    }, 3000);
  }
}