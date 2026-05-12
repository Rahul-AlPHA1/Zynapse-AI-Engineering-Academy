import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  AlertTriangle,
  BookOpen,
  Bot,
  CheckCircle2,
  Filter,
  GitBranch,
  Layers,
  Loader2,
  RefreshCw,
  Route as RouteIcon,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { streamContent } from '../services/geminiService';
import { cn } from '../lib/utils';

type Category = 'foundations' | 'frontend' | 'backend' | 'systems' | 'database' | 'infrastructure' | 'ai' | 'career';
type Level = 'beginner' | 'intermediate' | 'advanced';
type RoadmapMode = 'ai' | 'full';

type ModuleNodeData = {
  moduleId: string;
  title: string;
  category: Category;
  topicCount: number;
  level: Level;
  onClick: (id: string) => void;
  [key: string]: unknown;
};

type AINodeData = {
  title: string;
  description: string;
  category: Category;
  level: Level;
  moduleId?: string;
  duration?: string;
  onClick: (moduleId?: string) => void;
  [key: string]: unknown;
};

type ModuleFlowNode = Node<ModuleNodeData, 'moduleNode'>;
type AIFlowNode = Node<AINodeData, 'aiPathNode'>;

interface AIPathResponse {
  title: string;
  summary: string;
  nodes: Array<{
    id: string;
    title: string;
    description?: string;
    category?: Category;
    level?: Level;
    moduleId?: string;
    duration?: string;
  }>;
  edges: Array<{ source: string; target: string }>;
}

const CAT_STYLE: Record<Category, { color: string; bg: string; border: string; label: string }> = {
  foundations:    { color: '#6366f1', bg: 'rgba(99,102,241,0.14)',  border: 'rgba(99,102,241,0.38)',  label: 'Foundations' },
  frontend:       { color: '#059669', bg: 'rgba(16,185,129,0.13)',  border: 'rgba(16,185,129,0.35)',  label: 'Frontend' },
  backend:        { color: '#2563eb', bg: 'rgba(59,130,246,0.13)',  border: 'rgba(59,130,246,0.35)',  label: 'Backend' },
  systems:        { color: '#d97706', bg: 'rgba(245,158,11,0.13)',  border: 'rgba(245,158,11,0.35)',  label: 'Systems' },
  database:       { color: '#7c3aed', bg: 'rgba(139,92,246,0.13)',  border: 'rgba(139,92,246,0.35)',  label: 'Data' },
  infrastructure: { color: '#0284c7', bg: 'rgba(14,165,233,0.13)',  border: 'rgba(14,165,233,0.35)',  label: 'Infra' },
  ai:             { color: '#c026d3', bg: 'rgba(217,70,239,0.13)',  border: 'rgba(217,70,239,0.35)',  label: 'AI' },
  career:         { color: '#ea580c', bg: 'rgba(249,115,22,0.13)',  border: 'rgba(249,115,22,0.35)',  label: 'Career' },
};

const LEVEL_DOT: Record<Level, string> = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

