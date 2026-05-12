import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Loader2, X } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopicTitle?: string;
  language: string;
}

function getWelcomeMessage(lang: string): string {
  return `Hey! 👋\n\nI'm **Zynapse** — your personal AI Engineering Mentor.\n\nAsk me anything about topics you're studying — LLMs, system design, algorithms, cloud, DevOps, interviews, or anything else in the curriculum. I'll explain clearly and concisely.\n\n*(Responding in ${lang})*`;
}

export function Chat({ isOpen, onClose, currentTopicTitle, language }: ChatProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatSession(createChatSession(language));
    setMessages([{ role: 'model', text: getWelcomeMessage(language) }]);
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);
    try {
      const contextPrefix = currentTopicTitle
        ? `[Context: Currently studying "${currentTopicTitle}"]\n`
        : '';
      const result = await chatSession.sendMessage({ message: contextPrefix + userMessage });
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: '⚠️ Something went wrong. Please check your API key in Settings and try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 w-full h-full flex flex-col z-50"
          style={{ background: 'var(--bg-surface)', backdropFilter: 'blur(24px)' }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center border"
                  style={{ background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.3)' }}>
                  <Bot className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Zynapse AI Mentor</h2>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {currentTopicTitle ? `Studying: ${currentTopicTitle}` : 'Ask me anything about the curriculum'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex gap-4', msg.role === 'user' ? 'flex-row-reverse' : '')}>
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 border',
                    msg.role === 'model'
                      ? 'bg-indigo-500/15 text-indigo-500 border-indigo-500/25'
                      : 'border-transparent'
                  )}
                    style={msg.role === 'user' ? { background: 'var(--bg-card)', borderColor: 'var(--border)' } : {}}>
                    {msg.role === 'model' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                  </div>
                  <div className={cn('flex-1 space-y-1.5 max-w-[85%]', msg.role === 'user' ? 'text-right' : '')}>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {msg.role === 'model' ? 'Zynapse' : 'You'}
                    </div>
                    <div className={cn('inline-block text-left text-sm md:text-base', msg.role === 'user' ? 'px-4 py-3 rounded-2xl rounded-tr-sm' : 'w-full')}
                      style={msg.role === 'user' ? { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' } : {}}>
                      {msg.role === 'model' ? (
                        <div className="markdown-body text-sm md:text-base">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.text}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full border border-indigo-500/25 bg-indigo-500/15 flex items-center justify-center shrink-0 mt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Zynapse</div>
                    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm border"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      <span className="text-sm">Thinking</span>
                      <span className="animate-pulse text-sm">...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 md:p-6 border-t shrink-0"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', backdropFilter: 'blur(12px)' }}>
            <div className="max-w-4xl mx-auto">
              <div className="relative flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Ask Zynapse anything…"
                  className="w-full pl-4 pr-14 py-4 rounded-xl text-sm resize-none min-h-[56px] max-h-[200px] outline-none transition-all"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)',
                  }}
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 bottom-3 p-2 rounded-lg transition-all disabled:opacity-40 text-white"
                  style={{ background: 'var(--primary)' }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Press <kbd className="px-1.5 py-0.5 rounded text-[10px] border font-sans"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>Enter</kbd> to send
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
