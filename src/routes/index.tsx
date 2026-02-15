import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import {
  Shield,
  Blocks,
  Zap,
  Lock,
  BookOpen,
  ArrowRight,
  Layers,
  FileText,
  Server,
  Copy,
  Check,
  Brain,
  Cpu,
  Quote,
  ExternalLink,
} from 'lucide-react';
import StickerPeel from '@/components/StickerPeel';
import { LogoLoop, type LogoItem } from '@/components/LogoLoop';

const getHighlightedCode = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const { codeToHtml } = await import('shiki');
      const cadenceGrammar = (await import('@/lib/cadence.tmLanguage.json'))
        .default;
      const html = await codeToHtml(codeExample, {
        lang: 'cadence',
        langs: [cadenceGrammar as never],
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      });
      return html;
    } catch (e) {
      // Fallback: return pre-formatted code without highlighting
      const escaped = codeExample
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre class="shiki"><code>${escaped}</code></pre>`;
    }
  },
);

export const Route = createFileRoute('/')({
  component: Home,
  loader: () => getHighlightedCode(),
  head: () => ({
    meta: [
      { title: 'Cadence - The Smart Contract Language for Flow' },
      {
        name: 'description',
        content:
          'Cadence is a resource-oriented programming language for building secure smart contracts on Flow.',
      },
    ],
  }),
});

const codeExample = `// Resources: assets that can't be copied or lost
access(all)
resource NFT {
    access(all) let id: UInt64
    access(all) let metadata: {String: String}

    init(metadata: {String: String}) {
        self.id = self.uuid
        self.metadata = metadata
    }
}

// Mint and transfer — ownership is enforced by the type system
access(all)
fun mint(): @NFT {
    return <- create NFT(metadata: {"name": "Rare Collectible"})
}

access(all)
fun transfer(token: @NFT, to: &{Collection}) {
    to.deposit(token: <- token)
    // 'token' no longer exists here — guaranteed by Cadence
}`;

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cadence',
  url: 'https://cadence-lang.org',
  logo: 'https://cadence-lang.org/img/logo.svg',
  sameAs: [
    'https://github.com/onflow/cadence',
    'https://discord.com/invite/J6fFnh2xx6',
  ],
};

const features = [
  {
    icon: Shield,
    title: 'Resource-Oriented',
    desc: 'Digital assets are first-class types that can\'t be copied or lost.',
    span: 'md:col-span-1',
  },
  {
    icon: Lock,
    title: 'Secure by Design',
    desc: 'Capability-based access control and built-in pre/post conditions.',
    span: 'md:col-span-1',
  },
  {
    icon: Zap,
    title: 'Atomic Transactions',
    desc: 'Multi-contract interactions. All succeed or all revert.',
    span: 'md:col-span-1',
  },
  {
    icon: Blocks,
    title: 'Composable',
    desc: 'Interfaces, attachments, and resources flow between contracts.',
    span: 'md:col-span-1',
  },
  {
    icon: Layers,
    title: 'Account-Centric',
    desc: 'Assets live in user accounts, not contract storage.',
    span: 'md:col-span-1',
  },
  {
    icon: BookOpen,
    title: 'Developer Friendly',
    desc: 'Swift/Rust-inspired syntax, testing framework, and playground.',
    span: 'md:col-span-1',
  },
];

const aiToolLogos: LogoItem[] = [
  {
    node: (
      <span className="inline-flex items-center gap-2 text-fd-foreground/70 font-medium whitespace-nowrap text-sm">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#D97757"/><path d="M6 13.5c1.5-3 3-4 5-6.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
        Claude Code
      </span>
    ),
    href: 'https://docs.anthropic.com/en/docs/claude-code',
    title: 'Claude Code',
  },
  {
    node: (
      <span className="inline-flex items-center gap-2 text-fd-foreground/70 font-medium whitespace-nowrap text-sm">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="5" fill="currentColor" opacity="0.8"/><path d="M7 6l7 4-7 4z" fill="var(--color-fd-background, #fff)"/></svg>
        Cursor
      </span>
    ),
    href: 'https://cursor.com',
    title: 'Cursor',
  },
  {
    node: (
      <span className="inline-flex items-center gap-2 text-fd-foreground/70 font-medium whitespace-nowrap text-sm">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#10A37F"/><path d="M7 10h6M10 7v6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
        ChatGPT
      </span>
    ),
    href: 'https://chatgpt.com',
    title: 'ChatGPT',
  },
  {
    node: (
      <span className="inline-flex items-center gap-2 text-fd-foreground/70 font-medium whitespace-nowrap text-sm">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="5" fill="#0EA5E9"/><path d="M6 14c3-6 5-4 8-10" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
        Windsurf
      </span>
    ),
    href: 'https://windsurf.com',
    title: 'Windsurf',
  },
  {
    node: (
      <span className="inline-flex items-center gap-2 text-fd-foreground/70 font-medium whitespace-nowrap text-sm">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="10" fill="#6366F1"/><circle cx="8" cy="10" r="2" fill="#fff"/><circle cx="13" cy="10" r="2" fill="#fff"/></svg>
        Copilot
      </span>
    ),
    href: 'https://github.com/features/copilot',
    title: 'GitHub Copilot',
  },
  {
    node: (
      <span className="inline-flex items-center gap-2 text-fd-foreground/70 font-medium whitespace-nowrap text-sm">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect width="20" height="20" rx="5" fill="#F59E0B"/><path d="M10 4v12M4 10h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        skills.sh
      </span>
    ),
    href: 'https://skills.sh',
    title: 'skills.sh',
  },
];

const skills = [
  {
    name: 'cadence-fundamentals',
    desc: 'Complete language reference — resources, capabilities, transactions, contracts, account storage.',
    tag: 'Language',
  },
  {
    name: 'cadence-token-development',
    desc: 'Build NFTs and fungible tokens — collection patterns, minting, transfers, Flow standards.',
    tag: 'Tokens',
  },
  {
    name: 'cadence-best-practices',
    desc: 'Security rules, design patterns, anti-patterns, and testing for production code.',
    tag: 'Security',
  },
];

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      className="ml-auto p-1 rounded text-fd-muted-foreground/50 hover:text-fd-muted-foreground transition-colors"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      aria-label="Copy command"
    >
      {copied ? (
        <Check className="w-4 h-4 text-[#00D87E]" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}

const projects = [
  {
    name: 'NBA Top Shot',
    desc: 'Officially licensed NBA digital collectibles — 21M+ moments sold.',
    url: 'https://nbatopshot.com',
  },
  {
    name: 'NFL ALL DAY',
    desc: 'NFL-licensed video moment NFTs on Flow, powered by Cadence.',
    url: 'https://nflallday.com',
  },
  {
    name: 'UFC Strike',
    desc: 'Official UFC digital collectibles bringing MMA moments on-chain.',
    url: 'https://ufcstrike.com',
  },
  {
    name: 'Dapper Wallet',
    desc: 'Consumer-friendly crypto wallet powering millions of Flow accounts.',
    url: 'https://meetdapper.com',
  },
];

const testimonials = [
  {
    quote: "Cadence's resource-oriented model makes it literally impossible to accidentally duplicate or lose digital assets. This is how smart contract languages should work.",
    author: 'Dieter Shirley',
    role: 'CTO, Dapper Labs & creator of ERC-721',
    avatar: 'DS',
  },
  {
    quote: "After writing Solidity for years, Cadence feels like a breath of fresh air. The type system catches bugs at compile time that would be exploits on other chains.",
    author: 'Andrea Muttoni',
    role: 'Developer Relations, Flow',
    avatar: 'AM',
  },
  {
    quote: "We shipped NBA Top Shot handling millions of transactions. Cadence's safety guarantees let us move fast without worrying about reentrancy or overflow exploits.",
    author: 'Layne Lafrance',
    role: 'Engineering Lead, Dapper Labs',
    avatar: 'LL',
  },
];

const SKILLS_ORG = import.meta.env.VITE_SKILLS_ORG || 'onflow';
const SKILLS_CMD = `npx skills add ${SKILLS_ORG}/cadence-lang.org`;

function Home() {
  const highlightedCode = Route.useLoaderData();

  return (
    <HomeLayout {...baseOptions()}>
      <div className="relative">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />

        {/* Draggable stickers */}
        <div className="hidden md:block">
          <StickerPeel
            imageSrc="/img/cadence-icon.svg"
            width={120}
            rotate={-12}
            peelDirection={45}
            initialPosition={{ x: 80, y: 160 }}
          />
          <StickerPeel
            imageSrc="/img/flow-icon.svg"
            width={100}
            rotate={15}
            peelDirection={135}
            initialPosition={{ x: -200, y: 220 }}
          />
        </div>

        {/* ════════ HERO ════════ */}
        <section className="relative overflow-hidden">
          {/* Grid background */}
          <div className="hero-grid absolute inset-0 pointer-events-none" />
          {/* Scanline overlay */}
          <div className="scanlines absolute inset-0" />
          {/* Glow orbs */}
          <div className="absolute top-[-20%] left-[20%] w-[40rem] h-[40rem] rounded-full bg-[#00D87E]/[0.04] blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[10%] w-[30rem] h-[30rem] rounded-full bg-[#00EF8B]/[0.03] blur-[100px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-8 text-center">
            <p className="pixel-text text-[#00D87E] text-lg md:text-xl tracking-wider mb-8 glow-text">
              AI-NATIVE WEB3 LANGUAGE
            </p>
            <h1 className="hero-heading text-5xl md:text-6xl lg:text-7xl leading-[1.08]">
              Write Web3.<br />
              <span className="gradient-heading">Ship with AI.</span>
            </h1>
            <p className="text-base md:text-lg text-fd-muted-foreground max-w-xl mx-auto mt-6 leading-relaxed tracking-tight">
              Resource-oriented smart contracts on Flow.
              Skills, MCP, and llms.txt — your agent writes production Cadence from day one.
            </p>

            {/* Terminal */}
            <div className="max-w-lg mx-auto mt-10">
              <div className="terminal-cmd group">
                <div className="flex items-center gap-3 relative z-10">
                  <span className="text-[#00D87E]/60 select-none">$</span>
                  <code className="text-fd-foreground text-sm md:text-base typing-cursor">
                    <span className="text-fd-muted-foreground">npx</span>{' '}
                    <span className="text-[#00D87E] font-semibold">skills add</span>{' '}
                    <span className="font-medium">{SKILLS_ORG}/cadence-lang.org</span>
                  </code>
                  <CopyButton text={SKILLS_CMD} />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <Link to="/docs/$" params={{ _splat: '' }} className="cta">
                Get started <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://play.flow.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-fd-border text-fd-foreground font-medium text-sm hover:bg-fd-muted transition-colors"
              >
                Playground
              </a>
            </div>
          </div>

          {/* Logo ticker */}
          <div className="relative max-w-3xl mx-auto pb-16 mt-4">
            <ClientOnly>
              <LogoLoop
                logos={aiToolLogos}
                speed={30}
                logoHeight={20}
                gap={40}
                pauseOnHover
                fadeOut
                scaleOnHover
                ariaLabel="Compatible AI tools"
              />
            </ClientOnly>
          </div>
        </section>

        {/* ════════ CODE SHOWCASE ════════ */}
        <section className="border-t border-fd-border">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-label">01 — Language</span>
              <span className="flex-1 h-px bg-fd-border" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
              Resources you can reason about
            </h2>
            <p className="text-fd-muted-foreground mb-8 max-w-2xl">
              Cadence makes digital assets first-class citizens. Ownership is enforced by the type system — assets can't be copied, lost, or accidentally destroyed.
            </p>

            {/* Code block — full width */}
            <div className="rounded-2xl border border-fd-border overflow-hidden bg-fd-card">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-fd-border bg-fd-muted/40">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>
                <span className="text-xs text-fd-muted-foreground ml-2 font-mono">
                  NFT.cdc
                </span>
                <span className="pixel-tag ml-auto">Cadence</span>
              </div>
              <div
                className="overflow-auto [&_pre]:p-5 [&_pre]:text-[13px] [&_pre]:leading-relaxed [&_pre]:m-0 [&_pre]:max-h-[24rem]"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </div>

            {/* Feature grid — clean 3-col */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 mt-12">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="rounded-lg bg-fd-primary/10 p-2 shrink-0">
                    <f.icon className="w-4 h-4 text-fd-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{f.title}</h3>
                    <p className="text-xs text-fd-muted-foreground leading-relaxed mt-0.5">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ AI TOOLKIT ════════ */}
        <section className="border-t border-fd-border bg-fd-muted/20">
          <div className="max-w-6xl mx-auto px-6 py-20">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-8">
              <span className="section-label">02 — AI Toolkit</span>
              <span className="flex-1 h-px bg-fd-border" />
            </div>

            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-6 h-6 text-[#00D87E]" />
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Built for Agents
              </h2>
            </div>
            <p className="text-fd-muted-foreground mb-10 max-w-xl">
              Everything your AI agent needs to write, audit, and deploy Cadence — no fine-tuning required.
            </p>

            {/* Bento grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {/* Skills — spans 2 cols */}
              <div className="md:col-span-2 rounded-2xl border border-fd-border bg-fd-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-5 h-5 text-[#00D87E]" />
                  <h3 className="font-semibold">Agent Skills</h3>
                  <span className="pixel-tag ml-auto">3 skills</span>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {skills.map((s) => (
                    <div key={s.name} className="rounded-xl bg-fd-muted/50 p-4 hover:bg-fd-muted transition-colors cursor-pointer">
                      <span className="pixel-tag">{s.tag}</span>
                      <p className="font-mono text-xs font-semibold mt-2 mb-1">{s.name}</p>
                      <p className="text-[11px] text-fd-muted-foreground leading-snug">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* MCP Server */}
              <div className="rounded-2xl border border-fd-border bg-fd-card p-6 flex flex-col">
                <Server className="w-8 h-8 text-[#00D87E] mb-3" />
                <h3 className="font-semibold mb-1">MCP Server</h3>
                <span className="pixel-tag w-fit mb-3">Protocol</span>
                <p className="text-xs text-fd-muted-foreground mb-4 flex-1">
                  Connect any MCP-compatible client to search and query Cadence docs.
                </p>
                <code className="text-xs bg-fd-muted rounded-lg px-3 py-2 font-mono text-fd-muted-foreground block">
                  npx cadence-lang-mcp-server
                </code>
              </div>
            </div>

            {/* Bottom row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-fd-border bg-fd-card p-6">
                <FileText className="w-8 h-8 text-[#00D87E] mb-3" />
                <h3 className="font-semibold mb-1">llms.txt</h3>
                <span className="pixel-tag w-fit mb-3">Context</span>
                <p className="text-xs text-fd-muted-foreground mb-3">
                  Machine-readable doc index. Feed entire docs to any LLM.
                </p>
                <div className="flex flex-col gap-1.5">
                  <code className="text-xs bg-fd-muted rounded-lg px-3 py-2 font-mono text-fd-muted-foreground block">
                    curl cadence-lang.org/llms.txt
                  </code>
                  <code className="text-xs bg-fd-muted rounded-lg px-3 py-2 font-mono text-fd-muted-foreground block">
                    curl cadence-lang.org/llms-full.txt
                  </code>
                </div>
              </div>
              <div className="rounded-2xl border border-fd-border bg-fd-card p-6">
                <Copy className="w-8 h-8 text-[#00D87E] mb-3" />
                <h3 className="font-semibold mb-1">Per-Page AI Actions</h3>
                <span className="pixel-tag w-fit mb-3">Export</span>
                <p className="text-xs text-fd-muted-foreground mb-3">
                  Every doc page has one-click export to your AI tool of choice.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Copy MD', color: 'bg-fd-muted' },
                    { label: 'ChatGPT', color: 'bg-[#10A37F]/10 text-[#10A37F]' },
                    { label: 'Claude', color: 'bg-[#D97757]/10 text-[#D97757]' },
                    { label: 'Cursor', color: 'bg-fd-muted' },
                  ].map((a) => (
                    <span key={a.label} className={`text-[11px] font-medium rounded-md px-2.5 py-1 ${a.color}`}>
                      {a.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ SOCIAL PROOF ════════ */}
        <section className="border-t border-fd-border">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-label">03 — Production</span>
              <span className="flex-1 h-px bg-fd-border" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
              Trusted at scale
            </h2>
            <p className="text-fd-muted-foreground mb-10 max-w-2xl">
              Cadence powers some of the largest consumer blockchain applications — from sports collectibles to digital wallets with millions of users.
            </p>

            {/* Project logos + stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              {projects.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-fd-border bg-fd-card p-5 transition-colors hover:bg-fd-muted/50"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-fd-muted flex items-center justify-center">
                      <span className="text-xs font-bold text-fd-muted-foreground">
                        {p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm">{p.name}</h3>
                    <ExternalLink className="w-3 h-3 text-fd-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-fd-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </a>
              ))}
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.author}
                  className="rounded-2xl border border-fd-border bg-fd-card p-6"
                >
                  <Quote className="w-5 h-5 text-fd-primary mb-3" />
                  <p className="text-sm text-fd-foreground/90 leading-relaxed mb-4">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-fd-border">
                    <div className="w-8 h-8 rounded-full bg-fd-primary/10 flex items-center justify-center text-xs font-bold text-fd-primary">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.author}</p>
                      <p className="text-xs text-fd-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ VIDEO ════════ */}
        <section className="border-t border-fd-border">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="flex items-center gap-3 mb-8">
              <span className="section-label">04 — Demo</span>
              <span className="flex-1 h-px bg-fd-border" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-8">
              See Cadence in Action
            </h2>
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-fd-border shadow-lg"
              style={{ paddingBottom: '56.25%' }}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/6SE8bvTmmQc?si=DTMmGOHf3wyqIDTF"
                title="Cadence introduction video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* ════════ BOTTOM CTA ════════ */}
        <section className="border-t border-fd-border relative overflow-hidden">
          <div className="absolute inset-0 hero-grid pointer-events-none opacity-50" />
          <div className="scanlines absolute inset-0" />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] rounded-full bg-[#00D87E]/[0.03] blur-[120px] pointer-events-none" />
          <div className="relative max-w-3xl mx-auto px-6 py-24 text-center">
            <p className="pixel-text text-[#00D87E] text-sm tracking-widest mb-4 glow-text">
              GET STARTED
            </p>
            <h2 className="hero-heading text-3xl md:text-4xl tracking-tight mb-4">
              Start building with Cadence
            </h2>
            <p className="text-fd-muted-foreground mb-6 max-w-lg mx-auto">
              Your AI agent is one command away from writing production Cadence.
            </p>
            <div className="max-w-md mx-auto mb-8">
              <div className="terminal-cmd group">
                <div className="flex items-center gap-3 relative z-10">
                  <span className="text-[#00D87E]/60 select-none">$</span>
                  <code className="text-fd-foreground text-sm">
                    <span className="text-fd-muted-foreground">npx</span>{' '}
                    <span className="text-[#00D87E] font-semibold">skills add</span>{' '}
                    {SKILLS_ORG}/cadence-lang.org
                  </code>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/docs/$"
                params={{ _splat: 'tutorial/first-steps' }}
                className="cta"
              >
                Start tutorial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/docs/$"
                params={{ _splat: 'language' }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-fd-border text-fd-foreground font-medium text-sm hover:bg-fd-muted transition-colors"
              >
                Language reference
              </Link>
            </div>
          </div>
        </section>
      </div>
    </HomeLayout>
  );
}