const MODULE_META: Record<string, { category: Category; level: Level }> = {
  'web-tech':              { category: 'foundations',    level: 'beginner' },
  'javascript-mastery':    { category: 'foundations',    level: 'beginner' },
  'python-mastery':        { category: 'foundations',    level: 'beginner' },
  'typescript-mastery':    { category: 'foundations',    level: 'intermediate' },
  'linux-mastery':         { category: 'foundations',    level: 'beginner' },
  'dsa-mastery':           { category: 'foundations',    level: 'intermediate' },
  'react-mastery':         { category: 'frontend',       level: 'intermediate' },
  'angular-mastery':       { category: 'frontend',       level: 'intermediate' },
  'vue-mastery':           { category: 'frontend',       level: 'intermediate' },
  'nextjs-mastery':        { category: 'frontend',       level: 'advanced' },
  'nodejs-mastery':        { category: 'backend',        level: 'intermediate' },
  'java-mastery':          { category: 'backend',        level: 'intermediate' },
  'spring-boot-mastery':   { category: 'backend',        level: 'advanced' },
  'microservices-mastery': { category: 'backend',        level: 'advanced' },
  'php-mastery':           { category: 'backend',        level: 'beginner' },
  'python-web':            { category: 'backend',        level: 'intermediate' },
  'csharp-mastery':        { category: 'backend',        level: 'intermediate' },
  'rest-api-design':       { category: 'backend',        level: 'intermediate' },
  'go-mastery':            { category: 'systems',        level: 'intermediate' },
  'rust-mastery':          { category: 'systems',        level: 'advanced' },
  'cpp-mastery':           { category: 'systems',        level: 'intermediate' },
  'kotlin-mastery':        { category: 'systems',        level: 'intermediate' },
  'flutter-mastery':       { category: 'systems',        level: 'intermediate' },
  'postgres-sql-mastery':  { category: 'database',       level: 'intermediate' },
  'rag-mastery':           { category: 'database',       level: 'advanced' },
  'docker-advanced':       { category: 'infrastructure', level: 'intermediate' },
  'aws-advanced':          { category: 'infrastructure', level: 'advanced' },
  'devops-mastery':        { category: 'infrastructure', level: 'advanced' },
  'cybersecurity':         { category: 'infrastructure', level: 'advanced' },
  'ml-mastery':            { category: 'ai',             level: 'advanced' },
  'prompt-engineering':    { category: 'ai',             level: 'intermediate' },
  'agentic-ai':            { category: 'ai',             level: 'advanced' },
  'blockchain-mastery':    { category: 'ai',             level: 'advanced' },
  'system-design':         { category: 'career',         level: 'advanced' },
  'software-testing':      { category: 'career',         level: 'intermediate' },
  'interview-crack-plan':  { category: 'career',         level: 'beginner' },
};

const EDGES_DEF: { source: string; target: string }[] = [
  { source: 'web-tech', target: 'javascript-mastery' },
  { source: 'javascript-mastery', target: 'typescript-mastery' },
  { source: 'javascript-mastery', target: 'react-mastery' },
  { source: 'javascript-mastery', target: 'nodejs-mastery' },
  { source: 'typescript-mastery', target: 'react-mastery' },
  { source: 'typescript-mastery', target: 'nextjs-mastery' },
  { source: 'react-mastery', target: 'nextjs-mastery' },
  { source: 'javascript-mastery', target: 'vue-mastery' },
  { source: 'javascript-mastery', target: 'angular-mastery' },
  { source: 'nodejs-mastery', target: 'rest-api-design' },
  { source: 'nodejs-mastery', target: 'postgres-sql-mastery' },
  { source: 'python-mastery', target: 'python-web' },
  { source: 'python-mastery', target: 'dsa-mastery' },
  { source: 'python-mastery', target: 'ml-mastery' },
  { source: 'java-mastery', target: 'spring-boot-mastery' },
  { source: 'spring-boot-mastery', target: 'microservices-mastery' },
  { source: 'microservices-mastery', target: 'docker-advanced' },
  { source: 'docker-advanced', target: 'aws-advanced' },
  { source: 'docker-advanced', target: 'devops-mastery' },
  { source: 'linux-mastery', target: 'docker-advanced' },
  { source: 'linux-mastery', target: 'cybersecurity' },
  { source: 'ml-mastery', target: 'prompt-engineering' },
  { source: 'prompt-engineering', target: 'agentic-ai' },
  { source: 'ml-mastery', target: 'rag-mastery' },
  { source: 'postgres-sql-mastery', target: 'rag-mastery' },
  { source: 'cpp-mastery', target: 'go-mastery' },
  { source: 'cpp-mastery', target: 'rust-mastery' },
  { source: 'dsa-mastery', target: 'system-design' },
  { source: 'system-design', target: 'interview-crack-plan' },
  { source: 'software-testing', target: 'interview-crack-plan' },
];

