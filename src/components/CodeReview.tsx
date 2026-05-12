import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Code2, Loader2, Sparkles, Copy, Check, Trash2, ChevronDown } from 'lucide-react';
import { streamContent, getAIConfig } from '../services/geminiService';

// ── Language config ─────────────────────────────────────────────────────────
const LANGUAGES = [
  { label: 'Python',      value: 'Python',     color: '#3b82f6' },
  { label: 'JavaScript',  value: 'JavaScript', color: '#f59e0b' },
  { label: 'TypeScript',  value: 'TypeScript', color: '#6366f1' },
  { label: 'Java',        value: 'Java',       color: '#ef4444' },
  { label: 'Go',          value: 'Go',         color: '#22d3ee' },
  { label: 'Rust',        value: 'Rust',       color: '#f97316' },
  { label: 'C++',         value: 'C++',        color: '#8b5cf6' },
  { label: 'C#',          value: 'C#',         color: '#10b981' },
  { label: 'PHP',         value: 'PHP',        color: '#a78bfa' },
  { label: 'Ruby',        value: 'Ruby',       color: '#f43f5e' },
  { label: 'Swift',       value: 'Swift',      color: '#fb923c' },
  { label: 'Kotlin',      value: 'Kotlin',     color: '#7c3aed' },
  { label: 'SQL',         value: 'SQL',        color: '#0ea5e9' },
  { label: 'Shell/Bash',  value: 'Shell',      color: '#84cc16' },
] as const;

type LangValue = typeof LANGUAGES[number]['value'];

// ── Example snippets ────────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: 'Python — N+1 Query Bug',
    language: 'Python' as LangValue,
    context: 'Fetch all users and their orders from the database',
    code: `def get_users_with_orders(session):
    users = session.query(User).all()
    result = []
    for user in users:
        orders = session.query(Order).filter(Order.user_id == user.id).all()
        result.append({"user": user.name, "orders": len(orders)})
    return result`,
  },
  {
    title: 'JavaScript — Promise Chain',
    language: 'JavaScript' as LangValue,
    context: 'Fetch user data and then fetch their posts',
    code: `function getUserPosts(userId) {
  fetch('/api/users/' + userId)
    .then(function(response) {
      return response.json()
    })
    .then(function(user) {
      fetch('/api/posts?author=' + user.name)
        .then(function(r) { return r.json() })
        .then(function(posts) { console.log(posts) })
        .catch(function(e) { console.log(e) })
    })
}`,
  },
  {
    title: 'TypeScript — Type Safety',
    language: 'TypeScript' as LangValue,
    context: 'Parse and validate user input from an API request',
    code: `function processUserData(data: any) {
  const user = data.user;
  const name = user.name;
  const age = parseInt(user.age);

  if (age > 18) {
    return { name: name, adult: true, age: age };
  } else {
    return { name: name, adult: false, age: age };
  }
}`,
  },
];

