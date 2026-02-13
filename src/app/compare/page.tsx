"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  Trophy,
  Target,
  BarChart3,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { fetchGitHubUserData } from '@/app/lib/github-service';
import { provideAnalysisSummaryAndRecommendations } from '@/ai/flows/provide-analysis-summary-and-recommendations';
import { compareCandidates, CompareCandidatesOutput } from '@/ai/flows/compare-candidates-flow';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SpiralAnimation } from '@/components/ui/spiral-animation';

export default function ComparePage() {
  const [usernames, setUsernames] = useState<string[]>([""]);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<CompareCandidatesOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  const addUsernameField = () => {
    if (usernames.length < 4) {
      setUsernames([...usernames, ""]);
    }
  };

  const removeUsernameField = (index: number) => {
    const newFields = [...usernames];
    newFields.splice(index, 1);
    setUsernames(newFields);
  };

  const updateUsername = (index: number, value: string) => {
    const newFields = [...usernames];
    newFields[index] = value;
    setUsernames(newFields);
  };

  const runComparison = async () => {
    setLoading(true);
    setError(null);
    setComparison(null);
    try {
      const validUsernames = usernames.filter(u => u.trim() !== "");
      if (validUsernames.length < 2) throw new Error("Please enter at least 2 usernames.");

      const summaries = await Promise.all(
        validUsernames.map(async (user, idx) => {
          setProgress(`Analyzing ${user} (${idx + 1}/${validUsernames.length})...`);
          const data = await fetchGitHubUserData(user);
          const analysis = await provideAnalysisSummaryAndRecommendations({
            githubData: data.summaryString,
            ...(jobDescription ? { jobDescription } : {})
          });
          return {
            username: user,
            persona: analysis.engineering_persona,
            fit_score: analysis.hire_recommendation?.fit_score || 0,
            top_signal: analysis.hiring_signals[0] || "No specific signals",
            main_red_flag: analysis.red_flags[0] || "No major flags",
          };
        })
      );

      setProgress("Running comparative analysis...");
      const result = await compareCandidates({
        ...(jobDescription ? { jobDescription } : {}),
        candidates: summaries
      });
      setComparison(result);
    } catch (e: any) {
      setError(e.message || "Comparison failed. Please check usernames.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  // Rank color mapping
  const rankStyle = (rank: number) => {
    if (rank === 1) return 'border-amber-400/30 bg-amber-400/[0.04]';
    if (rank === 2) return 'border-slate-300/20 bg-slate-300/[0.03]';
    return 'border-white/[0.06] bg-white/[0.02]';
  };

  const rankBadge = (rank: number) => {
    if (rank === 1) return 'bg-amber-400/15 text-amber-300 border-amber-400/20';
    if (rank === 2) return 'bg-slate-300/10 text-slate-300 border-slate-300/15';
    return 'bg-white/5 text-muted-foreground border-white/10';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-white/[0.04] py-4 px-6 sticky top-0 bg-background/70 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.location.href = '/'} className="text-muted-foreground hover:text-accent pl-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-5 w-px bg-border" />
            <h1 className="text-xl font-headline font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Talent Comparison
            </h1>
          </div>
          <a href="/" className="text-sm font-headline font-bold text-gradient">GitInsights</a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT: INPUTS ── */}
          <div className="lg:col-span-1 space-y-5">
            <Card className="glass rounded-2xl border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Candidates</CardTitle>
                <CardDescription className="text-xs">Enter up to 4 GitHub usernames</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {usernames.map((u, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`github-user-${i + 1}`}
                      value={u}
                      onChange={(e) => updateUsername(i, e.target.value)}
                      className="glass rounded-xl border-white/[0.06] text-sm font-code placeholder:font-body"
                    />
                    {usernames.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeUsernameField(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {usernames.length < 4 && (
                  <Button variant="outline" className="w-full border-dashed border-white/[0.08] hover:border-accent/30 rounded-xl text-muted-foreground hover:text-accent" onClick={addUsernameField}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Candidate
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="glass rounded-2xl border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Job Context <span className="text-xs font-normal text-muted-foreground ml-1">(Optional)</span>
                </CardTitle>
                <CardDescription className="text-xs">Leave empty for general engineering quality comparison</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Paste Job Description..."
                  className="min-h-[160px] glass rounded-xl border-white/[0.06] text-sm placeholder:text-muted-foreground/50"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <Button
                  onClick={runComparison}
                  disabled={loading}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 font-bold rounded-xl shadow-lg shadow-accent/10"
                >
                  {loading ? "Analyzing..." : "Compare Engineering DNA"}
                </Button>
                {error && <p className="text-xs text-destructive text-center">{error}</p>}
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: RESULTS ── */}
          <div className="lg:col-span-2">
            {/* Empty state */}
            {!comparison && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-2xl glass opacity-60">
                <BarChart3 className="w-16 h-16 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-headline font-bold">No Analysis Yet</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Enter candidates to see a head-to-head comparison. Optionally add a JD for role-specific evaluation.
                </p>
              </div>
            )}

            {/* Loading with spiral */}
            {loading && (
              <div className="h-[500px] rounded-2xl overflow-hidden relative flex flex-col items-center justify-center">
                <div className="absolute inset-0 opacity-20">
                  <SpiralAnimation />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-5">
                  <div className="p-4 rounded-2xl glass-strong">
                    <Sparkles className="w-10 h-10 text-accent animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-headline font-bold text-lg text-accent">{progress || "Running Comparative Analysis..."}</p>
                    <p className="text-xs text-muted-foreground">Analyzing 10 repos per candidate</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-accent"
                        style={{ animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {comparison && (
              <div className="space-y-6 animate-fade-up">
                {/* Winner Card */}
                <Card className="bg-gradient-to-br from-accent/80 to-purple-700/80 text-white border-none shadow-2xl rounded-2xl relative overflow-hidden glow-accent-strong">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.08]">
                    <Trophy className="w-28 h-28" />
                  </div>
                  <CardContent className="p-8 space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-[0.15em]">
                      <Target className="w-3 h-3" />
                      Top Recommended Pick
                    </div>
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">
                      Winner: {comparison.best_fit.split(' ')[0]}
                    </h2>
                    <p className="text-base leading-relaxed opacity-90">{comparison.best_fit}</p>
                  </CardContent>
                </Card>

                {/* Rankings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {comparison.ranking.map((rank) => (
                    <Card key={rank.username} className={`rounded-2xl border ${rankStyle(rank.rank)} backdrop-blur-xl`}>
                      <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <Avatar className="w-11 h-11 ring-2 ring-white/[0.06]">
                          <AvatarFallback className="bg-accent/10 text-accent font-headline font-bold text-sm">
                            {rank.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-code">{rank.username}</CardTitle>
                            <Badge className={`${rankBadge(rank.rank)} rounded-md text-[10px] font-bold`}>
                              #{rank.rank}
                            </Badge>
                          </div>
                          <CardDescription className="text-[10px] uppercase tracking-wider">Engineering Fit</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          &ldquo;{rank.reasoning}&rdquo;
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Comparative Matrix */}
                <Card className="rounded-2xl glass border-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      Head-to-Head Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-5 rounded-xl glass border border-white/[0.04]">
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                        {comparison.head_to_head}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
