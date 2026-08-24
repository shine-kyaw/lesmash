/**
 * Progressive enhancement only.
 *
 * Served verbatim from public/, unbundled and deferred. Everything below
 * upgrades markup that already works without it: the menu is HTML, every link
 * is a real link, and no content is hidden until script decides to reveal it.
 * If this file never loads, the site is intact.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ------------------------------------------------------------ analytics */

  /**
   * Cookieless events, PRD §20.2 taxonomy. No vendor is configured yet, so
   * events queue on window.lesmashEvents for a provider snippet to drain.
   * Outbound events fire on pointerdown, before navigation starts, so they are
   * not lost to the unload.
   */
  window.lesmashEvents = window.lesmashEvents || [];
  function track(name, props) {
    window.lesmashEvents.push(Object.assign({
      event: name,
      page_path: location.pathname,
      device_type: window.matchMedia('(min-width: 54rem)').matches ? 'desktop' : 'mobile',
      ts: Date.now()
    }, props || {}));
    if (typeof window.plausible === 'function') window.plausible(name, { props: props });
  }

  var analyticsBound = false;
  function bindAnalytics() {
    if (analyticsBound) return;
    analyticsBound = true;
    document.addEventListener('pointerdown', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-analytics]') : null;
      if (!el) return;
      track(el.dataset.analytics, {
        branch_slug: el.dataset.branch || undefined,
        source: el.dataset.source || undefined,
        category_slug: el.dataset.category || undefined,
        platform: el.dataset.platform || undefined
      });
    }, true);
  }

  /* --------------------------------------------------------- preview bar */

  /**
   * The preview bar is fixed, so the header and every sticky offset below it
   * need its real height — which wraps to two lines on a narrow phone.
   *
   * This lives here rather than in an inline <script> because the deployed
   * Content-Security-Policy is script-src 'self': an inline script would be
   * blocked in production and nowhere else, so the header would quietly sit
   * under the bar on the live site only.
   */
  function initBanner() {
    var bar = $('[data-banner]');
    if (!bar) return;
    var set = function () {
      document.documentElement.style.setProperty('--banner-h', bar.offsetHeight + 'px');
    };
    set();
    window.addEventListener('resize', set);
  }

  /* --------------------------------------------------------------- header */

  function initHeader() {
    var hdr = $('[data-header]');
    if (!hdr) return;
    // Fills in only once the reader has left the hero, so the film is never
    // framed by a bar on first paint.
    var mark = function () {
      hdr.classList.toggle('is-stuck', window.scrollY > window.innerHeight * 0.72);
    };
    mark();
    window.addEventListener('scroll', mark, { passive: true });
  }

  /* --------------------------------------------------------------- reveal */

  function initReveal() {
    var nodes = $$('.reveal');
    if (!nodes.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        // A short stagger reads as considered; anything longer reads as a queue.
        setTimeout(function () { entry.target.classList.add('is-in'); }, i * 70);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---------------------------------------------------------- course rail */

  function initCourses() {
    var links = $$('[data-course-link]');
    var sections = $$('.course[id]');
    if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.dataset.courseLink === entry.target.id);
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ----------------------------------------------------------- hero video */

  /**
   * The film is an enhancement, not the hero itself.
   *
   * A full-bleed autoplaying video is the most expensive thing this page could
   * do, and the audience is on a median 5 Mbps mobile connection. So it is
   * attached only on a wide viewport, and never when the browser has told us
   * the connection is slow or the visitor has asked to save data. Everyone
   * else keeps the canvas plane, which is already a finished hero.
   */
  function initVideo() {
    var video = $('[data-video-src]');
    if (!video) return;
    if (!window.matchMedia('(min-width: 54rem)').matches) return;

    var c = navigator.connection;
    if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return;

    video.src = video.dataset.videoSrc;
    video.load();
    var play = video.play();
    if (play && play.catch) play.catch(function () { /* autoplay refused; canvas stands */ });
    video.addEventListener('playing', function () { video.classList.add('is-playing'); }, { once: true });
  }

  /* ---------------------------------------------------------- the smash */

  /**
   * The one orchestrated moment on the site.
   *
   * On load the wordmark takes a press — it compresses and springs back once,
   * the way a ball of beef does on the plancha. It runs on type that is
   * already painted, so it delays nothing, and it is skipped entirely under
   * reduced motion. One moment, on the one word it belongs to.
   */
  function initSmash() {
    var word = $('[data-smash-word]');
    if (!word || reduced) return;
    requestAnimationFrame(function () {
      word.animate(
        [
          { transform: 'scaleY(1) scaleX(1)', offset: 0 },
          { transform: 'scaleY(0.62) scaleX(1.06)', offset: 0.34 },
          { transform: 'scaleY(1.06) scaleX(0.985)', offset: 0.62 },
          { transform: 'scaleY(1) scaleX(1)', offset: 1 }
        ],
        { duration: 900, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'none' }
      );
    });
  }

  /* ---------------------------------------------------------- scroll depth */

  var scrollBound = false;
  function initScrollDepth() {
    if (scrollBound) return;
    scrollBound = true;
    var marks = [25, 50, 75, 100], sent = {}, ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var height = document.documentElement.scrollHeight - window.innerHeight;
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
    initBanner();
    initHeader();
    initReveal();
    initCourses();
    initVideo();
    initSmash();
    initScrollDepth();
    track('page_view', { referrer_group: referrerGroup() });
  }

  function referrerGroup() {
    var ref = document.referrer;
    if (!ref) return 'direct';
    if (/facebook|instagram|tiktok|t\.co|viber|telegram/i.test(ref)) return 'social';
    if (/google|bing|duckduckgo|yahoo/i.test(ref)) return 'search';
    try { if (new URL(ref).host === location.host) return 'internal'; } catch (e) { /* malformed */ }
    return 'referral';
  }

  window.addEventListener('error', function (e) {
    track('js_error', { message: String(e.message || '').slice(0, 200) });
  });

  /* Exposed so a host page that swaps views without a page load can re-run the
     per-view wiring. boot() is safe to call repeatedly. */
  window.__lesmashBoot = boot;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
