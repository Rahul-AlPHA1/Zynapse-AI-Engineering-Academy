import { useState, useMemo, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { ContentArea } from './components/ContentArea';
import { Chat } from './components/Chat';
import { AIProviderSettings } from './components/AIProviderSettings';
import { SetupWizard } from './components/SetupWizard';
import { CodeCompiler } from './components/CodeCompiler';
import { CommandPalette } from './components/CommandPalette';
import { LocalModelManager } from './components/LocalModelManager';
import { LearningPathFlow } from './components/LearningPathFlow';
import { InterviewHub } from './components/InterviewHub';
import { QuizHub } from './components/QuizHub';
import { MockInterview } from './components/MockInterview';
import { Flashcards } from './components/Flashcards';
import { CodeReview } from './components/CodeReview';
import { ProjectIdeas } from './components/ProjectIdeas';
import { StudyPlanner } from './components/StudyPlanner';
import { GuidedTutor } from './components/GuidedTutor';
import { CodeChallengeArena } from './components/CodeChallengeArena';
import { PortfolioBuilder } from './components/PortfolioBuilder';
import { SmartRecommendations } from './components/SmartRecommendations';
import { DataManager } from './components/DataManager';
import { ProviderHealth } from './components/ProviderHealth';
import { ThemeStudio, applyZynapsePalette } from './components/ThemeStudio';
import { MessageSquare } from 'lucide-react';
import { curriculum } from './data/curriculum';
import { useProgress } from './hooks/useProgress';
import { useStreak, getLevel, getLevelTitle } from './hooks/useStreak';
import { useBookmarks } from './hooks/useBookmarks';
import { useNotes } from './hooks/useNotes';
import { useAchievements, AchievementCheckInput } from './hooks/useAchievements';
import { AchievementToast } from './components/AchievementToast';
import { AchievementsModal } from './components/AchievementsModal';
import { DailyChallenge } from './components/DailyChallenge';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CloudSync } from './components/CloudSync';
import { ClassroomMode } from './components/ClassroomMode';
import { ShareCenter } from './components/ShareCenter';
import { PluginMarketplace } from './components/PluginMarketplace';
import { QAChecks } from './components/QAChecks';
import { ContactPage } from './components/ContactPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60,       // 1 hour — AI content stays fresh
      gcTime: 1000 * 60 * 60 * 24,     // 24 hour cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}

