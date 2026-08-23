// @ts-check
import { defineConfig } from 'astro/config';
import { SITE } from './src/lib/site.config.mjs';

// Static output only. Core content must render as HTML on arrival — see PRD §5.2, §23.
export default defineConfig({
  site: SITE.origin,
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
