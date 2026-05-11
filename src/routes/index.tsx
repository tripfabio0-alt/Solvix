import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import glowingCube from "@/assets/glowing-cube.png";
import funnel from "@/assets/funnel.png";
import globe from "@/assets/globe.png";
import { LangSwitcher } from "@/components/LangSwitcher";
import {
  IconSearch, IconBrain, IconCode, IconRocket, IconCloud, IconUser,
  IconCog, IconNetwork, IconChart, IconPuzzle, IconArrow, IconSpark,
} from "@/components/SolvixIcons";
import { dict, SLOGAN_PREFIX, SLOGAN_HIGHLIGHT, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solvix — AI solutions for real problems" },
      { name: "description", content: "Solvix is an AI Solution Studio building intelligent tools that solve real operational challenges." },
      { property: "og:title", content: "Solvix — AI solutions for real problems" },
      { property: "og:description", content: "AI Solution Studio building intelligent tools." },
    ],
  }),
  component: Index,
});

export function Index() {
  const [lang, setLang] = useState<Lang>("pt");
  const [animate, setAnimate] = useState(false);
  const t = dict[lang];

  useEffect(() => {
    // Enable animations only on capable devices (avoid heavy mobile / reduced-motion)
    const mq = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    setAnimate(mq.matches);
  }, []);

  const processIcons = [IconSearch, IconBrain, IconCode, IconRocket];
  const whatIcons = [IconCloud, IconUser, IconCog, IconNetwork, IconChart, IconPuzzle];
  const diffIcons = [IconBrain, IconCog, IconChart, IconNetwork];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* radial glow background */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "var(--gradient-radial)" }} />

      {/* NAV */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
        <a href="#" className="flex items-center gap-5">
          <img src={logo} alt="Solvix" className="h-[88px] w-[88px] object-contain" />
          <span className="text-5xl font-extrabold tracking-[0.1em] font-outfit leading-none">SOLVIX</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          {t.nav.map((n) => (
            <a key={n} href="#" className="transition-colors hover:text-foreground">{n}</a>
          ))}
        </nav>
        <LangSwitcher lang={lang} onChange={setLang} />
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-8 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              {SLOGAN_PREFIX}
              <span className="text-gradient">{SLOGAN_HIGHLIGHT}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">{t.heroDesc}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="group inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
                {t.ctaPrimary}
                <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-6 py-3.5 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-secondary">
                {t.ctaSecondary}
                <IconArrow className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-10 text-xs uppercase tracking-wider text-muted-foreground">{t.trusted}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-muted-foreground/70">
              {["LUMEN", "▽ vertex", "◎ quantix", "◈ nexora", "⊕ datakly"].map((b) => (
                <span key={b} className="font-medium tracking-wider">{b}</span>
              ))}
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative mx-auto h-[440px] w-full max-w-lg flex items-center justify-center">
            <img
              src={glowingCube}
              alt="Solvix Holographic Cube"
              className="hero-glowing-cube h-full w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="glass-card overflow-hidden rounded-3xl p-6 sm:p-10">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl">
              <img
                src={funnel}
                alt=""
                width={1024}
                height={768}
                loading="lazy"
                className={`h-64 w-full object-cover ${animate ? "animate-slide-x" : ""}`}
              />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">{t.problemTag}</div>
              <h2 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">{t.problemTitle}</h2>
              <div className="mt-5 space-y-3 text-sm text-muted-foreground sm:text-base">
                {t.problemBody.map((p, i) => (<p key={i}>{p}</p>))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">{t.processTag}</div>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{t.processTitle}</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {t.process.map((step, i) => {
            const Icon = processIcons[i];
            return (
              <div key={i} className="glass-card relative rounded-2xl p-6 text-left">
                <Icon className="h-8 w-8 text-accent" />
                <div className="mt-5 flex items-baseline gap-2 text-lg font-semibold">
                  <span className="text-muted-foreground">{i + 1}</span>
                  <span>{step.t}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{step.d}</p>
                {i < 3 && (
                  <div className="absolute right-[-18px] top-1/2 hidden -translate-y-1/2 text-muted-foreground/40 lg:block">→</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">{t.whatTag}</div>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{t.whatTitle}</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {t.what.map((card, i) => {
            const Icon = whatIcons[i];
            return (
              <div key={i} className="glass-card rounded-2xl p-5 text-center transition-transform hover:-translate-y-1">
                <Icon className="mx-auto h-9 w-9 text-accent" />
                <h3 className="mt-4 text-sm font-semibold">{card.t}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{card.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* DIFFERENTIAL + DASHBOARD */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="glass-card rounded-3xl p-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">{t.differentialTag}</div>
            <h2 className="mt-3 text-3xl font-bold leading-snug">{t.differentialTitle}</h2>
            <p className="mt-4 text-sm text-muted-foreground">{t.differentialBody}</p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {t.differentialPoints.map((p, i) => {
                const Icon = diffIcons[i];
                return (
                  <div key={p} className="text-center">
                    <Icon className="mx-auto h-7 w-7 text-accent" />
                    <div className="mt-2 text-xs font-medium">{p}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <img src={logo} alt="" className="h-7 w-7" />
                <span className="text-sm font-semibold">{t.dashTitle}</span>
              </div>
              <div className="flex gap-1.5 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              </div>
            </div>
            <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{t.dashOverview}</div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { l: t.dashAutos, v: "142", d: "+34%" },
                { l: t.dashTime, v: "1,248h", d: "+30%" },
                { l: t.dashAcc, v: "96.8%", d: "+12%" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border/40 bg-secondary/30 p-3">
                  <div className="text-[10px] text-muted-foreground">{s.l}</div>
                  <div className="mt-1 text-lg font-bold">{s.v}</div>
                  <div className="text-[10px] text-emerald-400">{s.d}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/40 bg-secondary/30 p-3 sm:col-span-2">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{t.dashPerf}</span><span>{t.dashWeek} ▾</span>
                </div>
                <svg viewBox="0 0 240 80" className="mt-2 h-20 w-full">
                  <defs>
                    <linearGradient id="gp" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="oklch(0.65 0.21 265)" stopOpacity="0.6" />
                      <stop offset="1" stopColor="oklch(0.65 0.21 265)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 C30,50 50,30 80,40 C110,50 140,20 170,30 C200,40 220,15 240,25 L240,80 L0,80 Z" fill="url(#gp)" />
                  <path d="M0,60 C30,50 50,30 80,40 C110,50 140,20 170,30 C200,40 220,15 240,25" stroke="oklch(0.7 0.2 265)" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <div className="rounded-xl border border-border/40 bg-secondary/30 p-3">
                <div className="text-xs font-semibold">{t.insightsTitle}</div>
                <p className="mt-2 text-[11px] text-muted-foreground">{t.insightsBody}</p>
                <button className="mt-3 w-full rounded-lg bg-gradient-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground">
                  {t.insightsCta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="glass-card overflow-hidden rounded-3xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="p-8 sm:p-12">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">{t.aboutTag}</div>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{t.aboutTitle}</h2>
              <p className="mt-4 text-muted-foreground">{t.aboutBody}</p>
              <div className="mt-8 space-y-4">
                {t.aboutPoints.map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/40">
                      <IconSpark className="h-4 w-4 text-accent" />
                    </div>
                    <div className="text-sm text-muted-foreground">{p}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[280px]">
              <img src={globe} alt="" width={1024} height={768} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">{t.finalTitle}</h2>
        <p className="mt-3 text-muted-foreground">{t.finalSub}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-glow">
            {t.ctaPrimary} <IconArrow className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-6 py-3.5 text-sm font-medium">
            {t.talkCta} <IconArrow className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4">
                <img src={logo} alt="" className="h-16 w-16 object-contain" />
                <span className="text-4xl font-extrabold tracking-[0.1em] font-outfit leading-none">SOLVIX</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t.footerSlogan}</p>
              <div className="mt-4 flex gap-3 text-muted-foreground">
                {["in", "x", "gh", "ig"].map((s) => (
                  <a key={s} href="#" className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/40 text-xs hover:text-foreground">{s}</a>
                ))}
              </div>
            </div>
            {t.footerCols.map((c) => (
              <div key={c.h}>
                <div className="text-sm font-semibold">{c.h}</div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {c.items.map((i) => (<li key={i}><a href="#" className="hover:text-foreground">{i}</a></li>))}
                </ul>
              </div>
            ))}
            <div>
              <div className="text-sm font-semibold">{t.newsletter}</div>
              <p className="mt-3 text-xs text-muted-foreground">{t.newsletterDesc}</p>
              <form className="mt-3 flex overflow-hidden rounded-lg border border-border bg-secondary/40">
                <input type="email" placeholder={t.emailPh} className="flex-1 bg-transparent px-3 py-2 text-xs outline-none" />
                <button className="bg-gradient-primary px-3 text-xs text-primary-foreground">→</button>
              </form>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground">
            <div>{t.rights}</div>
            <div className="flex gap-5">
              {t.legal.map((l) => (<a key={l} href="#" className="hover:text-foreground">{l}</a>))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
