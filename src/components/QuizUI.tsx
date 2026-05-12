import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Code, List, ChevronRight, ChevronLeft, Send, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'coding';
  question: string;
  options?: string[];
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

interface QuizUIProps {
  quizData: QuizData;
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  isEvaluating: boolean;
  evaluationResult: string | null;
  onRetake: () => void;
}

export function QuizUI({ quizData, onSubmit, isEvaluating, evaluationResult, onRetake }: QuizUIProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  const handleCodeChange = (code: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: code }));
  };

  const handleNext = () => {
    if (!isLastQuestion) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (!isFirstQuestion) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  if (evaluationResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl mx-auto mt-8 p-1 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
      >
        <div className="bg-white dark:bg-zinc-950 rounded-[23px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 dark:from-indigo-900/20 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl">
                <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                AI Evaluation Result
              </h2>
            </div>
            
            <div className="prose prose-invert prose-indigo max-w-none markdown-body bg-slate-50 dark:bg-zinc-900/50 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {evaluationResult}
              </ReactMarkdown>
            </div>

            <div className="mt-10 flex justify-end">
              <button
                onClick={onRetake}
                className="px-8 py-4 bg-slate-100 dark:bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-bold transition-all flex items-center gap-2"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-200">{quizData.title}</h3>
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Question {currentQuestionIndex + 1} of {quizData.questions.length}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-start gap-4 mb-8 relative z-10">
            <div className="mt-1 p-2 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
              {currentQuestion.type === 'mcq' ? (
                <List className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <h4 className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
              {currentQuestion.question}
            </h4>
          </div>

          <div className="relative z-10">
            {currentQuestion.type === 'mcq' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                        isSelected 
                          ? 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                          : 'bg-slate-50 dark:bg-white dark:bg-zinc-950/50 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:bg-white/5 hover:border-slate-200 dark:border-white/10'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20' : 'border-slate-300 dark:border-zinc-600'
                      }`}>
                        {isSelected && <div className="w-3 h-3 rounded-full bg-indigo-400" />}
                      </div>
                      <span className={`text-lg ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-600 dark:text-zinc-300'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'coding' && (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="// Write your code here..."
                  className="relative w-full h-64 p-6 bg-slate-900 dark:bg-[#0d1117] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-zinc-200 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                  spellCheck="false"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between relative z-10 border-t border-slate-200 dark:border-white/10 pt-6">
            <button
              onClick={handlePrev}
              disabled={isFirstQuestion}
              className="px-6 py-3 rounded-xl font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-zinc-100 hover:bg-slate-100 dark:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-indigo-600 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isEvaluating}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-70"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    Submit Quiz
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
