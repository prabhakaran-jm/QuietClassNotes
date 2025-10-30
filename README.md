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
2. Open Chrome → `chrome://extensions`
3. Toggle **Developer mode** (top-right)
4. Click **Load unpacked** → select the repo folder
5. Pin the extension and open the side panel

## Usage

- Select text on any page → floating chips appear
- Choose **Summarize**, **Simplify**, **Translate**, or **Proofread**
- Results render in the side panel; copy or export as needed

## Notes

- The extension detects API availability and shows status badges
- For hybrid fallback (Firebase AI Logic / Gemini cloud), wire your config in `src/ai/hybrid.js` and switch the toggle in the side panel settings

## License

MIT

