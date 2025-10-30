# QuietClass Notes (MVP)

Privacy-first classroom companion for the web. Summarize, simplify, translate, and proofread **on-device** using Chrome's Built‑in AI (Gemini Nano). Optional hybrid fallback when on-device is unavailable.

## Features (MVP)

- Key-points **Summarizer** for selected text
- **Simplify/Rewriter** for level & tone
- **Translator** (with language detect)
- **Proofreader** (inline explanations)
- Side Panel UI + floating action chips

## Install (Developer Mode)

1. Clone/download this repo
2. **Replace placeholder icons**: The `public/icons/` folder contains empty placeholder files. Replace `icon16.png`, `icon48.png`, and `icon128.png` with actual PNG images (you can use any image editor or online tool).
3. Open Chrome → `chrome://extensions`
4. Toggle **Developer mode** (top-right)
5. Click **Load unpacked** → select the repo folder
6. Pin the extension and open the side panel

## Usage

- Select text on any page → floating chips appear
- Choose **Summarize**, **Simplify**, **Translate**, or **Proofread**
- Results render in the side panel; copy or export as needed

## Notes

- The extension detects API availability and shows status badges
- For hybrid fallback (Firebase AI Logic / Gemini cloud), wire your config in `src/ai/hybrid.js` and switch the toggle in the side panel settings

## License

MIT

