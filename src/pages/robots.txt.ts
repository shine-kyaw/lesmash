import type { APIRoute } from 'astro';
import { SITE } from '../lib/site.config.mjs';
import { absoluteUrl } from '../lib/i18n';

/**
 * Generated rather than static, so the sitemap URL always matches the origin
 * this build was actually deployed to (SEO-05). A hard-coded robots.txt on a
 * preview deployment points crawlers at a domain that may not exist.
 *
 * Preview deployments are also disallowed outright: a Vercel preview URL
 * serving a full copy of the site is a duplicate-content liability, and it
 * would compete with the real domain for the brand terms this project is
 * specifically trying to win back (PRD §19.7).
 */
export const GET: APIRoute = () => {
  const isPreview =
    process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development';

  const body = isPreview
    ? `# Preview deployment — not for indexing.
User-agent: *
Disallow: /
`
    : `# Le SMASH Burgers & Co. — Yangon
# /order carries no unique content and would compete with the branch pages,
# so it is excluded from indexing while remaining fully crawlable for links
# (PRD SEO-05, §9.3).

User-agent: *
Allow: /
Disallow: /order
Disallow: /my/order

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
