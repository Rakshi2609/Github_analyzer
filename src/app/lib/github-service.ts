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

export async function fetchGitHubUserData(username: string) {
  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) {
      if (userRes.status === 404) throw new Error('User not found');
      if (userRes.status === 403) throw new Error('GitHub API rate limit exceeded. Please try again later.');
      throw new Error('Failed to fetch user profile');
    }
    const user = await userRes.json();

    // Fetch more repos for deeper analysis
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`);
    if (!reposRes.ok) throw new Error('Failed to fetch repositories');

    const allRepos = await reposRes.json();

    if (!Array.isArray(allRepos)) {
      console.error('GitHub API returned non-array for repos:', allRepos);
      throw new Error('Could not retrieve repository list. API limit might be reached.');
    }

    // Filter out forks, take top 10 by recency
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

    // Deep-dive into top repos: README + commits
    const repoDetails = await Promise.all(
      topRepos.map(async (repo: any) => {
        try {
          const readmeRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
            headers: { Accept: 'application/vnd.github.raw' },
          });
          const readme = readmeRes.ok ? await readmeRes.text() : 'No README found';

          const commitsRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits?per_page=10`);
          const commits: GitHubCommit[] = commitsRes.ok ? await commitsRes.json() : [];

          return {
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            readme: readme.substring(0, 4000),
            commits: (Array.isArray(commits) ? commits : []).map(c => ({
              message: c.commit.message,
              date: c.commit.author.date
            }))
          };
        } catch (e) {
          return { name: repo.name, description: repo.description, language: repo.language, stars: 0, readme: 'Error fetching details', commits: [] };
        }
      })
    );

    // Build a rich summary string for AI analysis
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
DESCRIPTION: ${r.description || 'No description'}
README (first 1500 chars): ${r.readme.substring(0, 1500)}
RECENT COMMITS (last 10): ${r.commits.map(c => `[${c.date}] ${c.message}`).join(' | ')}
`).join('\n')}
    `;

    return {
      profile: user,
      repositories: repoDetails,
      summaryString,
    };
  } catch (error: any) {
    console.error('GitHub API error:', error);
    throw error;
  }
}
