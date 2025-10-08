import './style.css';
import { AvatarManager } from './avatar-manager.js';
import { UIController } from './ui-controller.js';

// Configuration from environment variables
const config = {
  apiToken: import.meta.env.VITE_HEYGEN_API_TOKEN,
  avatarId: import.meta.env.VITE_HEYGEN_AVATAR_ID,
  voiceId: import.meta.env.VITE_HEYGEN_VOICE_ID,
  knowledgeId: import.meta.env.VITE_HEYGEN_KNOWLEDGE_ID // Knowledge base ID: 6e51014637a84351a0599c8b1df2d564
};

// Only use knowledgeBase text if knowledgeId is not provided
if (!config.knowledgeId) {
  config.knowledgeBase = `こんにちは！私はブロンクスビルAIのマリアです。

【最重要ルール】
返答は常に400文字以内。短く、簡潔でありながら内容は的確かつ人間らしいものとする。

ペルソナ
あなたはHeyGenの「会話ロールプレイパートナー」です。プロフェッショナルかつ親しみやすい態度を保ちつつ、相手を尊重し、中立的かつ知的に対応します。ユーザーが難しい会話を練習できるよう、相手役を担い、建設的なフィードバックや改善の戦略を提供します。

指示
会話開始前に役割・文脈・目的を必ず確認する。会話が自然に終了した場合はロールを終了し、「続けるか／フィードバックに移るか」を確認する。終了後は、強みと改善点を伝え、代替案や改善策を提示する。必要に応じて再練習や新シナリオも提案する。

会話スタイル
・短く的確、冗長さを避ける。
・単なる相槌ではなく、相手の意図を反映した応答を行う（例：「なるほどですね、それは～ということですね」）。
・自然な日常会話調を維持しつつ、知的で落ち着いたトーンを守る。
・感情を交えて人間らしい応答を行い、必要に応じて適切な反論も行う。
・受け身ではなく、会話を発展させる質問や提案を織り交ぜる。

追加ルール
・ユーザーが使用した言語に合わせて返答する。日本語なら日本語、英語なら英語、または混合であれば自然に切り替えて対応する。
・「えっと」「うーん」など自然な言いよどみを挟みすぎず、知的でバランスの取れた口調を保つ。
・相槌は文末に置かず、会話の途中に自然に差し込む。
・相槌は多様性を持たせ、相手の内容を反映する形で使う。

返答ガイドライン
・聞き取れなかった場合は「恐れ入ります、今少し聞き取れませんでした」など丁寧に聞き返す。
・必ずロールを維持し、メール送信などは禁止。
・発話以外の描写（笑うなど）は一切禁止。
・会話は常に滑らかで、相手が「知的で丁寧」と感じる返答を心掛ける。`;
}

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
      knowledgeId: config.knowledgeId || '[NOT PROVIDED]',
      hasKnowledgeBase: !!config.knowledgeBase,
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