function AppShell() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(() => {
    const hash = window.location.hash.replace(/^#/, '').trim();
    return hash || null;
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);
  const { completed, isComplete, toggleComplete } = useProgress();
  const { xp, streak, level, levelTitle, levelPct, addXP } = useStreak();
  const { bookmarks, toggle: toggleBookmark, isBookmarked } = useBookmarks();
  const { getNote, setNote, getAllNoteIds } = useNotes();
  const { allAchievements, newlyUnlocked, dismissNew, check: checkAchievements, unlockedCount } = useAchievements();
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [quizOpenCount, setQuizOpenCount] = useState(0);

  const selectTopic = useCallback((id: string | null) => {
    setSelectedTopicId(id);
    const nextUrl = id ? `${window.location.pathname}#${id}` : window.location.pathname;
    window.history.replaceState(null, '', nextUrl);
  }, []);

  // Theme: persist in localStorage, dark-first default
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('ZYNAPSE_THEME');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) { root.classList.add('dark'); root.classList.remove('light'); }
    else         { root.classList.remove('dark'); root.classList.add('light'); }
    localStorage.setItem('ZYNAPSE_THEME', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    applyZynapsePalette(localStorage.getItem('ZYNAPSE_ACCENT') || 'aurora');
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, '').trim();
      setSelectedTopicId(hash || null);
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Check achievements whenever relevant state changes
  useEffect(() => {
    const allLearnTopics = curriculum.flatMap(m =>
      m.sections.flatMap(s => s.topics.filter(t => {
        const tl = t.title.toLowerCase(), il = t.id.toLowerCase();
        return !tl.includes('interview') && !il.includes('interview') && !tl.includes('quiz') && !il.includes('quiz');
      }))
    );
    const input: AchievementCheckInput = {
      completedCount: completed.size,
      totalTopics: allLearnTopics.length,
      streak,
      level,
      xp,
      bookmarkCount: bookmarks.length,
      hasNote: getAllNoteIds().length > 0,
      quizOpenCount,
    };
    checkAchievements(input);
  }, [completed.size, streak, level, xp, bookmarks.length, quizOpenCount, checkAchievements, getAllNoteIds]);

  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    for (const module of curriculum) {
      for (const section of module.sections) {
        const topic = section.topics.find(t => t.id === selectedTopicId);
        if (topic) return { ...topic, moduleTitle: module.title, sectionTitle: section.title };
      }
    }
    return null;
  }, [selectedTopicId]);

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'var(--bg-void)' }}>
      <SetupWizard
        onComplete={() => {}}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelectTopic={(id: string) => { selectTopic(id); setIsPaletteOpen(false); }}
      />

      <Sidebar
        selectedTopicId={selectedTopicId}
        onSelectTopic={selectTopic}
        isDarkMode={isDark}
        toggleDarkMode={() => setIsDark(d => !d)}
        language={language}
        setLanguage={setLanguage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPalette={() => setIsPaletteOpen(true)}
        onOpenModelManager={() => setIsModelManagerOpen(true)}
        completedTopics={completed}
        bookmarkedTopics={bookmarks}
        xp={xp}
        streak={streak}
        level={level}
        levelTitle={levelTitle}
        levelPct={levelPct}
        unlockedAchievements={unlockedCount}
        totalAchievements={allAchievements.length}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
      />

      <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden" style={{ background: 'var(--bg-void)' }}>
        {selectedTopicId === 'COMPILER' ? (
          <CodeCompiler />
        ) : selectedTopicId === 'ROADMAP' ? (
          <LearningPathFlow onSelectTopic={selectTopic} />
        ) : selectedTopicId === 'INTERVIEW_HUB' ? (
          <InterviewHub onSelectTopic={selectTopic} language={language} />
        ) : selectedTopicId === 'QUIZ_HUB' ? (
          <QuizHub onSelectTopic={selectTopic} />
        ) : selectedTopicId === 'MOCK_INTERVIEW' ? (
          <MockInterview />
        ) : selectedTopicId === 'FLASHCARDS' ? (
          <Flashcards />
        ) : selectedTopicId === 'CODE_REVIEW' ? (
          <CodeReview />
        ) : selectedTopicId === 'ANALYTICS' ? (
          <AnalyticsDashboard />
        ) : selectedTopicId === 'PROJECT_IDEAS' ? (
          <ProjectIdeas />
        ) : selectedTopicId === 'STUDY_PLANNER' ? (
          <StudyPlanner />
        ) : selectedTopicId === 'GUIDED_TUTOR' ? (
          <GuidedTutor />
        ) : selectedTopicId === 'CHALLENGE_ARENA' ? (
          <CodeChallengeArena />
        ) : selectedTopicId === 'PORTFOLIO_BUILDER' ? (
          <PortfolioBuilder />
        ) : selectedTopicId === 'RECOMMENDATIONS' ? (
          <SmartRecommendations onSelectTopic={selectTopic} />
        ) : selectedTopicId === 'DATA_MANAGER' ? (
          <DataManager />
        ) : selectedTopicId === 'CLOUD_SYNC' ? (
          <CloudSync />
        ) : selectedTopicId === 'CLASSROOM_MODE' ? (
          <ClassroomMode />
        ) : selectedTopicId === 'SHARE_CENTER' ? (
          <ShareCenter />
        ) : selectedTopicId === 'PLUGIN_MARKETPLACE' ? (
          <PluginMarketplace />
        ) : selectedTopicId === 'QA_CHECKS' ? (
          <QAChecks />
        ) : selectedTopicId === 'PROVIDER_HEALTH' ? (
          <ProviderHealth />
        ) : selectedTopicId === 'THEME_STUDIO' ? (
          <ThemeStudio isDark={isDark} onToggleTheme={() => setIsDark(d => !d)} />
        ) : selectedTopicId === 'CONTACT' ? (
          <ContactPage />
        ) : selectedTopicId === 'DAILY_CHALLENGE' ? (
          <DailyChallenge language={language} streak={streak} onXP={addXP} />
        ) : (
          <ContentArea
            topic={selectedTopic}
            language={language}
            isComplete={selectedTopic ? isComplete(selectedTopic.id) : false}
            isBookmarked={selectedTopic ? isBookmarked(selectedTopic.id) : false}
            note={selectedTopic ? getNote(selectedTopic.id) : ''}
            onToggleComplete={() => {
              if (!selectedTopic) return;
              const wasComplete = isComplete(selectedTopic.id);
              toggleComplete(selectedTopic.id);
              if (!wasComplete) {
                addXP(50);
                const newXp = xp + 50;
                const newLevel = getLevel(newXp);
                if (newLevel > level) {
                  toast.success(`Level Up! Lv.${newLevel} ${getLevelTitle(newLevel)}`, { duration: 4000, icon: '🎉' });
                } else {
                  toast.success(`+50 XP — Topic Complete!`, { duration: 2500, icon: '⚡' });
                }
              }
            }}
            onToggleBookmark={() => selectedTopic && toggleBookmark(selectedTopic.id)}
            onSaveNote={(text) => selectedTopic && setNote(selectedTopic.id, text)}
            onNavigate={selectTopic}
            onQuizOpen={() => setQuizOpenCount(c => c + 1)}
          />
        )}

        {/* Floating chat button */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="absolute bottom-7 right-7 p-4 rounded-2xl text-white z-40 group transition-all duration-300 hover:scale-110 btn-primary glow-indigo"
            title="Ask Zynapse (AI Mentor)"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none glass border border-white/10 text-zinc-200">
              Ask Zynapse
            </span>
          </button>
        )}
      </main>

      <Chat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentTopicTitle={selectedTopic?.title}
        language={language}
      />

      <AIProviderSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <LocalModelManager
        isOpen={isModelManagerOpen}
        onClose={() => setIsModelManagerOpen(false)}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={allAchievements}
      />

      <AchievementToast achievements={newlyUnlocked} onDismiss={dismissNew} />

      <Toaster
        theme={isDark ? 'dark' : 'light'}
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? '#0a0a14' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.20)'}`,
            color: isDark ? '#e2e8f0' : '#18181b',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
        }}
      />
    </div>
  );
}
