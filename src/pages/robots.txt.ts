import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/site.config.mjs';

/**
 * Generated rather than static, so the sitemap URL always matches the origin
 * this build was actually deployed to. Preview deployments are disallowed
 * outright: a preview URL serving a full copy of the site would compete with
 * the real domain for the brand terms this project is trying to win back.
 */
export const GET: APIRoute = () => {
  const isPreview =
    process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development';

  const body = isPreview
    ? '# Preview deployment — not for indexing.\nUser-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
