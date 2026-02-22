import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import {
  ArrowRight,
  Terminal,
  Cpu,
  ShieldCheck,
  Zap,
  Box,
  ChevronRight,
  Github,
  Copy,
  Check,
  MessageCircleIcon,
} from "lucide-react";
import { MorphingAscii } from "@/components/MorphingAscii";
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from "@/components/search";

// ════════ DATA ════════
const corePillars = [
  {
    title: "Resource Oriented",
    label: "SAFETY",
    desc: "Assets live in account storage as first-class objects. They cannot be lost, duplicated, or forgotten. The type system enforces physical-world scarcity.",
  },
  {
    title: "Capabilities",
    label: "ACCESS",
    desc: "Security via object-capabilities. Authority is granted by holding a reference to a resource, removing the need for error-prone permission lists.",
  },
  {
    title: "AI Optimized",
    label: "CONTEXT",
    desc: "Standardized MCP servers and llms.txt allow AI agents to understand your contracts with zero hallucination. Built for the era of autonomous coding.",
  },
];

const codeSnippet = `// The system enforces ownership
access(all) resource NFT {
    access(all) let id: UInt64
    init() { self.id = self.uuid }
}

// Moves are explicit and safe
access(all) fun transfer(token: @NFT) {
    // '@' denotes a resource that MUST be handled
    Receiver.deposit(token: <- token)
}`;

// ════════ HIGHLIGHTER ════════
const getHighlightedCode = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const { codeToHtml } = await import("shiki");
      const cadenceGrammar = (await import("@/lib/cadence.tmLanguage.json"))
        .default;
      return await codeToHtml(codeSnippet, {
        lang: "cadence",
        // @ts-expect-error type mismatches but custom lang works
        langs: [cadenceGrammar as never],
        theme: "github-dark",
      });
    } catch (e) {
      return `<pre><code>${codeSnippet}</code></pre>`;
    }
  },
);

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => getHighlightedCode(),
});

// ════════ COMPONENTS ════════

