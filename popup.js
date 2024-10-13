// popup.js

let API_KEY = ''; // 将从存储中获取
const API_ENDPOINT = 'https://api.groq.com/openai/v1/audio/translations'; // Groq API端点
let OPENAI_API_KEY = '';

let isRecording = false;
let mediaRecorder;
let audioChunks = [];

const statusElement = document.getElementById('status');
const resultElement = document.getElementById('result');
let actionButton = document.getElementById('actionButton');
const buttonContainer = document.getElementById('buttonContainer');

// Fetch both API keys
chrome.storage.sync.get(['apiKey', 'openaiApiKey'], function(result) {
    API_KEY = result.apiKey;
    OPENAI_API_KEY = result.openaiApiKey;
    if (!API_KEY || !OPENAI_API_KEY) {
        statusElement.textContent = "请先在选项页面设置API密钥";
        actionButton.disabled = true;
    }
});

actionButton.addEventListener('click', toggleRecording);

function toggleRecording() {
    if (!API_KEY) {
        alert('请先在选项页面设置API密钥');
        return;
    }
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

function startRecording() {
    isRecording = true;
    audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            // Check for supported mime types
            const options = { mimeType: 'audio/wav' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/webm';
            }
            mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorder.start();
            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            statusElement.textContent = "录音进行中...";
            statusElement.classList.add('blinking');
            actionButton.textContent = "停止";
            actionButton.classList.remove('green');
            actionButton.classList.add('red');
        })
        .catch(error => {
            console.error('Error accessing microphone:', error);
            alert('无法访问麦克风。请检查您的权限设置。');
        });
}

function stopRecording() {
    isRecording = false;
    mediaRecorder.stop();

    statusElement.textContent = "正在翻译...";
    actionButton.textContent = "翻译中";
    actionButton.classList.remove('red');
    actionButton.classList.add('disabled');
    actionButton.disabled = true;

    mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
        convertAndSendAudio(audioBlob);
    });
}

function convertAndSendAudio(audioBlob) {
    // Optional: Convert audio to mp3 if necessary using external libraries
    // For simplicity, we'll proceed directly
    sendAudioForTranslation(audioBlob);
}

function sendAudioForTranslation(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-large-v3');
    formData.append('temperature', '0.0');
    // formData.append('prompt', '提供必要的上下文'); // 可选

    console.log('Sending audio for translation...');

    fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: formData
        })
        .then(response => {
            console.log('Received response:', response);
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('API response data:', data);
            console.log('Full API Response:', JSON.stringify(data, null, 2));
            if (data.text) {
                showResult(data.text);
            } else {
                throw new Error('Unexpected response format');
            }
        })
        .catch(error => {
            console.error('Error during translation:', error);
            alert(`翻译过程中出现错误: ${error.message}`);
            resetUI();
        });
}

// Load the last state when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
    const lastEnglishResult = localStorage.getItem('lastEnglishResult');
    const lastChineseResult = localStorage.getItem('lastChineseResult');
    if (lastEnglishResult) {
        showResult(lastEnglishResult, false); // Don't reset the UI on reload
    }
    if (lastChineseResult) {
        showChineseResult(lastChineseResult, false); // Don't reset the UI on reload
    }
});

function showResult(text, shouldSave = true) {
    text = text.trim(); // Remove any leading or trailing whitespace

    if (shouldSave) {
        localStorage.setItem('lastEnglishResult', text);
    }

    statusElement.style.display = 'none';
    resultElement.style.display = 'block';
    resultElement.value = text;

    buttonContainer.innerHTML = `
    <button id="copyButton" class="green">复制文本</button>
    <button id="translateButton" class="green">翻译成中文</button>
    <button id="resetButton" class="blue">重新录制</button>
  `;

    document.getElementById('translateButton').addEventListener('click', () => {
        translateToChinese(text);
    });

    document.getElementById('copyButton').addEventListener('click', () => {
        resultElement.select();
        document.execCommand('copy');
        document.getElementById('copyButton').style.backgroundColor = '#006400'; // Dark green color
        document.getElementById('copyButton').textContent = '已複製';
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'c' && event.ctrlKey) {
            resultElement.select();
            document.execCommand('copy');
            document.getElementById('copyButton').style.backgroundColor = '#006400'; // Dark green color
            document.getElementById('copyButton').textContent = '已複製';
        }
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        resetUI();
        toggleRecording();
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'r' && event.ctrlKey) {
        const resetButton = document.getElementById('resetButton');
        const actionButton = document.getElementById('actionButton');
        if (resetButton) {
            resetButton.click();
        } else if (actionButton) {
            actionButton.click();
        }
    }

});

