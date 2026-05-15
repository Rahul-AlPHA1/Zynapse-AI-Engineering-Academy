import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import { BookOpen, Loader2, PlusCircle, Sparkles, Send, BrainCircuit, CheckCircle2, AlertCircle, Terminal, Download, FileCheck2, FileText, CalendarDays, Upload, Square, Trophy, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, StickyNote, X } from 'lucide-react';
import { createChatSession, streamContent } from '../services/geminiService';
import { generateInterviewPlan, AIPlanResponse, loadMorePlanQuestions } from '../services/geminiService';
import { curriculum } from '../data/curriculum';
import { buildJavaOfflineLesson, isJavaOfflineTopic, preloadJavaScrapedContent } from '../data/javaOfflineLessons';
import { QuizUI, QuizData } from './QuizUI';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface ContentAreaProps {
  topic: any;
  language: string;
  isComplete?: boolean;
  isBookmarked?: boolean;
  note?: string;
  onToggleComplete?: () => void;
  onToggleBookmark?: () => void;
  onSaveNote?: (text: string) => void;
  onNavigate?: (topicId: string) => void;
  onQuizOpen?: () => void;
}

type Difficulty = 'beginner' | 'standard' | 'expert';

type PdfExportOptions = {
  title: string;
  subtitle: string;
  bodyHtml: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildPdfDocument({ title, subtitle, bodyHtml }: PdfExportOptions) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page {
        size: A4;
        margin: 14mm 12mm;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #111827;
        font-family: Inter, Arial, Helvetica, sans-serif;
        font-size: 11.5pt;
        line-height: 1.65;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .pdf-page {
        width: 100%;
      }

      .pdf-header {
        border-bottom: 2px solid #4f46e5;
        margin-bottom: 22px;
        padding-bottom: 14px;
      }

      .pdf-kicker {
        color: #4f46e5;
        font-size: 8.5pt;
        font-weight: 800;
        letter-spacing: 0.12em;
        margin: 0 0 6px;
        text-transform: uppercase;
      }

      .pdf-title {
        color: #0f172a;
        font-size: 24pt;
        line-height: 1.15;
        margin: 0;
      }

      .pdf-subtitle {
        color: #475569;
        font-size: 10pt;
        margin: 8px 0 0;
      }

      .pdf-content h1,
      .pdf-content h2,
      .pdf-content h3,
      .pdf-content h4 {
        color: #111827;
        line-height: 1.25;
        break-after: avoid;
        page-break-after: avoid;
      }

      .pdf-content h1 {
        font-size: 22pt;
        margin: 26px 0 12px;
      }

      .pdf-content h2 {
        border-bottom: 1px solid #c7d2fe;
        color: #312e81;
        font-size: 17pt;
        margin: 24px 0 10px;
        padding-bottom: 5px;
      }

      .pdf-content h3 {
        color: #4338ca;
        font-size: 13.5pt;
        margin: 18px 0 8px;
      }

      .pdf-content h4 {
        color: #374151;
        font-size: 11pt;
        margin: 14px 0 6px;
        text-transform: uppercase;
      }

      .pdf-content p,
      .pdf-content li {
        color: #1f2937;
        margin-top: 0;
        orphans: 3;
        widows: 3;
      }

      .pdf-content ul,
      .pdf-content ol {
        margin: 0 0 14px 22px;
        padding: 0;
      }

      .pdf-content table {
        border-collapse: collapse;
        margin: 16px 0;
        width: 100%;
      }

      .pdf-content th,
      .pdf-content td {
        border: 1px solid #cbd5e1;
        padding: 8px 9px;
        text-align: left;
        vertical-align: top;
      }

      .pdf-content th {
        background: #eef2ff;
        color: #312e81;
        font-weight: 800;
      }

      .pdf-content blockquote,
      .pdf-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-left: 4px solid #6366f1;
        border-radius: 8px;
        margin: 16px 0;
        padding: 13px 15px;
      }

      .pdf-content pre {
        background: #0f172a;
        border-radius: 8px;
        color: #e5e7eb;
        font-family: "JetBrains Mono", Consolas, monospace;
        font-size: 9pt;
        line-height: 1.55;
        margin: 16px 0;
        overflow: visible;
        padding: 14px;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .pdf-content code {
        background: #eef2ff;
        border-radius: 4px;
        color: #3730a3;
        font-family: "JetBrains Mono", Consolas, monospace;
        font-size: 0.92em;
        padding: 1px 4px;
      }

      .pdf-content pre code {
        background: transparent;
        color: inherit;
        padding: 0;
      }

      .pdf-card,
      .question-card,
      .timeline-item,
      pre,
      table,
      blockquote {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .question-card {
        border: 1px solid #dbe2f0;
        border-radius: 10px;
        margin: 16px 0;
        padding: 15px;
      }

      .question-heading {
        align-items: flex-start;
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
      }

      .question-number {
        background: #4f46e5;
        border-radius: 8px;
        color: white;
        flex: 0 0 auto;
        font-weight: 900;
        height: 28px;
        line-height: 28px;
        text-align: center;
        width: 28px;
      }

      .question-title {
        color: #0f172a;
        font-size: 13pt;
        font-weight: 900;
        line-height: 1.35;
        margin: 2px 0 0;
      }

      .section-label {
        color: #4f46e5;
        font-size: 8pt;
        font-weight: 900;
        letter-spacing: 0.12em;
        margin: 12px 0 4px;
        text-transform: uppercase;
      }

      .timeline-item {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin: 9px 0;
        padding: 11px 13px;
      }

      .pdf-footer {
        border-top: 1px solid #e2e8f0;
        color: #64748b;
        font-size: 8.5pt;
        margin-top: 26px;
        padding-top: 10px;
      }
    </style>
  </head>
  <body>
    <main class="pdf-page">
      <header class="pdf-header">
        <p class="pdf-kicker">Zynapse AI Engineering Academy</p>
        <h1 class="pdf-title">${escapeHtml(title)}</h1>
        <p class="pdf-subtitle">${escapeHtml(subtitle)}</p>
      </header>
      <article class="pdf-content">
        ${bodyHtml}
      </article>
      <footer class="pdf-footer">Generated from Zynapse for offline study.</footer>
    </main>
  </body>
</html>`;
}

function buildAiPlanPdfBody(aiPlan: AIPlanResponse, days: number) {
  const scheduleHtml = aiPlan.schedule?.length
    ? `<h2>${days}-Day Preparation Timeline</h2>
      ${aiPlan.schedule.map(dayPlan => `
        <div class="timeline-item">
          <strong>${escapeHtml(dayPlan.day)}</strong>
          <p>${escapeHtml(dayPlan.description)}</p>
        </div>
      `).join('')}`
    : '';

  const questionsHtml = aiPlan.detailedQuestions?.length
    ? `<h2>Advanced Questions (${aiPlan.detailedQuestions.length})</h2>
      ${aiPlan.detailedQuestions.map((q, index) => `
        <section class="question-card">
          <div class="question-heading">
            <div class="question-number">${index + 1}</div>
            <h3 class="question-title">${escapeHtml(q.question)}</h3>
          </div>

          <p class="section-label">Definition</p>
          <p>${escapeHtml(q.definition)}</p>

          <p class="section-label">Key Points</p>
          <ul>
            ${q.keyPoints.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
          </ul>

          <div class="pdf-card">
            <p class="section-label">Universal Real-Life Scenario</p>
            <p>${escapeHtml(q.scenario)}</p>
          </div>
        </section>
      `).join('')}`
    : '';

  return `
    <div class="pdf-card">
      <h2>Strategic Overview</h2>
      <p>${escapeHtml(aiPlan.overview)}</p>
    </div>
    ${scheduleHtml}
    ${questionsHtml}
  `;
}

async function openPdfPrintDocument(options: PdfExportOptions) {
  if (typeof document === 'undefined') return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.title = 'Zynapse PDF export';

  document.body.appendChild(iframe);

  const frameDocument = iframe.contentDocument;
  const frameWindow = iframe.contentWindow;
  if (!frameDocument || !frameWindow) {
    iframe.remove();
    throw new Error('Unable to prepare PDF document.');
  }

  const cleanup = () => {
    if (iframe.parentNode) iframe.remove();
  };

  frameWindow.addEventListener('afterprint', cleanup, { once: true });
  window.setTimeout(cleanup, 60000);

  frameDocument.open();
  frameDocument.write(buildPdfDocument(options));
  frameDocument.close();

  try {
    await frameDocument.fonts?.ready;
  } catch {
    // Printing can continue even if font loading is blocked.
  }

  await new Promise(resolve => window.setTimeout(resolve, 150));
  frameWindow.focus();
  frameWindow.print();
}

function contentCacheKey(topicId: string, language: string, difficulty: Difficulty) {
  return `zynapse_offline_v5_${topicId}_${language}_${difficulty}`;
}

function getLastInterviewQuestionNumber(markdown: string | null) {
  if (!markdown) return 0;

  const matches = markdown.matchAll(/(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*\*)?\s*(?:Q(?:uestion)?\s*)?(\d{1,4})[\).:-]\s+/gi);
  let last = 0;
  for (const match of matches) {
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > last) last = value;
  }

  return last;
}

function languageOutputPolicy(language: string) {
  const lower = language.toLowerCase();
  const roman = lower.includes('roman') || lower.includes('hinglish');

  if (roman) {
    return 'Use English alphabet / Latin letters only. Do not use Urdu, Hindi, Arabic, Chinese, Japanese, or Korean script.';
  }

  return 'Use the selected language naturally. Do not fall back to English except for technical keywords.';
}

function buildMentorContract(language: string, difficultyNote: string) {
  return `You are Zynapse, a Staff+ level Software Engineering Mentor, curriculum designer, and practical interview coach.

MISSION:
Teach so completely that the learner should not need to search another tutorial for this topic.
Your answer must be deep, practical, structured, and production-minded, while staying understandable.
Treat this as a self-contained textbook chapter plus senior mentor walkthrough, not a short blog answer.

LANGUAGE POLICY:
- Write the full lesson in: ${language}.
- ${languageOutputPolicy(language)}
- Keep important technical keywords in English too, in parentheses, when translation may reduce clarity.
- If the selected language is Hinglish/Urdu/Hindi, use natural mentor-style explanations with simple wording.
- Do not switch language randomly. Keep the whole answer consistent.

DEPTH POLICY:
${difficultyNote}

QUALITY BAR:
- Be precise. Do not give vague motivational filler.
- Explain WHY, HOW, WHEN to use it, and WHEN NOT to use it.
- Include practical examples, edge cases, mistakes, debugging tips, performance/security notes where relevant.
- Include enough prerequisite explanation that the lesson is beginner-safe, then gradually go deep.
- Prefer concrete examples over abstract definitions.
- If there are trade-offs, compare them in a table.
- If there is a workflow, show the complete workflow end-to-end.
- For programming topics, include runnable code and explain the code line-by-line.
- For tools/platforms/cloud/devops topics, include commands, config examples, workflow steps, and production best practices.
- For AI/ML topics, include intuition, math/architecture where useful, implementation examples, evaluation, and failure modes.
- For C/C++/systems topics, cover memory, compilation, undefined behavior, pointers/references, performance, and debugging where relevant.

OUTPUT STYLE:
Use clean Markdown with headings, tables, bullets, code blocks, and ASCII diagrams where helpful.
Avoid tiny shallow answers. Make it a complete mini-chapter.
Minimum depth target: cover the topic at a level suitable for serious self-study, interview preparation, and real project usage.`;
}

function findModuleForTopic(topic: any) {
  return curriculum.find(m =>
    m.title === topic?.moduleTitle ||
    m.sections.some(s => s.topics.some(t => t.id === topic?.id))
  );
}

function buildModuleContext(topic: any) {
  const moduleData = findModuleForTopic(topic);
  return moduleData
    ? moduleData.sections.map(s => `${s.title}: ${s.topics.map(t => t.title).join(', ')}`).join('\n')
    : `${topic?.sectionTitle || 'Current section'}: ${topic?.title || 'Selected topic'}`;
}

function buildOfflineLesson(topic: any, language: string, difficulty: Difficulty, reason: string) {
  if (isJavaOfflineTopic(topic)) {
    return buildJavaOfflineLesson({ topic, language, difficulty, reason });
  }

  const moduleData = findModuleForTopic(topic);
  const section = moduleData?.sections.find(s => s.topics.some(t => t.id === topic?.id));
  const nearbyTopics = section?.topics
    .filter(t => t.id !== topic?.id)
    .slice(0, 8)
    .map(t => t.title) || [];
  const moduleTitle = topic?.moduleTitle || moduleData?.title || 'Zynapse';
  const sectionTitle = topic?.sectionTitle || section?.title || 'Current section';
  const depth = difficulty === 'beginner'
    ? 'Start with definitions first, then practice tiny examples.'
    : difficulty === 'expert'
    ? 'Focus on internals, trade-offs, edge cases, and production-grade reasoning.'
    : 'Balance concepts, examples, and interview readiness.';

  return `# ${topic?.title || 'Selected Topic'}

> Offline Study Mode: AI providers are temporarily unavailable, but this topic is still usable. Reason: ${reason}

## Learning Outcomes
- Understand what **${topic?.title || 'this topic'}** means in the context of **${moduleTitle}**.
- Know the prerequisite ideas to review before going deeper.
- Practice the topic through small exercises and interview-style prompts.
- Decide what to learn next from the same module.

## Context
- Module: **${moduleTitle}**
- Section: **${sectionTitle}**
- Level: **${difficulty}**
- Study approach: ${depth}

## Core Explanation
${topic?.title || 'This topic'} is one part of the larger ${moduleTitle} path. Start by identifying:

1. The main definition: what problem this topic solves.
2. The moving parts: terms, syntax, APIs, tools, or concepts involved.
3. The workflow: how a learner uses it step by step.
4. The mistakes: what commonly breaks and how to debug it.
5. The production angle: where it matters in real projects or interviews.

## Study Checklist
| Area | What To Do |
| --- | --- |
| Definition | Write a 2-line definition in your own words. |
| Example | Build or explain one tiny example. |
| Debugging | List 3 errors a beginner might make. |
| Interview | Prepare one "why", one "how", and one "when not to use it" answer. |
| Project | Connect this topic to a small real-world feature. |

## Practice Tasks
1. Explain ${topic?.title || 'this topic'} to a beginner in 5 sentences.
2. Create one minimal code/config/example related to it.
3. Write 5 flashcards: definition, purpose, syntax/steps, common mistake, real-world use.
4. Compare this topic with one related concept from the same module.

## Interview Prompts
1. What is ${topic?.title || 'this topic'}, and why does it matter?
2. What are the prerequisites someone should know first?
3. What is a common mistake and how would you debug it?
4. How would you use this in a real project?
5. What trade-offs or limitations should a senior engineer know?

## Related Topics
${nearbyTopics.length ? nearbyTopics.map(t => `- ${t}`).join('\n') : '- Review the previous and next topics in the sidebar.'}

## Recovery
- If using Groq, wait for the TPM cooldown or switch to Gemini.
- If using Gemini, add/refresh the Gemini key in AI Provider Settings.
- If using Ollama, start Ollama locally and select an installed chat model.
- Use **Save Offline** after content loads so this topic remains available later.
`;
}

export function ContentArea({ topic, language, isComplete = false, isBookmarked = false, note = '', onToggleComplete, onToggleBookmark, onSaveNote, onNavigate, onQuizOpen }: ContentAreaProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const abortRef = useRef<boolean>(false);
  
  // Quiz states
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // AI Plan Generator states
  const [jdInput, setJdInput] = useState('');
  const [resumeInput, setResumeInput] = useState('');
  const [days, setDays] = useState<number>(3);
  const [aiPlan, setAiPlan] = useState<AIPlanResponse | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isLoadingMorePlan, setIsLoadingMorePlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [isUploadingJd, setIsUploadingJd] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [noteText, setNoteText] = useState(note);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const lessonContentRef = useRef<HTMLDivElement>(null);

  // Store the chat session to continue the conversation
  const sessionRef = useRef<any>(null);
  const isInterviewTopic = topic?.title?.toLowerCase().includes('interview');
  const isQuizTopic = topic?.title?.toLowerCase().includes('quiz');
  const isAIPlanGenerator = topic?.id === 'ai-plan-generator';

  // Flat ordered list of all learnable topics (no quiz/interview) for prev/next nav
  const flatTopics = curriculum.flatMap(m =>
    m.sections.flatMap(s =>
      s.topics.filter(t => {
        const tl = t.title.toLowerCase(), il = t.id.toLowerCase();
        return !tl.includes('interview') && !il.includes('interview') &&
               !tl.includes('quiz') && !il.includes('quiz') &&
               !tl.includes('q&a') && !tl.includes('faq');
      }).map(t => ({ ...t, moduleId: m.id, moduleTitle: m.title }))
    )
  );
  const currentIdx = topic ? flatTopics.findIndex(t => t.id === topic.id) : -1;
  const prevTopic = currentIdx > 0 ? flatTopics[currentIdx - 1] : null;
  const nextTopic = currentIdx >= 0 && currentIdx < flatTopics.length - 1 ? flatTopics[currentIdx + 1] : null;

  useEffect(() => {
    // Reset states on topic change
    setQuizData(null);
    setEvaluation(null);
    setIsEvaluating(false);
    setAiPlan(null);
    setJdInput('');
    setPlanError(null);
    setIsSaved(false);
    setIsNotesOpen(false);
    setNoteText(note);

    if (!topic) {
      setContent(null);
      sessionRef.current = null;
      return;
    }

    if (isAIPlanGenerator) {
      const savedPlan = localStorage.getItem(`zynapse_offline_ai_plan`);
      if (savedPlan) {
        try {
          setAiPlan(JSON.parse(savedPlan));
          setIsSaved(true);
        } catch (e) {
          console.error("Failed to parse saved plan");
        }
      }
      setIsLoading(false);
      sessionRef.current = null;
      return;
    }

    if (topic.content) {
      setContent(topic.content);
      setIsLoading(false);
      sessionRef.current = null;
      return;
    }

    // Check if offline content exists
    const cacheKey = contentCacheKey(topic.id, language, difficulty);
    const savedContent = localStorage.getItem(cacheKey);
    if (savedContent) {
      setContent(savedContent);
      setIsSaved(true);
      setIsLoading(false);
      sessionRef.current = createChatSession(language); // Still init session for follow up
      return;
    }

    // Kick off lazy load of scraped Java content in background (no-await)
    if (isJavaOfflineTopic(topic)) preloadJavaScrapedContent();

    // Dynamic fetch with streaming
    let isMounted = true;
    abortRef.current = false;

    const fetchContent = async () => {
      setIsLoading(true);
      setContent(null);
      try {
        const session = createChatSession(language);
        sessionRef.current = session;
        const moduleContext = buildModuleContext(topic);

        const difficultyNote =
          difficulty === 'beginner'
            ? 'Beginner mode: assume zero prior knowledge. Start from prerequisites, use simple analogies, define every key term, and keep code examples small before expanding.'
            : difficulty === 'expert'
            ? 'Expert mode: include internals, trade-offs, failure modes, performance, security, production architecture, advanced patterns, and expert-level interview depth.'
            : 'Standard mode: balanced depth for an intermediate learner. Explain foundations clearly, then move into practical production usage.';
        const mentorContract = buildMentorContract(language, difficultyNote);

        let prompt = '';
        if (isQuizTopic) {
          const moduleData = curriculum.find(m => m.title === topic.moduleTitle || m.sections.some(s => s.topics.some(t => t.id === topic.id)));
          const allTopicsContext = moduleData 
            ? moduleData.sections.flatMap(s => s.topics.map(t => t.title)).join(', ') 
            : topic.title;

          prompt = `The user wants to take a quiz for the module: "${topic.moduleTitle}".
          The difficulty level is: "${topic.title}".
          
${mentorContract}

CRITICAL INSTRUCTION: You MUST return ONLY valid JSON. No markdown formatting, no backticks, no explanations. Just the raw JSON object.

Generate a quiz with exactly 50 questions (to ensure stable JSON generation).
Mix Multiple Choice Questions (MCQs) and short programming/logic questions.
The quiz must test understanding, practical application, edge cases, debugging, and interview-level reasoning.

Base the questions on these topics:
[ ${allTopicsContext} ]

The JSON structure MUST exactly match this format:
{
  "title": "${topic.title}",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "What is the size of int in Java?",
      "options": ["2 bytes", "4 bytes", "8 bytes", "Depends on OS"]
    },
    {
      "id": "q2",
      "type": "coding",
      "question": "Write a Java program to print 'Hello World'."
    }
  ]
}

Ensure the "type" is strictly either "mcq" or "coding". For "mcq", provide exactly 4 "options".
Generate the quiz questions in ${language}.`;
        } else if (isInterviewTopic) {
          // Find all topics in the current module to give context to the AI
          const moduleData = curriculum.find(m => m.title === topic.moduleTitle || m.sections.some(s => s.topics.some(t => t.id === topic.id)));
          const allTopicsContext = moduleData 
            ? moduleData.sections.flatMap(s => s.topics.map(t => t.title)).join(', ') 
            : topic.title;

          prompt = `The user has requested a comprehensive list of interview questions for the topic: "${topic.title}".
          
${mentorContract}

CRITICAL INSTRUCTION: Quality and explanation depth are more important than just volume.
1. Each answer MUST be detailed enough that the learner understands the concept, not just memorizes it.
2. For every answer, include: direct answer, why it matters, practical example, and common mistake when relevant.
3. Use code snippets, diagrams, or real-world architecture examples where applicable.
4. Generate the FIRST BATCH of 30 high-quality, detailed questions in this response. We will ask for more later.
5. Number the questions sequentially starting from 1.

Base these questions on the following topics covered in this module:
[ ${allTopicsContext} ]

Structure the output clearly:
# ${topic.title} - Detailed Interview Q&A 🚀

Divide the questions into categories as you progress:
## 🟢 BEGINNER LEVEL (Core Concepts)
## 🟡 INTERMEDIATE LEVEL (Practical Application)
## 🔴 ADVANCED LEVEL (Architecture & Performance)
## 🧠 SCENARIO-BASED (Real-world problems)
## ⚠️ TRICKY QUESTIONS (Common traps)

Start generating the numbered list now with detailed explanations in ${language}.`;
        } else if (topic.moduleTitle?.includes('DSA')) {
          prompt = `The user wants to learn the DSA problem/topic: "${topic.title}" from the "${topic.sectionTitle}" section.
          
${mentorContract}

CRITICAL INSTRUCTION: Explain the logic properly. Show the step-by-step execution flow. Explain WHY this approach is used.
Module context:
${moduleContext}

Follow this strict structure:
# ${topic.title} 🚀
## 1. Prerequisites
What concepts must the learner know first?
## 2. Problem Statement
Explain the problem in plain language, with input/output examples.
## 3. Brute Force Intuition
Show the simplest possible approach and why it is inefficient.
## 4. Optimal Intuition
Explain the key insight that makes the optimal solution work.
## 5. Data Structure / Algorithm Choice
Why this approach? When would another approach be better?
## 6. Step-by-Step Dry Run
Use a small example and show every important state change.
## 7. Production-Quality Code
Provide clean code. Prefer C++ and JavaScript/TypeScript for DSA unless the topic/module clearly implies another language.
## 8. Line-by-Line Code Explanation
Explain how the code flows.
## 9. Complexity Analysis
Time, space, and why.
## 10. Edge Cases & Common Mistakes
Include off-by-one, overflow, empty input, duplicate values, recursion depth, memory concerns, etc. when relevant.
## 11. Interview Follow-ups
List variations and how to adapt the solution.
## 12. Practice Tasks
Give 3 exercises from easy to hard.`;
        } else {
          prompt = `Generate a comprehensive tutorial for the topic: "${topic.title}" from the "${topic.sectionTitle}" section in the "${topic.moduleTitle}" module.

${mentorContract}

Module context:
${moduleContext}

The current topic is "${topic.title}". Teach it in context of the surrounding module, but do not drift away from the selected topic.

Generate a complete, detailed tutorial with this exact structure:

# ${topic.title}

## 1. Learning Outcomes
List exactly what the learner will be able to do after this lesson.

## 2. Prerequisites
Explain required background. If none, say "No strict prerequisite".

## 3. Why This Topic Matters
Real-world context, where it is used, and why professionals care.

## 4. Mental Model
Explain the concept with an analogy and, if useful, an ASCII diagram.

## 5. Core Concepts Deep Dive
Break the topic into sub-concepts. Define key terms clearly.

## 6. How It Works Internally
Explain mechanics, runtime behavior, architecture, protocol flow, memory behavior, or lifecycle depending on the topic.

## 7. Practical Examples
Give realistic examples. For coding topics include runnable code blocks.
For C/C++ topics include compilation commands and mention common compiler/runtime issues.
For DevOps/cloud topics include CLI/config examples.
For AI/ML topics include data flow, model/evaluation notes, and failure modes.

## 8. Code / Configuration Explanation
Explain important lines, settings, or steps.

## 9. Common Mistakes and Debugging
Show symptoms, cause, and fix.

## 10. Best Practices
Production-grade advice, naming, structure, security, performance, maintainability.

## 11. Performance / Security / Scalability Notes
Include only relevant points, but be concrete.

## 12. Mini Project or Real Scenario
Give one practical task that applies this topic.

## 13. Interview Questions and Answers
Give 8 interview questions with strong answers: 3 beginner, 3 intermediate, 2 advanced.

## 14. Quick Recap / Cheat Sheet
Compact table of key takeaways.

## 15. What To Learn Next
Suggest next topics from the same module or adjacent skills.

FINAL SELF-CHECK BEFORE ANSWERING:
- Did you define all important terms?
- Did you explain the practical reason this topic exists?
- Did you include examples/code/config where relevant?
- Did you include mistakes, debugging, and best practices?
- Did you include interview preparation?
- Did you keep the whole lesson in ${language}?

Make the lesson comprehensive enough to replace a normal tutorial page.`;
        }

        // Quiz topics still use non-streaming (need full JSON at once)
        if (isQuizTopic) {
          const result = await session.sendMessage({ message: prompt });
          if (isMounted) {
            try {
              const text = result.text;
              const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
              const jsonString = jsonMatch ? jsonMatch[1] : text;
              const parsedData = JSON.parse(jsonString);
              setQuizData(parsedData);
            } catch (e) {
              console.error("Failed to parse quiz JSON:", e, result.text);
              setContent("# ⚠️ Error\nFailed to generate quiz. Please try again.");
            }
          }
        } else {
          // All other topics: use streaming
          setIsLoading(false);
          setIsStreaming(true);
          let accumulated = '';
          const messages = [
            { role: 'user', content: prompt },
          ];
          for await (const chunk of streamContent(messages)) {
            if (!isMounted || abortRef.current) break;
            accumulated += chunk;
            setContent(accumulated);
          }
          if (isMounted && !abortRef.current) {
            setIsStreaming(false);
          }
        }
      } catch (error) {
        console.error("Failed to generate content:", error);
        if (isMounted) {
          const detail = error instanceof Error ? error.message : "Unknown provider error";
          if (isJavaOfflineTopic(topic)) await preloadJavaScrapedContent();
          setContent(buildOfflineLesson(topic, language, difficulty, detail));
          setIsSaved(false);
          setIsStreaming(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsStreaming(false);
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [topic, language, difficulty]);

  const saveOffline = () => {
    if (!topic) return;
    if (isAIPlanGenerator && aiPlan) {
      localStorage.setItem(`zynapse_offline_ai_plan`, JSON.stringify(aiPlan));
      setIsSaved(true);
    } else if (content) {
      localStorage.setItem(contentCacheKey(topic.id, language, difficulty), content);
      setIsSaved(true);
    }
  };

  const handleDownloadPDF = async () => {
    if (!topic || isExportingPdf) return;

    const title = isAIPlanGenerator && aiPlan ? aiPlan.planTitle : topic.title;
    const subtitle = isAIPlanGenerator
      ? `AI generated interview plan - ${days}-day timeline`
      : `${topic.moduleTitle || 'Zynapse'} / ${topic.sectionTitle || 'Generated lesson'} - ${language} - ${difficulty}`;

    let bodyHtml = '';
    if (isAIPlanGenerator && aiPlan) {
      bodyHtml = buildAiPlanPdfBody(aiPlan, days);
    } else if (lessonContentRef.current) {
      bodyHtml = lessonContentRef.current.innerHTML;
    } else if (content) {
      bodyHtml = `<pre>${escapeHtml(content)}</pre>`;
    }

    if (!bodyHtml.trim()) return;

    setIsExportingPdf(true);
    try {
      await openPdfPrintDocument({ title, subtitle, bodyHtml });
    } catch (error) {
      console.error('Failed to prepare PDF export:', error);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const parseFileToText = async (file: File): Promise<string> => {
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (fileType === 'txt') {
      return await file.text();
    } else if (fileType === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text;
    } else if (fileType === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      throw new Error("Unsupported file type. Please upload .txt, .pdf, or .docx");
    }
  };

  const handleJdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingJd(true);
    setPlanError(null);
    try {
      const text = await parseFileToText(file);
      setJdInput((prev) => prev ? prev + '\n\n' + text : text);
    } catch (err: any) {
      setPlanError(err.message || 'Error processing JD file.');
    } finally {
      setIsUploadingJd(false);
      e.target.value = ''; // Reset
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingResume(true);
    setPlanError(null);
    try {
      const text = await parseFileToText(file);
      setResumeInput((prev) => prev ? prev + '\n\n' + text : text);
    } catch (err: any) {
      setPlanError(err.message || 'Error processing Resume file.');
    } finally {
      setIsUploadingResume(false);
      e.target.value = ''; // Reset
    }
  };

  const loadMoreAIPlanQuestions = async () => {
    if (!aiPlan || isLoadingMorePlan) return;
    
    setIsLoadingMorePlan(true);
    try {
      const moreQs = await loadMorePlanQuestions(jdInput, resumeInput, days, aiPlan.detailedQuestions.length, language);
      if (moreQs && moreQs.length > 0) {
        const newPlan = { ...aiPlan, detailedQuestions: [...aiPlan.detailedQuestions, ...moreQs] };
        setAiPlan(newPlan);
        if (isSaved) {
          localStorage.setItem(`zynapse_offline_ai_plan`, JSON.stringify(newPlan));
        }
      } else {
        alert("No more advanced questions available for this configuration.");
      }
    } catch (error) {
      console.error("Failed to load more plan questions", error);
      alert("Failed to load more questions. Please try again.");
    } finally {
      setIsLoadingMorePlan(false);
    }
  };

  const loadMoreQuestions = async () => {
    if (!sessionRef.current || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const lastQuestionNumber = getLastInterviewQuestionNumber(content);
      const nextStart = lastQuestionNumber + 1;
      const batchSize = 50;
      const nextEnd = nextStart + batchSize - 1;
      const prompt = `Great job! Now generate exactly ${batchSize} more high-quality interview questions.
      
NUMBERING RULES:
- The first new question MUST start with ${nextStart}.
- The last new question MUST be ${nextEnd}.
- Do not jump numbers. Do not restart from 1. Do not skip any number.
- Use top-level numbered question headings like: ${nextStart}. Question text

Maintain the same high quality: direct answer, why it matters, practical example, common trap, and code snippet where relevant.
Do not repeat previous questions. Explain in ${language}.
${languageOutputPolicy(language)}`;
      
      const result = await sessionRef.current.sendMessage({ message: prompt });
      const newContent = content ? `${content}\n\n${result.text}` : result.text;
      setContent(newContent);
      if (isSaved) {
        localStorage.setItem(contentCacheKey(topic.id, language, difficulty), newContent);
      }
    } catch (error) {
      console.error("Failed to load more questions:", error);
      alert("Failed to load more questions. Please try again later.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!jdInput.trim() || isGeneratingPlan) return;
    
    setIsGeneratingPlan(true);
    setPlanError(null);
    try {
      const plan = await generateInterviewPlan(jdInput, resumeInput, days, language);
      setAiPlan(plan);
    } catch (error) {
      console.error("Failed to generate AI plan:", error);
      setPlanError("Failed to generate AI plan. Please try again later.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const submitQuizAnswers = async (answers: Record<string, string>) => {
    if (!sessionRef.current || isEvaluating || Object.keys(answers).length === 0) return;
    
    setIsEvaluating(true);
    try {
      const formattedAnswers = Object.entries(answers)
        .map(([qId, answer]) => `Question ID: ${qId}\nAnswer: ${answer}`)
        .join('\n\n');

      const prompt = `Here are the user's answers for the quiz you just generated:

${formattedAnswers}

Please evaluate these answers. 
1. Provide a final score out of ${quizData?.questions.length || 50}.
2. Give brief, constructive feedback on incorrect answers.
3. Keep the tone encouraging, like a supportive Zynapse AI Mentor speaking in Hinglish.
Format the output clearly in Markdown.`;
      
      const result = await sessionRef.current.sendMessage({ message: prompt });
      setEvaluation(result.text);
    } catch (error) {
      console.error("Failed to evaluate answers:", error);
      alert("Bhai, answers evaluate karne mein error aa gaya. Thodi der baad try kar.");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!topic) {
    const features = [
      { icon: BookOpen,      color: '#6366f1', label: '36 Modules',           desc: 'Full-stack, AI, DevOps, System Design & more' },
      { icon: BrainCircuit,  color: '#22d3ee', label: 'AI-Powered Content',   desc: 'Streaming explanations tailored to your level' },
      { icon: Sparkles,      color: '#f59e0b', label: 'Interview & Quiz Hubs', desc: '50-question quizzes + curated Q&A per topic' },
      { icon: Terminal,      color: '#34d399', label: 'Online Compiler',       desc: '32 languages — JDoodle & Piston powered' },
    ];
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.09) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-2xl w-full text-center">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 border border-indigo-500/25"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(79,70,229,0.15))', boxShadow: '0 0 48px rgba(99,102,241,0.22), 0 0 0 1px rgba(99,102,241,0.1)' }}>
            <Terminal className="w-9 h-9" style={{ color: 'var(--primary)' }} />
          </div>

          <h1 className="text-5xl font-black mb-2 tracking-tight" style={{ color: 'var(--text)' }}>
            Zynapse
          </h1>
          <p className="text-base mb-1 font-medium" style={{ color: 'var(--primary-light)' }}>AI Engineering Academy</p>
          <p className="mb-10 text-sm" style={{ color: 'var(--text-muted)' }}>
            Pick any topic from the sidebar — or press <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>Ctrl+K</kbd> to search
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map(({ icon: Icon, color, label, desc }) => (
              <div key={label}
                className="flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:scale-[1.02]"
                style={{ background: 'var(--bg-surface)', borderColor: `${color}28`, boxShadow: 'var(--card-shadow)' }}>
                <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${color}18` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{label}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
            Master AI, Cloud, System Design, and more — with a personal AI mentor beside you
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      key={topic.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 overflow-y-auto bg-transparent p-8 lg:p-12 relative transition-colors duration-300 z-10"
    >
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8 flex flex-col gap-4">
          {/* Breadcrumb + difficulty + actions row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-black text-indigo-400 uppercase tracking-widest">
              {topic.moduleTitle} <span className="text-indigo-500/50">/</span> {topic.sectionTitle}
            </div>

            {/* Difficulty selector — only for regular topics */}
            {!isAIPlanGenerator && !isQuizTopic && (
              <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                {(['beginner', 'standard', 'expert'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                    style={difficulty === d ? {
                      background: 'var(--primary)',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                    } : { color: 'var(--text-muted)' }}
                  >
                    {d === 'beginner' ? '🧒 Beginner' : d === 'standard' ? '🎓 Standard' : '🔬 Expert'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Streaming stop button + actions */}
          <div className="flex items-center justify-between gap-3">
            {/* Stop streaming */}
            {isStreaming && (
              <button
                onClick={() => { abortRef.current = true; setIsStreaming(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-all"
              >
                <Square className="w-3 h-3 fill-current" /> Stop generating
              </button>
            )}

          {content && !isAIPlanGenerator && !isStreaming && (
            <div className="flex items-center gap-2 no-print flex-wrap">
              {onToggleComplete && !isQuizTopic && !isInterviewTopic && (
                <button
                  onClick={onToggleComplete}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 border ${
                    isComplete
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10'
                  }`}
                >
                  {isComplete ? <Trophy className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isComplete ? 'Completed!' : 'Mark Complete'}
                </button>
              )}

              {/* Bookmark */}
              {onToggleBookmark && !isQuizTopic && !isInterviewTopic && (
                <button
                  onClick={onToggleBookmark}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark this topic'}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 border ${
                    isBookmarked
                      ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-yellow-400 hover:border-yellow-500/30 hover:bg-yellow-500/10'
                  }`}
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              )}

              {/* Notes */}
              {onSaveNote && !isQuizTopic && (
                <button
                  onClick={() => setIsNotesOpen(o => !o)}
                  title="Topic notes"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 border ${
                    isNotesOpen || noteText.trim()
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10'
                  }`}
                >
                  <StickyNote className="w-4 h-4" />
                  {noteText.trim() ? 'Notes ●' : 'Notes'}
                </button>
              )}
              <button
                onClick={handleDownloadPDF}
                disabled={isExportingPdf}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 active:scale-95 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isExportingPdf ? 'Preparing PDF...' : 'Download PDF'}
              </button>
              <button
                onClick={saveOffline}
                disabled={isSaved}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isSaved 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 active:scale-95 cursor-pointer outline-none'
                }`}
              >
                {isSaved ? <FileCheck2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                {isSaved ? 'Saved Offline' : 'Save Offline'}
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Notes panel */}
        {isNotesOpen && onSaveNote && (
          <div className="mb-6 rounded-xl border border-violet-500/20 overflow-hidden"
            style={{ background: 'rgba(139,92,246,0.05)' }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-violet-500/15">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-400">
                <StickyNote className="w-3.5 h-3.5" />
                My Notes — {topic.title}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { onSaveNote(noteText); }}
                  className="px-3 py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 text-xs font-semibold transition-colors"
                >
                  Save
                </button>
                <button onClick={() => setIsNotesOpen(false)}
                  className="p-1 rounded text-zinc-600 hover:text-zinc-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onBlur={() => onSaveNote(noteText)}
              placeholder="Write your notes here… supports plain text or markdown."
              rows={6}
              className="w-full px-4 py-3 bg-transparent text-sm text-zinc-300 placeholder-zinc-700 resize-y focus:outline-none font-mono leading-relaxed"
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin relative z-10" />
            </div>
            <p className="text-zinc-500 text-sm font-semibold tracking-widest uppercase animate-pulse">
              Zynapse is generating content...
            </p>
          </div>
        ) : isAIPlanGenerator ? (
          <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="w-24 h-24 text-indigo-500" />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                  AI Interview Plan Generator
                </h2>
                <p className="text-slate-600 dark:text-zinc-400 mb-6 leading-relaxed">
                  Ready for Beast Mode? 🚀 Paste your JD, Optional Resume, and select your timeline. Zynapse will generate highly advanced, universal real-world problems. (Language: {language})
                </p>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300">Job Description (JD) <span className="text-red-500">*</span></label>
                      <label className="cursor-pointer flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 active:scale-95 transition-all">
                        {isUploadingJd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploadingJd ? 'Extracting...' : 'Upload File (PDF/DOCX/TXT)'}
                        <input type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={handleJdUpload} disabled={isUploadingJd} />
                      </label>
                    </div>
                    <textarea
                      value={jdInput}
                      onChange={(e) => setJdInput(e.target.value)}
                      placeholder="Paste the Job Description (JD) here or upload a file..."
                      className="w-full h-32 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none font-mono text-sm shadow-inner"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300">Resume (Optional)</label>
                      <label className="cursor-pointer flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20 active:scale-95 transition-all">
                        {isUploadingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploadingResume ? 'Extracting...' : 'Upload File (PDF/DOCX/TXT)'}
                        <input type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={handleResumeUpload} disabled={isUploadingResume} />
                      </label>
                    </div>
                    <textarea
                      value={resumeInput}
                      onChange={(e) => setResumeInput(e.target.value)}
                      placeholder="Paste your Resume here to strictly align questions with your existing experience or upload your resume file..."
                      className="w-full h-32 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none font-mono text-sm shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-3">Time Until Interview</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { v: 3, l: '3 Days', d: '~50 Qs target' },
                        { v: 7, l: '7 Days', d: '~150 Qs target' },
                        { v: 15, l: '15 Days', d: '~400 Qs target' },
                        { v: 30, l: '1 Month', d: '1000+ Qs target' }
                      ].map(opt => (
                        <button
                          key={opt.v}
                          onClick={() => setDays(opt.v)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            days === opt.v 
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-[1.02]' 
                              : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="font-black text-lg">{opt.l}</div>
                          <div className="text-xs font-bold opacity-70 tracking-wider uppercase mt-1">{opt.d}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGeneratePlan}
                  disabled={!jdInput.trim() || isGeneratingPlan}
                  className="mt-6 w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.4)] active:scale-[0.98]"
                >
                  {isGeneratingPlan ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing JD & Thinking Advanced...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Generate Advanced Plan
                    </>
                  )}
                </button>
                {planError && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {planError}
                  </div>
                )}
              </div>
            </div>

            {aiPlan && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 pb-12"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{aiPlan.planTitle}</h1>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-sm">AI Generated Advanced Strategy</p>
                </div>

                <div className="bg-indigo-600/5 dark:bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-8 relative">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Strategic Overview
                    </h3>
                    <button
                      onClick={saveOffline}
                      disabled={isSaved}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        isSaved 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default'
                        : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md active:scale-95 cursor-pointer'
                      }`}
                    >
                      {isSaved ? <FileCheck2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      {isSaved ? 'Saved Offline' : 'Save Offline'}
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-zinc-300 leading-relaxed italic">
                    "{aiPlan.overview}"
                  </p>
                </div>

                {aiPlan.schedule && aiPlan.schedule.length > 0 && (
                  <div className="bg-slate-900 dark:bg-zinc-800 rounded-3xl p-10 text-white border border-slate-800 dark:border-white/10 shadow-2xl relative overflow-hidden break-inside-avoid">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                      <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                        <CalendarDays className="w-6 h-6 text-indigo-400 dark:text-indigo-500" />
                        {days}-Day Preparation Timeline
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {aiPlan.schedule.map((dayPlan, dIdx) => (
                          <div key={dIdx} className="bg-black/30 rounded-2xl p-5 border border-white/5 flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center font-black text-white shrink-0 shadow-lg shadow-indigo-500/20 text-sm">
                              {dayPlan.day}
                            </div>
                            <div>
                              <p className="text-slate-300 text-sm font-medium leading-relaxed">{dayPlan.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {aiPlan.detailedQuestions && aiPlan.detailedQuestions.length > 0 && (
                  <div className="space-y-6 pt-8">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Advanced Questions ({aiPlan.detailedQuestions.length} generated so far)
                      </h2>
                      
                      <button
                        onClick={handleDownloadPDF}
                        disabled={isExportingPdf}
                        className="no-print flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isExportingPdf ? 'Preparing PDF...' : 'Download PDF'}
                      </button>
                    </div>

                    <div className="grid gap-6">
                      {aiPlan.detailedQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:border-indigo-500/30 transition-all shadow-sm break-inside-avoid">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-black text-lg shrink-0">
                              {qIdx + 1}
                            </div>
                            <div className="flex-1 space-y-6">
                              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                                {q.question}
                              </h3>
                              
                              <div>
                                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Definition</h4>
                                <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">{q.definition}</p>
                              </div>

                              <div className="pl-4 border-l-2 border-indigo-500/20">
                                <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Key Points</h4>
                                <ul className="space-y-1">
                                  {q.keyPoints.map((kp, kIdx) => (
                                    <li key={kIdx} className="text-sm font-medium text-slate-600 dark:text-zinc-400 flex items-start gap-2">
                                      <span className="text-indigo-500 mt-1">•</span> {kp}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-6 border border-slate-200 dark:border-white/5 pt-5 pb-5 mt-4 group">
                                <h4 className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3">
                                  <AlertCircle className="w-4 h-4" /> Universal Real-Life Scenario
                                </h4>
                                <p className="text-slate-800 dark:text-zinc-200 font-medium italic text-sm leading-relaxed">
                                  {q.scenario}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-16 flex justify-center no-print">
                      <button
                        onClick={loadMoreAIPlanQuestions}
                        disabled={isLoadingMorePlan}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                      >
                        {isLoadingMorePlan ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                            Loading Beast Mode Questions...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            Load Next 30 Advanced Questions
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <>
            {isQuizTopic && quizData ? (
              <QuizUI 
                quizData={quizData} 
                onSubmit={submitQuizAnswers} 
                isEvaluating={isEvaluating} 
                evaluationResult={evaluation} 
                onRetake={() => {
                  setQuizData(null);
                  setEvaluation(null);
                  // Re-trigger fetch by clearing content
                  setContent(null);
                }} 
              />
            ) : (
              !isQuizTopic && (
                <div ref={lessonContentRef} className={`markdown-body ${isStreaming ? 'stream-cursor' : ''}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || ''}
                  </ReactMarkdown>
                </div>
              )
            )}
            
            {isInterviewTopic && !topic.content && (
              <div className="mt-16 flex justify-center">
                <button
                  onClick={loadMoreQuestions}
                  disabled={isLoadingMore}
                  className="flex items-center gap-3 px-8 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg dark:shadow-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                      Generating More Questions...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Load Next 50 Questions
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Prev / Next topic navigation */}
        {onNavigate && (prevTopic || nextTopic) && (
          <div className="mt-16 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
            {prevTopic ? (
              <button
                onClick={() => onNavigate(prevTopic.id)}
                className="group flex flex-col gap-1 px-4 py-3 rounded-xl border text-left transition-all hover:bg-white/5 hover:border-white/15"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-indigo-400 transition-colors">
                  <ChevronLeft className="w-3 h-3" /> Previous
                </span>
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">
                  {prevTopic.title}
                </span>
                <span className="text-[10px] text-zinc-700">{prevTopic.moduleTitle}</span>
              </button>
            ) : <div />}
            {nextTopic ? (
              <button
                onClick={() => onNavigate(nextTopic.id)}
                className="group flex flex-col gap-1 px-4 py-3 rounded-xl border text-right transition-all hover:bg-white/5 hover:border-white/15 items-end"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-indigo-400 transition-colors">
                  Next <ChevronRight className="w-3 h-3" />
                </span>
                <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors truncate w-full text-right">
                  {nextTopic.title}
                </span>
                <span className="text-[10px] text-zinc-700">{nextTopic.moduleTitle}</span>
              </button>
            ) : <div />}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 flex justify-between items-center text-xs font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest">
          <p>Zynapse Advanced Curriculum</p>
          <p>Senior Engineer Track</p>
        </div>
      </div>
    </motion.div>
  );
}
