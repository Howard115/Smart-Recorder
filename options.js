// 保存选项到 chrome.storage
function saveOptions() {
  const apiKey = document.getElementById('apiKey').value;
  chrome.storage.sync.set({ apiKey: apiKey }, function() {
      // 更新状态以让用户知道选项已保存。
      const status = document.getElementById('status');
      status.textContent = 'API Key 已保存。';
      setTimeout(function() {
          status.textContent = '';
      }, 3000);
  });
}

// 当选项页面加载时，恢复保存的选项
function restoreOptions() {
  chrome.storage.sync.get('apiKey', function(items) {
      document.getElementById('apiKey').value = items.apiKey || '';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);