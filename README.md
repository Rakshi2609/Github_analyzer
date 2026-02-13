# Github_analyzer

**GitInsights** — Decode the Engineering DNA of any GitHub user using GenAI.

## Features

- 🔬 **Deep Analysis** — Analyzes 10 non-fork repos in depth (README, commits, language stats)
- 🧬 **Engineering Persona** — AI-generated persona based on code patterns
- 📊 **4 Pillar Scoring** — Signal vs Noise, Architecture, Doc UX, Code Evolution
- 🏆 **Candidate Comparison** — Compare up to 4 engineers head-to-head
- 🌀 **Spiral Loading Screen** — Immersive GSAP-powered loading animation
- ✨ **GlowCard Spotlight** — Interactive mouse-tracking glow border effects
- 🎨 **Premium UI** — Glassmorphism, glow effects, Sora + DM Sans typography

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: Google Genkit
- **Styling**: Tailwind CSS + shadcn/ui
- **Animation**: GSAP
- **Components**: GlowCard, SpiralAnimation, CircularScore
- **API**: GitHub REST API

## Components

### `/components/ui/spotlight-card.tsx`
Interactive spotlight card with mouse-tracking border glow effect. Supports 5 glow colors (`blue`, `purple`, `green`, `red`, `orange`) and 3 preset sizes or custom dimensions.

```tsx
import { GlowCard } from "@/components/ui/spotlight-card";

<GlowCard glowColor="purple" customSize className="p-6">
  <h3>Your content</h3>
</GlowCard>
```

### `/components/ui/spiral-animation.tsx`
Full-screen GSAP-powered 3D spiral animation with 5000 particles. Used as loading screen and subtle background effect.

## Getting Started

# GitInsights (Github_analyzer)

**Decode the Engineering DNA of any GitHub user using GenAI.**

This repository powers GitInsights — a Next.js app that analyzes a GitHub user's public profile and repositories, produces summarized metrics, and generates an AI-assisted engineering persona and maturity assessment using Genkit.

**Key capabilities**
- 🔬 Deep repository analysis (top 10 original repos) — README, recent commits, language breakdown
- 🧠 AI-generated engineering persona & 4-pillar scoring (Signal vs Noise, Architecture, Doc UX, Code Evolution)
- ⚖️ Compare multiple candidates side-by-side
- ✨ Polished UI with spiral loading animation, GlowCard spotlight, and responsive layout

**Tech stack**
- **Framework:** Next.js 15 (App Router)
- **AI:** Google Genkit (`genkit` + `@genkit-ai/google-genai`)
- **Styling:** Tailwind CSS + shadcn/ui patterns
- **Animations:** GSAP
- **Language:** TypeScript + React 19

**Repository status**: development-ready — run locally via `npm run dev` (dev server on port `9002` by default).

