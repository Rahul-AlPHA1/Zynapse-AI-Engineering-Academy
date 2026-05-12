import { useState } from 'react';
import { GraduationCap, Plus, Trash2, Users } from 'lucide-react';
import { curriculum } from '../data/curriculum';

interface Assignment {
  id: string;
  title: string;
  topicId: string;
  dueDate: string;
  cohort: string;
}

const KEY = 'ZYNAPSE_CLASSROOM_ASSIGNMENTS';

function loadAssignments(): Assignment[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

const topics = curriculum.flatMap(module => module.sections.flatMap(section => section.topics.map(topic => ({
  id: topic.id,
  title: topic.title,
  moduleTitle: module.title,
}))));

export function ClassroomMode() {
  const [assignments, setAssignments] = useState<Assignment[]>(loadAssignments);
  const [title, setTitle] = useState('Weekly AI Engineering Sprint');
  const [topicId, setTopicId] = useState(topics[0]?.id ?? '');
  const [cohort, setCohort] = useState('Cohort A');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));

  const save = (items: Assignment[]) => {
    setAssignments(items);
    localStorage.setItem(KEY, JSON.stringify(items));
  };

  const add = () => save([{ id: `assignment-${Date.now()}`, title, topicId, dueDate, cohort }, ...assignments]);
  const remove = (id: string) => save(assignments.filter(item => item.id !== id));

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-7xl mx-auto p-5 lg:p-8">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-3"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: 'var(--border)', color: 'var(--primary-light)' }}>
            <Users className="w-3.5 h-3.5" />
            Classroom Mode
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Run Zynapse for a cohort</h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: 'var(--text-muted)' }}>Create local assignments, track classroom plans, and prepare mentor-led learning sprints.</p>
        </header>

        <div className="grid xl:grid-cols-[380px_1fr] gap-5">
          <aside className="rounded-3xl border p-5 h-fit" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <h2 className="font-black text-lg mb-4" style={{ color: 'var(--text)' }}>New Assignment</h2>
            <div className="space-y-3">
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-3 rounded-xl border outline-none"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <input value={cohort} onChange={e => setCohort(e.target.value)} className="w-full px-3 py-3 rounded-xl border outline-none"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <select value={topicId} onChange={e => setTopicId(e.target.value)} className="w-full px-3 py-3 rounded-xl border outline-none"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                {topics.map(topic => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
              </select>
              <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className="w-full px-3 py-3 rounded-xl border outline-none"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
              <button onClick={add} className="w-full px-4 py-3 rounded-xl text-white font-black flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,var(--primary),#4f46e5)' }}>
                <Plus className="w-4 h-4" /> Add Assignment
              </button>
            </div>
          </aside>

          <main className="space-y-3">
            {assignments.length === 0 ? (
              <div className="rounded-3xl border p-10 text-center" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
                <GraduationCap className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--primary-light)' }} />
                <h2 className="font-black text-2xl" style={{ color: 'var(--text)' }}>No assignments yet</h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Create your first classroom task for a cohort.</p>
              </div>
            ) : assignments.map(item => {
              const topic = topics.find(t => t.id === item.topicId);
              return (
                <div key={item.id} className="rounded-3xl border p-5 flex items-start gap-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black" style={{ background: 'linear-gradient(135deg,var(--primary),var(--accent))' }}>
                    {item.cohort.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-black text-lg" style={{ color: 'var(--text)' }}>{item.title}</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{topic?.title} · {topic?.moduleTitle}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)' }}>{item.cohort}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>Due {item.dueDate}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(item.id)} className="p-2 rounded-xl border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </main>
        </div>
      </div>
    </div>
  );
}
