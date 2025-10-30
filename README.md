# QuietClass Notes 📘

Privacy-first classroom companion for the web. Summarize, simplify, translate, and proofread **on-device** using Chrome's Built‑in AI (Gemini Nano). Optional hybrid fallback when on-device is unavailable.

## ✨ Features

### Core AI Features
- **📝 Summarizer** - Extract key points from selected text (markdown format)
- **✏️ Simplify/Rewriter** - Rewrite content by level (beginner/intermediate) or tone (formal/casual)
- **🌐 Translator** - Translate to 10+ languages with auto-detection
- **🧹 Proofreader** - Grammar and clarity corrections with explanations

### User Experience
- **🎯 Floating Action Chips** - Quick access when selecting text on any webpage
- **⌨️ Keyboard Shortcuts** - Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) to run
- **📊 Input Statistics** - Real-time character and word count
- **💾 Preference Persistence** - Language and mode selections are saved
- **📤 Export Options** - Export results as JSON or Markdown files
- **🌙 Dark Mode Support** - Automatic theme based on system preferences
- **🔔 Toast Notifications** - Visual feedback for actions
- **⚠️ Smart Error Handling** - Helpful error messages with actionable suggestions

### Privacy & Performance
- **🔒 On-Device Processing** - All AI runs locally using Chrome Built-in AI
- **☁️ Optional Hybrid Fallback** - Cloud fallback when on-device unavailable
- **⚡ Fast Response** - Optimized for < 2s for short text, < 5s for medium content
- **📴 Offline Capable** - Works without internet (on-device mode)

## 🚀 Installation

### Prerequisites
- Chrome 130+ (for Chrome Built-in AI APIs)
- Chrome Built-in AI enabled (check `chrome://flags` for "Chrome Built-in AI")

### Developer Mode Setup

1. **Clone/download this repository**
   ```bash
   git clone https://github.com/yourusername/quietclass-notes.git
   cd quietclass-notes
   ```

2. **Replace placeholder icons** (optional but recommended)
   - Replace `public/icons/icon16.png`, `icon48.png`, and `icon128.png` with your PNG images

3. **Load the extension**
   - Open Chrome → Navigate to `chrome://extensions`
   - Toggle **Developer mode** (top-right corner)
   - Click **Load unpacked**
   - Select the `quietclass-notes` folder

4. **Pin and activate**
   - Pin the extension to your toolbar
   - Click the extension icon or use `Ctrl+Shift+Y` to open the side panel

## 📖 Usage

### Basic Workflow

1. **Select text on any webpage** - Floating action chips appear automatically
2. **Click a chip** - Choose **Summarize**, **Simplify**, **Translate**, or **Proofread**
3. **View results** - Side panel opens with the processed text
4. **Take action** - Copy, export, or use the output as new input

### Features in Detail

#### Summarizer
- Select any text block (article, lecture notes, research paper)
- Click **Summarize** chip
- Get concise bullet points in markdown format

#### Simplify/Rewriter
- Select complex text
- Choose your mode:
  - **Beginner** - Simplest language
  - **Intermediate** - Clear but detailed
  - **Formal** - Professional tone
  - **Casual** - Conversational style
- Click **Simplify** chip

#### Translator
- Select text in any language
- Choose target language (10+ supported)
- Click **Translate** chip
- View translated text side-by-side

#### Proofreader
- Paste or type your notes
- Select **Proofread** tab
- Click **Run** or press `Ctrl+Enter`
- Review grammar and clarity suggestions

### Keyboard Shortcuts

- `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac) - Run AI processing
- Click extension icon or `Ctrl+Shift+Y` - Open side panel

### Quick Actions

- **Clear** - Reset input text
- **Use as Input** - Move output back to input for further processing
- **Copy Output** - Copy results to clipboard
- **Export** - Download as JSON or Markdown

## 🔧 Technical Details

### Architecture

```
QuietClass Notes/
├── src/
│   ├── contentScript.js      # Floating chips & text selection
│   ├── serviceWorker.js      # Message routing
│   ├── ai/                   # AI wrapper modules
│   │   ├── summarizer.js     # Chrome Summarizer API
│   │   ├── rewriter.js       # Chrome Rewriter API
│   │   ├── translator.js     # Chrome Translator API
│   │   ├── proofreader.js    # Chrome Proofreader API
│   │   └── hybrid.js          # Cloud fallback (configurable)
│   └── utils/
│       ├── availability.js   # API availability checks
│       └── storage.js        # Local storage helpers
├── sidepanel/
│   ├── index.html            # Side panel UI
│   └── index.js              # UI logic & event handlers
└── public/
    └── sidepanel.css         # Styling (with dark mode)
```

### Chrome Built-in AI APIs Used

1. **Summarizer API** - On-device summarization
2. **Rewriter API** - Text rewriting with tone/level control
3. **Translator API** - Multi-language translation
4. **Proofreader API** - Grammar and clarity checking

### Hybrid Mode Configuration

To enable cloud fallback, edit `src/ai/hybrid.js`:

```javascript
// Example: Firebase AI Logic
import { getFirebaseApp } from './firebase-config.js';

export async function summarizeCloud(text) {
  // Implement your cloud AI call here
  // Return string result compatible with on-device format
}
```

Or use Gemini Developer API:

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('YOUR_API_KEY');

export async function summarizeCloud(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(`Summarize: ${text}`);
  return result.response.text();
}
```

## 🎯 Use Cases

- **Students** - Summarize long articles, simplify complex concepts
- **Language Learners** - Translate study materials, proofread writing
- **Researchers** - Extract key points from papers
- **Educators** - Prepare simplified notes for diverse learners

## 🛠️ Development

### Project Structure

See [Architecture](#architecture) section above.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit with clear messages
5. Push and create a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Chrome Built-in AI (Gemini Nano)
- Uses Chrome Extension Manifest V3
- Inspired by privacy-first educational tools

## 📞 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check the [TODO.md](TODO.md) for planned features
- Review the demo script in `DEMO.md` (if available)

---

**Made with ❤️ for students and educators**

