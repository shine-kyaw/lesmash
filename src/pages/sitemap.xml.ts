import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/site.config.mjs';

/** Two pages. Generated so the origin always matches the deployed build. */
const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/menu', priority: '0.9', changefreq: 'weekly' },
];

export const GET: APIRoute = () => {
  const urls = ROUTES.map(
    (r) => `  <url>
    <loc>${absoluteUrl(r.path)}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  ).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};
