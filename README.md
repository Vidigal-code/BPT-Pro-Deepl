# BPT-Pro-Deepl

**BPT-Pro-Deepl** is an advanced text translation tool that utilizes the powerful DeepL translation API to
provide high-quality translations. This project allows users to configure the API URL, set the desired target language,
and quickly translate selected text on web pages with ease.

## Example

![GIF Example](https://github.com/Vidigal-code/BPT-Pro-Deepl/blob/main/example/example-1.gif?raw=true)

## Features

- **API Configuration**: Configure the DeepL API URL and API key for seamless translation services.
- **Multiple Language Support**: Translate text into a wide variety of languages supported by DeepL, including English,
  German, Spanish, French, Dutch, Italian, Polish, Russian, Portuguese, and more.
- **Popup Display**: Translations are displayed in an elegant popup window right after selecting text on a webpage.
- **User-Friendly Interface**: The extension provides an intuitive interface to manage settings and customize the
  translation experience for users.

## Installation

### Steps to Install

1. **Download or Clone the Repository**:
    - You can either download the ZIP file of the repository or clone the repository using Git:

   ```bash
   git clone https://github.com/Vidigal-code/BPT-Pro-Deepl.git
   ```

2. **Load the Extension in Chrome or Edge**:

   ![Tutorial 1](https://github.com/Vidigal-code/BPT-Pro-Deepl/blob/main/example/tutorial-3.png?raw=true)

    - Open your browser and go to the extensions page (`chrome://extensions` for Chrome or `edge://extensions` for
      Edge).
    - Enable **Developer Mode** (toggle in the top-right corner).

   ![Tutorial 1](https://github.com/Vidigal-code/BPT-Pro-Deepl/blob/main/example/tutorial-0.png?raw=true)

    - Click on **Load Unpacked** and select the folder where you downloaded or cloned the repository.

   ![Tutorial 1](https://github.com/Vidigal-code/BPT-Pro-Deepl/blob/main/example/tutorial-1.png?raw=true)

4. **Configure the Extension**:
    - Click on the extension icon in the browser toolbar.
    - Enter the DeepL API URL and API key for the translation service.
    - Select the target language for translation.
    - API Test URL: [DeepL API Test](https://www.deepl.com/pro#developer)
    - API Test Key: Obtain it by signing up on [DeepL Pro](https://www.deepl.com/pro).

   ![Tutorial 1](https://github.com/Vidigal-code/BPT-Pro-Deepl/blob/main/example/example-2.png?raw=true)

### Start Using

Once configured, simply highlight text on any webpage, and the translation will appear in a popup.

## Usage

1. **Select Text**: Highlight the text on a webpage.
2. **Translation Popup**: The translation of the selected text will appear in a popup.
3. **Close Popup**: Click the "X" button on the popup to close it.
4. **Configure Settings**: If necessary, change the API URL, API key, or target language via the settings page.
5. **Plugin Status**: Ensure the plugin is activated.

## Example Code

```javascript
async function translateText(text, targetLanguage, apiUrl, apiKey) {
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `DeepL-Auth-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: [text],
            target_lang: targetLanguage.toUpperCase(),
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return data.translations[0]?.text || '';
}
```


To implement the keyboard shortcuts you mentioned in your code (`Alt + A` to activate the plugin, `Alt + K` to deactivate the plugin, `Alt + G` to toggle the plugin status, and `Alt + T` to test or open the test connection menu), you can modify the existing `setupKeyboardShortcuts` function. Here’s the updated version of the code with these specific shortcuts added:

```javascript
/**
 * Sets up keyboard shortcuts to activate/deactivate the plugin, test connection, and toggle the plugin status.
 */
setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        if (event.altKey) {
            switch (event.key.toUpperCase()) {
                case 'A': // Alt + A to activate the plugin
                    this.togglePluginStatus(true);
                    break;
                case 'K': // Alt + K to deactivate the plugin
                    this.togglePluginStatus(false);
                    break;
                case 'G': // Alt + G to toggle the plugin status (activate if deactivated, deactivate if active)
                    event.preventDefault();
                    this.togglePluginStatus();
                    break;
                case 'T': // Alt + T to open the test connection menu
                    event.preventDefault();
                    const apiTestPopup = new ApiTestPopup();
                    apiTestPopup.createApiTestListPopup();
                    break;
                default:
                    break;
            }
        }
    });
}
```

### Explanation of the Key Shortcuts:
1. **Alt + A**: Activates the plugin (calls `togglePluginStatus(true)`).
2. **Alt + K**: Deactivates the plugin (calls `togglePluginStatus(false)`).
3. **Alt + G**: Toggles the plugin status. If it is active, it will deactivate it; if it is inactive, it will activate it (calls `togglePluginStatus()`).
4. **Alt + T**: Opens the test connection menu by calling the `ApiTestPopup` constructor and its `createApiTestListPopup` method.

This will allow users to control the plugin's activation and deactivation with keyboard shortcuts, providing a more seamless user experience. Make sure that the `togglePluginStatus` function and `ApiTestPopup` class are properly implemented in your project for this to work correctly.

## Technologies Used

- **HTML**: Used to create the extension’s settings page and popup.
- **CSS**: Used to style and create a responsive interface for the extension.
- **JavaScript**: Handles the logic for translating selected text and manages the interactions between the extension and
  the browser.
- **Chrome/Edge Extension APIs**: Manages the browser’s communication with the extension, stores settings, and handles
  popup interactions.

# License

This project is licensed under the **MIT License**.

See the [LICENSE](https://github.com/Vidigal-code/BPT-Pro-Deepl/blob/main/License.mit) file for more details.

---

## Credits

- **Creator**: Kauan Vidigal
- **Translation API**: [DeepL](https://www.deepl.com/)
- **Contributions**: Contributions are welcome! Feel free to fork the repository, open an issue, or submit a pull
  request for improvements or new features.

## Links

- [DeepL API Documentation](https://www.deepl.com/docs-api)
- [DeepL API GitHub](https://github.com/DeepLcom/deepl-node)

---

Feel free to modify and enhance this project to suit your needs!


