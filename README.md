# Smart-Recorder

## Overview
**Smart-Recorder** is a Chrome extension designed to record voice input and translate it to English text using the GroqCloud Whisper API. This tool is ideal for users who want a quick and easy way to convert spoken language into text directly within their browser.

## Features
- Voice recording within the Chrome browser.
- Translation of voice input to English text using the GroqCloud Whisper API.
- Translation of English text to Chinese using OpenAI's GPT-4o-mini model.
- Keyboard shortcuts for easy control and navigation.
- Copy translated text (both English and Chinese) to the clipboard with a single shortcut.

## Keyboard Shortcuts
- **Toggle Popup**: `Ctrl + F` (Mac)  
  *Note: You need to set this manually. Go to [chrome://extensions/shortcuts](chrome://extensions/shortcuts) to configure it.*
- **Start/Stop Recording**: `Ctrl + R` (Mac)
- **Copy Text**: `Ctrl + C` (Mac)
- **Translate to Chinese / Copy Chinese**: `Ctrl + B` (Mac)

## Setup
1. Clone or download the repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top-right corner.
4. Click on "Load unpacked" and select the folder containing the extension files.
5. Configure the keyboard shortcuts by going to [chrome://extensions/shortcuts](chrome://extensions/shortcuts).
6. Open the extension options page and enter your [Groq API Key](https://console.groq.com/keys). (You can choose whether to set the [OpenAI API Key](https://platform.openai.com/api-keys), as it is only needed if you want to confirm the accuracy of the translation by translating it back to Chinese.)

## How to Use
1. Use the **Toggle Popup** shortcut (`Ctrl + F` on Mac) to open the Smart-Recorder extension popup.
2. Press **Start Record/Stop Record** (`Ctrl + R` on Mac) to begin or end voice recording.
3. Once the recording is stopped, the translated English text will be displayed.
4. Use the **Copy Text** shortcut (`Ctrl + C` on Mac) to copy the English text to your clipboard.
5. To translate the English text to Chinese, click the "Translate to Chinese" button or use the `Ctrl + B` shortcut.
6. After translation, use the `Ctrl + B` shortcut again to copy the Chinese text to your clipboard.

## Credits
The prototype code for this project is based on a [tutorial](https://www.youtube.com/watch?v=MWlcUgyllco) by [Zhu的AI开发日记](https://www.youtube.com/@zhuhaofunAI).
