
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'translate') {
        translateText(request.text, request.targetLanguage, request.apiUrl, request.apiKey)
            .then((translatedText) => {
                sendResponse({ translatedText: translatedText });
            }).catch(err => {
            console.error('Translation error:', err);
            sendResponse({ error: { message: err.message || 'Translation error' } });
        });
        return true;
    }
});

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
    })
        .then(response => {
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
