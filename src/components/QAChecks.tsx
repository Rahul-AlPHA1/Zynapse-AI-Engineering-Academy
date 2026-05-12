import { Activity, CheckCircle2, MonitorSmartphone, PlayCircle } from 'lucide-react';

const ROUTES = [
  'ROADMAP', 'COMPILER', 'DAILY_CHALLENGE', 'STUDY_PLANNER', 'RECOMMENDATIONS',
  'INTERVIEW_HUB', 'QUIZ_HUB', 'MOCK_INTERVIEW', 'CHALLENGE_ARENA',
  'FLASHCARDS', 'CODE_REVIEW', 'GUIDED_TUTOR', 'PROJECT_IDEAS',
  'PORTFOLIO_BUILDER', 'ANALYTICS', 'PROVIDER_HEALTH', 'THEME_STUDIO',
  'DATA_MANAGER', 'CLOUD_SYNC', 'CLASSROOM_MODE', 'SHARE_CENTER', 'PLUGIN_MARKETPLACE',
];

export function QAChecks() {
  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'var(--border)', color: 'var(--primary-light)' }}>
            <Activity className="w-3.5 h-3.5" />
            QA Checks
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Production smoke checklist</h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>Routes covered by automated Playwright smoke tests across desktop/mobile and dark/light modes.</p>
        </header>

        <section className="rounded-3xl border p-5 mb-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center gap-3">
            <PlayCircle className="w-7 h-7" style={{ color: 'var(--primary-light)' }} />
            <div>
              <h2 className="font-black" style={{ color: 'var(--text)' }}>Run locally</h2>
              <p className="text-sm font-mono mt-1" style={{ color: 'var(--text-muted)' }}>npm run qa:smoke</p>
            </div>
          </div>
        </section>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {ROUTES.map(route => (
            <a key={route} href={`#${route}`} className="rounded-2xl border p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)', color: 'var(--text)' }}>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div className="min-w-0">
                <p className="font-black text-sm truncate">{route.replaceAll('_', ' ')}</p>
                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><MonitorSmartphone className="w-3 h-3" /> desktop + mobile</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
