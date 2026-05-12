# Zynapse

AI-powered engineering academy for learning, practice, code execution, interviews, analytics, and local AI workflows.

Zynapse is built as a full-stack learning workspace: a large engineering curriculum, AI mentor explanations, visual roadmaps, compiler execution, quiz and interview practice, flashcards, analytics, project generation, theme customization, provider health checks, and an Electron-ready desktop shell.

![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-Ready-47848f?style=for-the-badge)

## What It Does

Zynapse turns a browser or desktop app into a complete AI engineering academy.

- Learn topics through senior-mentor AI explanations.
- Switch explanation language across a large global language list.
- Run code through cloud, local, and fallback compiler paths.
- Practice with quizzes, interviews, mock interviews, challenges, and flashcards.
- Track progress through XP, streaks, achievements, analytics, notes, and bookmarks.
- Generate projects, portfolios, recommendations, study plans, and guided tutor sessions.
- Use local Ollama models when available, or connect to hosted AI providers.
- Verify routes with automated light/dark screenshot smoke tests.

## Developed By

**Rahool Gir**  
Senior Software Engineer focused on AI-powered learning products, Java microservices, full-stack engineering, fintech systems, and polished product experiences.

| Link | URL |
| --- | --- |
| Email | `rahool.goswami16@gmail.com` |
| GitHub | `https://github.com/rahul-alpha1` |
| Portfolio | `https://rahul-alpha1.github.io/RahoolPortfolio.com/` |
| LinkedIn | `https://www.linkedin.com/in/rahool-goswami-4b055a126` |

## Feature Map

| Area | Features |
| --- | --- |
| AI Learning | Senior mentor prompt engine, detailed topic explanations, difficulty modes, language output selector, local content cache |
| Curriculum | Multi-track software engineering curriculum, module/section/topic hierarchy, progress tracking |
| Roadmap | React Flow learning roadmap, stack-based diagram view, curriculum navigation |
| Practice | Quiz Hub, Interview Hub, Mock Interview, Daily Challenge, Challenge Arena |
| Memory | Flashcards with spaced repetition, bookmarks, per-topic notes |
| Coding | Compiler, AI Code Review, local runtime diagnostics, Piston/JDoodle/local execution chain |
| Analytics | Completion ring, module progress charts, activity heatmap, XP and streak stats |
| Planning | Study Planner, Smart Recommendations, Guided Tutor |
| Projects | Project Ideas Generator, Portfolio Builder |
| System | Provider Health, Data Manager, Cloud Sync, Classroom Mode, Share Center, Plugin Marketplace, QA Checks |
| Theming | Dark mode, light mode, Theme Studio, CSS variable design system |
| Desktop | Electron shell, preload bridge, development and production preview scripts |
| Local AI | Ollama status check, system specs endpoint, recommended model download flow |

## Route Ledger

These are the main app routes and the component that powers each one.

| Route ID | Screen | Component |
| --- | --- | --- |
| `HOME` | Welcome / empty state | `ContentArea.tsx` |
| `ROADMAP` | Learning roadmap | `LearningPathFlow.tsx` |
| `COMPILER` | Code compiler | `CodeCompiler.tsx` |
| `INTERVIEW_HUB` | Interview questions | `InterviewHub.tsx` |
| `QUIZ_HUB` | Quiz practice | `QuizHub.tsx` |
| `MOCK_INTERVIEW` | AI mock interview | `MockInterview.tsx` |
| `FLASHCARDS` | Spaced repetition cards | `Flashcards.tsx` |
| `CODE_REVIEW` | AI code review | `CodeReview.tsx` |
| `ANALYTICS` | Learning analytics | `AnalyticsDashboard.tsx` |
| `PROJECT_IDEAS` | Project generator | `ProjectIdeas.tsx` |
| `STUDY_PLANNER` | Study planning | `StudyPlanner.tsx` |
| `GUIDED_TUTOR` | Guided tutor session | `GuidedTutor.tsx` |
| `CHALLENGE_ARENA` | Coding challenges | `CodeChallengeArena.tsx` |
| `PORTFOLIO_BUILDER` | Portfolio builder | `PortfolioBuilder.tsx` |
| `RECOMMENDATIONS` | Smart recommendations | `SmartRecommendations.tsx` |
| `DATA_MANAGER` | Data import/export | `DataManager.tsx` |
| `CLOUD_SYNC` | Sync interface | `CloudSync.tsx` |
| `CLASSROOM_MODE` | Classroom workflow | `ClassroomMode.tsx` |
| `SHARE_CENTER` | Sharing hub | `ShareCenter.tsx` |
| `PLUGIN_MARKETPLACE` | Plugin catalog | `PluginMarketplace.tsx` |
| `QA_CHECKS` | QA smoke checks | `QAChecks.tsx` |
| `PROVIDER_HEALTH` | Provider diagnostics | `ProviderHealth.tsx` |
| `THEME_STUDIO` | Theme customization | `ThemeStudio.tsx` |
| `CONTACT` | Developer contact links | `ContactPage.tsx` |
| `DAILY_CHALLENGE` | Daily AI challenge | `DailyChallenge.tsx` |

## Architecture

