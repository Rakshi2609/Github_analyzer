import { Suspense } from 'react';
import { AnalysisDashboard } from '@/components/AnalysisDashboard';
import { fetchGitHubUserData } from '@/app/lib/github-service';

interface PageProps {
  params: Promise<{ username: string }>;
}

async function DashboardContent({ username }: { username: string }) {
  try {
    const data = await fetchGitHubUserData(username);
    return <AnalysisDashboard initialData={data} username={username} />;
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-headline font-bold text-destructive">Analysis Failed</h2>
          <p className="text-muted-foreground max-w-md">
            We couldn&apos;t find user &quot;{username}&quot; or the GitHub API rate limit was reached. Please try again.
          </p>
        </div>
        <a
          href="/"
          className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
        >
          ← Try another search
        </a>
      </div>
    );
  }
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* This is intentionally minimal — AnalysisDashboard handles its own loading with spiral */}
      <div className="space-y-2 text-center">
        <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground animate-pulse">Fetching GitHub data...</p>
      </div>
    </div>
  );
}

export default async function DashboardPage({ params }: PageProps) {
  const { username } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 py-4 px-6 sticky top-0 bg-background/70 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="text-xl font-headline font-bold text-gradient tracking-tight">
            GitInsights
          </a>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Analyzing</span>
            <span className="px-3 py-1 rounded-lg glass text-sm font-medium text-foreground font-code">
              {username}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent username={username} />
        </Suspense>
      </main>
    </div>
  );
}