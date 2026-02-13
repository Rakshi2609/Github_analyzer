export interface GitHubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  language: string;
  updated_at: string;
  html_url: string;
  fork: boolean;
}

export interface GitHubCommit {
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
}

// Build auth headers if GITHUB_TOKEN is set
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };

  const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[GitHub] Using authenticated requests (token found)');
  } else {
    console.warn('[GitHub] WARNING: No GITHUB_TOKEN found in .env — using unauthenticated requests (60 req/hr limit)');
  }

  return headers;
}

// Wrapper for GitHub API fetch with error handling
async function githubFetch(url: string): Promise<Response> {
  const headers = getHeaders();
  const res = await fetch(url, { headers, cache: 'no-store' });

  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    const limit = res.headers.get('x-ratelimit-limit');
    console.error(`[GitHub] 403 Forbidden — Rate limit: ${remaining}/${limit}`);
    if (remaining === '0') {
      const resetTime = res.headers.get('x-ratelimit-reset');
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
      const waitMinutes = resetDate ? Math.ceil((resetDate.getTime() - Date.now()) / 60000) : '?';
      throw new Error(
        `GitHub API rate limit exceeded. ${limit === '60' ? 'Your GITHUB_TOKEN is not being used! Make sure it is set correctly in .env and restart the dev server.' : `Resets in ~${waitMinutes} min.`}`
      );
    }
  }

  if (res.status === 404) {
    throw new Error('User not found on GitHub.');
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res;
}

export async function fetchGitHubUserData(username: string) {
  try {
    const headers = getHeaders();

    // 1. Fetch user profile
    const userRes = await githubFetch(`https://api.github.com/users/${username}`);
    const user = await userRes.json();

    // 2. Fetch repos
    const reposRes = await githubFetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`);
    const allRepos = await reposRes.json();

    if (!Array.isArray(allRepos)) {
      throw new Error('Could not retrieve repository list.');
    }

    // Filter out forks, take top 10
    const originalRepos = allRepos.filter((r: any) => !r.fork);
    const topRepos = originalRepos.slice(0, 10);

    // Aggregate stats
    const totalStars = allRepos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0);
    const totalForks = allRepos.reduce((sum: number, r: any) => sum + (r.forks_count || 0), 0);
    const totalWatchers = allRepos.reduce((sum: number, r: any) => sum + (r.watchers_count || 0), 0);
    const forkedRepos = allRepos.filter((r: any) => r.fork).length;

    const languageMap: Record<string, number> = {};
    for (const repo of allRepos) {
      if (repo.language) {
        languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
      }
    }
    const languageBreakdown = Object.entries(languageMap)
      .sort(([, a], [, b]) => b - a)
      .map(([lang, count]) => `${lang}: ${count} repos`)
      .join(', ');

    // 3. Fetch recent events (PRs, issues, contributions)
    let prCount = 0;
    let issueCount = 0;
    let pushCount = 0;
    try {
      const eventsRes = await fetch(
        `https://api.github.com/users/${username}/events/public?per_page=100`,
        { headers, cache: 'no-store' }
      );
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        if (Array.isArray(events)) {
          prCount = events.filter((e: any) => e.type === 'PullRequestEvent').length;
          issueCount = events.filter((e: any) => e.type === 'IssuesEvent').length;
          pushCount = events.filter((e: any) => e.type === 'PushEvent').length;
        }
      }
    } catch { /* skip */ }

    // 4. Deep-dive into top repos
    const repoResults = await Promise.allSettled(
      topRepos.map(async (repo: any) => {
        let readme = 'No README found';
        try {
          const readmeRes = await fetch(
            `https://api.github.com/repos/${username}/${repo.name}/readme`,
            { headers: { ...headers, Accept: 'application/vnd.github.raw' }, cache: 'no-store' }
          );
          if (readmeRes.ok) readme = await readmeRes.text();
        } catch { /* skip */ }

        let commits: any[] = [];
        try {
          const commitsRes = await fetch(
            `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=5`,
            { headers, cache: 'no-store' }
          );
          if (commitsRes.ok) {
            const data = await commitsRes.json();
            commits = Array.isArray(data) ? data : [];
          }
        } catch { /* skip */ }

        return {
          name: repo.name,
          description: repo.description || 'No description',
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          open_issues: repo.open_issues_count,
          readme: readme.substring(0, 3000),
          commits: commits.map((c: any) => ({
            message: c.commit?.message || '',
            date: c.commit?.author?.date || ''
          }))
        };
      })
    );

    const repoDetails = repoResults.map((result, i) => {
      if (result.status === 'fulfilled') return result.value;
      return {
        name: topRepos[i]?.name || 'unknown',
        description: topRepos[i]?.description || '',
        language: topRepos[i]?.language || null,
        stars: topRepos[i]?.stargazers_count || 0,
        forks: 0,
        open_issues: 0,
        readme: 'Could not fetch details',
        commits: []
      };
    });

    // Build enriched summary string for AI
    const summaryString = `
USER: ${user.login}
BIO: ${user.bio || 'N/A'}
LOCATION: ${user.location || 'N/A'}
PUBLIC REPOS: ${user.public_repos}
FOLLOWERS: ${user.followers}
FOLLOWING: ${user.following}
ACCOUNT CREATED: ${user.created_at}

=== CONTRIBUTION & COMMUNITY IMPACT (treat these as POSITIVE indicators) ===
TOTAL STARS RECEIVED: ${totalStars} (community recognition of useful work)
TOTAL FORKS BY OTHERS: ${totalForks} (others building upon their work)
TOTAL WATCHERS: ${totalWatchers}
REPOS THEY FORKED (contributions to other projects): ${forkedRepos}
RECENT PULL REQUESTS (last 100 events): ${prCount} PRs (collaboration & contribution)
RECENT ISSUES FILED: ${issueCount} (engagement with community)
RECENT PUSH EVENTS: ${pushCount} (active development)

=== LANGUAGE DISTRIBUTION (across ${allRepos.length} repos) ===
${languageBreakdown || 'N/A'}

=== ANALYZED REPOSITORIES (${repoDetails.length} original, non-fork repos) ===
${repoDetails.map(r => `
--- REPO: ${r.name} ---
LANGUAGE: ${r.language || 'N/A'}
⭐ STARS: ${r.stars} | 🍴 FORKS: ${r.forks} | ISSUES: ${r.open_issues}
DESCRIPTION: ${r.description}
README (excerpt): ${r.readme.substring(0, 1200)}
RECENT COMMITS: ${r.commits.map(c => `[${c.date}] ${c.message}`).join(' | ') || 'No commits'}
`).join('\n')}
    `;

    return {
      profile: user,
      repositories: repoDetails,
      summaryString,
    };
  } catch (error: any) {
    console.error('GitHub API error:', error.message);
    throw error;
  }
}