// ── Component ───────────────────────────────────────────────────────────────
export function CodeReview() {
  const [language, setLanguage] = useState<LangValue>('Python');
  const [context, setContext] = useState('');
  const [code, setCode] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);

  const abortRef = useRef<boolean>(false);

  const selectedLang = LANGUAGES.find(l => l.value === language) ?? LANGUAGES[0];

  // ── Build prompt ──────────────────────────────────────────────────────────
  const buildPrompt = (lang: string, ctx: string, src: string) => `You are an expert code reviewer. Review this ${lang} code thoroughly.

${ctx ? `Context: ${ctx}\n` : ''}
Code:
\`\`\`${lang.toLowerCase()}
${src}
\`\`\`

Provide a structured review in markdown with these EXACT sections:
## Overall Quality
Rate it X/10 and explain in 1-2 sentences.

## Issues Found
List bugs, security issues, performance problems, bad practices. Use bullet points.

## Suggestions
3-5 actionable improvements. Be specific.

## Improved Version
Show the improved code in a code block with key changes commented.

Keep feedback constructive and specific.`;

  // ── Stream review ─────────────────────────────────────────────────────────
  const handleReview = useCallback(async () => {
    if (!code.trim()) return;

    setReviewText('');
    setError('');
    setIsDone(false);
    setIsStreaming(true);
    abortRef.current = false;

    const prompt = buildPrompt(language, context, code);
    const cfg = getAIConfig();

    try {
      let review = '';
      for await (const chunk of streamContent(
        [{ role: 'user', content: prompt }],
        cfg.primaryProvider
      )) {
        if (abortRef.current) break;
        review += chunk;
        setReviewText(review);
      }
      setIsDone(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'AI review failed. Please check your API key in Settings.');
    } finally {
      setIsStreaming(false);
    }
  }, [language, context, code]);

  // ── Load example ──────────────────────────────────────────────────────────
  const loadExample = (ex: typeof EXAMPLES[number]) => {
    setLanguage(ex.language);
    setContext(ex.context);
    setCode(ex.code);
    setReviewText('');
    setIsDone(false);
    setError('');
  };

  // ── Copy review ───────────────────────────────────────────────────────────
  const copyReview = async () => {
    try {
      await navigator.clipboard.writeText(reviewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // ── Clear ─────────────────────────────────────────────────────────────────
  const handleClear = () => {
    setCode('');
    setContext('');
    setReviewText('');
    setIsDone(false);
    setError('');
    abortRef.current = true;
    setIsStreaming(false);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-void)' }}>
      {/* ── Header ── */}
      <header
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0.875rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Code2 size={18} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
            AI Code Review
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
            Paste your code · get expert feedback · instant streaming
          </p>
        </div>
        {isStreaming && (
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              color: 'var(--primary)',
              fontWeight: 600,
            }}
          >
            <Loader2 size={14} className="animate-spin" />
            Reviewing…
          </div>
        )}
      </header>

      {/* ── Main two-panel area ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ════ LEFT PANEL (40%) ════ */}
        <div
          style={{
            width: '40%',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Language selector */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '0.4rem' }}>
                Language
              </label>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsLangOpen(v => !v)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: selectedLang.color,
                      flexShrink: 0,
                    }}
                  />
                  {selectedLang.label}
                  <ChevronDown size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)', transform: isLangOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                </button>
                {isLangOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      zIndex: 50,
                      maxHeight: 220,
                      overflowY: 'auto',
                      boxShadow: 'var(--card-shadow)',
                    }}
                  >
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.value}
                        onClick={() => { setLanguage(lang.value); setIsLangOpen(false); }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: language === lang.value ? 'var(--bg-card)' : 'transparent',
                          border: 'none',
                          color: 'var(--text)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: lang.color, flexShrink: 0 }} />
                        {lang.label}
                        {language === lang.value && (
                          <Check size={12} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Context textarea */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '0.4rem' }}>
                Context <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
              </label>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                rows={3}
                placeholder="What should this code do?"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text)',
                  fontSize: '0.85rem',
                  resize: 'vertical',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Code textarea */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '0.4rem' }}>
                Code
              </label>
              <div
                style={{
                  flex: 1,
                  borderRadius: 8,
                  border: `1px solid ${codeFocused ? selectedLang.color : 'var(--border)'}`,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s',
                  position: 'relative',
                }}
              >
                {/* Language badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 10,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: selectedLang.color,
                    background: `${selectedLang.color}18`,
                    border: `1px solid ${selectedLang.color}33`,
                    borderRadius: 4,
                    padding: '2px 6px',
                    pointerEvents: 'none',
                    zIndex: 2,
                    letterSpacing: '0.05em',
                  }}
                >
                  {selectedLang.label}
                </div>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="// Paste your code here..."
                  onFocus={() => setCodeFocused(true)}
                  onBlur={() => setCodeFocused(false)}
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 240,
                    padding: '0.75rem',
                    background: 'var(--bg-card)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                    tabSize: 2,
                  }}
                  spellCheck={false}
                  onKeyDown={e => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const start = e.currentTarget.selectionStart;
                      const end = e.currentTarget.selectionEnd;
                      const val = e.currentTarget.value;
                      setCode(val.substring(0, start) + '  ' + val.substring(end));
                      setTimeout(() => {
                        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
                      }, 0);
                    }
                  }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleReview}
                disabled={!code.trim() || isStreaming}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1rem',
                  borderRadius: 8,
                  border: 'none',
                  background: code.trim() && !isStreaming
                    ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                    : 'var(--bg-card)',
                  color: code.trim() && !isStreaming ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: code.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
              >
                {isStreaming ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Reviewing…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Review Code
                  </>
                )}
              </button>
              {code.trim() && (
                <button
                  onClick={handleClear}
                  title="Clear"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--danger)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                  }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '0.65rem 0.875rem',
                  borderRadius: 8,
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: 'var(--danger)',
                  fontSize: '0.8rem',
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        {/* ════ RIGHT PANEL (60%) ════ */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-void)',
            overflow: 'hidden',
          }}
        >
          {/* Review output header */}
          {(reviewText || isStreaming) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                flexShrink: 0,
              }}
            >
              {isStreaming ? (
                <>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      animation: 'pulse 1s infinite',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)' }}>
                    Reviewing…
                  </span>
                </>
              ) : (
                <>
                  <Check size={14} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--success)' }}>
                    Review complete
                  </span>
                </>
              )}
              {isDone && reviewText && (
                <button
                  onClick={copyReview}
                  style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                  {copied ? 'Copied!' : 'Copy Review'}
                </button>
              )}
            </div>
          )}

          {/* Review content / placeholder */}
          <div style={{ flex: 1, overflowY: 'auto', padding: reviewText || isStreaming ? '1.25rem' : '2rem' }}>
            {reviewText ? (
              <div
                className="markdown-body"
                style={{
                  color: 'var(--text)',
                  fontSize: '0.875rem',
                  lineHeight: 1.75,
                  maxWidth: 720,
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {reviewText}
                </ReactMarkdown>
                {isStreaming && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 16,
                      background: 'var(--primary)',
                      marginLeft: 2,
                      borderRadius: 2,
                      animation: 'pulse 0.8s infinite',
                      verticalAlign: 'text-bottom',
                    }}
                  />
                )}
              </div>
            ) : (
              /* ─── Placeholder ─── */
              <div style={{ maxWidth: 520 }}>
                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                    }}
                  >
                    <Sparkles size={24} color="#fff" />
                  </div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.4rem' }}>
                    AI Code Review
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                    Paste your code on the left to get an expert AI review with quality rating, issues, suggestions, and an improved version.
                  </p>
                </div>

                {/* What you'll get */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.6rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  {[
                    { icon: '📊', label: 'Quality Score', desc: 'X/10 rating with explanation' },
                    { icon: '🐛', label: 'Issues Found',  desc: 'Bugs, security & performance' },
                    { icon: '💡', label: 'Suggestions',   desc: '3-5 actionable improvements' },
                    { icon: '✨', label: 'Improved Code',  desc: 'Refactored with comments' },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                      }}
                    >
                      <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{item.icon}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.15rem' }}>{item.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Example snippets */}
                <div>
                  <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 0.5rem' }}>
                    Try an example
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {EXAMPLES.map(ex => (
                      <button
                        key={ex.title}
                        onClick={() => loadExample(ex)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.65rem 0.875rem',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'var(--bg-surface)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                          width: '100%',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)';
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface)';
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: LANGUAGES.find(l => l.value === ex.language)?.color ?? 'var(--primary)',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text)' }}>
                          {ex.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }}>
                          Load →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Inline styles for markdown and pulse animation ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .markdown-body h2 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          margin: 1.5rem 0 0.6rem;
          padding-bottom: 0.35rem;
          border-bottom: 1px solid var(--border);
        }
        .markdown-body h2:first-child {
          margin-top: 0;
        }
        .markdown-body h3 {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text);
          margin: 1rem 0 0.4rem;
        }
        .markdown-body p {
          margin: 0 0 0.6rem;
          color: var(--text);
        }
        .markdown-body ul {
          margin: 0 0 0.75rem 1.25rem;
          padding: 0;
        }
        .markdown-body li {
          margin-bottom: 0.35rem;
          color: var(--text);
        }
        .markdown-body code {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.1em 0.4em;
          color: var(--primary);
        }
        .markdown-body pre {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1rem;
          overflow-x: auto;
          margin: 0.75rem 0 1rem;
        }
        .markdown-body pre code {
          background: none;
          border: none;
          padding: 0;
          color: var(--text);
          font-size: 0.82rem;
          line-height: 1.65;
        }
        .markdown-body strong {
          color: var(--text);
          font-weight: 600;
        }
        .markdown-body blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 0.875rem;
          margin: 0.5rem 0;
          color: var(--text-muted);
        }
        .markdown-body a {
          color: var(--primary);
          text-decoration: none;
        }
        .markdown-body a:hover {
          text-decoration: underline;
        }
        .markdown-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75rem 0;
          font-size: 0.82rem;
        }
        .markdown-body th, .markdown-body td {
          padding: 0.4rem 0.75rem;
          border: 1px solid var(--border);
          text-align: left;
        }
        .markdown-body th {
          background: var(--bg-card);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
