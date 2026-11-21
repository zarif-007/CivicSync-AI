# CivicPulse AI

**Smart Citizen Grievance & Resource Optimizer**  
*Integrated public-data intelligence for planning.*

CivicPulse AI is a frontend-only Smart Nation hackathon prototype. It demonstrates how citizen-reported infrastructure issues can be organized into an urban operations workflow with simulated AI triage, zone-level issue intelligence, department routing, and resource-prioritization recommendations.

## Prototype features

- Executive dashboard with active-report, high-severity-zone, budget-estimate, and dispatch-time indicators.
- Interactive schematic city-zone density map with report filtering.
- Citizen report simulator with image preview, issue category, zone, and description.
- Simulated 1.5-second AI triage flow for category, severity, duplicate-cluster hint, and municipal-unit assignment.
- Searchable, filterable report queue with dispatch and resolution workflows.
- Browser-local report persistence across refreshes (localStorage).
- Traditional versus optimized sample budget allocation chart.
- Ranked maintenance queue with urgency, affected-population estimate, and repair-cost estimate.

## Tech stack

- React + Vite
- Tailwind CSS
- lucide-react
- Recharts

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. Keep the framework preset as **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. No environment variables or backend services are required.

## Demo notes and limitations

- All seed data is synthetic and intended for demonstration.
- AI triage is a deterministic local simulation; no external AI model is called.
- The uploaded image is previewed in the browser only. It is not transmitted or analyzed.
- The city-zone visualization is a schematic grid, not a geospatial map.
- Budget, savings, population-impact, and dispatch-time figures are illustrative estimates, not audited outcomes.
- Reports and dispatch changes persist in the current browser using localStorage; clearing site data or switching browsers/devices resets the demo state.
- Uploaded images are validated (PNG/JPG/WEBP, up to 5 MB), previewed locally, and never uploaded.
- No real municipal department is connected. Department assignment is shown as a prototype workflow.

## Frontend quality checks

A GitHub Actions workflow builds the production bundle on pushes to the improvement branches and on pull requests targeting `main`. Run the same checks locally with `npm install`, `npm test`, and `npm run build`.

## Suggested next steps

For a later production iteration, add a secure API, authentication and role-based access, persistent storage, geocoding, validated public datasets, real multimodal AI with human review, audit logs, and accessibility testing.


## DNCC backend foundation (in progress)

The `feature/production-platform-integrations` branch adds a secure server-side integration foundation for a DNCC pilot:

- `api/triage.js`: authenticated Gemini triage endpoint; validates input and marks every result for human review.
- `api/reports.js`: authenticated report creation/listing API with citizen/staff visibility constraints.
- `api/dncc.js`: transparent registry of verified official DNCC public reference sources. It explicitly reports that no live municipal API is connected.
- `supabase/schema.sql`: initial PostgreSQL schema, profile roles, report status, indexes and row-level security policies.
- `docs/DNCC-INTEGRATION.md`: public-source verification, integration prerequisites and privacy boundaries.
- `.env.example`: required environment variable names (no secrets).

### Required setup

1. Create a Supabase project and apply `supabase/schema.sql`.
2. Configure server-only `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GEMINI_API_KEY` in the deployment environment. Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only as server secrets.
3. Configure browser `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` when the authentication UI is wired.
4. Set staff/admin roles only through a trusted administrative process.
5. Obtain DNCC permission, API documentation and authoritative ward boundary data before enabling live municipal case exchange or claiming official integration.

**Important:** These backend endpoints and schema are an integration foundation, not a completed production deployment. The existing demo UI has not yet been switched over to them. The AI endpoint requires a configured Gemini key. The DNCC registry is not a live government API.