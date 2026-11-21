# DNCC integration plan

## Municipality scope

The first deployment target is Dhaka North City Corporation (DNCC), not DSCC. The app must not silently classify a DSCC address as a DNCC report.

## Verified public references

- DNCC official portal: https://dncc.gov.bd/
- DNCC sitemap/service directory: https://dncc.gov.bd/views/sitemap
- The official site publishes department directories (including Engineering, ICT Cell, Waste Management, Health and Urban Planning), ward officer information, citizen services, notices and links to DNCC maps/community-service location maps.
- DNCC procurement records describe GIS-based ward maps and an asset-inventory/web-GIS asset-management platform. This establishes that ward-level GIS work has existed; it does not grant this project access to those datasets or APIs.

## Integration boundary

As of this implementation, no public, documented, supported DNCC API for submitting grievances, retrieving authenticated case status, or downloading authoritative ward-boundary GeoJSON has been verified. The API endpoint `/api/dncc` therefore returns an explicitly labelled public-source registry, not fabricated live records.

Before production municipal integration, DNCC/ICT Cell must provide or authorize:
1. API documentation, base URLs, credentials and rate limits.
2. Written permission and data-sharing terms for complaint creation/status retrieval.
3. Authoritative ward boundary polygons (GeoJSON/shapefile) with coordinate reference system and version date.
4. Department routing contacts, service-level targets and escalation rules.
5. A sandbox/test account and a named technical liaison.

## Suggested data workflow

1. Citizen chooses a point on a map; the server validates the point against the approved DNCC ward polygon dataset.
2. Store coordinates as WGS84 and derive ward number from the authoritative polygon layer.
3. Persist the report and attachment metadata in Supabase; store image bytes in a private bucket with signed URLs.
4. Gemini produces a draft summary/category/severity with confidence and safety flags. A human staff member reviews it before assignment.
5. Authorized staff update status; all changes should be recorded in an append-only audit log before public launch.
6. A separately configured municipal adapter sends/receives cases only after DNCC has approved the integration.

## Data and privacy safeguards

- Never use public website scraping as a substitute for an API agreement.
- Do not send citizen personal data or exact location to an AI provider unless disclosed and authorized.
- Keep all service-role keys and AI keys server-side.
- Do not expose staff/admin role changes through user-editable profile metadata.
- Use least-privilege role policies, private storage, retention limits, abuse throttling and audit logs.
- AI output is decision support only; no automated rejection, emergency dispatch or official DNCC commitment.
