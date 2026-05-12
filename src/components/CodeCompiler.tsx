import { useState, useEffect, useRef } from 'react';
import MonacoEditor, { Monaco } from '@monaco-editor/react';
import { Play, Loader2, Code2, Terminal as TerminalIcon, Copy, RotateCcw, Sparkles, CheckCheck, Download, Server } from 'lucide-react';
import { streamContent, getAIConfig } from '../services/geminiService';

interface Runtime { language: string; version: string; aliases: string[] }
interface SandboxStatus {
  enabled: boolean;
  timeoutMs: number;
  maxCodeBytes: number;
  supportedLanguages: string[];
  languages?: {
    language: string;
    available: boolean;
    commands: string[];
    missingCommands: string[];
    installHint: string;
  }[];
  isolation: string;
}

// ── Language registry ──────────────────────────────────────────────────────────
const LANG_DISPLAY: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', python:      'Python',
  java:       'Java',       'c++':      'C++',         c:           'C',
  go:         'Go',         rust:       'Rust',         ruby:        'Ruby',
  php:        'PHP',        swift:      'Swift',        csharp:      'C#',
  kotlin:     'Kotlin',     dart:       'Dart',         scala:       'Scala',
  lua:        'Lua',        bash:       'Bash',         r:           'R',
  haskell:    'Haskell',    perl:       'Perl',         julia:       'Julia',
  elixir:     'Elixir',     erlang:     'Erlang',       crystal:     'Crystal',
  nim:        'Nim',        zig:        'Zig',           fsharp:      'F#',
  groovy:     'Groovy',     powershell: 'PowerShell',   coffeescript:'CoffeeScript',
  ocaml:      'OCaml',      fortran:    'Fortran',       prolog:      'Prolog',
};

const MONACO_LANG: Record<string, string> = {
  javascript: 'javascript', typescript: 'typescript', python:      'python',
  java:       'java',       'c++':      'cpp',         c:           'c',
  go:         'go',         rust:       'rust',         ruby:        'ruby',
  php:        'php',        swift:      'swift',        csharp:      'csharp',
  kotlin:     'kotlin',     dart:       'dart',         scala:       'scala',
  lua:        'lua',        bash:       'shell',        r:           'r',
  haskell:    'haskell',    perl:       'perl',         julia:       'julia',
  elixir:     'elixir',     erlang:     'erlang',       crystal:     'crystal',
  nim:        'nim',        zig:        'zig',           fsharp:      'fsharp',
  groovy:     'groovy',     powershell: 'powershell',   coffeescript:'coffeescript',
  ocaml:      'ocaml',      fortran:    'fortran',       prolog:      'prolog',
};

const FILE_EXT: Record<string, string> = {
  javascript: 'js', typescript: 'ts', python: 'py', java: 'java', 'c++': 'cpp',
  c: 'c', go: 'go', rust: 'rs', ruby: 'rb', php: 'php', swift: 'swift',
  csharp: 'cs', kotlin: 'kt', dart: 'dart', scala: 'scala', lua: 'lua',
  bash: 'sh', r: 'r', haskell: 'hs', perl: 'pl', julia: 'jl', elixir: 'ex',
  erlang: 'erl', crystal: 'cr', nim: 'nim', zig: 'zig', fsharp: 'fs',
  groovy: 'groovy', powershell: 'ps1', coffeescript: 'coffee', ocaml: 'ml',
  fortran: 'f90', prolog: 'pl',
};