const TRACKS: { label: string; modules: string[] }[] = [
  { label: 'Foundations', modules: ['web-tech', 'javascript-mastery', 'typescript-mastery'] },
  { label: 'Frontend', modules: ['react-mastery', 'vue-mastery', 'angular-mastery', 'nextjs-mastery'] },
  { label: 'Backend', modules: ['nodejs-mastery', 'rest-api-design', 'java-mastery', 'spring-boot-mastery', 'microservices-mastery'] },
  { label: 'Python / AI', modules: ['python-mastery', 'python-web', 'ml-mastery', 'prompt-engineering', 'agentic-ai'] },
  { label: 'Data', modules: ['postgres-sql-mastery', 'rag-mastery'] },
  { label: 'Infra', modules: ['linux-mastery', 'docker-advanced', 'aws-advanced', 'devops-mastery', 'cybersecurity'] },
  { label: 'Systems', modules: ['cpp-mastery', 'go-mastery', 'rust-mastery'] },
  { label: 'Mobile', modules: ['kotlin-mastery', 'flutter-mastery'] },
  { label: 'Career', modules: ['dsa-mastery', 'system-design', 'software-testing', 'interview-crack-plan'] },
];

const STACK_OPTIONS = [
  {
    id: 'fullstack-js',
    title: 'Full Stack JavaScript',
    description: 'Frontend, backend, APIs, database, deployment, and system design.',
    modules: ['web-tech', 'javascript-mastery', 'typescript-mastery', 'react-mastery', 'nextjs-mastery', 'nodejs-mastery', 'rest-api-design', 'postgres-sql-mastery', 'docker-advanced', 'aws-advanced', 'system-design'],
  },
  {
    id: 'java-backend',
    title: 'Java Backend Engineer',
    description: 'Core Java, Spring Boot, APIs, microservices, databases, cloud, and interviews.',
    modules: ['java-mastery', 'spring-boot-mastery', 'rest-api-design', 'postgres-sql-mastery', 'microservices-mastery', 'docker-advanced', 'aws-advanced', 'system-design', 'interview-crack-plan'],
  },
  {
    id: 'ai-engineer',
    title: 'AI / Agent Engineer',
    description: 'Python, ML basics, prompt engineering, RAG, agents, and production deployment.',
    modules: ['python-mastery', 'dsa-mastery', 'ml-mastery', 'prompt-engineering', 'rag-mastery', 'agentic-ai', 'python-web', 'docker-advanced', 'aws-advanced'],
  },
  {
    id: 'devops-cloud',
    title: 'DevOps / Cloud Engineer',
    description: 'Linux, containers, cloud, CI/CD, security, and production reliability.',
    modules: ['linux-mastery', 'docker-advanced', 'aws-advanced', 'devops-mastery', 'cybersecurity', 'software-testing', 'system-design'],
  },
  {
    id: 'frontend-pro',
    title: 'Frontend Engineer',
    description: 'Web fundamentals, JS/TS, React, UI architecture, Next.js, testing, and APIs.',
    modules: ['web-tech', 'javascript-mastery', 'typescript-mastery', 'react-mastery', 'nextjs-mastery', 'rest-api-design', 'software-testing'],
  },
  {
    id: 'systems-engineer',
    title: 'Systems / Performance Engineer',
    description: 'C++, Go, Rust, Linux, data structures, databases, and high-scale design.',
    modules: ['cpp-mastery', 'go-mastery', 'rust-mastery', 'linux-mastery', 'dsa-mastery', 'postgres-sql-mastery', 'system-design'],
  },
];

const moduleLookup = new Map(curriculum.map(m => [m.id, m]));
const availableModules = curriculum
  .filter(m => MODULE_META[m.id])
  .map(m => `${m.id}: ${m.title}`)
  .join('\n');

const NODE_W = 220;
const NODE_H = 86;
const AI_NODE_W = 240;
const AI_NODE_H = 132;

function normalizeCategory(value: unknown, fallback: Category): Category {
  return typeof value === 'string' && value in CAT_STYLE ? value as Category : fallback;
}

function normalizeLevel(value: unknown, fallback: Level): Level {
  return value === 'beginner' || value === 'intermediate' || value === 'advanced' ? value : fallback;
}

function extractJsonObject(text: string): AIPathResponse {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const source = fenced ? fenced[1] : text;
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('AI response did not include a JSON object.');
  const parsed = JSON.parse(source.slice(start, end + 1));
  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error('AI roadmap JSON is missing nodes or edges.');
  }
  return parsed as AIPathResponse;
}

