export class EmbedFallback {
  constructor() {
    this.isEmbedLoaded = false;
    this.embedContainer = null;
  }

  createEmbedFallback() {
    console.log('Creating HeyGen embed fallback...');

    // Create embed container
    this.embedContainer = document.createElement('div');
    this.embedContainer.id = 'heygen-embed-fallback';
    this.embedContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 800px;
      height: 500px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      z-index: 1000;
      padding: 1rem;
      box-sizing: border-box;
    `;

    // Add title and instructions
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="text-align: center; margin-bottom: 1rem; color: white;">
        <h3 style="margin: 0 0 0.5rem 0;">HeyGen Interactive Avatar</h3>
        <p style="margin: 0; opacity: 0.8; font-size: 0.9rem;">
          SDK requires paid plan - Using embed fallback
        </p>
      </div>
    `;

    // Create iframe for the embed
    const iframe = document.createElement('iframe');
    iframe.src = "https://labs.heygen.com/interactive-avatar/share?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiI1OGU0NDVlZmM5ZDI0NDUzYmFlZWI5ZDg5%0D%0AZjFiZmEwYiIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3Yz%0D%0ALzU4ZTQ0NWVmYzlkMjQ0NTNiYWVlYjlkODlmMWJmYTBiL2Z1bGwvMi4yL3ByZXZpZXdfdGFyZ2V0%0D%0ALndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6IjE4%0D%0ANzEzYTliYTlhMTRkN2ZhYjBiYWViZmI5ZjJhNjFiIiwidXNlcm5hbWUiOiI3YWMxOWZmYmNhMjM0%0D%0AOGQxYmExZTEyMDEyNWJjMzcxMiJ9";
    iframe.style.cssText = `
      width: 100%;
      height: calc(100% - 80px);
      border: none;
      border-radius: 12px;
      background: white;
    `;
    iframe.allow = "microphone; camera";
    iframe.title = "HeyGen Interactive Avatar";

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 1.5rem;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    `;

    closeButton.addEventListener('click', () => {
      this.removeEmbedFallback();
    });

    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.background = 'rgba(255, 255, 255, 0.3)';
    });

    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
    });

    // Assemble the embed
    this.embedContainer.appendChild(header);
    this.embedContainer.appendChild(iframe);
    this.embedContainer.appendChild(closeButton);

    // Add to page
    document.body.appendChild(this.embedContainer);
    this.isEmbedLoaded = true;

    // Add click outside to close
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (this.embedContainer && !this.embedContainer.contains(e.target)) {
          this.removeEmbedFallback();
        }
      });
    }, 100);

    console.log('HeyGen embed fallback created');
    return true;
  }

  removeEmbedFallback() {
    if (this.embedContainer) {
      this.embedContainer.remove();
      this.embedContainer = null;
      this.isEmbedLoaded = false;
      console.log('HeyGen embed fallback removed');
    }
  }

  show() {
    if (!this.isEmbedLoaded) {
      return this.createEmbedFallback();
    }
    return true;
  }
}