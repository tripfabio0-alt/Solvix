import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/logo.png";
import glowingCube from "@/assets/glowing-cube.png";
import { LangSwitcher } from "@/components/LangSwitcher";
import {
  IconSearch, IconBrain, IconCode, IconRocket, IconArrow,
} from "@/components/SolvixIcons";
import { dict, SLOGAN_PREFIX, SLOGAN_HIGHLIGHT, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Index,
});

export function Index() {
  const [lang, setLang] = useState<Lang>("pt");
  const t = dict[lang];

  const processIcons = [IconSearch, IconBrain, IconCode, IconRocket];

  return (
    <div className="min-h-screen bg-[#05050a] text-white overflow-x-hidden selection:bg-indigo-500/30">
      {/* Glow Effect */}
      <div className="fixed inset-0 -z-10 hero-glow opacity-40 pointer-events-none" />

      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#05050a]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Solvix" className="h-10 w-10 object-contain" />
            <span className="font-outfit text-xl font-bold tracking-tighter">SOLVIX</span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <Link to="/app/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link to="/app/consultoria/senior/eraser/ferramentas/lsp" className="hover:text-white transition-colors">IA Senior</Link>
            </nav>
            <LangSwitcher lang={lang} onChange={setLang} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-slide-up">
            <div className="mb-6 inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
              AI Solution Studio
            </div>
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-7xl font-outfit">
              {SLOGAN_PREFIX}
              <span className="text-gradient block">{SLOGAN_HIGHLIGHT}</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg text-zinc-400">
              {t.heroDesc}
            </p>
            <div className="mt-10">
              <Link to="/app/dashboard" className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-black transition-transform hover:scale-105">
                {t.ctaPrimary} <IconArrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="animate-float flex justify-center">
            <img src={glowingCube} alt="Solvix AI" className="w-full max-w-[450px] object-contain" />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {t.process.slice(0, 4).map((step, i) => {
            const Icon = processIcons[i] || IconRocket;
            return (
              <div key={i} className="glass-card rounded-3xl p-8 hover:bg-white/[0.02] transition-colors">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.t}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-zinc-600">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logo} alt="" className="h-6 w-6 opacity-50" />
            <span className="font-outfit font-bold tracking-widest uppercase">Solvix</span>
          </div>
          {t.rights}
        </div>
      </footer>
    </div>
  );
}
