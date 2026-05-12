import { useEffect, useState } from 'react';
import { Achievement } from '../hooks/useAchievements';

interface Props {
  achievements: Achievement[];
  onDismiss: () => void;
}

export function AchievementToast({ achievements, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievements.length === 0) return;
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 400); }, 3500);
    return () => clearTimeout(t);
  }, [achievements, onDismiss]);

  if (achievements.length === 0) return null;
  const a = achievements[0];

  return (
    <div
      className={`fixed bottom-24 right-7 z-50 transition-all duration-400 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl"
        style={{
          background: 'rgba(10,10,20,0.97)',
          borderColor: `${a.color}44`,
          boxShadow: `0 0 24px ${a.color}22`,
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="text-2xl">{a.icon}</div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: a.color }}>
            Achievement Unlocked!
          </p>
          <p className="text-white font-bold text-sm leading-none">{a.title}</p>
          <p className="text-zinc-500 text-xs mt-0.5">{a.desc}</p>
        </div>
      </div>
    </div>
  );
}