const DEFAULT_CODE: Record<string, string> = {
  javascript:   'console.log("Hello, World!");',
  typescript:   'const greet = (name: string): string => `Hello, ${name}!`;\nconsole.log(greet("World"));',
  python:       'print("Hello, World!")',
  java:         'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}',
  'c++':        '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}',
  c:            '#include <stdio.h>\n\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}',
  go:           'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello, World!")\n}',
  rust:         'fn main() {\n  println!("Hello, World!");\n}',
  ruby:         'puts "Hello, World!"',
  php:          '<?php\necho "Hello, World!\\n";',
  swift:        'print("Hello, World!")',
  csharp:       'using System;\n\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello, World!");\n  }\n}',
  kotlin:       'fun main() {\n  println("Hello, World!")\n}',
  dart:         'void main() {\n  print("Hello, World!");\n}',
  scala:        'object Main extends App {\n  println("Hello, World!")\n}',
  lua:          'print("Hello, World!")',
  bash:         '#!/bin/bash\necho "Hello, World!"',
  r:            'cat("Hello, World!\\n")',
  haskell:      'main :: IO ()\nmain = putStrLn "Hello, World!"',
  perl:         'print "Hello, World!\\n";',
  julia:        'println("Hello, World!")',
  elixir:       'IO.puts "Hello, World!"',
  erlang:       '-module(main).\n-export([start/0]).\nstart() -> io:fwrite("Hello, World!~n").',
  crystal:      'puts "Hello, World!"',
  nim:          'echo "Hello, World!"',
  zig:          'const std = @import("std");\n\npub fn main() !void {\n  const stdout = std.io.getStdOut().writer();\n  try stdout.print("Hello, World!\\n", .{});\n}',
  fsharp:       'printfn "Hello, World!"',
  groovy:       'println "Hello, World!"',
  powershell:   'Write-Host "Hello, World!"',
  coffeescript: 'console.log "Hello, World!"',
  ocaml:        'let () = print_endline "Hello, World!"',
  fortran:      'program hello\n  print *, "Hello, World!"\nend program hello',
  prolog:       ':- initialization(main).\nmain :- write("Hello, World!"), nl.',
};

// ── Monaco custom theme ────────────────────────────────────────────────────────
function defineAuraTheme(monaco: Monaco) {
  monaco.editor.defineTheme('aura-dark', {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'keyword',   foreground: '818cf8' },
      { token: 'string',    foreground: '34d399' },
      { token: 'comment',   foreground: '374151', fontStyle: 'italic' },
      { token: 'number',    foreground: 'f59e0b' },
      { token: 'type',      foreground: '22d3ee' },
      { token: 'class',     foreground: 'e879f9' },
      { token: 'function',  foreground: '60a5fa' },
      { token: 'variable',  foreground: 'e2e8f0' },
      { token: 'operator',  foreground: '94a3b8' },
      { token: 'delimiter', foreground: '6b7280' },
    ],
    colors: {
      'editor.background':                  '#060610',
      'editor.foreground':                  '#e2e8f0',
      'editor.lineHighlightBackground':     '#0d0d20',
      'editor.selectionBackground':         '#6366f133',
      'editor.inactiveSelectionBackground': '#6366f122',
      'editorCursor.foreground':            '#22d3ee',
      'editorLineNumber.foreground':        '#374151',
      'editorLineNumber.activeForeground':  '#6366f1',
      'editorIndentGuide.background1':      '#1f2937',
      'editorIndentGuide.activeBackground1':'#374151',
      'editorWidget.background':            '#0a0a14',
      'editorSuggestWidget.background':     '#0a0a14',
      'editorSuggestWidget.border':         '#6366f133',
      'editorSuggestWidget.selectedBackground': '#6366f122',
      'scrollbarSlider.background':         '#6366f133',
      'scrollbarSlider.hoverBackground':    '#6366f155',
      'editorGutter.background':            '#060610',
    },
  });
}

