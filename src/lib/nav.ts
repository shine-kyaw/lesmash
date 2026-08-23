import type { Locale } from './i18n';
import { t } from '../data/copy';

export interface NavItem { route: string; label: string }

/** Top-level navigation, shared by header, drawer and footer. */
export function navItems(locale: Locale): NavItem[] {
  const c = t(locale);
  return [
    { route: '/menu', label: c.nav.menu },
    { route: '/breakfast', label: c.nav.breakfast },
    { route: '/burgers', label: c.nav.burgers },
    { route: '/locations', label: c.nav.locations },
    { route: '/about', label: c.nav.about },
  ];
}
