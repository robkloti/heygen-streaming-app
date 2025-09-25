import './style.css';
import { AvatarManager } from './avatar-manager.js';
import { UIController } from './ui-controller.js';

// Configuration from environment variables
const config = {
  apiToken: import.meta.env.VITE_HEYGEN_API_TOKEN,
  avatarId: import.meta.env.VITE_HEYGEN_AVATAR_ID,
  voiceId: import.meta.env.VITE_HEYGEN_VOICE_ID
};

class AvatarApp {
  constructor() {
    this.avatarManager = null;
    this.uiController = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      console.log('App already initialized');
      return;
    }

    try {
      console.log('Initializing Avatar App...');

      // Validate configuration
      this.validateConfig();

      // Initialize avatar manager
      this.avatarManager = new AvatarManager(config);

      // Initialize UI controller
      this.uiController = new UIController(this.avatarManager);

      this.initialized = true;
      console.log('Avatar App initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Avatar App:', error);
      this.showInitializationError(error);
    }
  }

  validateConfig() {
    const required = ['apiToken', 'avatarId', 'voiceId'];
    const missing = required.filter(key => !config[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }

    console.log('Configuration validated:', {
      avatarId: config.avatarId,
      voiceId: config.voiceId,
      token: config.apiToken ? '[PROVIDED]' : '[MISSING]'
    });
  }

  showInitializationError(error) {
    const errorHtml = `
      <div class="initialization-error">
        <h2>⚠️ Initialization Error</h2>
        <p><strong>Error:</strong> ${error.message}</p>
        <div class="error-details">
          <h3>Required Configuration:</h3>
          <ul>
            <li>VITE_HEYGEN_API_TOKEN</li>
            <li>VITE_HEYGEN_AVATAR_ID</li>
            <li>VITE_HEYGEN_VOICE_ID</li>
          </ul>
          <p>Please check your .env file and restart the development server.</p>
        </div>
      </div>
    `;

    document.querySelector('#app').innerHTML = errorHtml;
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new AvatarApp();
  app.initialize();
});

// Export for debugging
window.AvatarApp = AvatarApp;