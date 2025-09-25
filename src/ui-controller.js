import { EmbedFallback } from './embed-fallback.js';

export class UIController {
  constructor(avatarManager) {
    this.avatarManager = avatarManager;
    this.currentScreen = 'landing';
    this.elements = {};
    this.isListening = false;
    this.isRecording = false;
    this.embedFallback = new EmbedFallback();

    this.initializeElements();
    this.setupEventListeners();
    this.setupAvatarEventHandlers();
  }

  initializeElements() {
    // Get or create main UI elements
    this.elements = {
      landingScreen: document.getElementById('landing-screen'),
      chatScreen: document.getElementById('chat-screen'),
      videoElement: document.getElementById('avatar-video'),
      startButton: document.getElementById('start-conversation'),
      speakButton: document.getElementById('speak-button'),
      messageInput: document.getElementById('message-input'),
      statusMessage: document.getElementById('status-message'),
      errorContainer: document.getElementById('error-container'),
      loadingOverlay: document.getElementById('loading-overlay'),
      charCount: document.getElementById('char-count'),
      voiceIndicator: document.getElementById('voice-indicator'),
      voiceStatusText: document.getElementById('voice-status-text')
    };
  }

  setupEventListeners() {
    // Start conversation button
    if (this.elements.startButton) {
      this.elements.startButton.addEventListener('click', () => {
        this.handleStartConversation();
      });
    }

    // Try embed button
    const embedButton = document.getElementById('try-embed');
    if (embedButton) {
      embedButton.addEventListener('click', () => {
        this.embedFallback.show();
      });
    }

    // Speak button
    if (this.elements.speakButton) {
      this.elements.speakButton.addEventListener('click', () => {
        this.handleSpeak();
      });
    }

    // No push-to-talk needed - voice is automatic

    // Message input enter key and character counting
    if (this.elements.messageInput) {
      this.elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSpeak();
        }
      });

      this.elements.messageInput.addEventListener('input', () => {
        this.updateCharacterCount();
      });
    }

    // Error container close
    if (this.elements.errorContainer) {
      const closeButton = this.elements.errorContainer.querySelector('.error-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          this.hideError();
        });
      }
    }
  }

  setupAvatarEventHandlers() {
    this.avatarManager.on('connected', (data) => {
      console.log('UI: Avatar connected', data);
      this.showChatScreen();
      this.updateStatus('Connected! Voice chat is active.');
      this.hideLoading();
    });

    this.avatarManager.on('autoListeningStarted', () => {
      console.log('UI: Auto-listening started');
      this.setVoiceActive(true);
      this.updateStatus('Voice chat active - Speak naturally!');
    });

    this.avatarManager.on('streamReady', (data) => {
      console.log('UI: Stream ready', data);
      if (this.elements.videoElement && data.stream) {
        this.elements.videoElement.srcObject = data.stream;

        // Ensure audio is enabled
        this.elements.videoElement.muted = false;
        this.elements.videoElement.volume = 1.0;

        // Play with user interaction to avoid autoplay restrictions
        this.elements.videoElement.play().catch(error => {
          console.log('Video autoplay blocked, will try after user interaction:', error);
          // Add click handler to enable audio after user interaction
          this.addAudioEnableButton();
        });

        // Add click handler to video to enable audio
        this.elements.videoElement.addEventListener('click', () => {
          this.elements.videoElement.muted = false;
          this.elements.videoElement.volume = 1.0;
          this.elements.videoElement.play().then(() => {
            console.log('Audio enabled by video click');
            const audioButton = document.getElementById('enable-audio-btn');
            if (audioButton) audioButton.remove();
          }).catch(console.error);
        });
      }
    });

    this.avatarManager.on('speaking', (data) => {
      console.log('UI: Avatar speaking', data);
      this.setAvatarSpeaking(true);
    });

    this.avatarManager.on('speechEnded', (data) => {
      console.log('UI: Avatar speech ended', data);
      this.setAvatarSpeaking(false);
    });

    this.avatarManager.on('userSpeaking', (data) => {
      console.log('UI: User speaking', data);
      this.setVoiceListening(true);
      this.updateStatus('Listening...');
    });

    this.avatarManager.on('userSpeechEnded', (data) => {
      console.log('UI: User speech ended', data);
      this.setVoiceListening(false);
      this.updateStatus('Processing...');
    });

    this.avatarManager.on('error', (data) => {
      console.error('UI: Avatar error', data);
      this.showError(data.message || 'An error occurred');
      this.hideLoading();
    });

    this.avatarManager.on('disconnected', () => {
      console.log('UI: Avatar disconnected');
      this.showLandingScreen();
      this.updateStatus('Disconnected');
    });
  }

  async handleStartConversation() {
    this.showLoading('Connecting to your avatar...');
    this.updateStatus('Initializing avatar connection...');

    try {
      await this.avatarManager.initialize();
    } catch (error) {
      console.error('Failed to start conversation:', error);
      this.showError(`Failed to connect: ${error.message}`);
      this.hideLoading();
    }
  }

  async handleSpeak() {
    const message = this.elements.messageInput?.value?.trim();
    if (!message) {
      this.showError('Please enter a message to speak');
      return;
    }

    try {
      this.updateStatus('Avatar is speaking...');
      await this.avatarManager.speak(message);
      this.elements.messageInput.value = '';
    } catch (error) {
      console.error('Speak failed:', error);
      this.showError(`Speech failed: ${error.message}`);
    }
  }

  setVoiceActive(isActive) {
    if (this.elements.voiceIndicator) {
      this.elements.voiceIndicator.classList.toggle('active', isActive);
    }
    if (this.elements.voiceStatusText) {
      this.elements.voiceStatusText.textContent = isActive
        ? '🎤 Voice chat active - Just speak naturally'
        : '🎤 Voice chat inactive';
    }
  }

  setVoiceListening(isListening) {
    if (this.elements.voiceIndicator) {
      this.elements.voiceIndicator.classList.toggle('listening', isListening);
    }
    if (this.elements.voiceStatusText) {
      this.elements.voiceStatusText.textContent = isListening
        ? '🔊 Listening...'
        : '🎤 Voice chat active - Just speak naturally';
    }
  }

  showLandingScreen() {
    this.currentScreen = 'landing';
    if (this.elements.landingScreen) {
      this.elements.landingScreen.style.display = 'block';
    }
    if (this.elements.chatScreen) {
      this.elements.chatScreen.style.display = 'none';
    }
  }

  showChatScreen() {
    this.currentScreen = 'chat';
    if (this.elements.landingScreen) {
      this.elements.landingScreen.style.display = 'none';
    }
    if (this.elements.chatScreen) {
      this.elements.chatScreen.style.display = 'block';
    }
  }

  showLoading(message = 'Loading...') {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = 'flex';
      const loadingText = this.elements.loadingOverlay.querySelector('.loading-text');
      if (loadingText) {
        loadingText.textContent = message;
      }
    }
  }

  hideLoading() {
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = 'none';
    }
  }

  updateStatus(message) {
    if (this.elements.statusMessage) {
      this.elements.statusMessage.textContent = message;
    }
  }

  setAvatarSpeaking(isSpeaking) {
    if (this.elements.videoElement) {
      this.elements.videoElement.classList.toggle('speaking', isSpeaking);

      // Ensure audio is playing when avatar speaks
      if (isSpeaking) {
        this.elements.videoElement.muted = false;
        if (this.elements.videoElement.paused) {
          this.elements.videoElement.play().catch(console.error);
        }
      }
    }

    // Disable input while avatar is speaking
    if (this.elements.messageInput) {
      this.elements.messageInput.disabled = isSpeaking;
    }
    if (this.elements.speakButton) {
      this.elements.speakButton.disabled = isSpeaking;
    }
  }

  addAudioEnableButton() {
    // Check if button already exists
    if (document.getElementById('enable-audio-btn')) {
      return;
    }

    const audioButton = document.createElement('button');
    audioButton.id = 'enable-audio-btn';
    audioButton.textContent = '🔊 Click to Enable Audio';
    audioButton.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ff6b6b, #ee5a52);
      border: none;
      border-radius: 25px;
      padding: 12px 24px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      z-index: 1002;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
      animation: bounce 2s infinite;
    `;

    audioButton.addEventListener('click', () => {
      if (this.elements.videoElement) {
        this.elements.videoElement.muted = false;
        this.elements.videoElement.volume = 1.0;
        this.elements.videoElement.play().then(() => {
          console.log('Audio enabled successfully');
          audioButton.remove();
          this.updateStatus('Audio enabled! Avatar can now speak to you.');
        }).catch(console.error);
      }
    });

    document.body.appendChild(audioButton);

    // Add bounce animation to CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
        40% { transform: translateX(-50%) translateY(-10px); }
        60% { transform: translateX(-50%) translateY(-5px); }
      }
    `;
    document.head.appendChild(style);
  }


  showError(message) {
    if (this.elements.errorContainer) {
      const errorText = this.elements.errorContainer.querySelector('.error-text');
      if (errorText) {
        errorText.innerHTML = message.replace(/\n/g, '<br>');
      }
      this.elements.errorContainer.style.display = 'block';

      // If it's an API error, add fallback button
      if (message.includes('API Error') || message.includes('400')) {
        this.addFallbackButton();
      }

      // Auto-hide error after 10 seconds for API errors (longer read time)
      const hideTime = message.includes('API Error') ? 10000 : 5000;
      setTimeout(() => {
        this.hideError();
      }, hideTime);
    } else {
      // Fallback to console and alert
      console.error('Error:', message);
      alert(`Error: ${message}`);
    }
  }

  addFallbackButton() {
    // Check if button already exists
    if (document.getElementById('fallback-embed-btn')) {
      return;
    }

    const fallbackBtn = document.createElement('button');
    fallbackBtn.id = 'fallback-embed-btn';
    fallbackBtn.textContent = 'Try Embed Version';
    fallbackBtn.style.cssText = `
      margin-top: 1rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    `;

    fallbackBtn.addEventListener('click', () => {
      this.embedFallback.show();
      this.hideError();
    });

    fallbackBtn.addEventListener('mouseenter', () => {
      fallbackBtn.style.transform = 'translateY(-2px)';
      fallbackBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.3)';
    });

    fallbackBtn.addEventListener('mouseleave', () => {
      fallbackBtn.style.transform = 'translateY(0)';
      fallbackBtn.style.boxShadow = 'none';
    });

    this.elements.errorContainer.querySelector('.error-message').appendChild(fallbackBtn);
  }

  hideError() {
    if (this.elements.errorContainer) {
      this.elements.errorContainer.style.display = 'none';

      // Remove fallback button if it exists
      const fallbackBtn = document.getElementById('fallback-embed-btn');
      if (fallbackBtn) {
        fallbackBtn.remove();
      }
    }
  }

  updateCharacterCount() {
    if (this.elements.messageInput && this.elements.charCount) {
      const count = this.elements.messageInput.value.length;
      const maxLength = this.elements.messageInput.getAttribute('maxlength') || 500;
      this.elements.charCount.textContent = `${count}/${maxLength}`;
    }
  }
}