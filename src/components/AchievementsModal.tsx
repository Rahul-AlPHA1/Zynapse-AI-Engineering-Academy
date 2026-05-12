import { X, Lock } from 'lucide-react';
import { Achievement } from '../hooks/useAchievements';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export function AchievementsModal({ isOpen, onClose, achievements }: Props) {
  if (!isOpen) return null;

  const unlocked = achievements.filter(a => a.unlockedAt);
  const locked   = achievements.filter(a => !a.unlockedAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#0a0a14] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(251,191,36,0.06))' }}>
          <div>
            <h2 className="text-white font-bold text-lg">Achievements</h2>
            <p className="text-zinc-500 text-xs">{unlocked.length}/{achievements.length} unlocked</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 border-b border-white/[0.06] shrink-0">
          <div className="h-2 rounded-full overflow-hidden bg-white/5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.round((unlocked.length / achievements.length) * 100)}%`,
                background: 'linear-gradient(90deg,#6366f1,#fbbf24)',
              }}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {unlocked.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Unlocked</p>
              <div className="grid grid-cols-2 gap-2">
                {unlocked.map(a => (
                  <div key={a.id}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ background: `${a.color}10`, borderColor: `${a.color}30` }}>
                    <span className="text-2xl shrink-0">{a.icon}</span>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-xs truncate">{a.title}</p>
                      <p className="text-zinc-500 text-[10px] leading-snug">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {locked.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Locked</p>
              <div className="grid grid-cols-2 gap-2">
                {locked.map(a => (
                  <div key={a.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/5 opacity-40">
                    <Lock className="w-5 h-5 text-zinc-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-zinc-400 font-semibold text-xs truncate">{a.title}</p>
                      <p className="text-zinc-600 text-[10px] leading-snug">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
