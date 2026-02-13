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

  // Check for token in multiple env var names
  const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Wrapper for GitHub API fetch with error handling
async function githubFetch(url: string): Promise<Response> {
  const res = await fetch(url, { headers: getHeaders() });

  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      const resetTime = res.headers.get('x-ratelimit-reset');
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
      const waitMinutes = resetDate ? Math.ceil((resetDate.getTime() - Date.now()) / 60000) : '?';
      throw new Error(
        `GitHub API rate limit exceeded. ${process.env.GITHUB_TOKEN ? `Resets in ~${waitMinutes} min.` : 'Add a GITHUB_TOKEN to your .env file to get 5000 requests/hour (currently using unauthenticated: 60/hour).'}`
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
    // 1. Fetch user profile
    const userRes = await githubFetch(`https://api.github.com/users/${username}`);
    const user = await userRes.json();

    // 2. Fetch repos (single call, sorted by updated)
    const reposRes = await githubFetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`);
    const allRepos = await reposRes.json();

    if (!Array.isArray(allRepos)) {
      throw new Error('Could not retrieve repository list.');
    }

    // Filter out forks, take top 10
    const originalRepos = allRepos.filter((r: any) => !r.fork);
    const topRepos = originalRepos.slice(0, 10);

    // Aggregate language distribution across ALL repos
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

    // 3. Deep-dive into top repos: README + recent commits
    // Use Promise.allSettled to not fail if one repo errors
    const repoResults = await Promise.allSettled(
      topRepos.map(async (repo: any) => {
        // Fetch README
        let readme = 'No README found';
        try {
          const readmeRes = await fetch(
            `https://api.github.com/repos/${username}/${repo.name}/readme`,
            { headers: { ...getHeaders(), Accept: 'application/vnd.github.raw' } }
          );
          if (readmeRes.ok) {
            readme = await readmeRes.text();
          }
        } catch { /* skip */ }

        // Fetch recent commits
        let commits: any[] = [];
        try {
          const commitsRes = await fetch(
            `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=5`,
            { headers: getHeaders() }
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
          readme: readme.substring(0, 3000),
          commits: commits.map((c: any) => ({
            message: c.commit?.message || '',
            date: c.commit?.author?.date || ''
          }))
        };
      })
    );

    // Extract successful results, use fallback for failed ones
    const repoDetails = repoResults.map((result, i) => {
      if (result.status === 'fulfilled') return result.value;
      return {
        name: topRepos[i]?.name || 'unknown',
        description: topRepos[i]?.description || '',
        language: topRepos[i]?.language || null,
        stars: topRepos[i]?.stargazers_count || 0,
        readme: 'Could not fetch details',
        commits: []
      };
    });

    // Build summary string for AI analysis
    const summaryString = `
USER: ${user.login}
BIO: ${user.bio || 'N/A'}
LOCATION: ${user.location || 'N/A'}
PUBLIC REPOS: ${user.public_repos}
FOLLOWERS: ${user.followers}
FOLLOWING: ${user.following}
ACCOUNT CREATED: ${user.created_at}

LANGUAGE DISTRIBUTION (across ${allRepos.length} repos): ${languageBreakdown || 'N/A'}

ANALYZED REPOSITORIES (${repoDetails.length} original, non-fork repos):
${repoDetails.map(r => `
--- REPO: ${r.name} ---
LANGUAGE: ${r.language || 'N/A'}
STARS: ${r.stars}
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
