import StreamingAvatar, { AvatarQuality, VoiceEmotion } from '@heygen/streaming-avatar';

export class AvatarManager {
  constructor(config) {
    this.avatar = null;
    this.config = config;
    this.isConnected = false;
    this.isInitializing = false;
    this.mediaStream = null;
    this.eventHandlers = new Map();
  }

  async initialize() {
    if (this.isInitializing || this.isConnected) {
      console.log('Avatar already initializing or connected');
      return;
    }

    this.isInitializing = true;

    try {
      console.log('Initializing AI Streaming Avatar with config:', {
        avatarId: this.config.avatarId,
        voiceId: this.config.voiceId,
        token: this.config.apiToken ? '[PROVIDED]' : '[MISSING]'
      });

      // Create streaming avatar instance
      console.log('Creating AI Avatar with token length:', this.config.apiToken?.length);
      this.avatar = new StreamingAvatar({
        token: this.config.apiToken
      });

      // Set up event handlers before creating session
      this.setupEventHandlers();

      // Create avatar session
      const avatarConfig = {
        avatarName: this.config.avatarId,
        quality: AvatarQuality.High,
        voice: {
          voiceId: this.config.voiceId,
          emotion: VoiceEmotion.FRIENDLY
        }
      };

      // Add knowledge base configuration if provided
      if (this.config.knowledgeId) {
        avatarConfig.knowledgeId = this.config.knowledgeId;
        console.log('Using knowledge base ID:', this.config.knowledgeId);
      } else if (this.config.knowledgeBase) {
        avatarConfig.knowledgeBase = this.config.knowledgeBase;
        console.log('Using custom knowledge base content');
      }

      const sessionInfo = await this.avatar.createStartAvatar(avatarConfig);

      console.log('Avatar session created:', sessionInfo);

      // Start voice chat
      await this.avatar.startVoiceChat();
      console.log('Voice chat started');

      // Automatically start listening (like HeyGen's interface)
      try {
        await this.avatar.startListening();
        console.log('Auto-listening started');
        this.emit('autoListeningStarted');
      } catch (error) {
        console.log('Auto-listening not available, will use text-only mode:', error.message);
      }

      this.isConnected = true;
      this.isInitializing = false;

      this.emit('connected', {
        sessionInfo,
        provider: 'heygen'
      });

    } catch (error) {
      console.error('Avatar initialization failed:', error);
      this.isInitializing = false;

      // Check for common API issues
      let errorMessage = `Initialization failed: ${error.message}`;

      if (error.message?.includes('400') || error.message?.includes('unauthorized') || error.message?.includes('API request failed')) {
        errorMessage = `API Error (${error.message})\n\n⚠️ This might be due to:\n• API token expired or invalid\n• Free plan limitations - Premium streaming requires a paid plan\n• Token not properly configured\n\nPlease check your account dashboard for plan details and token status.`;
      } else if (error.message?.includes('CORS')) {
        errorMessage = `CORS Error: ${error.message}\n\nTry serving from a proper domain or check API token permissions.`;
      }

      this.emit('error', {
        error,
        message: errorMessage
      });
      throw error;
    }
  }

  setupEventHandlers() {
    if (!this.avatar) return;

    // Stream ready - video stream available
    this.avatar.on('stream_ready', (event) => {
      console.log('Stream ready event:', event);
      this.mediaStream = event.detail;
      this.emit('streamReady', {
        stream: this.mediaStream,
        provider: 'heygen'
      });
    });

    // Avatar starts talking
    this.avatar.on('avatar_start_talking', (event) => {
      console.log('Avatar started talking:', event);
      this.emit('speaking', {
        talking: true,
        provider: 'heygen'
      });
    });

    // Avatar stops talking
    this.avatar.on('avatar_stop_talking', (event) => {
      console.log('Avatar stopped talking:', event);
      this.emit('speechEnded', {
        talking: false,
        provider: 'heygen'
      });
    });

    // User starts speaking
    this.avatar.on('user_start', (event) => {
      console.log('User started speaking:', event);
      this.emit('userSpeaking', {
        userSpeaking: true
      });
    });

    // User stops speaking
    this.avatar.on('user_stop', (event) => {
      console.log('User stopped speaking:', event);
      this.emit('userSpeechEnded', {
        userSpeaking: false
      });
    });

    // Error handling
    this.avatar.on('error', (event) => {
      console.error('Avatar error event:', event);
      this.emit('error', {
        error: event.detail || event,
        message: `Avatar error: ${event.detail?.message || 'Unknown error'}`
      });
    });
  }

  async speak(message) {
    if (!this.avatar || !this.isConnected) {
      throw new Error('Avatar not connected');
    }

    if (!message?.trim()) {
      throw new Error('Message cannot be empty');
    }

    try {
      console.log('Sending speak command:', message);
      await this.avatar.speak({
        text: message.trim(),
        task_type: 'talk'
      });
    } catch (error) {
      console.error('Speak failed:', error);
      this.emit('error', {
        error,
        message: `Speech failed: ${error.message}`
      });
      throw error;
    }
  }

  async startListening() {
    if (!this.avatar || !this.isConnected) {
      throw new Error('Avatar not connected');
    }

    try {
      await this.avatar.startListening();
      this.emit('listeningStarted');
    } catch (error) {
      console.error('Start listening failed:', error);
      throw error;
    }
  }

  async stopListening() {
    if (!this.avatar || !this.isConnected) {
      throw new Error('Avatar not connected');
    }

    try {
      await this.avatar.stopListening();
      this.emit('listeningStopped');
    } catch (error) {
      console.error('Stop listening failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.avatar && this.isConnected) {
      try {
        await this.avatar.closeVoiceChat();
        await this.avatar.stopAvatar();
        console.log('Avatar disconnected successfully');
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }

    this.avatar = null;
    this.isConnected = false;
    this.mediaStream = null;
    this.emit('disconnected');
  }

  // Event emitter methods
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
  }

  emit(event, data = {}) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Event handler error for ${event}:`, error);
        }
      });
    }
  }
}