# AdoptAI

Decision support for AI investments: measure business processes, compare implementation options and build an auditable financial case. Six languages: English, Spanish, French, German, Portuguese and Italian.

## What It Does

- Guided assessment with process-specific workload, labor economics, evidence, budget, timing, software stack and readiness.
- Ten curated AI opportunity types, each with its own borderless visual asset and implementation shortlist.
- Shared financial model across analysis, prioritization, simulation and executive recommendation.
- Cash savings separated from non-cash capacity gains; implementation delay, adoption ramp, recurring costs, human review and downside assumptions.
- Three editable scenarios, 12-month ROI on total costs, 24-month net value, 36-month NPV, payback and peak funding.
- Per-opportunity persistence, explicit currency conversion, CSV export and browser printing.
- Source-backed implementation guide with official product pages and partner directories. This is a curated guide, not a live generative chatbot or market ranking.

Read [the methodology](docs/METHODOLOGY.md) for formulas, assumptions, sources, limitations and validation requirements. Outputs are estimates, not supplier quotes, certified advice or guaranteed returns.

## Development

Next.js 15, React, TypeScript, Tailwind, Framer Motion and Recharts. Use Node.js 22 and the pnpm version pinned in `package.json`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000).

```sh
pnpm test
pnpm lint
pnpm build:pages
```

The build exports HTML and assets to `out/`. Google Fonts are fetched at build time and served locally in the exported website.

Browser QA runs against that exact static export:

```sh
# Requires Playwright and Edge, or set PLAYWRIGHT_MODULE and BROWSER_CHANNEL.
node tests/browser-qa.cjs
```

It covers the complete journey in six languages at desktop and two mobile sizes. Screenshots are written to ignored `artifacts/`.

## User Journey

1. `/`: interactive landing preview, entering assessment at the first step.
2. `/onboarding`: company context, economics, process selection, a measurement step per process, readiness and review.
3. `/analysis`: individually ranked opportunities, with the same cash figures as the simulator.
4. `/prioritize`: value/difficulty comparison with keyboard-accessible links to each simulation.
5. `/roi`: progressively edited financial assumptions, scenarios, results and implementation guidance.
6. `/recommendation`: the selected opportunity's current scenario, financial evidence and validation steps.

## Data and Privacy

The current assessment runs entirely in the browser. No API keys are required. Aggregate inputs and financial assumptions persist in `localStorage`; no automatic cloud upload occurs. The previous stored version is backed up locally before migration to financial model 3. Starting a new assessment clears current data and that backup.

Legacy Supabase helpers remain in the repository but are not invoked automatically by this experience. Enabling future cloud persistence or a generative advisor requires an explicit data-handling design and secure backend. Do not put private API keys in `NEXT_PUBLIC_*` variables.

## GitHub Pages

Live site: [ai-adopt.github.io](https://ai-adopt.github.io/).

Repository: [AI-Adopt/AI-Adopt.github.io](https://github.com/AI-Adopt/AI-Adopt.github.io).

**Develop and deploy only from `experience-redesign-v2`. Keep `main` unchanged. Do not merge automatically.**

The `Deploy to GitHub Pages` workflow installs from the lockfile, tests the financial model, builds the static export and publishes it. In repository Settings > Pages, the source must be GitHub Actions. The deployment job is restricted to `experience-redesign-v2`.

```sh
git switch experience-redesign-v2
git push origin experience-redesign-v2
```