```text
Browser / Electron Shell
        |
        v
React 19 + TypeScript + Vite
        |
        +-- UI Components
        |   +-- Learning, practice, compiler, analytics, system tools
        |
        +-- Hooks
        |   +-- progress, streak, achievements, bookmarks, notes, flashcards
        |
        +-- AI Service Layer
        |   +-- Gemini, Groq, Claude, OpenAI, Mistral, Together, DeepSeek, NVIDIA, Ollama
        |
        +-- Express Backend
            +-- compiler endpoints
            +-- local runtime diagnostics
            +-- Ollama/system endpoints
            +-- static production serving
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4, CSS variables, custom dark/light theme system |
| Animation | Motion |
| Diagrams | React Flow |
| Charts | Recharts |
| Markdown | React Markdown, Remark GFM |
| Compiler UI | Monaco Editor |
| Backend | Express, TSX |
| Desktop | Electron |
| QA | TypeScript, Vite build, Playwright smoke routes |

## AI Providers

Zynapse supports multiple AI providers through `src/services/geminiService.ts`.

| Provider | Env Variable |
| --- | --- |
| Gemini | `GEMINI_API_KEY` |
| Groq | `GROQ_API_KEY` |
| Claude | `CLAUDE_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Mistral | `MISTRAL_API_KEY` |
| Together | `TOGETHER_API_KEY` |
| DeepSeek | `DEEPSEEK_API_KEY` |
| NVIDIA | `NVIDIA_API_KEY` |
| Ollama | `OLLAMA_URL`, `OLLAMA_MODEL` |

The app includes a Provider Health screen so keys and providers can be checked from the UI.

## Compiler Execution Chain

The compiler is designed with fallbacks instead of one fragile path.

1. Piston-compatible API through `/api/code/execute`.
2. Local runtime execution through `/api/code/local`.
3. JDoodle fallback through `/api/code/jdoodle`.
4. Runtime diagnostics through `/api/code/sandbox/status`.

For Java local execution, install a JDK:

```bash
sudo apt install default-jdk
java -version
javac -version
```

If `javac` is missing, the app reports a clear runtime diagnostic instead of silently failing.

## Local AI With Ollama

Zynapse can work with local models when Ollama is installed.

Backend endpoints:

| Endpoint | Purpose |
| --- | --- |
| `/api/system/specs` | Detect CPU, RAM, architecture, and OS |
| `/api/ollama/status` | Check if Ollama is running |
| `/api/ollama/pull` | Pull a recommended model |

Recommended workflow:

1. Install Ollama from `https://ollama.com`.
2. Start Ollama.
3. Open Zynapse.
4. Go to Local AI Models.
5. Download the recommended model for your machine.

## Environment Setup

Copy `.env.example` to `.env` and add keys as needed.

```bash
cp .env.example .env
```

Most features work with one AI key. Local compiler features need either cloud executor access, local runtimes, or fallback credentials.

## Install

```bash
npm install
```

## Run Web App

```bash
npm run dev
```

Default URL:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Electron

Development shell:

```bash
npm run electron:dev
```

Production preview shell:

```bash
npm run electron:preview
```

Windows installer packaging is intentionally not included yet. The app shell is ready, but distribution packaging should be added after final QA and signing decisions.

## QA

TypeScript:

```bash
npx tsc --noEmit
```

Production build:

```bash
npm run build
```

Route smoke screenshots:

```bash
npm run qa:smoke
```

Smoke outputs are written to:

```text
test-results/smoke
```

## Project Structure

```text
.
+-- electron/               Electron main and preload scripts
+-- public/                 PWA manifest, service worker, icons
+-- scripts/                smoke tests and Electron dev launcher
+-- src/
|   +-- components/         route screens and UI modules
|   +-- data/               curriculum, languages, interview plan
|   +-- hooks/              progress, streak, notes, flashcards, achievements
|   +-- lib/                small utilities
|   +-- services/           AI provider and streaming service layer
|   +-- App.tsx             main routing and layout
|   +-- index.css           theme system and global UI polish
|   +-- main.tsx            React entry
+-- server.ts               Express backend and compiler/Ollama endpoints
+-- vite.config.ts          Vite build and chunk strategy
```

## Data Storage

Zynapse stores user learning data locally in browser storage unless a sync feature is explicitly configured.

Common local keys:

| Key | Purpose |
| --- | --- |
| `AURA_COMPLETED_TOPICS` | completed topics |
| `AURA_GAMIFICATION` | XP, level, streak |
| `AURA_BOOKMARKS` | bookmarked topics |
| `AURA_ACHIEVEMENTS` | unlocked achievements |
| `ZYNAPSE_FLASHCARDS` | spaced repetition cards |
| `ZYNAPSE_THEME` | theme preference |
| `ZYNAPSE_XP_HISTORY` | analytics history |

Some older `AURA_*` storage keys remain for backward compatibility with existing users.

## Theme System

The UI is controlled by CSS variables in `src/index.css`.

Core tokens:

- `--bg-void`
- `--bg-surface`
- `--bg-card`
- `--border`
- `--text`
- `--text-muted`
- `--primary`
- `--accent`
- `--card-shadow`

Dark and light modes are both first-class. Theme Studio lets the user tune the experience from inside the app.

## Security Notes

- Never commit `.env`.
- API keys stay in local environment/browser settings.
- Local code execution should only be used on trusted machines.
- For public hosted deployments, prefer sandboxed cloud execution over unrestricted local execution.
- Electron production distribution should include signing, update strategy, and a packaged backend plan.

## GitHub Push

After creating a GitHub repository, connect it like this:

```bash
git remote add origin https://github.com/<your-username>/zynapse.git
git branch -M main
git push -u origin main
```

## License

MIT License. See `LICENSE`.
