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
   git clone https://github.com/prabhakaran-jm/QuietClassNotes.git
   cd QuietClassNotes
   ```

2. **Replace placeholder icons** (optional but recommended)
   - Replace `public/icons/icon16.png`, `icon48.png`, and `icon128.png` with your PNG images

3. **Load the extension**
   - Open Chrome → Navigate to `chrome://extensions`
   - Toggle **Developer mode** (top-right corner)
   - Click **Load unpacked**
   - Select the `QuietClassNotes` folder

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

## 🧪 Testing Instructions for Judges

### Prerequisites
- Chrome 130+ (or Chrome Canary for latest experimental features)
- Chrome Built-in AI enabled

### Setup Steps

1. **Enable Chrome Built-in AI:**
   - Open Chrome
   - Navigate to `chrome://flags`
   - Search for "Chrome Built-in AI" or "Built-in AI"
   - Enable the flag(s)
   - **Restart Chrome** (required)

2. **Load the Extension:**
   - Open `chrome://extensions`
   - Toggle **Developer mode** (top-right corner)
   - Click **Load unpacked**
   - Select the `QuietClassNotes` folder (this repository)

3. **Verify Installation:**
   - Extension icon should appear in Chrome toolbar
   - Pin it for easy access
   - Click icon or press `Ctrl+Shift+Y` to open side panel

4. **Test Features:**

   **Test Summarizer:**
   - Visit any webpage with text (e.g., Wikipedia article or news site)
   - Select a paragraph or multiple paragraphs
   - Click the ✳️ **Summarize** chip that appears
   - Verify summary appears in side panel (markdown format)

   **Test Simplifier:**
   - Select complex text on any webpage
   - Click ✏️ **Simplify** chip
   - Choose a mode (Beginner, Intermediate, Formal, or Casual)
   - Click **Run** button
   - Verify simplified/rewritten output appears

   **Test Translator:**
   - Select text in any language
   - Click 🌐 **Translate** chip
   - Choose target language from dropdown
   - Click **Run**
   - Verify translation appears with original text

   **Test Proofreader:**
   - Click extension icon to open side panel
   - Go to **Proofread** tab
   - Paste or type text with grammar errors
   - Click **Run** or press `Ctrl+Enter`
   - Verify corrections are shown with explanations

### Troubleshooting

**If APIs are not available:**
1. Ensure Chrome Built-in AI flag is enabled and Chrome restarted
2. Try Chrome Canary for latest experimental features
3. Check API availability:
   - Open DevTools (F12)
   - Go to Console tab
   - Run: `typeof Summarizer !== 'undefined'`
   - Should return `true` if Summarizer API is available
4. Note: Some APIs may require Chrome Canary or future releases
5. Extension includes hybrid fallback mode for testing when APIs unavailable

**If extension doesn't load:**
- Ensure all files are in correct folder structure
- Check for JavaScript errors in `chrome://extensions` → Extension details → Errors
- Verify manifest.json is valid

**If floating chips don't appear:**
- Ensure text is actually selected (highlighted)
- Check that content scripts are loaded (DevTools → Sources → Content scripts)
- Try refreshing the webpage

### Expected Behavior

- ✅ Floating chips appear automatically when text is selected
- ✅ Side panel opens automatically when chip is clicked
- ✅ AI processing completes within 2-5 seconds
- ✅ Results are displayed clearly in the side panel
- ✅ Export options (JSON/Markdown) work correctly
- ✅ Preferences (language, mode) are saved
- ✅ Keyboard shortcuts work (`Ctrl+Enter` to run)

### Additional Testing Resources

For more detailed testing information, see:
- [TEST_WITH_CANARY.md](TEST_WITH_CANARY.md) - Chrome Canary setup guide
- [API_AVAILABILITY.md](API_AVAILABILITY.md) - API availability information

## 📞 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Check the [TODO.md](TODO.md) for planned features
- Review the demo script in `DEMO.md` (if available)

---

**Made with ❤️ for students and educators**