function buildStaticGraph(onClickNode: (id: string) => void) {
  const nodes: ModuleFlowNode[] = [];
  let y = 0;

  for (const track of TRACKS) {
    track.modules.forEach((modId, col) => {
      const mod = moduleLookup.get(modId);
      const meta = MODULE_META[modId];
      if (!mod || !meta) return;
      const topicCount = mod.sections.reduce((sum, sec) => sum + sec.topics.length, 0);
      nodes.push({
        id: modId,
        type: 'moduleNode',
        position: { x: col * 275, y: y + 28 },
        data: { moduleId: modId, title: mod.title, category: meta.category, topicCount, level: meta.level, onClick: onClickNode },
      });
    });
    y += 136;
  }

  const edges: Edge[] = EDGES_DEF.filter(edge => moduleLookup.has(edge.source) && moduleLookup.has(edge.target)).map(({ source, target }) => ({
    id: `${source}-${target}`,
    source,
    target,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: 'var(--primary)' },
    style: { stroke: 'var(--primary)', strokeOpacity: 0.38, strokeWidth: 1.8, strokeDasharray: '6 5' },
  }));

  return { nodes, edges };
}

function buildFallbackPath(stackId: string): AIPathResponse {
  const stack = STACK_OPTIONS.find(s => s.id === stackId) ?? STACK_OPTIONS[0];
  const nodes = stack.modules
    .filter(id => moduleLookup.has(id))
    .map((moduleId, index) => {
      const mod = moduleLookup.get(moduleId)!;
      const meta = MODULE_META[moduleId];
      return {
        id: moduleId,
        title: mod.title,
        description: index === 0
          ? 'Start here and build the foundation required for this stack.'
          : 'Learn this after completing the previous dependency in the path.',
        category: meta.category,
        level: meta.level,
        moduleId,
        duration: index < 3 ? '3-5 days' : index < 7 ? '1 week' : '1-2 weeks',
      };
    });

  const edges = nodes.slice(1).map((node, index) => ({ source: nodes[index].id, target: node.id }));
  return {
    title: `${stack.title} Roadmap`,
    summary: stack.description,
    nodes,
    edges,
  };
}

function buildAIPrompt(stackId: string) {
  const stack = STACK_OPTIONS.find(s => s.id === stackId) ?? STACK_OPTIONS[0];
  return `You are Zynapse, an elite software engineering curriculum architect.

Create a personalized visual learning roadmap for this track:
Track: ${stack.title}
Goal: ${stack.description}

Use the available Zynapse module IDs whenever possible:
${availableModules}

Return ONLY valid JSON. No markdown. No commentary.
Schema:
{
  "title": "roadmap title",
  "summary": "1 sentence summary",
  "nodes": [
    {
      "id": "stable-node-id",
      "title": "short step title",
      "description": "1 sentence: what to learn here",
      "category": "foundations|frontend|backend|systems|database|infrastructure|ai|career",
      "level": "beginner|intermediate|advanced",
      "moduleId": "optional existing Zynapse module id",
      "duration": "e.g. 3-5 days"
    }
  ],
  "edges": [{ "source": "node-id", "target": "node-id" }]
}

Rules:
- Create 9 to 13 nodes.
- Make the path dependency-aware, from basics to advanced work.
- Prefer real moduleId values from the available list.
- Include 1 portfolio/project milestone node near the end even if it has no moduleId.
- Include one interview/system-design readiness node at the end.`;
}

