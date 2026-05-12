# Zynapse Feature Backlog

Current status after the Electron/Ollama/language polish pass.

## Current Status

- **Web app:** Production smoke pass completed.
- **Theme:** Dark and light routes verified by Playwright screenshots.
- **Compiler:** Permanent executor chain in place with runtime diagnostics.
- **Ollama:** Local model manager now detects real system specs, checks Ollama, and can download recommended models from inside the app.
- **Electron:** Desktop shell and preview scripts are ready. Windows installer packaging is intentionally skipped for now.

## Completed Pending Features

- Cloud Sync
- Classroom Mode
- Share Center
- Plugin Marketplace
- QA Checks / screenshot smoke coverage
- Compiler hardening with local runtime availability diagnostics
- Electron shell scaffold without installer packaging
- Local Ollama setup workflow:
  - System specs endpoint: `/api/system/specs`
  - Ollama status endpoint: `/api/ollama/status`
  - Ollama model pull endpoint: `/api/ollama/pull`
  - PC-tier model recommendations
  - One-click recommended model download button in Local Model Manager
- Expanded output language list:
  - Major global languages, South Asian languages, European languages, Middle Eastern languages, African languages, East/Southeast Asian languages, indigenous/regional languages, and classical/constructed options.

## Verification Completed

- `npx tsc --noEmit` — passed.
- `npm run build` — passed.
- `SMOKE_BASE_URL=http://localhost:3005 npm run qa:smoke` — passed.
- Smoke artifacts: `test-results/smoke`.
- `/api/system/specs` tested and detected this machine as Linux x64, 8 CPU cores, ~31GB RAM.
- `/api/ollama/status` tested and correctly reports Ollama offline when it is not running.
- Compiler runtime diagnostics tested:
  - JavaScript local execution works.
  - Java reports missing `javac`/`java` with install hint.

## Remaining External Setup

- **Install JDK for Java compiler support on this machine:**
  - Ubuntu/Debian: `sudo apt install default-jdk`
  - Verify: `java -version && javac -version`

- **Install and run Ollama for local AI:**
  - Download: https://ollama.com
  - Start Ollama, then use Zynapse → Local AI Models → Download recommended model.

- **Install Electron dependency when npm registry is reachable:**
  - `npm install`
  - Run dev desktop app: `npm run electron:dev`
  - Run production-preview desktop app: `npm run electron:preview`

## Intentionally Skipped

- Windows `.exe` installer / NSIS build.
- Bundled Ollama auto-download during installer install.

Those are installer/distribution concerns and were skipped per request.

## Future Enhancements

- Native packaged backend for Electron production builds.
- Optional bundled Ollama installer flow for Windows.
- Docker/firejail executor isolation for untrusted code.
- Visual screenshot diff baselines in CI.
