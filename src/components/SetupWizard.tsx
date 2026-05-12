import { useState, useEffect } from 'react';
import { X, ArrowRight, ExternalLink, Activity, Network, Box } from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
  onOpenSettings: () => void;
}

export function SetupWizard({ onComplete, onOpenSettings }: SetupWizardProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenSetup = localStorage.getItem('SETUP_COMPLETED') === 'true';
    if (!hasSeenSetup) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('SETUP_COMPLETED', 'true');
    setIsOpen(false);
    onComplete();
  };

  const handleOpenSettings = () => {
    localStorage.setItem('SETUP_COMPLETED', 'true');
    setIsOpen(false);
    onComplete();
    onOpenSettings();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-500" />
              Welcome to Zynapse
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">First-time setup: Choose your AI brain to power the platform.</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-zinc-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Groq Card */}
            <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex flex-col gap-1">
                <span className="text-indigo-500 flex items-center gap-2"><Network className="w-4 h-4"/> Recommended</span>
                Groq (Llama 3)
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                Lightning fast inference. Extremely quick responses.
              </p>
              <ol className="text-xs text-slate-600 dark:text-zinc-400 space-y-2 list-decimal pl-4 mb-4">
                <li>Go to the <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Groq Console</a></li>
                <li>Sign up / Log in</li>
                <li>Create a new API Key</li>
              </ol>
            </div>

            {/* Gemini Card */}
            <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex flex-col gap-1">
                <span className="text-emerald-500 flex items-center gap-2"><Box className="w-4 h-4"/> Default</span>
                Google Gemini
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                Great reasoning and high accuracy. Enabled by default in this environment, but you can set your own key.
              </p>
              <ol className="text-xs text-slate-600 dark:text-zinc-400 space-y-2 list-decimal pl-4 mb-4">
                <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">Google Gemini API Console</a></li>
                <li>Create API Key</li>
              </ol>
            </div>

            {/* Ollama Card */}
            <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                Ollama (Local AI)
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                Run AI entirely on your computer for maximum privacy and zero API costs.
              </p>
              <ol className="text-xs text-slate-600 dark:text-zinc-400 space-y-2 list-decimal pl-4 mb-4">
                <li>Download & install from <a href="https://ollama.com/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Ollama.com</a></li>
                <li>Open terminal / command prompt</li>
                <li>Run command: <code className="bg-slate-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">ollama run llama3</code></li>
                <li>Ensure the app URL accesses <code className="bg-slate-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">localhost</code></li>
              </ol>
            </div>

             {/* NVIDIA Card */}
             <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-slate-200 dark:border-white/5 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                NVIDIA Build
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                Access powerful models like Llama 3 70B directly from NVIDIA's cloud.
              </p>
              <ol className="text-xs text-slate-600 dark:text-zinc-400 space-y-2 list-decimal pl-4 mb-4">
                <li>Go to <a href="https://build.nvidia.com/" target="_blank" rel="noreferrer" className="text-green-500 hover:underline">NVIDIA Build</a></li>
                <li>Select a model and get the API key</li>
              </ol>
            </div>

          </div>

          <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4 flex gap-3 text-sm text-indigo-800 dark:text-indigo-200">
            <Activity className="w-5 h-5 shrink-0" />
            <p>
              <strong>Pro Tip:</strong> We've added an <strong>Auto-Fallback</strong> feature. You can provide multiple API keys, and if one rate-limits you, it will automatically seamlessly switch to another provider!
            </p>
          </div>

        </div>

        <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900/50 rounded-b-2xl flex justify-between items-center gap-3">
          <button 
            onClick={handleClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
          >
            Skip for now
          </button>
          <button 
            onClick={handleOpenSettings}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl active:scale-95 transition-all shadow-md"
          >
            Configure AI Setting now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