function Home() {
  const highlightedCode = Route.useLoaderData();
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("npx skills add outblock/cadence-lang.org");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AISearch>
      <AISearchPanel />
      <AISearchTrigger
        position="float"
        className="bg-fd-primary text-fd-primary-foreground px-4 py-2.5 rounded-full text-sm font-medium"
      >
        <MessageCircleIcon className="size-4" />
        Ask Cadence AI
      </AISearchTrigger>
      <HomeLayout {...baseOptions()}>
        <div className="relative min-h-screen overflow-x-hidden bg-[#FAFAFA] dark:bg-black text-neutral-900 dark:text-white selection:bg-[var(--accent)] selection:text-black font-sans transition-colors duration-300">
          {/* Subtle Grid Background */}
          <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Glow effect at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00FF94]/10 rounded-full blur-[120px] pointer-events-none" />

          {/* ════════ HERO ════════ */}
          <section className="relative pt-32 pb-24 px-6 overflow-hidden flex flex-col justify-center min-h-[90vh]">
            <div className="max-w-7xl mx-auto w-full z-10 grid lg:grid-cols-2 gap-12 items-center">

              {/* Left Column: Copy & CTA */}
              <div className="flex flex-col items-start text-left">

                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8">
                  The Safest, Most <br className="md:hidden" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-blue-500">
                    Composable
                  </span>
                  <br />
                  Language for Web3.
                </h1>

                <p className="max-w-xl text-lg md:text-xl text-neutral-600 dark:text-[#888] leading-relaxed mb-4">
                  Built for AI-native development. Cadence gives AI agents and human developers the same first-class primitives — resource ownership, capability-based security, and composable contracts — natively understood through MCP and skills.
                </p>

                <div className="flex items-center gap-3 mb-8">
                  <a
                    href="https://skills.sh"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-[var(--accent)] hover:underline underline-offset-4"
                  >
                    skills.sh
                  </a>
                  <span className="text-neutral-300 dark:text-neutral-700">·</span>
                  <a
                    href="/llms.txt"
                    className="text-xs font-mono text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:underline underline-offset-4"
                  >
                    llms.txt
                  </a>
                  <span className="text-neutral-300 dark:text-neutral-700">·</span>
                  <a
                    href="/llms-full.txt"
                    className="text-xs font-mono text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:underline underline-offset-4"
                  >
                    llms-full.txt
                  </a>
                </div>

                {/* Install Skill Command - The primary CTA */}
                <div className="relative w-full max-w-lg mb-2 group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)]/30 to-blue-500/30 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex items-center justify-between bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl p-2 pl-6 shadow-2xl overflow-hidden backdrop-blur-xl transition-colors duration-300">
                    <div className="flex items-center gap-3 font-mono text-sm sm:text-base">
                      <span className="text-neutral-400 dark:text-[#666] select-none">$</span>
                      <span className="text-neutral-900 dark:text-white font-medium">
                        npx skills add{" "}
                        <span className="text-green-600 dark:text-[var(--accent)]">
                          outblock/cadence-lang.org
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={copyCommand}
                      className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-neutral-500 dark:text-[#888] hover:text-black dark:hover:text-white"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-[var(--accent)]" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 dark:text-neutral-600 font-mono mb-10">
                  Install the Cadence skill for your AI coding agent
                </p>

                <div className="flex flex-wrap items-center gap-6">
                  <Link
                    to="/docs/$"
                    className="h-12 px-6 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black font-medium flex items-center gap-2 hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Read the Docs <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="https://github.com/onflow/cadence"
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 px-6 rounded-lg bg-black/5 dark:bg-white/5 text-neutral-900 dark:text-white font-medium flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-colors"
                  >
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                </div>
              </div>

              {/* Right Column: Animation */}
              <div className="relative flex items-center justify-center lg:justify-end">
                <MorphingAscii />
              </div>

            </div>
          </section>

          {/* ════════ BORDERED SECTION ════════ */}
          <section className="relative py-24 px-6 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-12 gap-16">
                <div className="lg:col-span-4 min-w-0 space-y-12">
                  <h3 className="text-2xl font-bold border-b border-black/10 dark:border-white/10 pb-4">
                    Architectural Pillars
                  </h3>
                  {corePillars.map((p, i) => (
                    <div key={i} className="group">
                      <div className="text-[10px] font-mono text-green-600 dark:text-[var(--accent)] mb-2 opacity-80 dark:opacity-50 group-hover:opacity-100 transition-opacity">
                        {p.label}
                      </div>
                      <h4 className="text-xl font-bold mb-3">{p.title}</h4>
                      <p className="text-sm text-neutral-600 dark:text-[#888] leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-8 min-w-0">
                  <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A0A] rounded-xl overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-[#111]">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <span className="font-mono text-xs text-neutral-500 dark:text-[#888]">
                        Resource_Interface.cdc
                      </span>
                    </div>
                    <div
                      className="p-6 overflow-auto text-sm [&>pre]:!bg-transparent"
                      dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════ PARADIGM SHIFT ════════ */}
          <section className="relative py-32 px-6 bg-black/[0.02] dark:bg-white/[0.01] border-t border-black/5 dark:border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <span className="text-green-600 dark:text-[var(--accent)] font-mono text-xs tracking-widest uppercase mb-4 block">
                  The Paradigm Shift
                </span>
                <h2 className="text-4xl md:text-5xl font-bold">
                  LEDGER VS. RESOURCES
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-2xl p-10 hover:border-black/20 dark:hover:border-white/20 transition-colors shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-3 mb-8 opacity-40">
                    <div className="w-4 h-4 rounded-sm border border-neutral-800 dark:border-white" />
                    <span className="text-xs font-mono uppercase tracking-widest">
                      The Old Way (Ledger)
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold mb-4">
                    Centralized Accounting
                  </h4>
                  <p className="text-neutral-600 dark:text-[#666] leading-relaxed mb-8">
                    Assets are just entries in a contract's private dictionary. To
                    move value, you update two numbers. This "ledger" model is
                    prone to reentrancy bugs.
                  </p>
                  <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-lg font-mono text-sm text-red-400/60 leading-relaxed">
                    mapping(address ={">"} uint) balances;
                    <br />
                    function transfer(address to, uint val) {"{"} <br />
                    &nbsp;&nbsp;balances[msg.sender] -= val;
                    <br />
                    &nbsp;&nbsp;balances[to] += val;
                    <br />
                    {"}"}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0A0A0A] border border-green-500/20 dark:border-[var(--accent)]/20 rounded-2xl p-10 relative overflow-hidden shadow-sm dark:shadow-none">
                  <div className="absolute top-0 right-0 p-6">
                    <Zap className="w-6 h-6 text-green-600/50 dark:text-[var(--accent)]/50" />
                  </div>
                  <div className="flex items-center gap-3 mb-8 text-green-600 dark:text-[var(--accent)]">
                    <Box className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-widest">
                      The Cadence Way
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
                    Direct Ownership
                  </h4>
                  <p className="text-neutral-600 dark:text-[#888] leading-relaxed mb-8">
                    Assets are objects stored directly in the user's account. To
                    move value, you physically move the object. Impossible to
                    duplicate.
                  </p>
                  <div className="p-6 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg font-mono text-sm text-[var(--accent)]/80 leading-relaxed">
                    let vault {"<-"} account.withdraw(amount: 10.0)
                    <br />
                    receiver.deposit(vault: {"<-"} vault)
                    <br />
                    <span className="text-white/40 mt-2 block">
                    // vault is now empty, reentrancy impossible
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* ════════ VIDEO PRESENTATION ════════ */}
          <section className="relative py-24 px-6 z-10 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/50">
            <div className="text-center mb-16">
              <span className="text-green-600 dark:text-[var(--accent)] font-mono text-xs tracking-widest uppercase mb-4 block">
                Watch The Intro
              </span>
              <h2 className="text-3xl md:text-5xl font-bold">
                BUILT FOR CONSUMER APPS & DEFI
              </h2>
            </div>
            <div className="max-w-5xl mx-auto w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)]/20 via-transparent to-blue-500/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-2xl p-2 backdrop-blur-3xl transform transition-transform duration-500 hover:scale-[1.01]">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/5 dark:bg-black/50 border border-black/5 dark:border-white/5 shadow-inner">
                  <iframe
                    title="Cadence Intro Video"
                    src="https://www.youtube.com/embed/6SE8bvTmmQc?si=DTMmGOHf3wyqIDTF&autoplay=0&rel=0&modestbranding=1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  ></iframe>
                </div>
              </div>
            </div>
          </section>

          {/* ════════ SCALE & TRUST ════════ */}
          <section className="relative py-24 px-6 border-t border-black/5 dark:border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-6 mb-16">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-black/10 dark:to-white/10" />
                <span className="font-mono text-xs text-neutral-500 dark:text-[#666] uppercase tracking-widest">
                  Built For Scale
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-black/10 dark:to-white/10" />
              </div>

              <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-2xl font-black tracking-tighter">
                  NBA TOP SHOT
                </span>
                <span className="text-2xl font-black tracking-tighter">
                  NFL ALL DAY
                </span>
                <span className="text-2xl font-black tracking-tighter">
                  TICKETMASTER
                </span>
                <span className="text-2xl font-black tracking-tighter">
                  DISNEY
                </span>
              </div>
            </div>
          </section>

          {/* ════════ FOOTER ════════ */}
          <footer className="relative py-16 px-6 border-t border-black/5 dark:border-white/5 bg-neutral-100 dark:bg-[#050505]">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
              <div>
                <Terminal className="text-green-600 dark:text-[#00FF94] w-8 h-8 mb-6" />
                <p className="text-sm text-neutral-600 dark:text-[#666] leading-relaxed max-w-sm">
                  Cadence is the standard for programmable ownership. Integrated
                  with the AI agents of tomorrow.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-12 sm:justify-items-end">
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-[#888]">
                    Ecosystem
                  </div>
                  <div className="flex flex-col gap-3 text-sm text-neutral-600 dark:text-[#555]">
                    <Link
                      to="/docs/$"
                      className="hover:text-black dark:hover:text-white transition-colors"
                    >
                      Documentation
                    </Link>
                    <a
                      href="https://play.flow.com"
                      className="hover:text-black dark:hover:text-white transition-colors"
                    >
                      Playground
                    </a>
                    <a
                      href="https://github.com/onflow/cadence"
                      className="hover:text-black dark:hover:text-white transition-colors"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-[#888]">
                    Community
                  </div>
                  <div className="flex flex-col gap-3 text-sm text-neutral-600 dark:text-[#555]">
                    <Link
                      to="/community"
                      className="hover:text-black dark:hover:text-white transition-colors"
                    >
                      Discord
                    </Link>
                    <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
                      Forum
                    </a>
                    <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between gap-4">
              <span className="text-xs text-neutral-500 dark:text-[#444]">
                © 2026 Flow Foundation. All rights reserved.
              </span>
              <span className="text-xs font-mono text-neutral-500 dark:text-[#444]">
                POWERED BY FLOW NETWORK
              </span>
            </div>
          </footer>
        </div>
      </HomeLayout>
    </AISearch>
  );
}
