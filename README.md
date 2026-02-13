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

```bash
npm install
npm run dev
```

Open [http://localhost:9002](http://localhost:9002)

## Project Structure

```
src/
├── ai/flows/          # Genkit AI analysis flows
├── app/
│   ├── page.tsx       # Home page (spiral bg + GlowCard features)
│   ├── compare/       # Candidate comparison
│   └── dashboard/     # User analysis dashboard
├── components/
│   ├── AnalysisDashboard.tsx
│   └── ui/            # shadcn + custom components
│       ├── spotlight-card.tsx   # GlowCard
│       ├── spiral-animation.tsx # Spiral animation
│       └── ...shadcn components
└── app/lib/
    └── github-service.ts  # GitHub API service
```
