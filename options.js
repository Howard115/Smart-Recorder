// 保存選項到 chrome.storage
function saveOptions() {
    const apiKey = document.getElementById('apiKey').value;
    const openaiApiKey = document.getElementById('openaiApiKey').value;
    chrome.storage.sync.set({ apiKey: apiKey, openaiApiKey: openaiApiKey }, function() {
        const status = document.getElementById('status');
        status.textContent = 'API Keys 已保存。';
        setTimeout(function() {
            status.textContent = '';
        }, 3000);
    });
}

// 当选项页面加载时，恢复保存的选项
function restoreOptions() {
    chrome.storage.sync.get(['apiKey', 'openaiApiKey'], function(items) {
        document.getElementById('apiKey').value = items.apiKey || '';
        document.getElementById('openaiApiKey').value = items.openaiApiKey || '';
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);