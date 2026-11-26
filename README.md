# CivicSync AI

**AI-assisted civic issue reporting and municipal workflow prototype**  
*Hackathon demonstration for a DNCC-inspired service workflow.*

CivicSync AI demonstrates how a citizen report could be analyzed, mapped, routed to a municipal department and reviewed by staff. It is a prototype only: it is not an official DNCC service and does not send complaints to the government.

## Features

- Executive dashboard with synthetic issue, severity and resource indicators.
- OpenStreetMap basemap centered on Dhaka North with illustrative neighborhood markers.
- Citizen issue submission with image preview and client-side validation.
- Real Gemini-powered triage through a server-side API endpoint, with a short evidence-based rationale and explicit human-review requirement.
- Synthetic department routing through a mock DNCC adapter.
- Demonstration report queue with dispatch and resolution workflow.
- Public website browsing without an account; sign in from the profile area only when entering a Citizen, Department Staff or Administrator demo workspace.
- Staff assignment workflow, staff-only assigned work queue and an accessible report response timeline.
- In-app activity notifications, complaint hotspot summaries, priority escalation flags and citizen resolution feedback.
- Duplicate-report cluster hints, CSV export and sample-data reset controls.
- Browser-local persistence through localStorage and session-only demo sign-in.
- Dark mode, mobile-responsive layout, keyboard focus indicators, reduced-motion support and graceful fallback states for map/chart failures.

## Recent polish (design system + UI)

- Refined panel system with subtle glass / backdrop-blur treatment and improved light/dark contrast.
- Stronger focus rings, smoother micro-interactions and hover states on cards and buttons.
- Enhanced Demo Login experience with mesh background, gradient brand mark and clearer visual hierarchy.
- Expanded Tailwind tokens (richer shadows, scale-in animation, mesh backgrounds).
- Better selection colors, scrollbar styling and forced-colors accessibility support.
- MapView filter bar and legend polished for consistency with the design system.
- ChartRenderer improved for dark-mode grids, ticks and tooltips.
- WorkflowFeatures panels cleaned up for clearer hierarchy and readable spacing.
- ReportTimeline and error-boundary panels aligned with the new visual language.
- `index.html` improved with proper light/dark theme-color and color-scheme meta.
- Recommended App.jsx visual upgrades (Brand gradient, MetricCard trend badges, ReportTable button polish) — see PR / commit notes.

## Technology

- React 18 + Vite
- Tailwind CSS 3
- Leaflet + React Leaflet + OpenStreetMap
- Recharts
- Vercel serverless functions
- Google Gemini API (server-side)

## Run the frontend

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Vite serves the frontend only. The Gemini and mock municipal API routes live in `api/` and are executed by Vercel, not by the Vite development server. To test the full workflow locally, use the Vercel CLI and run `vercel dev`.

## Architecture overview

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the application flow, frontend modules, API boundaries and demo-data lifecycle. For a presenter-led judging sequence, see [docs/DEMO-WALKTHROUGH.md](docs/DEMO-WALKTHROUGH.md).

## Configure real AI inference

Set `GEMINI_API_KEY` as a server-side environment variable in Vercel. Optionally set `GEMINI_MODEL` (defaults to `gemini-2.5-flash`). Never add the key to a `VITE_*` variable or commit it to Git.

If the key is missing or Gemini fails, the app shows an actionable error and does not create a fake AI result. Successful triage includes a short rationale grounded in the submitted description. The displayed model self-assessment is not independently calibrated and must not be interpreted as a probability of correctness. Gemini output remains a suggestion; staff review is required.

## Deploy a hackathon preview

1. Import the repository into Vercel.
2. Use the Vite framework preset.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add `GEMINI_API_KEY` to the Vercel environment.
6. Deploy and test the API routes on the preview URL.

## Demo accounts and data

The public dashboard, transparency view and sample reports can be browsed without signing in. Use the **Profile · Sign in** control in the site header when you want to enter a role-specific demo workspace or submit a citizen report. Use one of these public sample accounts on the sign-in screen:

| Role | Email | Password |
|---|---|---|
| Citizen | `citizen@civicsync.demo` | `Citizen@123` |
| Department staff | `staff@civicsync.demo` | `Staff@123` |
| Administrator | `admin@civicsync.demo` | `Admin@123` |

These are intentionally public demonstration credentials. Sign-in is a **presentation-only demo gate**, not real authentication: credentials are embedded in the public frontend, roles are not server-authorized, and no private user accounts should be created. The demo session is kept in `sessionStorage` and ends when the user signs out or the browser session is cleared.

Reports, staff assignments, notifications and citizen feedback persist only in the current browser using `localStorage`. They are not shared between browsers or users. The generic demo staff workspace can act on reports assigned to the sample staff roster. Hotspots are calculated from the local report snapshot. Priority escalation flags reports with severity 90+ or an age of at least 48 hours; these are illustrative review prompts, not official SLA breaches. Resolution feedback is local demonstration data. Seed reports, issue density, budget figures, population impact, dispatch times, sample departments, ward labels and service targets are synthetic.

## DNCC simulation boundary

- `GET /api/demo/municipal` returns mock departments, sample ward labels and illustrative service targets.
- `POST /api/demo/triage` uses Gemini for real inference and marks every result as requiring human review.
- `GET /api/dncc` is a backwards-compatible alias for the mock municipal adapter.
- Map tiles are from OpenStreetMap; the plotted points are illustrative neighborhood coordinates, not official ward polygons.
- No complaint is sent to DNCC, no government data is queried and no official status is retrieved.
- No government contact or permission is required for this hackathon prototype.

## Privacy and safety

Use synthetic data during judging. Do not enter real citizen personal information. The current upload preview remains local to the browser and is not uploaded or analyzed by Gemini. AI triage is decision support only; staff review is required.

## Validation

Run:

```bash
npm test
npm run build
```

The CI workflow should run the same checks on the pull request. A successful build does not mean that deployment secrets or Gemini connectivity have been configured.

## Security posture

See [SECURITY.md](SECURITY.md) for the prototype's security boundaries, deployment requirements and maintainer hardening checklist. This project is a public hackathon demo, not a production municipal reporting service.
