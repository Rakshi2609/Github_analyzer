"use client";

import { useEffect, useState } from 'react';
import { provideAnalysisSummaryAndRecommendations, ProvideAnalysisSummaryAndRecommendationsOutput } from '@/ai/flows/provide-analysis-summary-and-recommendations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Zap,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Layers,
  BookOpen,
  History,
  Target,
  ArrowRight,
  User,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Users,
  Sparkles,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SpiralAnimation } from '@/components/ui/spiral-animation';

interface AnalysisDashboardProps {
  initialData: any;
  username: string;
}

// Circular progress ring component
function CircularScore({ score, maxScore = 10, size = 80, label }: { score: number; maxScore?: number; size?: number; label?: string }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / maxScore) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="hsl(228 20% 16%)" strokeWidth="4" fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="hsl(270 60% 70%)" strokeWidth="4" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-headline font-bold text-foreground">{score}</span>
        {label && <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
}

export function AnalysisDashboard({ initialData, username }: AnalysisDashboardProps) {
  const [summary, setSummary] = useState<ProvideAnalysisSummaryAndRecommendationsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function getSummary(jd?: string) {
    setIsAnalyzing(true);
    try {
      const result = await provideAnalysisSummaryAndRecommendations({
        githubData: initialData.summaryString,
        ...(jd || jobDescription ? { jobDescription: jd || jobDescription } : {})
      });
      setSummary(result);
    } catch (e) {
      console.error("AI Analysis failed", e);
    } finally {
      setLoading(false);
      setIsAnalyzing(false);
    }
  }

  useEffect(() => {
    getSummary();
  }, [initialData.summaryString]);

  // ── SPIRAL LOADING STATE ──
  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black">
        <div className="absolute inset-0 opacity-30">
          <SpiralAnimation />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="p-5 rounded-2xl glass-strong">
            <Sparkles className="w-12 h-12 text-accent animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-white tracking-tight">
              Decoding Engineering DNA
            </h2>
            <p className="text-sm text-white/50 tracking-wide">
              Analyzing {initialData.repositories?.length || 10} repositories in depth...
            </p>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-accent"
                style={{
                  animation: 'pulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-20 space-y-4">
        <XCircle className="w-12 h-12 text-destructive mx-auto" />
        <p className="text-destructive font-headline font-bold text-xl">Failed to generate analysis</p>
        <p className="text-muted-foreground text-sm">The AI could not process the data. Please try again.</p>
      </div>
    );
  }

  const debtScore = Number(summary.technical_debt_score);

  const pillarData = [
    { icon: <ShieldCheck className="w-5 h-5" />, title: 'Signal vs Noise', pillar: summary.pillars.signal_vs_noise, color: 'from-purple-500/20 to-transparent' },
    { icon: <Layers className="w-5 h-5" />, title: 'Architecture', pillar: summary.pillars.architecture, color: 'from-blue-500/20 to-transparent' },
    { icon: <BookOpen className="w-5 h-5" />, title: 'Doc UX', pillar: summary.pillars.doc_ux, color: 'from-emerald-500/20 to-transparent' },
    { icon: <History className="w-5 h-5" />, title: 'Code Evolution', pillar: summary.pillars.code_evolution, color: 'from-amber-500/20 to-transparent' },
  ];

  return (
    <div className="space-y-8 pb-24">
      {/* ── JOB DESCRIPTION TOOL ── */}
      <section
        className="rounded-2xl glass-strong p-6 relative overflow-hidden animate-fade-up glow-accent"
      >
        <div className="absolute top-0 right-0 p-4 opacity-[0.06]">
          <Briefcase className="w-28 h-28 text-accent" />
        </div>
        <div className="space-y-4 max-w-3xl relative z-10">
          <div className="space-y-1">
            <h2 className="text-xl font-headline font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Job-Specific Evaluation
              <span className="text-xs font-normal text-muted-foreground ml-1">(Optional)</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Paste a JD to evaluate role fit, or explore the general analysis below.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Textarea
              placeholder="Paste Job Description here..."
              className="flex-grow glass rounded-xl border-white/[0.06] min-h-[90px] text-sm placeholder:text-muted-foreground/50 focus:ring-accent/20"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <Button
              onClick={() => getSummary()}
              disabled={isAnalyzing || !jobDescription}
              className="sm:w-28 h-auto bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-semibold shadow-lg shadow-accent/10"
            >
              {isAnalyzing ? "Analyzing..." : "Evaluate"}
            </Button>
          </div>
        </div>
      </section>

      {/* ── HIRE RECOMMENDATION ── */}
      {summary.hire_recommendation && (
        <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <Card className={`border-none shadow-2xl overflow-hidden rounded-2xl ${summary.hire_recommendation.decision === 'Strong Hire' ? 'glass glow-green' :
              summary.hire_recommendation.decision === 'Consider' ? 'glass glow-accent' : 'glass border-destructive/20'
            }`}>
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0 flex flex-col items-center gap-3">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${summary.hire_recommendation.decision === 'Strong Hire' ? 'bg-green-500/10 text-green-400' :
                    summary.hire_recommendation.decision === 'Consider' ? 'bg-amber-500/10 text-amber-400' : 'bg-destructive/10 text-destructive'
                  }`}>
                  {summary.hire_recommendation.decision === 'Strong Hire' ? <CheckCircle2 className="w-10 h-10" /> :
                    summary.hire_recommendation.decision === 'Consider' ? <AlertCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Decision</span>
                  <div className="text-base font-headline font-bold">{summary.hire_recommendation.decision}</div>
                </div>
              </div>
              <div className="flex-grow space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-headline font-bold">JD Fit Score</h3>
                  <span className="text-3xl font-headline font-bold text-gradient">{summary.hire_recommendation.fit_score}%</span>
                </div>
                <Progress value={summary.hire_recommendation.fit_score} className="h-2 bg-white/[0.04]" />
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &ldquo;{summary.hire_recommendation.justification}&rdquo;
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── PROFILE + PERSONA ── */}
      <section className="flex flex-col lg:flex-row gap-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <Card className="flex-grow rounded-2xl glass border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/[0.03] rounded-full -mr-24 -mt-24 blur-3xl" />
          <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <Avatar className="w-28 h-28 border-2 border-accent/20 shadow-2xl ring-4 ring-accent/[0.06]">
              <AvatarImage src={initialData.profile.avatar_url} />
              <AvatarFallback className="bg-accent/10 text-xl uppercase font-headline font-bold text-accent">{username.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="space-y-4 flex-grow">
              <div className="space-y-1.5">
                <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground flex items-center justify-center md:justify-start gap-3">
                  {initialData.profile.name || username}
                  <a href={initialData.profile.html_url} target="_blank" rel="noreferrer" className="opacity-40 hover:opacity-100 hover:text-accent transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl">{initialData.profile.bio || "No bio provided."}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge className="px-3 py-1.5 text-sm bg-accent/10 text-accent border-accent/20 rounded-lg">
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  {summary.engineering_persona}
                </Badge>
                <Badge variant="outline" className="px-3 py-1.5 text-sm border-white/[0.08] text-muted-foreground rounded-lg">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                  {summary.role_recommendation}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full lg:w-72 rounded-2xl glass border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <Zap className="w-4 h-4 text-accent" />
              Tech Debt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <CircularScore score={debtScore} label="/10" />
              <Badge className={`${debtScore > 6 ? 'bg-destructive/10 text-destructive' : debtScore > 4 ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'} rounded-lg`}>
                {debtScore > 7 ? 'High Debt' : debtScore > 4 ? 'Moderate' : 'Excellent'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground italic leading-relaxed">
              Calculated via code refinement frequency, documentation depth, and architectural patterns.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── ENGINEERING PILLARS ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        {pillarData.map((p, i) => (
          <TooltipProvider key={p.title}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="rounded-2xl glass border-none group cursor-default hover:bg-white/[0.04] transition-all duration-300">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-accent group-hover:scale-110 transition-transform`}>
                        {p.icon}
                      </div>
                      <CircularScore score={p.pillar.score} size={56} />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-headline font-semibold text-sm">{p.title}</h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{p.pillar.justification}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-[0.12em] text-accent/80 border-accent/20 rounded-md">{p.pillar.rating}</Badge>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3 text-xs leading-relaxed glass-strong rounded-xl">
                {p.pillar.justification}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </section>

      {/* ── SIGNALS & RED FLAGS ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '0.25s' }}>
        <Card className="lg:col-span-2 rounded-2xl glass border-none">
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Hiring Signals
              </CardTitle>
              <CardDescription className="text-xs">Engineering strengths identified from code analysis</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {summary.hiring_signals.map((signal, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3.5 rounded-xl glass group hover:bg-white/[0.04] transition-all">
                  <TrendingUp className="w-4 h-4 text-green-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium leading-relaxed">{signal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl glass border-none relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-destructive/40 to-transparent" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Red Flags
            </CardTitle>
            <CardDescription className="text-xs">Areas for growth or risk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.red_flags.map((flag, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-destructive/[0.04] border border-destructive/[0.08] text-xs font-medium leading-relaxed">
                {flag}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* ── ACTIONABLE ENHANCEMENT ── */}
      <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <Card className="bg-gradient-to-br from-accent/90 to-purple-700/90 text-white border-none shadow-2xl rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.05] rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
          <CardContent className="p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-[0.15em]">
                <Target className="w-3 h-3" />
                Strategic Enhancement
              </div>
              <h3 className="text-2xl md:text-3xl font-headline font-bold">Priority Improvement</h3>
              <p className="text-base opacity-90 leading-relaxed font-body">
                {summary.actionable_enhancement}
              </p>
            </div>
            <div className="shrink-0">
              <Badge className="bg-white text-accent px-5 py-2.5 text-base font-bold rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow cursor-default">
                Optimize
                <ArrowRight className="w-4 h-4" />
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── BOTTOM NAV ── */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/60 backdrop-blur-2xl border-t border-white/[0.04] p-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Search className="w-4 h-4" />
            New Search
          </Button>
          <Button
            onClick={() => window.location.href = '/compare'}
            className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2 rounded-xl shadow-lg shadow-accent/10"
          >
            <Users className="w-4 h-4" />
            Compare
          </Button>
        </div>
      </footer>
    </div>
  );
}
