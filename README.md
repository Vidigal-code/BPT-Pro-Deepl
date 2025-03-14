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
    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `DeepL-Auth-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: [text],
            target_lang: targetLanguage.toUpperCase(),
        }),
    }).then(response => {
            if (!response.ok) {
                return response.text().then(errorData => {
                    throw new Error(`API Error (${response.status}): ${errorData}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.translations && data.translations.length > 0) {
                return data.translations[0].text;
            } else {
                throw new Error('No translation returned from API');
            }
        })
        .catch(error => {
            console.error('Translation API error:', error);
            throw error;
        });
}
```

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

# License - API

This project is licensed under the **MIT License**.

See the [LICENSE](https://github.com/LibreTranslate/LibreTranslate/blob/main/LICENSE) file for more details.

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


