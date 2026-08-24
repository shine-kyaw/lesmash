// @ts-check
import { defineConfig } from 'astro/config';
import { SITE } from './src/lib/site.config.mjs';

// Static output only. Core content must render as HTML on arrival — see PRD §5.2, §23.
/*
 * GitHub Pages serves this repo from a subpath (/lesmash/), so both the origin
 * and the base are environment-driven. A root deployment (a custom domain, or
 * Vercel) simply leaves them unset and everything resolves from /.
 */
export default defineConfig({
  site: process.env.SITE_ORIGIN || SITE.origin,
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // One stylesheet, inlined where small enough. Protects the CSS budget (PRD §21.2).
    inlineStylesheets: 'always',
    format: 'directory',
  },
  compressHTML: true,
  prefetch: false,
  image: {
    // AVIF/WebP derivatives are generated at build time (PRD §18.3).
    responsiveStyles: true,
  },
  devToolbar: { enabled: false },
});