function layoutAINodes(path: AIPathResponse, onClick: (moduleId?: string) => void) {
  const ids = new Set(path.nodes.map(n => n.id));
  const validEdges = path.edges.filter(e => ids.has(e.source) && ids.has(e.target));
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();

  for (const node of path.nodes) {
    incoming.set(node.id, 0);
    outgoing.set(node.id, []);
  }
  for (const edge of validEdges) {
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  }

  const levelMap = new Map<string, number>();
  const queue = path.nodes.filter(n => (incoming.get(n.id) ?? 0) === 0).map(n => n.id);
  queue.forEach(id => levelMap.set(id, 0));

  while (queue.length) {
    const id = queue.shift()!;
    const nextLevel = (levelMap.get(id) ?? 0) + 1;
    for (const next of outgoing.get(id) ?? []) {
      levelMap.set(next, Math.max(levelMap.get(next) ?? 0, nextLevel));
      incoming.set(next, (incoming.get(next) ?? 1) - 1);
      if ((incoming.get(next) ?? 0) <= 0) queue.push(next);
    }
  }

  path.nodes.forEach((node, index) => {
    if (!levelMap.has(node.id)) levelMap.set(node.id, index);
  });

  const groups = new Map<number, typeof path.nodes>();
  for (const node of path.nodes) {
    const level = levelMap.get(node.id) ?? 0;
    groups.set(level, [...(groups.get(level) ?? []), node]);
  }

  const nodes: AIFlowNode[] = [];
  for (const [column, group] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
    const totalHeight = group.length * AI_NODE_H + (group.length - 1) * 32;
    group.forEach((node, row) => {
      const meta = node.moduleId ? MODULE_META[node.moduleId] : undefined;
      const category = normalizeCategory(node.category, meta?.category ?? 'career');
      const level = normalizeLevel(node.level, meta?.level ?? 'intermediate');
      nodes.push({
        id: node.id,
        type: 'aiPathNode',
        position: {
          x: column * 320,
          y: row * (AI_NODE_H + 32) - totalHeight / 2,
        },
        data: {
          title: node.title,
          description: node.description || 'A recommended learning milestone for this stack.',
          category,
          level,
          moduleId: node.moduleId,
          duration: node.duration,
          onClick,
        },
      });
    });
  }

  const edges: Edge[] = validEdges.map(edge => ({
    id: `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: 'var(--primary)' },
    style: { stroke: 'var(--primary)', strokeWidth: 2, strokeOpacity: 0.55 },
  }));

  return { nodes, edges };
}

function ModuleNode({ data }: NodeProps<ModuleFlowNode>) {
  const cs = CAT_STYLE[data.category];
  return (
    <button
      onClick={() => data.onClick(data.moduleId)}
      className="group text-left rounded-2xl transition-all duration-200 select-none"
      style={{
        width: NODE_W,
        minHeight: NODE_H,
        background: 'var(--bg-surface)',
        border: `1px solid ${cs.border}`,
        boxShadow: 'var(--card-shadow)',
        padding: '12px 14px',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: cs.color, width: 7, height: 7, border: 'none' }} />
      <Handle type="source" position={Position.Right} style={{ background: cs.color, width: 7, height: 7, border: 'none' }} />
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: LEVEL_DOT[data.level] }} />
        <span className="text-[12px] font-bold leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
          {data.title}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: cs.color, background: cs.bg }}>
          {cs.label}
        </span>
        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>{data.topicCount} topics</span>
      </div>
    </button>
  );
}

function AIPathNode({ data }: NodeProps<AIFlowNode>) {
  const cs = CAT_STYLE[data.category];
  const hasModule = Boolean(data.moduleId);
  return (
    <button
      onClick={() => data.onClick(data.moduleId)}
      className={cn('group text-left rounded-2xl transition-all duration-200', hasModule ? 'cursor-pointer' : 'cursor-default')}
      style={{
        width: AI_NODE_W,
        minHeight: AI_NODE_H,
        background: 'var(--bg-surface)',
        border: `1px solid ${cs.border}`,
        boxShadow: 'var(--card-shadow)',
        padding: '14px',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: cs.color, width: 8, height: 8, border: 'none' }} />
      <Handle type="source" position={Position.Right} style={{ background: cs.color, width: 8, height: 8, border: 'none' }} />
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: cs.color, background: cs.bg }}>
          {cs.label}
        </span>
        <span className="flex items-center gap-1 text-[10px] capitalize font-semibold" style={{ color: 'var(--text-muted)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: LEVEL_DOT[data.level] }} />
          {data.level}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-black leading-snug" style={{ color: 'var(--text)' }}>{data.title}</h3>
      <p className="mt-1 text-[11px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>{data.description}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold" style={{ color: data.duration ? 'var(--primary-light)' : 'var(--text-subtle)' }}>
          {data.duration || 'Milestone'}
        </span>
        {hasModule && (
          <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: cs.color }}>
            Open
          </span>
        )}
      </div>
    </button>
  );
}

const NODE_TYPES = { moduleNode: ModuleNode, aiPathNode: AIPathNode };

interface LearningPathFlowProps {
  onSelectTopic: (id: string) => void;
}

export function LearningPathFlow({ onSelectTopic }: LearningPathFlowProps) {
  const [mode, setMode] = useState<RoadmapMode>('ai');
  const [stackId, setStackId] = useState(STACK_OPTIONS[0].id);
  const [filterLevel, setFilterLevel] = useState<Level | 'all'>('all');
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [pathTitle, setPathTitle] = useState('Full Stack JavaScript Roadmap');
  const [pathSummary, setPathSummary] = useState(STACK_OPTIONS[0].description);
  const [streamPreview, setStreamPreview] = useState('');

  const openModule = useCallback((moduleId?: string) => {
    if (!moduleId) return;
    const mod = curriculum.find(m => m.id === moduleId);
    const firstTopic = mod?.sections[0]?.topics[0];
    if (firstTopic) onSelectTopic(firstTopic.id);
  }, [onSelectTopic]);

  const fallback = useMemo(() => layoutAINodes(buildFallbackPath(stackId), openModule), [stackId, openModule]);
  const [aiNodes, setAINodes, onAINodesChange] = useNodesState<AIFlowNode>(fallback.nodes);
  const [aiEdges, setAIEdges, onAIEdgesChange] = useEdgesState(fallback.edges);

  useEffect(() => {
    const path = buildFallbackPath(stackId);
    const laidOut = layoutAINodes(path, openModule);
    setPathTitle(path.title);
    setPathSummary(path.summary);
    setAINodes(laidOut.nodes);
    setAIEdges(laidOut.edges);
  }, [stackId, openModule, setAINodes, setAIEdges]);

  const generateAIPath = useCallback(async () => {
    setIsGenerating(true);
    setError('');
    setStreamPreview('');
    try {
      let buffer = '';
      for await (const chunk of streamContent([
        { role: 'system', content: 'Return only valid JSON. Do not include markdown fences.' },
        { role: 'user', content: buildAIPrompt(stackId) },
      ])) {
        buffer += chunk;
        setStreamPreview(buffer.slice(-600));
      }
      const parsed = extractJsonObject(buffer);
      const laidOut = layoutAINodes(parsed, openModule);
      setPathTitle(parsed.title || 'AI Generated Roadmap');
      setPathSummary(parsed.summary || 'A personalized path generated for your selected stack.');
      setAINodes(laidOut.nodes);
      setAIEdges(laidOut.edges);
      localStorage.setItem(`ZYNAPSE_ROADMAP_${stackId}`, JSON.stringify(parsed));
      setStreamPreview('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not generate AI roadmap.';
      setError(`${message} Showing the built-in high-quality roadmap instead.`);
      const fallbackPath = buildFallbackPath(stackId);
      const laidOut = layoutAINodes(fallbackPath, openModule);
      setPathTitle(fallbackPath.title);
      setPathSummary(fallbackPath.summary);
      setAINodes(laidOut.nodes);
      setAIEdges(laidOut.edges);
    } finally {
      setIsGenerating(false);
    }
  }, [stackId, openModule, setAINodes, setAIEdges]);

  const handleStaticClick = useCallback((moduleId: string) => openModule(moduleId), [openModule]);
  const { nodes: rawStaticNodes, edges: rawStaticEdges } = useMemo(() => buildStaticGraph(handleStaticClick), [handleStaticClick]);
  const [staticNodes, setStaticNodes, onStaticNodesChange] = useNodesState<ModuleFlowNode>(rawStaticNodes);
  const [staticEdges, , onStaticEdgesChange] = useEdgesState(rawStaticEdges);

  useEffect(() => {
    setStaticNodes(rawStaticNodes.map(n => ({
      ...n,
      hidden: (filterLevel !== 'all' && n.data.level !== filterLevel) ||
        (filterCat !== 'all' && n.data.category !== filterCat),
    })));
  }, [filterLevel, filterCat, rawStaticNodes, setStaticNodes]);

  const cats = Object.entries(CAT_STYLE) as [Category, typeof CAT_STYLE[Category]][];
  const selectedStack = STACK_OPTIONS.find(s => s.id === stackId) ?? STACK_OPTIONS[0];

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-void)' }}>
      <div className="shrink-0 border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="px-5 lg:px-7 py-4 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-2xl border" style={{ background: 'rgba(99,102,241,0.13)', borderColor: 'rgba(99,102,241,0.28)' }}>
                <GitBranch className="w-5 h-5" style={{ color: 'var(--primary-light)' }} />
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-xl tracking-tight" style={{ color: 'var(--text)' }}>Learning Roadmap</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Generate an AI stack path or explore the full Zynapse curriculum graph.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border p-1 w-fit" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              {(['ai', 'full'] as RoadmapMode[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setMode(tab)}
                  className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                  style={{
                    background: mode === tab ? 'var(--primary)' : 'transparent',
                    color: mode === tab ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {tab === 'ai' ? <Wand2 className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                  {tab === 'ai' ? 'AI Path' : 'Full Map'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'ai' ? (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-3">
              <div className="grid sm:grid-cols-[220px_1fr] gap-3">
                <select
                  value={stackId}
                  onChange={e => setStackId(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border text-sm font-bold outline-none"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  {STACK_OPTIONS.map(stack => (
                    <option key={stack.id} value={stack.id}>{stack.title}</option>
                  ))}
                </select>
                <div className="px-3 py-2.5 rounded-xl border text-xs" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text)' }}>{selectedStack.title}</strong> - {selectedStack.description}
                </div>
              </div>
              <button
                onClick={generateAIPath}
                disabled={isGenerating}
                className="px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,var(--primary),#4f46e5)', boxShadow: 'var(--card-shadow)' }}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isGenerating ? 'Generating...' : 'Generate AI Diagram'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <div className="flex items-center gap-1 rounded-xl border p-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(level => (
                  <button
                    key={level}
                    onClick={() => setFilterLevel(level)}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                    style={{
                      background: filterLevel === level ? 'rgba(99,102,241,0.18)' : 'transparent',
                      color: filterLevel === level ? 'var(--primary-light)' : 'var(--text-muted)',
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value as Category | 'all')}
                className="px-3 py-2 rounded-xl border text-xs font-bold outline-none"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="all">All Domains</option>
                {cats.map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
              </select>
            </div>
          )}

          {mode === 'ai' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {error ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                <span>{error || `${pathTitle} - ${pathSummary}`}</span>
              </div>
              {streamPreview && (
                <pre className="max-h-20 overflow-hidden rounded-xl border p-3 text-[10px] whitespace-pre-wrap" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  {streamPreview}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {mode === 'ai' ? (
          <ReactFlow
            nodes={aiNodes}
            edges={aiEdges}
            onNodesChange={onAINodesChange}
            onEdgesChange={onAIEdgesChange}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.16 }}
            minZoom={0.25}
            maxZoom={1.8}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'transparent' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(99,102,241,0.20)" />
            <Controls style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
            <MiniMap
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 }}
              maskColor="rgba(99,102,241,0.08)"
              nodeColor={node => CAT_STYLE[(node.data as AINodeData).category]?.color ?? '#6366f1'}
            />
            <Panel position="top-left">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <Bot className="w-4 h-4" style={{ color: 'var(--primary-light)' }} />
                AI-generated dependency diagram
              </div>
            </Panel>
            <Panel position="bottom-right">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <RouteIcon className="w-4 h-4" />
                Click any linked module to start learning
              </div>
            </Panel>
          </ReactFlow>
        ) : (
          <ReactFlow
            nodes={staticNodes}
            edges={staticEdges}
            onNodesChange={onStaticNodesChange}
            onEdgesChange={onStaticEdgesChange}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.25}
            maxZoom={1.8}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'transparent' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(99,102,241,0.18)" />
            <Controls style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
            <MiniMap
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 }}
              maskColor="rgba(99,102,241,0.08)"
              nodeColor={node => CAT_STYLE[(node.data as ModuleNodeData).category]?.color ?? '#6366f1'}
            />
            <Panel position="top-right">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <BookOpen className="w-4 h-4" />
                {curriculum.length} modules - filter by level/domain
              </div>
            </Panel>
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
