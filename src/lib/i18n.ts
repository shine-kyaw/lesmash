import { SITE, DEFAULT_LOCALE } from './site.config.mjs';

export type Locale = 'en' | 'my';

export const LOCALES: Locale[] = ['en', 'my'];

/** Locale param used by `[...lang]` routes: `undefined` for EN, `'my'` for Burmese. */
export type LangParam = undefined | 'my';

export function localeFromParam(lang: string | undefined): Locale {
  return lang === 'my' ? 'my' : 'en';
}

/** The two static paths every localised route generates. */
export function localePaths() {
  return [{ params: { lang: undefined } }, { params: { lang: 'my' } }];
}

/**
 * Build a path in a given locale. EN lives at the root, Burmese under /my/.
 * PRD §16.3 — subdirectory strategy, Latin slugs in both locales.
 */
export function localePath(locale: Locale, path = '/'): string {
  const clean = '/' + String(path).replace(/^\/+/, '').replace(/\/+$/, '');
  const base = clean === '/' ? '' : clean;
  return locale === 'en' ? base || '/' : `/my${base}` || '/my';
}

/** Strip the locale prefix from a pathname, returning the shared route key. */
export function routeKey(pathname: string): string {
  const p = '/' + pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  if (p === '/my') return '/';
  return p.startsWith('/my/') ? p.slice(3) || '/' : p;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'my' : 'en';
}

/** The switcher is always labelled in the target language, never a flag (PRD §11.1). */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  my: 'မြန်မာ',
};

export const HTML_LANG: Record<Locale, string> = { en: 'en', my: 'my' };

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.origin).toString().replace(/\/$/, '') || SITE.origin;
}

export { SITE, DEFAULT_LOCALE };
