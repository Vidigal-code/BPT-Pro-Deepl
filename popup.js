/**
 * PopupManager is responsible for handling the settings interface of the translation plugin.
 * It loads, saves, and manages plugin settings including language selection, API URL, API key, and keyboard shortcuts.
 */
class PopupManager {
    /**
     * Initializes the PopupManager with default settings for the DeepL API.
     */
    constructor() {
        /**
         * Initialize the state of the plugin, including plugin status and keyboard shortcuts.
         * The default API URL is set to DeepL's free API endpoint.
         */
        this.defaultApiUrl = 'https://api-free.deepl.com/v2/translate'; // Default DeepL API URL

        this.state = {
            apiUrl: this.defaultApiUrl, // API URL (set to DeepL default)
            apiKey: '', // API Key (empty by default)
            isPluginActive: false, // Plugin active status
            shortcuts: {
                activate: 'A', // Shortcut to activate plugin
                deactivate: 'K', // Shortcut to deactivate plugin
                testConnection: 'T', // Shortcut to test API connection
                toggle: 'G', // Shortcut to toggle plugin status
            }
        };

        this.init();
    }

    /**
     * Initializes the PopupManager by loading settings, setting up event listeners,
     * and configuring storage and message listeners.
     */
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupStorageListener();
        this.setupMessageListener();
        this.setupKeyboardShortcuts();
    }

    /**
     * Loads settings from Chrome's local storage and updates the popup UI.
     * Sets default values if no saved settings exist.
     */
    loadSettings() {
        chrome.storage.local.get(['targetLanguage', 'apiUrl', 'apiKey', 'isPluginActive', 'shortcuts'], (result) => {
            if (result.shortcuts) {
                this.state.shortcuts = { ...this.state.shortcuts, ...result.shortcuts };
            }
            document.getElementById('languageSelect').value = result.targetLanguage || 'EN'; // Default to 'EN' for DeepL
            document.getElementById('apiUrl').value = result.apiUrl || this.defaultApiUrl; // Set API URL input
            document.getElementById('apiKey').value = result.apiKey || ''; // Set API key input
            document.getElementById('shortcutActivate').value = this.state.shortcuts.activate;
            document.getElementById('shortcutDeactivate').value = this.state.shortcuts.deactivate;
            document.getElementById('shortcutTestConnection').value = this.state.shortcuts.testConnection;
            document.getElementById('shortcutToggle').value = this.state.shortcuts.toggle;
            this.state.isPluginActive = result.isPluginActive || false;
            this.state.apiUrl = result.apiUrl || this.defaultApiUrl;
            this.state.apiKey = result.apiKey || '';

            this.updatePluginButton(); // Update plugin status button
        });
    }

    /**
     * Sets up event listeners for user interactions with the settings interface.
     * Handles save, toggle, test connection, and shortcut changes.
     */
    setupEventListeners() {
        document.getElementById('saveButton').addEventListener('click', () => this.saveSettings());
        document.getElementById('togglePluginButton').addEventListener('click', () => this.togglePluginStatus());
        document.getElementById('testConnectionButton').addEventListener('click', () => this.testConnection());
        document.querySelectorAll('.shortcut-settings input').forEach((input) => {
            input.addEventListener('input', () => this.updateShortcuts());
        });
    }

    /**
     * Sets up a listener for changes to Chrome's local storage to update plugin status.
     */
    setupStorageListener() {
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.isPluginActive) {
                this.state.isPluginActive = changes.isPluginActive.newValue;
                this.updatePluginButton();
            }
        });
    }

    /**
     * Sets up a listener for messages from other parts of the extension to update plugin status.
     */
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'updatePluginStatus') {
                this.state.isPluginActive = message.isActive;
                this.updatePluginButton();
            }
        });
    }

    /**
     * Updates shortcut keys based on user input in the settings panel.
     */
    updateShortcuts() {
        this.state.shortcuts.activate = document.getElementById('shortcutActivate').value.toUpperCase() || 'A';
        this.state.shortcuts.deactivate = document.getElementById('shortcutDeactivate').value.toUpperCase() || 'K';
        this.state.shortcuts.testConnection = document.getElementById('shortcutTestConnection').value.toUpperCase() || 'T';
        this.state.shortcuts.toggle = document.getElementById('shortcutToggle').value.toUpperCase() || 'G';
    }

    /**
     * Sets up global keyboard shortcuts to control the plugin.
     * Supports toggling, testing connection, and changing plugin status.
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.altKey) {
                switch (event.key.toUpperCase()) {
                    case this.state.shortcuts.activate:
                        this.togglePluginStatus(true);
                        break;
                    case this.state.shortcuts.deactivate:
                        this.togglePluginStatus(false);
                        break;
                    case this.state.shortcuts.testConnection:
                        this.testConnection();
                        break;
                    case this.state.shortcuts.toggle:
                        this.togglePluginStatus();
                        break;
                    default:
                        break;
                }
            }
        });
    }

    /**
     * Saves settings to Chrome's local storage, including target language, API URL, API key, and shortcuts.
     */
    saveSettings() {
        const selectedLanguage = document.getElementById('languageSelect').value;
        const apiUrl = document.getElementById('apiUrl').value;
        const apiKey = document.getElementById('apiKey').value;

        if (!apiUrl || !apiKey) {
            alert('Please fill in both API URL and API Key fields.');
            return;
        }

        chrome.storage.local.set(
            {
                targetLanguage: selectedLanguage,
                apiUrl: apiUrl,
                apiKey: apiKey,
                isPluginActive: this.state.isPluginActive,
                shortcuts: this.state.shortcuts,
            },
            () => {
                alert('Settings saved successfully');
            }
        );
    }

    /**
     * Toggles the plugin's active status and updates the UI.
     * @param {boolean|null} forceState - Optional state to force (true/false), null to toggle.
     */
    togglePluginStatus(forceState = null) {
        this.state.isPluginActive = forceState !== null ? forceState : !this.state.isPluginActive;
        chrome.storage.local.set({ isPluginActive: this.state.isPluginActive }, () => {
            this.updatePluginButton();
            chrome.runtime.sendMessage({ action: 'updatePluginStatus', isActive: this.state.isPluginActive });
        });
    }

    /**
     * Updates the plugin status button to reflect whether the plugin is active or inactive.
     */
    updatePluginButton() {
        const statusButton = document.getElementById('togglePluginButton');
        statusButton.innerHTML = `Plugin Status: <strong>${this.state.isPluginActive ? 'Active' : 'Inactive'}</strong>`;
    }

    /**
     * Tests the connection to the DeepL API using the configured API URL and API Key.
     * Displays the result to the user.
     */
    async testConnection() {
        const apiUrl = document.getElementById('apiUrl').value;
        const apiKey = document.getElementById('apiKey').value;

        if (!apiUrl || !apiKey) {
            alert("Please enter both API URL and API Key to test connection.");
            return;
        }

        try {
            const testResult = await ApiTest.testConnection(apiUrl, apiKey);
            alert(testResult.success ? "Connection successful!" : `Connection failed: ${testResult.message}`);
        } catch (error) {
            alert(`Error testing connection: ${error.message}`);
        }
    }
}

/**
 * ApiTest is responsible for testing the connection to the DeepL API by sending a sample translation request.
 */
class ApiTest {
    /**
     * Tests the connection to the DeepL API by sending a sample translation request.
     * @param {string} apiUrl - The URL of the DeepL API (e.g., 'https://api-free.deepl.com/v2/translate').
     * @param {string} apiKey - The API key for authentication.
     * @returns {Promise<Object>} - A promise resolving to an object with success status and message.
     */
    static async testConnection(apiUrl, apiKey) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `DeepL-Auth-Key ${apiKey}`, // DeepL authentication header
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: ["Hello, world!"], // Sample text for translation
                    target_lang: "ES" // Target language: Spanish
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            if (data.translations && data.translations[0].text) {
                return { success: true, message: "DeepL API connection successful" };
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            return { success: false, message: error.message || "Unknown error" };
        }
    }
}

// Initialize PopupManager
const popupManager = new PopupManager();

// Clean up when popup is closed
window.addEventListener('unload', () => popupManager.destroy());