export function CodeCompiler() {
  const [runtimes, setRuntimes]         = useState<Runtime[]>([]);
  const [runtimesLoaded, setRuntimesLoaded] = useState(false);
  const [language, setLanguage]         = useState('javascript');
  const [code, setCode]                 = useState(DEFAULT_CODE.javascript);
  const [output, setOutput]             = useState('');
  const [isRunning, setIsRunning]       = useState(false);
  const [copied, setCopied]             = useState(false);
  const [aiExplain, setAiExplain]       = useState('');
  const [isAILoading, setIsAILoading]   = useState(false);
  const [executorUsed, setExecutorUsed] = useState<'piston' | 'local' | 'jdoodle' | 'none'>('none');
  const [sandbox, setSandbox] = useState<SandboxStatus | null>(null);
  const editorRef = useRef<unknown>(null);

  // Fetch runtimes through server proxy (avoids CORS / rate-limit on browser)
  useEffect(() => {
    fetch('/api/code/sandbox/status')
      .then(r => r.json())
      .then(setSandbox)
      .catch(() => setSandbox(null));

    fetch('/api/code/runtimes')
      .then(r => r.json())
      .then((data: { language: string; version: string; aliases: string[] }[]) => {
        const wanted = new Set(Object.keys(LANG_DISPLAY));
        const map = new Map<string, Runtime>();
        for (const r of data) {
          if (wanted.has(r.language) && (!map.has(r.language) || r.version > map.get(r.language)!.version)) {
            map.set(r.language, { language: r.language, version: r.version, aliases: r.aliases || [] });
          }
        }
        setRuntimes([...map.values()].sort((a, b) => a.language.localeCompare(b.language)));
        setRuntimesLoaded(true);
      })
      .catch(() => setRuntimesLoaded(true)); // continue even if runtimes fail
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang] || '// Start coding...');
    setOutput('');
    setAiExplain('');
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setExecutorUsed('none');
    try {
      const rt = runtimes.find(r => r.language === language);

      // Read user-configured executor settings from localStorage
      const customPistonUrl   = localStorage.getItem('PISTON_CUSTOM_URL') || '';
      const jdoodleClientId   = localStorage.getItem('JDOODLE_CLIENT_ID') || '';
      const jdoodleClientSecret = localStorage.getItem('JDOODLE_CLIENT_SECRET') || '';

      // ── Strategy: try Piston → local machine → JDoodle ─────────────────────
      let pistonOk = false;
      let providerUsed: 'piston' | 'local' | 'jdoodle' | 'none' = 'none';
      let data: Record<string, unknown> = {};

      // 1. Try Piston (custom URL or emkc default)
      try {
        const body: Record<string, unknown> = {
          language,
          version: rt?.version ?? '*',
          files: [{ name: `main.${FILE_EXT[language] ?? 'txt'}`, content: code }],
        };
        if (customPistonUrl) body._pistonUrl = customPistonUrl;

        const res = await fetch('/api/code/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        data = await res.json() as Record<string, unknown>;

        // emkc went whitelist-only — if we get that message try JDoodle next
        const msg = (data.message as string) || '';
        if (msg.toLowerCase().includes('whitelist') || msg.toLowerCase().includes('whitelisted')) {
          pistonOk = false;
        } else if (!res.ok) {
          throw new Error(`Error ${res.status}: ${msg || (res.statusText)}`);
        } else {
          pistonOk = true;
          providerUsed = 'piston';
          setExecutorUsed('piston');
        }
      } catch (e) {
        pistonOk = false;
      }

      // 2. Permanent local fallback: runs on this machine via server proxy
      if (!pistonOk) {
        try {
          const localRes = await fetch('/api/code/local', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language, code }),
          });
          const localData = await localRes.json() as Record<string, unknown>;
          if (localRes.ok) {
            data = localData;
            providerUsed = 'local';
            setExecutorUsed('local');
          } else if (!jdoodleClientId || !jdoodleClientSecret) {
            const hint = localData.hint ? `\n\nFix:\n${localData.hint}` : '';
            throw new Error(`${(localData.error as string) || 'Local execution unavailable'}${hint}`);
          }
        } catch (localErr) {
          if (!jdoodleClientId || !jdoodleClientSecret) {
            const reason = localErr instanceof Error ? localErr.message : String(localErr);
            setOutput(
`⚠️  Code execution needs one working executor.

Local executor tried first and failed:
${reason}

━━ Permanent Fix ━━━━━━━━━━━━━━━━━━━━━━━━━
Install the runtime for this language on your machine.
Examples:
  JavaScript/TypeScript: Node.js 20+
  Python: python3
  Java: JDK (java + javac)
  C/C++: gcc / g++
  Go: go
  Rust: rustc

After installing, click Run again. Zynapse will use the local executor automatically.

━━ Cloud Backup ━━━━━━━━━━━━━━━━━━━━━━━━━━
Add JDoodle credentials in Settings → Code Executor.
Piston custom URL is also supported for self-hosted execution.`
            );
            setExecutorUsed('none');
            return;
          }
        }
      }

      // 3. Fall back to JDoodle if both Piston and local unavailable
      if (!pistonOk && providerUsed !== 'local' && !('run' in data)) {
        if (!jdoodleClientId || !jdoodleClientSecret) {
          setOutput(
`⚠️  Code execution not configured.

The default Piston API (emkc.org) is now whitelist-only.

━━ Quick Fix (Free) ━━━━━━━━━━━━━━━━━━━━━━
1. Register free at https://www.jdoodle.com
2. Go to My Account → API credentials
3. Copy your Client ID & Client Secret
4. Open ⚙️ Settings → Code Executor (in sidebar)
5. Paste your credentials & Save

━━ Advanced (Unlimited) ━━━━━━━━━━━━━━━━━━
Self-host Piston with Docker:
  docker run -d --name piston --privileged \\
    -p 2000:2000 ghcr.io/engineer-man/piston
Then set Custom Piston URL: http://localhost:2000`
          );
          return;
        }

        // Call JDoodle through server proxy
        const jRes = await fetch('/api/code/jdoodle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: jdoodleClientId, clientSecret: jdoodleClientSecret, language, code }),
        });
        data = await jRes.json() as Record<string, unknown>;
        if (!jRes.ok) throw new Error((data.error as string) || 'JDoodle execution failed');
        providerUsed = 'jdoodle';
        setExecutorUsed('jdoodle');
      }

      // ── Parse output ──────────────────────────────────────────────────────────
      const run = data.run as Record<string, unknown> | undefined;
      const compile = data.compile as Record<string, unknown> | undefined;
      if (compile && compile.code !== 0 && compile.output) {
        setOutput(compile.output as string);
      } else {
        setOutput((run?.output as string) || (run?.code === 0 ? '(no output)' : 'Execution failed'));
      }
    } catch (e: unknown) {
      setOutput(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `main.${FILE_EXT[language] ?? 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAIExplain = async () => {
    setIsAILoading(true);
    setAiExplain('');
    const cfg = getAIConfig();
    const messages = [
      { role: 'system', content: 'You are Zynapse, a senior software engineer. Explain code clearly and concisely.' },
      { role: 'user',   content: `Explain this ${LANG_DISPLAY[language] || language} code step by step:\n\`\`\`${language}\n${code}\n\`\`\`` },
    ];
    try {
      for await (const chunk of streamContent(messages, cfg.primaryProvider)) {
        setAiExplain(prev => prev + chunk);
      }
    } catch {
      setAiExplain('Failed to get AI explanation. Check your API key in Settings.');
    } finally {
      setIsAILoading(false);
    }
  };

  const hasError = output.toLowerCase().startsWith('error') || output.toLowerCase().includes('exception') || output.toLowerCase().includes('traceback');

  // Sorted list for dropdown: runtimes first (with version), then static fallbacks
  const orderedLangs = Object.keys(LANG_DISPLAY).sort((a, b) => {
    const aHasRt = runtimes.some(r => r.language === a);
    const bHasRt = runtimes.some(r => r.language === b);
    if (aHasRt && !bHasRt) return -1;
    if (!aHasRt && bHasRt) return 1;
    return a.localeCompare(b);
  });
  const localLanguageStatus = sandbox?.languages?.find(item => item.language === language);
  const localRuntimeMissing = !!localLanguageStatus && !localLanguageStatus.available;

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-void)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <Code2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none" style={{ color: 'var(--text)' }}>Online Compiler</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Monaco Editor · {runtimesLoaded ? `${runtimes.length} runtimes loaded` : 'Loading runtimes...'} · 32 languages
              {sandbox ? ` · Local ${sandbox.enabled ? `${Math.round(sandbox.timeoutMs / 1000)}s sandbox` : 'disabled'}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language selector */}
          <select
            value={language}
            onChange={e => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-sm font-medium focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {orderedLangs.map(l => {
              const rt = runtimes.find(r => r.language === l);
              return (
                <option key={l} value={l}>
                  {LANG_DISPLAY[l]}{rt ? ` (${rt.version})` : ''}
                </option>
              );
            })}
          </select>

          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <Download className="w-3.5 h-3.5" /> Save
          </button>

          <button onClick={() => { setCode(DEFAULT_CODE[language] || ''); setOutput(''); setAiExplain(''); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>

          <button onClick={handleAIExplain} disabled={isAILoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-xs font-medium transition-colors disabled:opacity-50">
            {isAILoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            AI Explain
          </button>

          <button onClick={handleRun} disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 btn-primary">
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'Running…' : 'Run'}
          </button>
        </div>
      </div>

      {localRuntimeMissing && (
        <div className="px-6 py-3 border-b text-sm"
          style={{ background: 'rgba(245,158,11,0.10)', borderColor: 'rgba(245,158,11,0.25)', color: 'var(--text)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="font-black text-amber-500">Local {LANG_DISPLAY[language] || language} runtime missing</span>
            <span style={{ color: 'var(--text-muted)' }}>
              Missing: {localLanguageStatus.missingCommands.join(', ')}.
            </span>
            <code className="text-xs px-2 py-1 rounded-lg border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              {localLanguageStatus.installHint}
            </code>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            Zynapse will still try cloud execution first. Add JDoodle credentials or self-host Piston for a runtime-independent backup.
          </p>
        </div>
      )}

      {/* Editor + Output */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Monaco Editor */}
        <div className="flex-1 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="flex items-center gap-2 px-4 py-1.5 border-b border-white/[0.06]" style={{ background: '#060610' }}>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-zinc-600 font-mono ml-1">
              main.{FILE_EXT[language] ?? 'txt'}
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <MonacoEditor
              height="100%"
              language={MONACO_LANG[language] || 'plaintext'}
              value={code}
              onChange={val => setCode(val || '')}
              theme="aura-dark"
              beforeMount={defineAuraTheme}
              onMount={editor => { editorRef.current = editor; }}
              options={{
                fontSize: 14,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                bracketPairColorization: { enabled: true },
                wordWrap: 'on',
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-96 flex flex-col" style={{ background: 'var(--bg-surface)' }}>
          {/* Output */}
          <div className="flex-1 flex flex-col border-b border-white/10 min-h-[180px]">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06]">
              <TerminalIcon className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Output</span>
              {executorUsed !== 'none' && (
                <span className="ml-auto flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border"
                  style={{ background: 'rgba(99,102,241,0.10)', borderColor: 'rgba(99,102,241,0.25)', color: 'var(--primary-light)' }}>
                  <Server className="w-3 h-3" />
                  {executorUsed}
                </span>
              )}
              {sandbox && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                  style={{ background: sandbox.enabled ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderColor: sandbox.enabled ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)', color: sandbox.enabled ? '#10b981' : '#ef4444' }}>
                  {sandbox.enabled ? 'SANDBOX ON' : 'SANDBOX OFF'}
                </span>
              )}
              {output && (
                <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  hasError ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {hasError ? 'ERROR' : 'OK'}
                </span>
              )}
            </div>
            <pre className="flex-1 p-4 text-sm font-mono overflow-auto leading-relaxed whitespace-pre-wrap"
              style={{ color: hasError ? '#f87171' : '#94a3b8' }}>
              {isRunning
                ? <span className="text-indigo-400 animate-pulse">Executing…</span>
                : output || <span style={{ color: '#374151' }}>Run your code to see output here</span>
              }
            </pre>
          </div>

          {/* AI Explanation */}
          {(aiExplain || isAILoading) && (
            <div className="flex-1 flex flex-col min-h-0 max-h-72">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06]">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">AI Explanation</span>
                {isAILoading && <Loader2 className="w-3 h-3 animate-spin text-zinc-500 ml-auto" />}
              </div>
              <div className="flex-1 overflow-y-auto p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {aiExplain || <span className="text-zinc-600 animate-pulse">Analyzing code…</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
