let isPluginActive = false;


document.addEventListener('DOMContentLoaded', () => {

    const defaultApiUrl = 'https://api-free.deepl.com/v2/translate';

    chrome.storage.local.get(['targetLanguage', 'apiUrl', 'apiKey', 'isPluginActive'], (result) => {
        document.getElementById('languageSelect').value = result.targetLanguage || 'EN';
        document.getElementById('apiUrl').value = result.apiUrl || defaultApiUrl;
        document.getElementById('apiKey').value = result.apiKey || '';
        isPluginActive = result.isPluginActive;
        updatePluginButton();
    });
});


document.getElementById('saveButton').addEventListener('click', () => {

    const selectedLanguage = document.getElementById('languageSelect').value;
    const apiUrl = document.getElementById('apiUrl').value;
    const apiKey = document.getElementById('apiKey').value;

    if (!apiUrl || !apiKey) {
        alert('Please fill in both API URL and API Key fields.');
        return;
    }

    chrome.storage.local.set({targetLanguage: selectedLanguage, apiUrl, apiKey}, () => {
        alert('Settings saved successfully');
    });

});


document.getElementById('togglePluginButton').addEventListener('click', () => {
    isPluginActive = !isPluginActive;
    chrome.storage.local.set({isPluginActive}, () => {
        updatePluginButton();
        chrome.runtime.sendMessage({action: 'updatePluginStatus', isActive: isPluginActive});
        alert(`Plugin ${isPluginActive ? 'Activated' : 'Deactivated'}`);
    });
});


document.getElementById('testConnectionButton').addEventListener('click', async () => {
    const apiUrl = document.getElementById('apiUrl').value;
    const apiKey = document.getElementById('apiKey').value;

    if (!apiUrl || !apiKey) {
        alert("Please enter both API URL and API Key to test connection.");
        return;
    }

    const testResult = await testApiConnection(apiUrl, apiKey);
    testResult.success ?
        alert("Connection successful! DeepL API is working correctly.") :
        alert(`Connection failed: ${testResult.message}`);
});


async function testApiConnection(apiUrl, apiKey) {
    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `DeepL-Auth-Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: ["Hello, world!"],
            target_lang: "ES"
        }),
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorText => {
                    throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.translations && data.translations.length > 0) {
                return {success: true, message: "DeepL API working correctly"};
            } else {
                return {success: false, message: "Invalid response format from API"};
            }
        })
        .catch(error => {
            return {success: false, message: error.message};
        });
}


function updatePluginButton() {
    const statusButton = document.getElementById('togglePluginButton');
    statusButton.innerHTML = `Plugin Status: <strong>${isPluginActive ? 'Active' : 'Inactive'}</strong>`;
}