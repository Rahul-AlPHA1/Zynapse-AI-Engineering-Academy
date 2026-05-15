import express from "express";
import path from "path";
import "dotenv/config";
import os from "os";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { spawn } from "child_process";

const LOCAL_OLLAMA_MODEL = "gemma2:2b";
const LOCAL_OLLAMA_MODEL_NAME = "Gemma 2 2B";
const LOCAL_OLLAMA_MODEL_REASON = "Single low-end default: small enough for CPU laptops, better quality than sub-1B models.";

function getFastOllamaRecommendation(totalRamGb: number, cpuCores: number) {
  return {
    id: LOCAL_OLLAMA_MODEL,
    name: LOCAL_OLLAMA_MODEL_NAME,
    reason: `${LOCAL_OLLAMA_MODEL_REASON} Detected ${totalRamGb} GB RAM and ${cpuCores} CPU cores.`,
  };
}

export async function startServer(port = Number(process.env.PORT || 3000)) {
  const app = express();
  const PORT = port;

  app.use(express.json({ limit: '1mb' }));

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
  const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 180_000);
  const HOSTED_AI_DEFAULT_MODELS: Record<'gemini' | 'groq', string> = {
    gemini: 'gemini-2.5-flash',
    groq: 'llama-3.1-8b-instant',
  };
  const HOSTED_AI_ENV_KEYS: Record<'gemini' | 'groq', string> = {
    gemini: 'GEMINI_API_KEY',
    groq: 'GROQ_API_KEY',
  };
  const HOSTED_AI_NAMES: Record<'gemini' | 'groq', string> = {
    gemini: 'Google Gemini',
    groq: 'Groq',
  };
  const GROQ_SAFE_MAX_COMPLETION_TOKENS = 2048;

  type HostedAIProvider = 'gemini' | 'groq';
  type HostedAIMessage = { role: 'system' | 'user' | 'assistant'; content: string };

  function isHostedAIProvider(provider: string): provider is HostedAIProvider {
    return provider === 'gemini' || provider === 'groq';
  }

  function hostedAIKey(provider: HostedAIProvider, suppliedKey?: unknown) {
    const userKey = typeof suppliedKey === 'string' ? suppliedKey.trim() : '';
    return {
      key: userKey || (process.env[HOSTED_AI_ENV_KEYS[provider]] || '').trim(),
      source: userKey ? 'user' : 'hosted',
    };
  }

  function hostedAIError(provider: HostedAIProvider, status: number, body: string) {
    const limited = status === 401 || status === 403 || status === 429 || status === 413;
    const hint = limited
      ? `${HOSTED_AI_NAMES[provider]} key is unavailable, quota-limited, or request-limited. Try ${HOSTED_AI_DEFAULT_MODELS[provider]} or add your own ${HOSTED_AI_ENV_KEYS[provider]}.`
      : `${HOSTED_AI_NAMES[provider]} request failed.`;
    return `${hint}${body ? ` Upstream: ${body.slice(0, 800)}` : ''}`;
  }

  function geminiRequestBody(messages: HostedAIMessage[], options: { jsonMode?: boolean; schema?: unknown } = {}) {
    const systemText = messages
      .filter(message => message.role === 'system')
      .map(message => message.content)
      .join('\n\n');
    const contents = messages
      .filter(message => message.role !== 'system')
      .map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      }));
    const generationConfig: Record<string, unknown> = {
      temperature: 0.25,
      maxOutputTokens: 4096,
    };
    if (options.jsonMode) {
      generationConfig.responseMimeType = 'application/json';
      if (options.schema) generationConfig.responseSchema = options.schema;
    }
    const body: Record<string, unknown> = { contents, generationConfig };
    if (systemText) body.systemInstruction = { parts: [{ text: systemText }] };
    return body;
  }

  function geminiText(data: any) {
    return (data?.candidates?.[0]?.content?.parts || [])
      .map((part: { text?: string }) => part.text || '')
      .join('');
  }

  async function callHostedGemini(params: {
    key: string;
    model: string;
    messages: HostedAIMessage[];
    jsonMode?: boolean;
    schema?: unknown;
  }) {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(params.model)}:generateContent?key=${params.key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequestBody(params.messages, { jsonMode: params.jsonMode, schema: params.schema })),
      },
    );
    const text = await resp.text();
    if (!resp.ok) throw new Error(hostedAIError('gemini', resp.status, text));
    return geminiText(text ? JSON.parse(text) : {});
  }

  async function callHostedGroq(params: {
    key: string;
    model: string;
    messages: HostedAIMessage[];
    jsonMode?: boolean;
  }) {
    const body: Record<string, unknown> = {
      model: params.model,
      messages: params.messages,
      temperature: 0.25,
      top_p: 0.9,
      max_completion_tokens: GROQ_SAFE_MAX_COMPLETION_TOKENS,
    };
    if (params.jsonMode) body.response_format = { type: 'json_object' };
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${params.key}` },
      body: JSON.stringify(body),
    });
    const text = await resp.text();
    if (!resp.ok) throw new Error(hostedAIError('groq', resp.status, text));
    const data = text ? JSON.parse(text) : {};
    return data.choices?.[0]?.message?.content || '';
  }

  function logHostedAI(event: string, details: Record<string, unknown>) {
    const safeDetails = { ...details };
    delete safeDetails.key;
    console.log(`[AI proxy] ${event}`, safeDetails);
  }

  async function fetchOllama(pathname: string, init?: RequestInit) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);
    try {
      return await fetch(`${OLLAMA_URL}${pathname}`, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function streamHostedGemini(params: {
    key: string;
    model: string;
    messages: HostedAIMessage[];
    keySource: string;
    res: express.Response;
  }) {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(params.model)}:streamGenerateContent?alt=sse&key=${params.key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequestBody(params.messages)),
      },
    );
    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => upstream.statusText);
      throw new Error(hostedAIError('gemini', upstream.status, text));
    }

    params.res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Zynapse-Provider': 'gemini',
      'X-Zynapse-Key-Source': params.keySource,
      'X-Accel-Buffering': 'no',
    });

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        try {
          const json = JSON.parse(trimmed.slice(5).trim());
          const parts = json?.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.text) params.res.write(part.text);
          }
        } catch {
          // Skip keep-alive or partial SSE fragments.
        }
      }
    }
  }

  async function streamHostedGroq(params: {
    key: string;
    model: string;
    messages: HostedAIMessage[];
    keySource: string;
    res: express.Response;
  }) {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${params.key}` },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: 0.25,
        top_p: 0.9,
        max_completion_tokens: GROQ_SAFE_MAX_COMPLETION_TOKENS,
        stream: true,
      }),
    });
    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => upstream.statusText);
      throw new Error(hostedAIError('groq', upstream.status, text));
    }

    params.res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Zynapse-Provider': 'groq',
      'X-Zynapse-Key-Source': params.keySource,
      'X-Accel-Buffering': 'no',
    });

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.replace(/^data:\s*/, '').trim();
        if (!trimmed || trimmed === '[DONE]') continue;
        try {
          const json = JSON.parse(trimmed);
          const chunk = json.choices?.[0]?.delta?.content;
          if (chunk) params.res.write(chunk);
        } catch {
          // Skip keep-alive or partial SSE fragments.
        }
      }
    }
  }

  app.get('/api/ai/status', (_req, res) => {
    res.json({
      ok: true,
      runtime: 'express',
      providers: {
        gemini: Boolean((process.env.GEMINI_API_KEY || '').trim()),
        groq: Boolean((process.env.GROQ_API_KEY || '').trim()),
      },
    });
  });

  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { provider, messages, model, key } = req.body || {};
      if (!isHostedAIProvider(provider)) return res.status(400).json({ ok: false, error: 'Only Gemini and Groq are supported.' });
      if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ ok: false, error: 'messages are required' });

      const resolved = hostedAIKey(provider, key);
      if (!resolved.key) throw new Error(`${HOSTED_AI_ENV_KEYS[provider]} is not configured. Add it to .env/Vercel or AI Provider Settings.`);
      const selectedModel = typeof model === 'string' && model.trim() ? model.trim() : HOSTED_AI_DEFAULT_MODELS[provider];
      logHostedAI('chat:start', { provider, model: selectedModel, keySource: resolved.source, messages: messages.length });

      const text = provider === 'gemini'
        ? await callHostedGemini({ key: resolved.key, model: selectedModel, messages })
        : await callHostedGroq({ key: resolved.key, model: selectedModel, messages });

      logHostedAI('chat:ok', { provider, model: selectedModel, chars: text.length });
      res.json({ ok: true, text, provider, model: selectedModel, keySource: resolved.source });
    } catch (err: any) {
      logHostedAI('chat:error', { error: err.message || String(err) });
      res.status(502).json({ ok: false, error: err.message || 'AI request failed' });
    }
  });

  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { provider, prompt, schema, type, model, key } = req.body || {};
      if (!isHostedAIProvider(provider)) return res.status(400).json({ ok: false, error: 'Only Gemini and Groq are supported.' });
      if (!prompt || typeof prompt !== 'string') return res.status(400).json({ ok: false, error: 'prompt is required' });

      const resolved = hostedAIKey(provider, key);
      if (!resolved.key) throw new Error(`${HOSTED_AI_ENV_KEYS[provider]} is not configured. Add it to .env/Vercel or AI Provider Settings.`);
      const selectedModel = typeof model === 'string' && model.trim() ? model.trim() : HOSTED_AI_DEFAULT_MODELS[provider];
      const jsonInstruction = `\n\nReturn ONLY raw JSON (${type === 'array' ? 'array' : 'object'}). No markdown fences, no explanation.`;
      const messages: HostedAIMessage[] = [{ role: 'user', content: prompt + jsonInstruction }];
      logHostedAI('generate:start', { provider, model: selectedModel, keySource: resolved.source, promptChars: prompt.length });

      const text = provider === 'gemini'
        ? await callHostedGemini({ key: resolved.key, model: selectedModel, messages, jsonMode: true, schema })
        : await callHostedGroq({ key: resolved.key, model: selectedModel, messages, jsonMode: true });

      logHostedAI('generate:ok', { provider, model: selectedModel, chars: text.length });
      res.json({ ok: true, text, provider, model: selectedModel, keySource: resolved.source });
    } catch (err: any) {
      logHostedAI('generate:error', { error: err.message || String(err) });
      res.status(502).json({ ok: false, error: err.message || 'AI request failed' });
    }
  });

  app.post('/api/ai/stream', async (req, res) => {
    try {
      const { provider, messages, model, key } = req.body || {};
      if (!isHostedAIProvider(provider)) return res.status(400).json({ ok: false, error: 'Only Gemini and Groq are supported.' });
      if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ ok: false, error: 'messages are required' });

      const resolved = hostedAIKey(provider, key);
      if (!resolved.key) throw new Error(`${HOSTED_AI_ENV_KEYS[provider]} is not configured. Add it to .env/Vercel or AI Provider Settings.`);
      const selectedModel = typeof model === 'string' && model.trim() ? model.trim() : HOSTED_AI_DEFAULT_MODELS[provider];
      logHostedAI('stream:start', { provider, model: selectedModel, keySource: resolved.source, messages: messages.length });

      if (provider === 'gemini') await streamHostedGemini({ key: resolved.key, model: selectedModel, messages, keySource: resolved.source, res });
      else await streamHostedGroq({ key: resolved.key, model: selectedModel, messages, keySource: resolved.source, res });
      logHostedAI('stream:ok', { provider, model: selectedModel });
      res.end();
    } catch (err: any) {
      logHostedAI('stream:error', { error: err.message || String(err) });
      if (res.headersSent) {
        return res.end();
      }
      res.status(502).json({ ok: false, error: err.message || 'AI stream failed' });
    }
  });

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

  app.get('/api/ollama/recommend', (_req, res) => {
    const totalRamGb = Math.round((os.totalmem() / 1024 / 1024 / 1024) * 10) / 10;
    const cpuCores = os.cpus().length;
    const cpuModel = os.cpus()[0]?.model || 'Unknown CPU';
    const recommended = getFastOllamaRecommendation(totalRamGb, cpuCores);

    res.json({
      platform: os.platform(),
      arch: os.arch(),
      totalRamGb,
      cpuCores,
      cpuModel,
      recommended,
    });
  });

  app.get('/api/setup/install-choice', async (_req, res) => {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    const choicePath = path.join(appData, 'Zynapse', 'install-choice.json');

    try {
      const raw = await readFile(choicePath, 'utf8');
      const parsed = JSON.parse(raw.replace(/^\uFEFF/, '').trim());
      const mode = parsed.mode === 'local-ollama' ? 'local-ollama' : 'ai-providers';
      res.json({ ok: true, mode, path: choicePath });
    } catch {
      res.json({ ok: true, mode: null, path: choicePath });
    }
  });

  app.get('/api/ollama/status', async (_req, res) => {
    try {
      const r = await fetchOllama('/api/tags');
      if (!r.ok) return res.status(r.status).json({ ok: false, error: r.statusText });
      const data = await r.json() as any;
      res.json({ ok: true, url: OLLAMA_URL, models: data.models || [] });
    } catch (err: any) {
      res.status(503).json({ ok: false, url: OLLAMA_URL, error: err.message || 'Ollama is not reachable' });
    }
  });

  app.post('/api/ollama/chat', async (req, res) => {
    const { model, messages, stream = true, options } = req.body as {
      model?: string;
      messages?: { role: string; content: string }[];
      stream?: boolean;
      options?: Record<string, unknown>;
    };

    if (!model || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'model and messages are required' });
    }

    try {
      const upstream = await fetchOllama('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream, options }),
      });

      if (!upstream.ok || !upstream.body) {
        return res.status(upstream.status).send(await upstream.text() || upstream.statusText);
      }

      if (!stream) return res.json(await upstream.json());

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
      res.status(503).json({ error: err.message || 'Ollama chat failed. Is Ollama running?' });
    }
  });

  app.post('/api/ollama/generate', async (req, res) => {
    const { model, prompt, format, options } = req.body as {
      model?: string;
      prompt?: string;
      format?: string;
      options?: Record<string, unknown>;
    };
    if (!model || !prompt) return res.status(400).json({ error: 'model and prompt are required' });

    try {
      const upstream = await fetchOllama('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: false, format, options }),
      });

      if (!upstream.ok) return res.status(upstream.status).send(await upstream.text() || upstream.statusText);
      res.json(await upstream.json());
    } catch (err: any) {
      res.status(503).json({ error: err.message || 'Ollama generate failed. Is Ollama running?' });
    }
  });

  app.post('/api/ollama/pull', async (req, res) => {
    const { model } = req.body as { model?: string };
    if (!model || typeof model !== 'string') {
      return res.status(400).json({ error: 'model is required' });
    }

    try {
      const upstream = await fetchOllama('/api/pull', {
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

  app.post('/api/ollama/ensure-model', async (_req, res) => {
    try {
      const tags = await fetchOllama('/api/tags');
      if (!tags.ok) return res.status(tags.status).json({ ok: false, error: tags.statusText });

      const data = await tags.json() as any;
      const installed = (data.models || []).some((model: { name?: string; model?: string }) => {
        const name = model.name || model.model || '';
        return name === LOCAL_OLLAMA_MODEL || name.split(':')[0] === LOCAL_OLLAMA_MODEL.split(':')[0];
      });

      if (!installed) {
        const pull = await fetchOllama('/api/pull', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: LOCAL_OLLAMA_MODEL, stream: false }),
        });
        if (!pull.ok) return res.status(pull.status).json({ ok: false, error: await pull.text() || pull.statusText });
      }

      res.json({ ok: true, model: LOCAL_OLLAMA_MODEL });
    } catch (err: any) {
      const message = err?.name === 'AbortError'
        ? `Timed out while preparing ${LOCAL_OLLAMA_MODEL}. Open Ollama and run: ollama pull ${LOCAL_OLLAMA_MODEL}`
        : err.message || 'Could not prepare Ollama model.';
      res.status(503).json({ ok: false, model: LOCAL_OLLAMA_MODEL, error: message });
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
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = process.env.ZYNAPSE_DIST_DIR || path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.ZYNAPSE_AUTOSTART !== "false") {
  startServer();
}