**Important files** (quick links)
- **Project manifest:** [package.json](package.json)
- **App root/layout:** [src/app/layout.tsx](src/app/layout.tsx#L1)
- **Home page:** [src/app/page.tsx](src/app/page.tsx#L1)
- **Dashboard page:** [src/app/dashboard/[username]/page.tsx](src/app/dashboard/[username]/page.tsx#L1)
- **GitHub service & fetch logic:** [src/app/lib/github-service.ts](src/app/lib/github-service.ts#L1)
- **Genkit entry (AI dev harness):** [src/ai/dev.ts](src/ai/dev.ts#L1)

**Quick start (local)**
1. Install deps:

```bash
npm install
```

2. Run dev server (uses turbopack on port 9002):

```bash
npm run dev
```

3. Open http://localhost:9002

**Genkit AI dev tasks**
- Start the Genkit dev harness (if experimenting with AI flows):

```bash
npm run genkit:dev
```

Use `npm run genkit:watch` to run Genkit in watch mode.

**Environment variables**
- `GITHUB_TOKEN` or `NEXT_PUBLIC_GITHUB_TOKEN` or `GH_TOKEN` — optional but highly recommended. When present, the app makes authenticated GitHub API requests and gets higher rate limits. See [src/app/lib/github-service.ts](src/app/lib/github-service.ts#L1) for how the token is consumed.

If no token is set the app will use unauthenticated requests with a low rate limit (~60 requests/hour).

**Available npm scripts** (see `package.json`)
- `dev` : Run Next.js dev server (`next dev --turbopack -p 9002`)
- `build` : Build for production (`next build`)
- `start` : Start production server (`next start`)
- `lint` : Run Next.js lint
- `typecheck` : Run TypeScript type checker
- `genkit:dev` / `genkit:watch` : Start the Genkit AI dev harness

**Project structure (high level)**
- `src/ai/` — Genkit flows, AI utilities and development harness. Example: [src/ai/dev.ts](src/ai/dev.ts#L1)
- `src/app/` — Next.js App Router pages and API routes
  - `src/app/page.tsx` — Public landing page and search form
  - `src/app/compare/` — Candidate comparison UI
  - `src/app/dashboard/[username]/page.tsx` — Dashboard route that triggers analysis
- `src/components/` — UI components and shadcn/ui wrappers (GlowCard, SpiralAnimation, AnalysisDashboard)
- `src/app/lib/github-service.ts` — Central GitHub API logic, rate-limit handling, repo deep-dive

How the analysis works (high level)
1. User enters a GitHub username on the home page and navigates to `/dashboard/<username>`.
2. The dashboard server code calls `fetchGitHubUserData` in [src/app/lib/github-service.ts](src/app/lib/github-service.ts#L1) to:
   - Fetch the user profile and up to 30 repos
   - Filter original (non-fork) repos and select top 10
   - Pull README content and recent commits for each top repo
   - Produce an aggregated summary string used by AI flows
3. The enriched data is rendered by `AnalysisDashboard` (see [src/components/AnalysisDashboard.tsx](src/components/AnalysisDashboard.tsx#L1)).
4. Genkit flows in `src/ai/flows/` consume the `summaryString` to produce personas, scores, and recommendations.

**Deployment notes**
- `apphosting.yaml` is included for Firebase hosting hints, but this project is a standard Next.js app and can be deployed to Vercel, Cloud Run, or Firebase Hosting + Cloud Functions depending on your target. See [apphosting.yaml](apphosting.yaml) for a simple runConfig example.

**Troubleshooting & tips**
- If you see rate limit errors, set a `GITHUB_TOKEN` in your environment and restart the dev server. The token can be set locally in a `.env` file (not committed).
- If GitHub requests fail with 403 and `x-ratelimit-remaining` is `0`, wait until the reset time or use an authenticated token.
- The app intentionally sets `next.config.ts` to ignore TypeScript/eslint build errors for rapid iteration. For production, enable stricter checks. See [next.config.ts](next.config.ts).

**Contributing**
- Fork, create a feature branch, and open a PR.
- Keep UI changes isolated to `src/components/ui/` and flows in `src/ai/flows/`.

**Further work / ideas**
- Add caching for GitHub requests and server-side memoization to conserve rate limit.
- Add paginated repo analysis and configurable repo depth.
- Add GitHub Enterprise / GraphQL support for richer insights.

**License**
- MIT (add a LICENSE file if you want to formally license this project)

---

If you'd like, I can also:
- Run a local dev start and verify the main pages load; or
- Generate example environment `.env.example` with required variables.

**Demo video**

Watch a short demo of the app here:

- https://drive.google.com/file/d/1vfOmkbEVQDcFZsHcipA7nF2hyUGwFsPB/view?usp=drivesdk

You can embed or replace this link with a hosted MP4 or YouTube URL for easier sharing.

Clone & setup (detailed)

1. Clone the repo:

```bash
git clone https://github.com/<your-org-or-username>/Github_analyzer.git
cd Github_analyzer
```

2. Install dependencies:

```bash
npm install
```

3. Copy the example env and edit values (do NOT commit your `.env`):

```bash
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN (recommended)
```

4. Run the dev server:

```bash
npm run dev
```

5. Open the app at `http://localhost:9002` and search a GitHub username.

Example `.env` variables

- `GITHUB_TOKEN` — a personal access token to increase GitHub API rate limits. Create one at https://github.com/settings/tokens. For public analysis, `public_repo`/`read:user` scopes are sufficient. Keep this token secret.
- `NEXT_PUBLIC_GITHUB_TOKEN` — only if you understand the security implications (exposes token client-side).
- `GENKIT_API_KEY` / `GOOGLE_GENAI_API_KEY` — provider keys if you run Genkit flows requiring authenticated access.

Notes on tokens and rate limits

- Without a token GitHub limits you to ~60 requests/hour per IP; the app fetches multiple endpoints and will hit that quickly during heavy use.
- With a `GITHUB_TOKEN` you get a much higher rate limit (usually 5,000 requests/hour) and fewer 403 errors. Set the token in `.env` and restart your dev server.

Next steps I can take for you

- Run a local dev server and verify the main pages load right now.
- Create a `README-checklist.md` with developer setup and testing steps.

