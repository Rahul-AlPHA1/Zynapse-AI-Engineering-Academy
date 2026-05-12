import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import "dotenv/config";
import os from "os";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { spawn } from "child_process";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  type LocalRunResult = {
    output: string;
    code: number;
    stderr?: string;
    provider: string;
  };

  const LOCAL_EXEC_ENABLED = process.env.ZYNAPSE_LOCAL_EXECUTOR !== "false";
  const LOCAL_EXEC_TIMEOUT_MS = Number(process.env.ZYNAPSE_LOCAL_EXEC_TIMEOUT_MS || 8000);
  const LOCAL_EXEC_MAX_BYTES = Number(process.env.ZYNAPSE_LOCAL_EXEC_MAX_BYTES || 120_000);
  const LOCAL_EXECUTION_COMMANDS: Record<string, string[]> = {
    javascript: ["node"],
    typescript: ["npx", "tsx"],
    python: ["python3", "python"],
    java: ["javac", "java"],
    c: ["gcc"],
    "c++": ["g++"],
    go: ["go"],
    rust: ["rustc"],
    bash: ["bash"],
    ruby: ["ruby"],
    php: ["php"],
    lua: ["lua"],
    perl: ["perl"],
    r: ["Rscript"],
  };

  const LOCAL_EXEC_INSTALL_HINTS: Record<string, string> = {
    javascript: "Install Node.js 20+ and verify with: node --version",
    typescript: "Install Node.js 20+, then run: npm install. Verify with: npx tsx --version",
    python: "Install Python and verify with: python3 --version",
    java: "Install a JDK and verify with: java -version && javac -version. Ubuntu: sudo apt install default-jdk",
    c: "Install GCC and verify with: gcc --version. Ubuntu: sudo apt install build-essential",
    "c++": "Install G++ and verify with: g++ --version. Ubuntu: sudo apt install build-essential",
    go: "Install Go and verify with: go version",
    rust: "Install Rust and verify with: rustc --version",
    bash: "Install Bash and verify with: bash --version",
    ruby: "Install Ruby and verify with: ruby --version",
    php: "Install PHP CLI and verify with: php --version",
    lua: "Install Lua and verify with: lua -v",
    perl: "Install Perl and verify with: perl -v",
    r: "Install R and verify with: Rscript --version",
  };

  const LOCAL_EXEC_REQUIREMENTS: Record<string, string[][]> = {
    javascript: [["node"]],
    typescript: [["npx"]],
    python: [["python3", "python"]],
    java: [["javac"], ["java"]],
    c: [["gcc"]],
    "c++": [["g++"]],
    go: [["go"]],
    rust: [["rustc"]],
    bash: [["bash"]],
    ruby: [["ruby"]],
    php: [["php"]],
    lua: [["lua"]],
    perl: [["perl"]],
    r: [["Rscript"]],
  };

  function commandExists(command: string): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn(command, ["--version"], { shell: false, env: { ...process.env, NO_COLOR: "1" } });
      child.on("error", () => resolve(false));
      child.on("close", () => resolve(true));
    });
  }

  async function languageAvailability(language: string) {
    const groups = LOCAL_EXEC_REQUIREMENTS[language] || [];
    const missingGroups: string[] = [];
    const resolvedCommands: string[] = [];

    for (const alternatives of groups) {
      let found = "";
      for (const command of alternatives) {
        if (await commandExists(command)) {
          found = command;
          break;
        }
      }
      if (found) resolvedCommands.push(found);
      else missingGroups.push(alternatives.join(" or "));
    }

    return {
      language,
      available: LOCAL_EXEC_ENABLED && missingGroups.length === 0,
      commands: resolvedCommands,
      missingCommands: missingGroups,
      installHint: LOCAL_EXEC_INSTALL_HINTS[language] || "",
    };
  }

  function missingRuntime(language: string, command: string, output: string) {
    const lower = output.toLowerCase();
    return {
      error: `Local ${language} runtime is missing: "${command}" was not found in PATH.`,
      command,
      hint: LOCAL_EXEC_INSTALL_HINTS[language] || `Install ${command} and try again.`,
      raw: output,
    };
  }

  function runCommand(
    cmd: string,
    args: string[],
    cwd: string,
    stdin = "",
    timeoutMs = LOCAL_EXEC_TIMEOUT_MS,
  ): Promise<LocalRunResult> {
    return new Promise((resolve) => {
      const child = spawn(cmd, args, {
        cwd,
        shell: false,
        env: { ...process.env, NO_COLOR: "1" },
      });
      let stdout = "";
      let stderr = "";
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        child.kill("SIGKILL");
        resolve({
          output: `${stdout}${stderr ? `\n${stderr}` : ""}\nExecution timed out after ${timeoutMs / 1000}s.`,
          stderr,
          code: 124,
          provider: "local",
        });
      }, timeoutMs);

      child.stdout.on("data", chunk => { stdout += chunk.toString(); });
      child.stderr.on("data", chunk => { stderr += chunk.toString(); });
      child.on("error", err => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ output: err.message, stderr: err.message, code: 127, provider: "local" });
      });
      child.on("close", code => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({
          output: stdout || stderr || "",
          stderr,
          code: code ?? 1,
          provider: "local",
        });
      });
      if (stdin) child.stdin.write(stdin);
      child.stdin.end();
    });
  }

  // ── Code Execution Proxy (Piston API) ─────────────────────────────────────
  // Runs server-side to avoid CORS + browser rate-limiting on emkc.org
  const PISTON_BASE = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston';
  const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

  app.get('/api/system/specs', (_req, res) => {
    res.json({
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || 'Unknown CPU',
      totalRamGb: Math.round((os.totalmem() / 1024 / 1024 / 1024) * 10) / 10,
      freeRamGb: Math.round((os.freemem() / 1024 / 1024 / 1024) * 10) / 10,
    });
  });

  app.get('/api/ollama/status', async (_req, res) => {
    try {
      const r = await fetch(`${OLLAMA_URL}/api/tags`);
      if (!r.ok) return res.status(r.status).json({ ok: false, error: r.statusText });
      const data = await r.json() as any;
      res.json({ ok: true, url: OLLAMA_URL, models: data.models || [] });
    } catch (err: any) {
      res.status(503).json({ ok: false, url: OLLAMA_URL, error: err.message || 'Ollama is not reachable' });
    }
  });

  app.post('/api/ollama/pull', async (req, res) => {
    const { model } = req.body as { model?: string };
    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'model is required' });
    }

    try {
      const upstream = await fetch(`${OLLAMA_URL}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: model, stream: true }),
      });

      if (!upstream.ok || !upstream.body) {
        return res.status(upstream.status).json({ error: await upstream.text() || upstream.statusText });
      }

      res.writeHead(200, {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
      res.end();
    } catch (err: any) {
      res.status(503).json({ error: err.message || 'Ollama pull failed. Is Ollama running?' });
    }
  });

  app.get('/api/code/runtimes', async (_req, res) => {
    try {
      const r = await fetch(`${PISTON_BASE}/runtimes`);
      if (!r.ok) return res.status(r.status).json({ error: r.statusText });
      res.json(await r.json());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/code/sandbox/status', async (_req, res) => {
    const languages = await Promise.all(Object.keys(LOCAL_EXECUTION_COMMANDS).map(languageAvailability));
    res.json({
      enabled: LOCAL_EXEC_ENABLED,
      timeoutMs: LOCAL_EXEC_TIMEOUT_MS,
      maxCodeBytes: LOCAL_EXEC_MAX_BYTES,
      supportedLanguages: Object.keys(LOCAL_EXECUTION_COMMANDS),
      languages,
      isolation: 'temp-directory + timeout + command whitelist',
      note: 'Local execution runs on this machine. Use only for trusted local development unless wrapped in Docker/firejail.',
    });
  });

  app.post('/api/code/execute', async (req, res) => {
    try {
      // Allow per-request custom Piston URL (from user settings)
      const base = req.body._pistonUrl || PISTON_BASE;
      const body = { ...req.body };
      delete body._pistonUrl;

      const r = await fetch(`${base}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Local execution fallback ──────────────────────────────────────────────
  // Intended for local development / desktop use. Runs only on the user's machine.
  app.post('/api/code/local', async (req, res) => {
    const { language, code, stdin } = req.body as { language: string; code: string; stdin?: string };
    if (!LOCAL_EXEC_ENABLED) {
      return res.status(403).json({ error: "Local executor disabled. Set ZYNAPSE_LOCAL_EXECUTOR=true to enable." });
    }
    if (!language || typeof code !== "string") {
      return res.status(400).json({ error: "language and code are required" });
    }
    if (!LOCAL_EXECUTION_COMMANDS[language]) {
      return res.status(400).json({ error: `Local execution is not configured for ${language}` });
    }
    if (Buffer.byteLength(code, "utf8") > LOCAL_EXEC_MAX_BYTES) {
      return res.status(413).json({ error: `Code too large. Limit is ${LOCAL_EXEC_MAX_BYTES} bytes.` });
    }

    const dir = await mkdtemp(path.join(os.tmpdir(), "zynapse-run-"));
    try {
      let result: LocalRunResult;
      switch (language) {
        case "javascript":
          await writeFile(path.join(dir, "main.js"), code);
          result = await runCommand("node", ["main.js"], dir, stdin);
          break;
        case "typescript":
          await writeFile(path.join(dir, "main.ts"), code);
          result = await runCommand("npx", ["tsx", "main.ts"], dir, stdin, 10000);
          break;
        case "python":
          await writeFile(path.join(dir, "main.py"), code);
          result = await runCommand("python3", ["main.py"], dir, stdin);
          if (result.code === 127) result = await runCommand("python", ["main.py"], dir, stdin);
          break;
        case "java":
          await writeFile(path.join(dir, "Main.java"), code);
          result = await runCommand("javac", ["Main.java"], dir, "", 10000);
          if (result.code === 0) result = await runCommand("java", ["Main"], dir, stdin);
          break;
        case "c":
          await writeFile(path.join(dir, "main.c"), code);
          result = await runCommand("gcc", ["main.c", "-O2", "-o", "main"], dir, "", 10000);
          if (result.code === 0) result = await runCommand("./main", [], dir, stdin);
          break;
        case "c++":
          await writeFile(path.join(dir, "main.cpp"), code);
          result = await runCommand("g++", ["main.cpp", "-std=c++17", "-O2", "-o", "main"], dir, "", 12000);
          if (result.code === 0) result = await runCommand("./main", [], dir, stdin);
          break;
        case "go":
          await writeFile(path.join(dir, "main.go"), code);
          result = await runCommand("go", ["run", "main.go"], dir, stdin, 12000);
          break;
        case "rust":
          await writeFile(path.join(dir, "main.rs"), code);
          result = await runCommand("rustc", ["main.rs", "-o", "main"], dir, "", 12000);
          if (result.code === 0) result = await runCommand("./main", [], dir, stdin);
          break;
        case "bash":
          await writeFile(path.join(dir, "main.sh"), code);
          result = await runCommand("bash", ["main.sh"], dir, stdin);
          break;
        case "ruby":
          await writeFile(path.join(dir, "main.rb"), code);
          result = await runCommand("ruby", ["main.rb"], dir, stdin);
          break;
        case "php":
          await writeFile(path.join(dir, "main.php"), code);
          result = await runCommand("php", ["main.php"], dir, stdin);
          break;
        case "lua":
          await writeFile(path.join(dir, "main.lua"), code);
          result = await runCommand("lua", ["main.lua"], dir, stdin);
          break;
        case "perl":
          await writeFile(path.join(dir, "main.pl"), code);
          result = await runCommand("perl", ["main.pl"], dir, stdin);
          break;
        case "r":
          await writeFile(path.join(dir, "main.r"), code);
          result = await runCommand("Rscript", ["main.r"], dir, stdin);
          break;
        default:
          return res.status(400).json({ error: `Local execution is not configured for ${language}` });
      }

      const firstCommand = LOCAL_EXECUTION_COMMANDS[language]?.[0] || language;
      if (result.code === 127 || /enoent|not found|command not found/i.test(result.output)) {
        return res.status(424).json(missingRuntime(language, firstCommand, result.output));
      }

      res.json({
        run: {
          output: result.output || "(no output)",
          code: result.code,
          stderr: result.stderr || "",
        },
        _provider: "local",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    } finally {
      rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  });

  // ── JDoodle proxy (free alternative when emkc Piston is whitelist-only) ────
  // Credentials come from the client (stored in user's localStorage) — never stored server-side
  const JDOODLE_LANG: Record<string, { lang: string; versionIndex: string }> = {
    javascript: { lang: 'nodejs',        versionIndex: '4' },
    typescript: { lang: 'typescript-400',versionIndex: '0' },
    python:     { lang: 'python3',       versionIndex: '4' },
    java:       { lang: 'java',          versionIndex: '4' },
    'c++':      { lang: 'cpp17',         versionIndex: '1' },
    c:          { lang: 'c',             versionIndex: '5' },
    go:         { lang: 'go',            versionIndex: '4' },
    rust:       { lang: 'rust',          versionIndex: '4' },
    ruby:       { lang: 'ruby',          versionIndex: '4' },
    php:        { lang: 'php',           versionIndex: '4' },
    swift:      { lang: 'swift',         versionIndex: '4' },
    csharp:     { lang: 'csharp',        versionIndex: '4' },
    kotlin:     { lang: 'kotlin',        versionIndex: '3' },
    dart:       { lang: 'dart',          versionIndex: '4' },
    scala:      { lang: 'scala',         versionIndex: '4' },
    lua:        { lang: 'lua',           versionIndex: '2' },
    bash:       { lang: 'bash',          versionIndex: '5' },
    r:          { lang: 'r',             versionIndex: '4' },
    haskell:    { lang: 'haskell',       versionIndex: '4' },
    perl:       { lang: 'perl',          versionIndex: '4' },
    julia:      { lang: 'julia',         versionIndex: '2' },
    elixir:     { lang: 'elixir',        versionIndex: '4' },
    erlang:     { lang: 'erlang',        versionIndex: '4' },
    groovy:     { lang: 'groovy',        versionIndex: '3' },
    coffeescript:{ lang: 'coffeescript', versionIndex: '1' },
    fsharp:     { lang: 'fsharp',        versionIndex: '0' },
    crystal:    { lang: 'crystal',       versionIndex: '0' },
    nim:        { lang: 'nim',           versionIndex: '0' },
    fortran:    { lang: 'fortran',       versionIndex: '0' },
    prolog:     { lang: 'prolog',        versionIndex: '0' },
  };

  app.post('/api/code/jdoodle', async (req, res) => {
    try {
      const { clientId, clientSecret, language, code, stdin } = req.body;
      if (!clientId || !clientSecret) {
        return res.status(400).json({ error: 'JDoodle clientId and clientSecret required' });
      }
      const mapping = JDOODLE_LANG[language];
      if (!mapping) {
        return res.status(400).json({ error: `Language "${language}" not supported by JDoodle` });
      }
      const r = await fetch('https://api.jdoodle.com/v1/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientSecret,
          script: code,
          stdin: stdin || '',
          language: mapping.lang,
          versionIndex: mapping.versionIndex,
        }),
      });
      const data = await r.json() as any;
      // Normalise to our format: { run: { output, code } }
      if (!r.ok || data.error) {
        return res.status(r.ok ? 400 : r.status).json({ error: data.error || r.statusText });
      }
      res.json({
        run: {
          output: data.output ?? '',
          code: data.errorCode === 0 ? 0 : 1,
          stderr: '',
        },
        _provider: 'jdoodle',
        _cpuTime: data.cpuTime,
        _memory: data.memory,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/models/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      if (provider === "gemini") {
        let apiKey = req.query.key;
        if (!apiKey || apiKey === "undefined") apiKey = process.env.GEMINI_API_KEY;
        console.log("Using Gemini API Key of length", apiKey?.length);
        if (!apiKey || apiKey === "undefined") return res.status(400).json({ error: "Missing Gemini API Key" });
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!resp.ok) throw new Error(await resp.text());
        return res.json(await resp.json());
      } else if (provider === "groq") {
        let apiKey = req.query.key;
        if (!apiKey || apiKey === "undefined") apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === "undefined") return res.status(400).json({ error: "Missing Groq API Key" });
        const resp = await fetch(`https://api.groq.com/openai/v1/models`, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!resp.ok) throw new Error(await resp.text());
        return res.json(await resp.json());
      } else if (provider === "nvidia") {
        let apiKey = req.query.key;
        if (!apiKey || apiKey === "undefined") apiKey = process.env.NVIDIA_API_KEY;
        if (!apiKey || apiKey === "undefined") return res.status(400).json({ error: "Missing NVIDIA API Key" });
        const resp = await fetch(`https://integrate.api.nvidia.com/v1/models`, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!resp.ok) throw new Error(await resp.text());
        return res.json(await resp.json());
      }
      res.status(404).json({ error: "Unknown provider" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/test/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const { model, key } = req.body;
      if (provider === "gemini") {
        let apiKey = key;
        if (!apiKey || apiKey === "undefined") apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "undefined") return res.status(400).json({ error: "Missing Gemini API Key" });
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
        });
        if (!resp.ok) throw new Error(await resp.text());
        return res.json(await resp.json());
      } else if (provider === "groq") {
        let apiKey = key;
        if (!apiKey || apiKey === "undefined") apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === "undefined") return res.status(400).json({ error: "Missing Groq API Key" });
        const resp = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages: [{ role: "user", content: "Hi" }], max_tokens: 5 })
        });
        if (!resp.ok) throw new Error(await resp.text());
        return res.json(await resp.json());
      } else if (provider === "nvidia") {
        let apiKey = key;
        if (!apiKey || apiKey === "undefined") apiKey = process.env.NVIDIA_API_KEY;
        if (!apiKey || apiKey === "undefined") return res.status(400).json({ error: "Missing NVIDIA API Key" });
        const resp = await fetch(`https://integrate.api.nvidia.com/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages: [{ role: "user", content: "Hi" }], max_tokens: 5 })
        });
        if (!resp.ok) throw new Error(await resp.text());
        return res.json(await resp.json());
      }
      res.status(404).json({ error: "Unknown provider" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