function translateToChinese(englishText) {
    if (!OPENAI_API_KEY) {
        alert('请先在选项页面设置OpenAI API密钥');
        return;
    }

    statusElement.textContent = "正在翻译成中文...";
    statusElement.style.display = 'block';

    fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a translator. Translate the following English text to Chinese." },
                    { role: "user", content: englishText }
                ]
            })
        })
        .then(response => response.json())
        .then(data => {
            const chineseText = data.choices[0].message.content.trim();
            showChineseResult(chineseText);
        })
        .catch(error => {
            console.error('Error during translation:', error);
            alert(`翻译成中文时出现错误: ${error.message}`);
            statusElement.textContent = "翻译失败";
        });
}

function showChineseResult(text, shouldSave = true) {
    if (shouldSave) {
        localStorage.setItem('lastChineseResult', text);
    }

    statusElement.style.display = 'none';
    const chineseResultElement = document.getElementById('chineseResult');
    chineseResultElement.style.display = 'block';
    chineseResultElement.value = text;

    buttonContainer.innerHTML = `
    <button id="copyEnglishButton" class="green">复制英文</button>
    <button id="copyChineseButton" class="green">复制中文</button>
    <button id="resetButton" class="blue">重新录制</button>
  `;

    document.getElementById('copyEnglishButton').addEventListener('click', () => {
        document.getElementById('result').select();
        document.execCommand('copy');
        document.getElementById('copyEnglishButton').style.backgroundColor = '#006400';
        document.getElementById('copyEnglishButton').textContent = '已复制英文';
    });

    document.getElementById('copyChineseButton').addEventListener('click', () => {
        chineseResultElement.select();
        document.execCommand('copy');
        document.getElementById('copyChineseButton').style.backgroundColor = '#006400';
        document.getElementById('copyChineseButton').textContent = '已复制中文';
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        resetUI();
        toggleRecording();
    });
}

function resetUI() {
    localStorage.removeItem('lastEnglishResult'); // Clear saved English result
    localStorage.removeItem('lastChineseResult'); // Clear saved Chinese result
    statusElement.style.display = 'block';
    statusElement.textContent = "点击下方按钮录制语音并翻译成英文";
    statusElement.classList.remove('blinking');
    resultElement.style.display = 'none';
    resultElement.value = '';
    const chineseResultElement = document.getElementById('chineseResult');
    chineseResultElement.style.display = 'none';
    chineseResultElement.value = '';
    buttonContainer.innerHTML = '<button id="actionButton" class="green">语音翻译</button>';
    actionButton = document.getElementById('actionButton');
    actionButton.disabled = false;
    actionButton.addEventListener('click', toggleRecording);
}

function handleShortcut(event) {
    if (event.ctrlKey && event.key === 'b') {
        event.preventDefault(); // Prevent the default browser action for Ctrl+B
        const chineseResultElement = document.getElementById('chineseResult');
        if (chineseResultElement.style.display === 'none') {
            const translateButton = document.getElementById('translateButton');
            if (translateButton) {
                translateButton.click();
            }
        } else {
            const copyChineseButton = document.getElementById('copyChineseButton');
            if (copyChineseButton) {
                copyChineseButton.click();
            }
        }
    }
}

document.addEventListener('keydown', handleShortcut);