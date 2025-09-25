# AI Streaming Avatar Application

A clean, professional web application for real-time voice conversations with your custom AI avatar.

## ✨ Features

- **Real-time Voice Chat**: Automatic voice detection with 2-4 second response times
- **Text Input**: Type messages for your avatar to speak
- **Beautiful UI**: Glass-morphism design with smooth animations
- **Mobile Responsive**: Works perfectly on all devices
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   Create a `.env` file with your API credentials:
   ```env
   VITE_HEYGEN_API_TOKEN=your-api-token-here
   VITE_HEYGEN_AVATAR_ID=your-avatar-id
   VITE_HEYGEN_VOICE_ID=your-voice-id
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173/`

## 🏗️ Project Structure

```
ai-streaming-app/
├── src/
│   ├── avatar-manager.js    # AI Avatar SDK wrapper with event handling
│   ├── ui-controller.js     # UI state management and interactions
│   ├── main.js             # Application entry point
│   └── style.css           # Beautiful CSS with animations
├── index.html              # Clean HTML structure
├── .env                    # Environment configuration
└── package.json            # Dependencies and scripts
```

## 🎯 How It Works

### 1. Landing Screen
- Beautiful gradient background with avatar preview
- Single "Start Conversation" button to initialize

### 2. Chat Interface
- Live avatar video stream
- Automatic voice detection (no push-to-talk needed)
- Text input with character counter
- Real-time status updates

### 3. Avatar Integration
- Uses modern streaming avatar SDK
- Handles stream setup and video display
- Manages voice chat lifecycle
- Error recovery and reconnection

## 🔧 Configuration

Your avatar configuration is set via environment variables:

- `VITE_HEYGEN_API_TOKEN`: Your API token
- `VITE_HEYGEN_AVATAR_ID`: Your custom avatar ID
- `VITE_HEYGEN_VOICE_ID`: Your voice model ID

## 🎨 Design Features

- **Glass-morphism UI**: Modern translucent design elements
- **Animated Gradient Background**: Dynamic color shifting
- **Responsive Layout**: Mobile-first design approach
- **Visual Feedback**: Speaking indicators and loading states
- **Accessibility**: ARIA labels and keyboard navigation

## 🛠️ Development

Built with:
- **Vite**: Fast build tool and dev server
- **Vanilla JavaScript**: No framework complexity
- **Modern CSS**: Custom properties and animations
- **Streaming Avatar SDK**: Latest AI avatar technology

## 📝 Usage

1. Click "Start Conversation" to initialize your avatar
2. Wait for connection (usually 2-3 seconds)
3. Just speak naturally - automatic voice detection
4. Or type messages in the text area
5. Watch your avatar respond in real-time!

## 🔍 Troubleshooting

**Connection Issues**: Check your API token and internet connection
**Voice Not Working**: Ensure microphone permissions are granted
**Avatar Not Loading**: Verify your avatar ID is correct
**Build Errors**: Run `npm install` to update dependencies

## ⚠️ Plan Requirements

**Premium Streaming**: Requires paid plan for full SDK access
- Real-time streaming with custom integration
- No watermarks with paid plans
- Full voice chat functionality

**Embed Fallback**: Works with free accounts
- Uses hosted embed iframe
- May include branding on free plans
- Still supports voice chat through web interface

## 💡 Usage Options

### Option 1: Premium Streaming (Paid Plan)
1. Upgrade to paid plan
2. Click "Start Conversation"
3. Enjoy full streaming functionality without watermarks

### Option 2: Embed Fallback (Free Plan)
1. Click "Try Embed Version" on landing page
2. Or click the fallback button if streaming connection fails
3. Interact with avatar through embed interface

---

Built following modern web development best practices for production-ready deployment.