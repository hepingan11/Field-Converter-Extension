// options.js
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('saveBtn').addEventListener('click', saveSettings);

function loadSettings() {
  chrome.storage.sync.get(['apiKey', 'model'], (items) => {
    if (items.apiKey) {
      document.getElementById('apiKey').value = items.apiKey;
    }
    if (items.model) {
      document.getElementById('model').value = items.model;
    }
  });
}

function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const model = document.getElementById('model').value;
  const statusDiv = document.getElementById('status');

  if (!apiKey) {
    showStatus('API密钥不能为空', 'error');
    return;
  }

  chrome.storage.sync.set(
    {
      apiKey: apiKey,
      model: model
    },
    () => {
      showStatus('设置已保存成功！', 'success');
      setTimeout(() => {
        statusDiv.className = 'status';
      }, 3000);
    }
  );
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
}