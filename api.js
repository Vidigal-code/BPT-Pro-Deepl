/**
 * Listens for messages from the extension and handles different actions.
 * @param {Object} message - The message object containing action and data.
 * @param {Object} sender - The sender of the message (not used here).
 * @param {Function} sendResponse - Function to send a response back to the sender.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    /**
     * Handles the translation request.
     * @param {string} message.text - The text to be translated.
     * @param {string} message.targetLanguage - The target language for translation.
     * @param {string} message.apiUrl - The URL of the translation API.
     * @param {string} message.apiKey - The API key for authentication.
     */
    if (message.action === 'translate') {
        translateText(message.text, message.targetLanguage, message.apiUrl, message.apiKey)
            .then(translatedText => {
                sendResponse({ translatedText });
            })
            .catch(error => {
                sendResponse({ error: { message: error.message || 'Translation error' } });
            });
        return true; // Keeps the message channel open for async response
    }

    /**
     * Handles the connection test request.
     * @param {string} message.apiUrl - The URL of the translation API.
     * @param {string} message.apiKey - The API key for authentication.
     */
    if (message.action === 'testConnection') {
        testConnection(message.apiUrl, message.apiKey)
            .then(result => {
                sendResponse(result);
            })
            .catch(error => {
                sendResponse({ success: false, message: error.message });
            });
        return true; // Keeps the message channel open for async response
    }
});

/**
 * Translates the given text to the target language using the translation API.
 * @param {string} text - The text to translate.
 * @param {string} targetLanguage - The target language code (e.g., 'EN', 'DE').
 * @param {string} apiUrl - The URL of the translation API.
 * @param {string} apiKey - The API key for authentication.
 * @returns {Promise<string>} - A promise that resolves to the translated text.
 */
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

/**
 * Background script for handling API connections.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'testConnection') {
        testConnection(message.apiUrl, message.apiKey)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, message: error.message }));
        return true; // Keeps the message channel open for async response
    }
});

/**
 * Tests the connection to the specified API.
 * @param {string} apiUrl - The URL of the API.
 * @param {string} apiKey - The API key for authentication.
 * @returns {Promise<Object>} - A promise that resolves to the test result.
 */
async function testConnection(apiUrl, apiKey) {
    try {
        console.log('Testing connection to:', apiUrl);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `DeepL-Auth-Key ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: ["Hello, world!"],
                target_lang: "ES", // Spanish translation
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        return { success: true, message: "API connection successful" };
    } catch (error) {
        console.error('Connection test failed:', error);
        return { success: false, message: error.message || "Unknown error" };
    }
}