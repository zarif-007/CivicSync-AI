import { json, requireMethod } from './_lib/http.js'

// DNCC's public website publishes service, ward, department and notice information.
// No supported public machine-readable complaint/ward API was verified for this project.
// Keep this registry transparent; do not scrape private systems or imply official integration.
const sources = [
  { name: 'DNCC official portal', url: 'https://dncc.gov.bd/', type: 'official_portal', status: 'public_reference' },
  { name: 'DNCC sitemap and service directory', url: 'https://dncc.gov.bd/views/sitemap', type: 'service_directory', status: 'public_reference' },
]
export default function handler(req, res) {
  if (!requireMethod(req, res, 'GET')) return
  return json(res, 200, {
    municipality: 'Dhaka North City Corporation',
    abbreviation: 'DNCC',
    sources,
    live_data_connected: false,
    note: 'These are public reference sources, not a live municipal API. Official API access, data-sharing permission and validated ward boundary datasets are required before operational integration.',
  })
}
