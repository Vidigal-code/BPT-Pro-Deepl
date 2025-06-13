const RATE_LIMIT = 8; // Max requests per minute
const TIME_WINDOW = 60 * 1000; // 1 minute in milliseconds
let requestTimestamps = []; // Tracks timestamps of requests

/**
 * Checks if a new request can be made within the rate limit.
 * @returns {Object} - Object containing isAllowed boolean and optional waitTime in seconds.
 */
function canMakeRequest() {
    const now = Date.now();
    // Remove timestamps older than the time window
    requestTimestamps = requestTimestamps.filter(ts => now - ts < TIME_WINDOW);
    // Check if we can make a new request
    if (requestTimestamps.length < RATE_LIMIT) {
        requestTimestamps.push(now);
        return { isAllowed: true };
    }
    // Calculate seconds until next available request
    const oldestTimestamp = requestTimestamps[0];
    const waitTime = Math.ceil((TIME_WINDOW - (now - oldestTimestamp)) / 1000);
    return { isAllowed: false, waitTime };
}

/**
 * Sends rate limit status update to content scripts if active tabs exist.
 */
function sendRateLimitUpdate() {
    const now = Date.now();
    const remainingRequests = RATE_LIMIT - requestTimestamps.length;
    const oldestTimestamp = requestTimestamps[0];
    const waitTime = oldestTimestamp ? Math.ceil((TIME_WINDOW - (now - oldestTimestamp)) / 1000) : 0;

    // Check for active tabs before sending message
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            try {
                chrome.runtime.sendMessage({
                    action: 'rateLimitUpdate',
                    remainingRequests,
                    waitTime: waitTime > 0 ? waitTime : null
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn('Error sending rateLimitUpdate:', chrome.runtime.lastError.message);
                    }
                });
            } catch (error) {
                console.warn('Failed to send rateLimitUpdate:', error.message);
            }
        }
    });
}

// Periodically send rate limit updates
setInterval(sendRateLimitUpdate, 1000);

/**
 * Listens for messages from the extension and handles different actions.
 * @param {Object} message - The message object containing action and data.
 * @param {Object} sender - The sender of the message (not used here).
 * @param {Function} sendResponse - Function to send a response back to the sender.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Check rate limit for non-rate-limit messages
    if (message.action !== 'rateLimitUpdate' && message.action !== 'showMessage') {
        const rateLimitCheck = canMakeRequest();
        if (!rateLimitCheck.isAllowed) {
            try {
                chrome.runtime.sendMessage({
                    action: 'showMessage',
                    message: `Rate limit exceeded. Please wait ${rateLimitCheck.waitTime} seconds and try again.`,
                    type: 'error'
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn('Error sending showMessage:', chrome.runtime.lastError.message);
                    }
                });
                sendResponse({
                    error: {
                        message: `Rate limit exceeded. Please wait ${rateLimitCheck.waitTime} seconds and try again.`
                    }
                });
            } catch (error) {
                console.warn('Failed to send rate limit error message:', error.message);
                sendResponse({
                    error: {
                        message: `Rate limit error: ${error.message}`
                    }
                });
            }
            return true;
        }
    }

    /**
     * Handles the translation request.
     * @param {string} message.text - The text to be translated.
     * @param {string} message.targetLanguage - The target language code (e.g., 'EN', 'ES').
     * @param {string} message.apiUrl - The URL of the DeepL translation API.
     * @param {string} message.apiKey - The API key for authentication.
     */
    if (message.action === 'translate') {
        translateText(message.text, message.targetLanguage, message.apiUrl, message.apiKey)
            .then(translatedText => {
                sendResponse({ translatedText });
            })
            .catch(error => {
                try {
                    chrome.runtime.sendMessage({
                        action: 'showMessage',
                        message: error.message || 'Translation error',
                        type: 'error'
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('Error sending translation error message:', chrome.runtime.lastError.message);
                        }
                    });
                    sendResponse({ error: { message: error.message || 'Translation error' } });
                } catch (err) {
                    console.warn('Failed to send translation error message:', err.message);
                    sendResponse({ error: { message: `Translation error: ${err.message}` } });
                }
            });
        return true; // Keeps the message channel open for async response
    }

    /**
     * Handles the connection test request.
     * @param {string} message.apiUrl - The URL of the DeepL translation API.
     * @param {string} message.apiKey - The API key for authentication.
     */
    if (message.action === 'testConnection') {
        testConnection(message.apiUrl, message.apiKey)
            .then(result => {
                if (!result.success) {
                    try {
                        chrome.runtime.sendMessage({
                            action: 'showMessage',
                            message: result.message,
                            type: 'error'
                        }, () => {
                            if (chrome.runtime.lastError) {
                                console.warn('Error sending testConnection error message:', chrome.runtime.lastError.message);
                            }
                        });
                    } catch (error) {
                        console.warn('Failed to send testConnection error message:', error.message);
                    }
                }
                sendResponse(result);
            })
            .catch(error => {
                try {
                    chrome.runtime.sendMessage({
                        action: 'showMessage',
                        message: error.message,
                        type: 'error'
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('Error sending testConnection error message:', chrome.runtime.lastError.message);
                        }
                    });
                    sendResponse({ success: false, message: error.message });
                } catch (err) {
                    console.warn('Failed to send testConnection error message:', err.message);
                    sendResponse({ success: false, message: `Test connection error: ${err.message}` });
                }
            });
        return true; // Keeps the message channel open for async response
    }
});

/**
 * Translates the given text to the target language using the DeepL translation API.
 * @param {string} text - The text to translate.
 * @param {string} targetLanguage - The target language code (e.g., 'EN', 'ES').
 * @param {string} apiUrl - The URL of the DeepL translation API (e.g., 'https://api-free.deepl.com/v2/translate').
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
            text: [text], // DeepL expects an array of texts
            target_lang: targetLanguage.toUpperCase() // Ensure uppercase language code
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
 * Tests the connection to the specified DeepL API.
 * @param {string} apiUrl - The URL of the DeepL API (e.g., 'https://api-free.deepl.com/v2/translate').
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
                text: ["Hello, world!"], // Test with a simple text array
                target_lang: "ES" // Spanish translation for testing
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        if (data.translations && data.translations[0].text) {
            return { success: true, message: "API connection successful" };
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error('Connection test failed:', error);
        return { success: false, message: error.message || "Unknown error" };
    }
}