/**
 * Progressive enhancement only.
 *
 * Served verbatim from public/, unbundled and deferred. Every feature below
 * upgrades markup that already works without it. If this
 * file fails to load, fails to parse, or is blocked, the site keeps working:
 * the menu is HTML, the drawer's links live in the footer, /order is a real
 * page, and the hours table is rendered server-side. Nothing here is load-
 * bearing (PRD NAV-05, ORD-02, PERF-06, §21.3).
 */
(function () {
  'use strict';

  var STORE_BRANCH = 'lesmash.branch';

  /* ---------------------------------------------------------------- utils */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (e) { /* private mode, blocked storage — feature simply degrades */ }
    return null;
  }

  /* ------------------------------------------------------------ analytics */

  /**
   * Cookieless event dispatch. No analytics vendor is configured yet
   * (SITE.analytics.provider is null), so events are pushed to a queue that a
   * provider snippet can drain later. The taxonomy is PRD §20.2.
   *
   * Outbound events must fire BEFORE navigation (ORD-04), so external links are
   * handled on pointerdown/keydown rather than after the page starts unloading.
   */
  window.lesmashEvents = window.lesmashEvents || [];
  function track(name, props) {
    var payload = Object.assign(
      {
        event: name,
        locale: document.documentElement.lang === 'my' ? 'my' : 'en',
        page_path: location.pathname,
        device_type: window.matchMedia('(min-width: 62rem)').matches ? 'desktop' : 'mobile',
        ts: Date.now(),
      },
      props || {}
    );
    window.lesmashEvents.push(payload);
    if (typeof window.plausible === 'function') window.plausible(name, { props: payload });
  }

  var globalsBound = false;

  function bindAnalytics() {
    // Document-level, so bind once even if boot() runs again.
    if (globalsBound) return;
    globalsBound = true;
    document.addEventListener('pointerdown', handle, true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') handle(e);
    }, true);

    function handle(e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-analytics]') : null;
      if (!el || el.dataset.tracked === '1') return;
      // Guard against the same click producing pointerdown + keydown events.
      el.dataset.tracked = '1';
      setTimeout(function () { delete el.dataset.tracked; }, 400);

      track(el.dataset.analytics, {
        branch_slug: el.dataset.branch || undefined,
        source: el.dataset.source || undefined,
        category_slug: el.dataset.category || undefined,
        platform: el.dataset.platform || undefined,
        to_locale: el.dataset.toLocale || undefined,
      });

      if (el.dataset.rememberBranch) store(STORE_BRANCH, el.dataset.rememberBranch);
    }
  }

  /* --------------------------------------------------------------- drawer */

  function initDrawer() {
    var toggle = $('[data-drawer-open]');
    var drawer = $('#site-drawer');
    if (!toggle || !drawer) return;

    // Revealed only now — before script runs, a dead toggle would be worse
    // than no toggle, so it ships hidden.
    toggle.hidden = false;

    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      drawer.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var first = $('a, button', drawer);
      if (first) first.focus();
      document.addEventListener('keydown', onKey);
    }

    function close() {
      drawer.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      if (lastFocus) lastFocus.focus();
    }

    function onKey(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      // Focus stays inside the drawer while it is open (A11Y-02).
      var focusables = $$('a[href], button:not([disabled])', drawer);
      if (focusables.length === 0) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    toggle.addEventListener('click', open);
    $$('[data-drawer-close]', drawer).forEach(function (b) { b.addEventListener('click', close); });
    drawer.addEventListener('click', function (e) { if (e.target === drawer) close(); });
    // A link inside the drawer navigates; close so a back-button return is clean.
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', close); });
  }

  /* ------------------------------------------------------- branch chooser */

  function initChooser() {
    var dialog = $('#branch-chooser');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    var remembered = store(STORE_BRANCH);

    $$('[data-order-cta]').forEach(function (cta) {
      // A CTA that already points at a specific branch listing is left alone.
      if (cta.target === '_blank') return;

      cta.addEventListener('click', function (e) {
        // If this visitor has already chosen a branch, honour it and skip the
        // chooser entirely — two taps to order for a repeat customer (US-04).
        if (remembered) {
          var direct = dialog.querySelector('[data-remember-branch="' + remembered + '"]');
          if (direct) {
            e.preventDefault();
            track('foodpanda_outbound', { branch_slug: remembered, source: 'remembered' });
            window.open(direct.href, '_blank', 'noopener');
            return;
          }
        }
        e.preventDefault();
        track('order_cta_click', { source: cta.dataset.source || 'unknown' });
        dialog.showModal();
      });
    });

    $$('[data-chooser-close]', dialog).forEach(function (b) {
      b.addEventListener('click', function () { dialog.close(); });
    });
    dialog.addEventListener('click', function (e) {
      // Click on the backdrop (outside the dialog box) dismisses it.
      var r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        dialog.close();
      }
    });

    if (remembered) showChangeBranch(remembered);
  }

  function showChangeBranch(slug) {
    $$('[data-change-branch]').forEach(function (el) {
      el.hidden = false;
      var name = el.dataset.changeBranch === slug ? el.dataset.branchName : null;
      if (name) el.textContent = name;
    });
  }

  /* ------------------------------------------------------------ open now */

  /**
   * "Open now" in Asia/Yangon (UTC+06:30, no DST).
   * Mirrors src/lib/hours.ts — including shifts that run past midnight.
   */
  function initOpenState() {
    var nodes = $$('.js-open-state');
    if (nodes.length === 0) return;

    var shifted = new Date(Date.now() + (6 * 60 + 30) * 60000);
    var day = shifted.getUTCDay();
    var minutes = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();

    nodes.forEach(function (node) {
      var hours;
      try { hours = JSON.parse(node.dataset.hours || '[]'); } catch (e) { return; }
      if (!hours.length) return;

      var open = isOpen(hours, day, minutes);
      var text = $('.js-open-state__text', node);
      if (text) text.textContent = open ? node.dataset.labelOpen : node.dataset.labelClosed;
      node.classList.add(open ? 'badge--open' : 'badge--closed');
    });

    // Highlight today's row in any hours table on the page.
    $$('.js-hours-table tr[data-day]').forEach(function (row) {
      if (Number(row.dataset.day) === day) row.setAttribute('data-today', '');
    });

    function mins(hhmm) {
      var parts = String(hhmm).split(':');
      return Number(parts[0]) * 60 + Number(parts[1] || 0);
    }

    function isOpen(list, d, now) {
      var prev = (d + 6) % 7;
      for (var i = 0; i < list.length; i++) {
        var e = list[i];
        if (e.isClosed) continue;
        var o = mins(e.open), c = mins(e.close);
        if (e.day === d) {
          if (c > o ? (now >= o && now < c) : now >= o) return true;
        } else if (e.day === prev && c <= o && now < c) {
          return true; // shift opened yesterday, still running
        }
      }
      return false;
    }
  }

  /* -------------------------------------------------- menu chips + filters */

  function initMenu() {
    var chips = $$('.chip[data-chip]');
    var sections = $$('.menu-section[id]');
    if (chips.length === 0) return;

    // Scroll-spy: the chip row reflects where the reader actually is (MENU-05).
    if ('IntersectionObserver' in window && sections.length) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var id = entry.target.id.replace(/^cat-/, '');
            chips.forEach(function (chip) {
              chip.classList.toggle('is-active', chip.dataset.chip === id);
            });
          });
        },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      sections.forEach(function (s) { observer.observe(s); });
    }

    initFilters();
  }

  /**
   * Tag filters run entirely over already-rendered DOM — no request, no
   * re-render (MENU-06). State is mirrored into the query string so a filtered
   * view can be shared (MENU-07).
   */
  function initFilters() {
    var form = $('[data-filters]');
    if (!form) return;
    form.hidden = false;

    var items = $$('.item[data-item]');
    var status = $('[data-filter-status]');
    var params = new URLSearchParams(location.search);

    $$('input[type="checkbox"]', form).forEach(function (input) {
      if (params.getAll('tag').indexOf(input.value) !== -1) input.checked = true;
      input.addEventListener('change', apply);
    });

    apply(true);

    function apply(initial) {
      var active = $$('input[type="checkbox"]:checked', form).map(function (i) { return i.value; });
      var shown = 0;

      items.forEach(function (item) {
        var tags = (item.dataset.tags || '').split(' ');
        var dietary = (item.dataset.dietary || '').split(' ');
        var pool = tags.concat(dietary);
        var match = active.length === 0 || active.every(function (a) { return pool.indexOf(a) !== -1; });
        item.hidden = !match;
        if (match) shown++;
      });

      // A section whose every item is filtered out hides its heading too.
      $$('.menu-section').forEach(function (section) {
        var any = $$('.item[data-item]', section).some(function (i) { return !i.hidden; });
        section.hidden = !any;
      });

      if (status) {
        status.textContent = status.dataset.template.replace('{n}', String(shown));
      }

      if (!initial) {
        var next = new URLSearchParams(location.search);
        next.delete('tag');
        active.forEach(function (a) { next.append('tag', a); });
        var qs = next.toString();
        history.replaceState(null, '', qs ? location.pathname + '?' + qs : location.pathname);
        active.forEach(function (a) { track('menu_filter_apply', { filter_type: 'tag', filter_value: a }); });
      }
    }
  }

  /* ----------------------------------------------------------- scroll depth */

  var scrollBound = false;

  function initScrollDepth() {
    if (scrollBound) return;
    scrollBound = true;
    var marks = [25, 50, 75, 100];
    var sent = {};
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var doc = document.documentElement;
        var height = doc.scrollHeight - window.innerHeight;
        if (height <= 0) return;
        var pct = Math.round((window.scrollY / height) * 100);
        marks.forEach(function (m) {
          if (pct >= m && !sent[m]) { sent[m] = true; track('scroll_depth', { depth: m }); }
        });
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ boot */

  function boot() {
    bindAnalytics();
    initDrawer();
    initChooser();
    initOpenState();
    initMenu();
    initScrollDepth();
    track('page_view', { referrer_group: referrerGroup() });
  }

  function referrerGroup() {
    var ref = document.referrer;
    if (!ref) return 'direct';
    if (/facebook|instagram|tiktok|t\.co|viber|telegram/i.test(ref)) return 'social';
    if (/google|bing|duckduckgo|yahoo/i.test(ref)) return 'search';
    try {
      if (new URL(ref).host === location.host) return 'internal';
    } catch (e) { /* malformed referrer */ }
    return 'referral';
  }

  window.addEventListener('error', function (e) {
    track('js_error', { message: String(e.message || '').slice(0, 200) });
  });

  /*
   * Exposed so a host page that swaps the visible view without a page load can
   * re-run the per-view wiring. boot() is safe to call repeatedly: the
   * document-level listeners guard themselves, and everything else re-queries
   * the DOM it is binding to.
   */
  window.__lesmashBoot = boot;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
