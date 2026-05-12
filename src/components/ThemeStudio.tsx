import { useState } from 'react';
import { Check, MonitorSmartphone, Moon, Palette, Sparkles, Sun } from 'lucide-react';

interface ThemeStudioProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const PALETTES = [
  {
    id: 'aurora',
    name: 'Aurora Indigo',
    desc: 'Premium Zynapse default',
    primary: '#6366f1',
    primaryLight: '#818cf8',
    accent: '#22d3ee',
    preview: 'linear-gradient(135deg,#6366f1,#22d3ee)',
  },
  {
    id: 'emerald',
    name: 'Emerald Circuit',
    desc: 'Fresh, focused, technical',
    primary: '#059669',
    primaryLight: '#34d399',
    accent: '#0ea5e9',
    preview: 'linear-gradient(135deg,#059669,#0ea5e9)',
  },
  {
    id: 'violet',
    name: 'Violet Neural',
    desc: 'AI-native and expressive',
    primary: '#7c3aed',
    primaryLight: '#a78bfa',
    accent: '#ec4899',
    preview: 'linear-gradient(135deg,#7c3aed,#ec4899)',
  },
  {
    id: 'amber',
    name: 'Solar Craft',
    desc: 'Warm, energetic, builder mode',
    primary: '#d97706',
    primaryLight: '#f59e0b',
    accent: '#ef4444',
    preview: 'linear-gradient(135deg,#d97706,#ef4444)',
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    desc: 'Crisp, futuristic, high signal',
    primary: '#0891b2',
    primaryLight: '#22d3ee',
    accent: '#6366f1',
    preview: 'linear-gradient(135deg,#0891b2,#6366f1)',
  },
  {
    id: 'rose',
    name: 'Rose Matrix',
    desc: 'Bold, creative, memorable',
    primary: '#e11d48',
    primaryLight: '#fb7185',
    accent: '#8b5cf6',
    preview: 'linear-gradient(135deg,#e11d48,#8b5cf6)',
  },
];

export function applyZynapsePalette(paletteId: string) {
  const palette = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0];
  const root = document.documentElement;
  root.style.setProperty('--primary', palette.primary);
  root.style.setProperty('--primary-light', palette.primaryLight);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--primary-glow', `${palette.primary}40`);
  root.style.setProperty('--accent-glow', `${palette.accent}35`);
  localStorage.setItem('ZYNAPSE_ACCENT', palette.id);
}

export function ThemeStudio({ isDark, onToggleTheme }: ThemeStudioProps) {
  const [active, setActive] = useState(localStorage.getItem('ZYNAPSE_ACCENT') || 'aurora');

  const selectPalette = (paletteId: string) => {
    applyZynapsePalette(paletteId);
    setActive(paletteId);
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <header className="mb-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'var(--border)', color: 'var(--primary-light)' }}>
            <Palette className="w-3.5 h-3.5" />
            Theme Studio
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Make Zynapse feel yours</h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Switch between polished light/dark modes and choose a premium accent system. Every new screen uses these design tokens.
          </p>
        </header>

        <div className="grid xl:grid-cols-[360px_1fr] gap-5">
          <aside className="rounded-3xl border p-5 h-fit" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <h2 className="font-black text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <MonitorSmartphone className="w-5 h-5" style={{ color: 'var(--primary-light)' }} />
              Mode
            </h2>
            <button
              onClick={onToggleTheme}
              className="w-full rounded-2xl border p-4 flex items-center justify-between gap-3 transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg,var(--primary),var(--accent))' }}>
                  {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <p className="font-black" style={{ color: 'var(--text)' }}>{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click to switch instantly</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--primary-light)' }} />
            </button>

            <div className="mt-5 rounded-2xl border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Theme rules</p>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li>• High contrast text in light mode</li>
                <li>• Deep surface layering in dark mode</li>
                <li>• Same accent tokens across all tools</li>
                <li>• Preferences stored locally</li>
              </ul>
            </div>
          </aside>

          <main className="rounded-3xl border p-5 lg:p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-black text-xl" style={{ color: 'var(--text)' }}>Accent Palettes</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Choose the visual personality for buttons, charts, diagrams, and highlights.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {PALETTES.map(palette => {
                const selected = active === palette.id;
                return (
                  <button
                    key={palette.id}
                    onClick={() => selectPalette(palette.id)}
                    className="group rounded-3xl border p-4 text-left transition-all hover:-translate-y-1"
                    style={{
                      background: selected ? `${palette.primary}12` : 'var(--bg-card)',
                      borderColor: selected ? palette.primary : 'var(--border)',
                      boxShadow: selected ? `0 16px 40px ${palette.primary}20` : 'none',
                    }}
                  >
                    <div className="h-28 rounded-2xl mb-4 relative overflow-hidden" style={{ background: palette.preview }}>
                      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, white 0, transparent 28%)' }} />
                      {selected && (
                        <div className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-black" style={{ color: 'var(--text)' }}>{palette.name}</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{palette.desc}</p>
                    <div className="mt-4 flex items-center gap-2">
                      {[palette.primary, palette.primaryLight, palette.accent].map(color => (
                        <span key={color} className="w-6 h-6 rounded-full border" style={{ background: color, borderColor: 'rgba(255,255,255,0.35)' }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-4">
              {['Learning', 'Practice', 'Build'].map((label, index) => (
                <div key={label} className="rounded-2xl border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-2xl mb-3 text-white flex items-center justify-center font-black"
                    style={{ background: index === 0 ? 'var(--primary)' : index === 1 ? 'var(--accent)' : 'linear-gradient(135deg,var(--primary),var(--accent))' }}>
                    {index + 1}
                  </div>
                  <p className="font-black" style={{ color: 'var(--text)' }}>{label}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Preview card using active theme tokens.</p>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
