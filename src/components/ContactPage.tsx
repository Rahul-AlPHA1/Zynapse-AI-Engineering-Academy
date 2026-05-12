import { ArrowUpRight, Github, Globe2, Linkedin, Mail, ShieldCheck, Sparkles } from 'lucide-react';

const profile = {
  name: 'Rahool Gir',
  role: 'Senior Software Engineer',
  summary:
    'Developer of Zynapse, focused on AI-powered learning tools, full-stack engineering, Java microservices, fintech systems, and polished product experiences.',
  email: 'rahool.goswami16@gmail.com',
  portfolio: 'https://rahul-alpha1.github.io/RahoolPortfolio.com/',
  linkedin: 'https://www.linkedin.com/in/rahool-goswami-4b055a126',
  github: 'https://github.com/rahul-alpha1',
};

const contactLinks = [
  {
    label: 'Email',
    value: profile.email,
    href: `mailto:${profile.email}`,
    icon: Mail,
    tone: '#6366f1',
  },
  {
    label: 'GitHub',
    value: 'github.com/rahul-alpha1',
    href: profile.github,
    icon: Github,
    tone: '#22d3ee',
  },
  {
    label: 'Portfolio',
    value: 'rahul-alpha1.github.io',
    href: profile.portfolio,
    icon: Globe2,
    tone: '#10b981',
  },
  {
    label: 'LinkedIn',
    value: 'rahool-goswami',
    href: profile.linkedin,
    icon: Linkedin,
    tone: '#0ea5e9',
  },
];

function ContactCard({ item }: { item: typeof contactLinks[number] }) {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      target={item.href.startsWith('http') ? '_blank' : undefined}
      rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
      className="group relative overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-1"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${item.tone}, transparent)` }}
      />
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: `${item.tone}18`, color: item.tone }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: 'var(--text-muted)' }}>
            {item.label}
          </p>
          <p className="mt-1 truncate text-sm font-black" style={{ color: 'var(--text)' }}>
            {item.value}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 opacity-40 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
      </div>
    </a>
  );
}

export function ContactPage() {
  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-void)' }}>
      <div className="mx-auto flex min-h-full w-full max-w-5xl items-center px-5 py-10 md:px-8">
        <section className="w-full">
          <div
            className="relative overflow-hidden rounded-[2rem] border p-6 md:p-10"
            style={{
              background:
                'radial-gradient(circle at top left, rgba(99,102,241,0.22), transparent 32%), radial-gradient(circle at bottom right, rgba(34,211,238,0.16), transparent 34%), var(--bg-surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div
              className="absolute -right-28 -top-28 h-72 w-72 rounded-full blur-3xl"
              style={{ background: 'rgba(99,102,241,0.18)' }}
            />
            <div
              className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full blur-3xl"
              style={{ background: 'rgba(34,211,238,0.12)' }}
            />

            <div className="relative mx-auto max-w-3xl text-center">
              <div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(34,211,238,0.12))',
                  borderColor: 'rgba(99,102,241,0.25)',
                  color: 'var(--primary-light)',
                  boxShadow: '0 18px 50px rgba(99,102,241,0.18)',
                }}
              >
                <ShieldCheck className="h-7 w-7" />
              </div>

              <div
                className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em]"
                style={{
                  background: 'rgba(99,102,241,0.12)',
                  borderColor: 'rgba(99,102,241,0.24)',
                  color: 'var(--primary-light)',
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Developed by
              </div>

              <h1 className="text-4xl font-black tracking-tight md:text-6xl" style={{ color: 'var(--text)' }}>
                {profile.name}
              </h1>
              <p className="mt-3 text-base font-black md:text-xl" style={{ color: 'var(--primary-light)' }}>
                {profile.role}
              </p>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 md:text-base" style={{ color: 'var(--text-muted)' }}>
                {profile.summary}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {contactLinks.map(item => <ContactCard key={item.label} item={item} />)}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

