'use client';

import { Search, Github, ShieldCheck, Terminal, BookOpen, Layers, ArrowRight, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';
import { SpiralAnimation } from '@/components/ui/spiral-animation';
import { GlowCard } from '@/components/ui/spotlight-card';

export default function Home() {
  const [username, setUsername] = useState('');
  const [showLoading, setShowLoading] = useState(true);
  const [loadingFadeOut, setLoadingFadeOut] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Loading screen shows first, then fades out to reveal content
  useEffect(() => {
    const fadeTimer = setTimeout(() => setLoadingFadeOut(true), 2800);
    const hideTimer = setTimeout(() => setShowLoading(false), 3500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      window.location.href = `/dashboard/${username.trim()}`;
    }
  };

  const features = [
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: 'Signal vs Noise',
      desc: 'Cut through tutorial repos to find real engineering depth',
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: 'Architecture',
      desc: 'Evaluate design patterns and system thinking maturity',
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: 'Doc UX',
      desc: 'Measure documentation quality and time-to-understand',
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      title: 'Code Evolution',
      desc: 'Analyze commit patterns and iterative refinement',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── LOADING SCREEN (shows first) ── */}
      {showLoading && (
        <div
          className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-700 ${loadingFadeOut ? 'opacity-0' : 'opacity-100'
            }`}
        >
          <div className="absolute inset-0 opacity-40">
            <SpiralAnimation />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06]">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="animate-pulse">
                <circle cx="24" cy="24" r="20" stroke="hsl(270,60%,70%)" strokeWidth="2" strokeDasharray="6 4" opacity="0.3" />
                <path d="M24 8C24 8 18 16 18 24C18 32 24 40 24 40C24 40 30 32 30 24C30 16 24 8 24 8Z" fill="hsl(270,60%,70%)" opacity="0.6" />
                <circle cx="24" cy="24" r="4" fill="white" />
                <circle cx="24" cy="24" r="8" stroke="hsl(270,60%,70%)" strokeWidth="1.5" opacity="0.4" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-white tracking-tight">
                Git<span className="text-gradient">Insights</span>
              </h2>
              <p className="text-sm text-white/40 tracking-[0.15em] uppercase font-light">
                Engineering DNA Analysis
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-purple-400"
                  style={{
                    animation: 'pulse 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT (revealed after loading) ── */}
      <div className={`flex flex-col items-center justify-center min-h-screen px-4 py-20 transition-opacity duration-500 ${showLoading ? 'opacity-0' : 'opacity-100'}`}>
        {/* Spiral animation as subtle background */}
        <div className="absolute inset-0 z-0 opacity-[0.12]">
          <SpiralAnimation />
        </div>

        {/* Ambient glow orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/8 rounded-full blur-[130px] animate-float" style={{ animationDelay: '3s' }} />
        </div>

        {/* Main content */}
        <div className="relative z-10 w-full max-w-3xl text-center space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-purple-300 uppercase tracking-[0.15em] animate-fade-up">
            <Github className="w-3.5 h-3.5" />
            Engineering DNA Analysis
          </div>

          {/* Headline */}
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tight leading-[1.05]">
              Decode Their{' '}
              <span className="text-gradient">
                Engineering DNA
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto font-body leading-relaxed">
              Go beyond stars and followers. Our AI evaluates original problem solving,
              architectural maturity, and documentation quality across{' '}
              <span className="text-foreground font-medium">10 repos deep</span>.
            </p>
          </div>

          {/* Search form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="relative flex-grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
                className="pl-11 h-13 glass-strong rounded-xl text-base focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-13 bg-accent hover:bg-accent/90 text-accent-foreground px-8 font-semibold rounded-xl shadow-lg shadow-accent/10 hover:shadow-accent/20 transition-all group"
            >
              Analyze
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>

          {/* Compare link */}
          <div className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <a
              href="/compare"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group"
            >
              <Users className="w-4 h-4" />
              Compare multiple candidates
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Feature cards with GlowCard spotlight effect */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {features.map((f, i) => (
              <div key={f.title} className="animate-fade-up" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
                <GlowCard
                  glowColor="purple"
                  customSize
                  className="!aspect-auto group flex flex-col items-center gap-3 !p-5 cursor-default"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 group-hover:bg-accent/15 transition-all relative z-10">
                    {f.icon}
                  </div>
                  <div className="text-center relative z-10">
                    <span className="text-sm font-semibold text-foreground">{f.title}</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 hidden md:block">{f.desc}</p>
                  </div>
                </GlowCard>
              </div>
            ))}
          </div>

          {/* Subtle bottom info */}
          <div className="animate-fade-up flex items-center justify-center gap-2 text-xs text-muted-foreground/60" style={{ animationDelay: '0.6s' }}>
            <Sparkles className="w-3 h-3" />
            Powered by Genkit AI — Analyzes 10 repos in depth
          </div>
        </div>
      </div>
    </div>
  );
}
