/*
 * Ember field — the generative stand-in for footage.
 *
 * No film or photography was available when this was built, and the two usual
 * fallbacks are both wrong: a flat colour block looks unfinished, and stock
 * food photography would recreate the exact gap between marketing and plate
 * that this whole project exists to close.
 *
 * So the empty media planes render heat instead of food: soft blooms drifting
 * like a grill throwing light, with sparks rising through them. It reads as a
 * graded, cinematic plate rather than a missing asset, and it costs one canvas
 * and no network request.
 *
 * Every plane is replaced the moment a real file lands in /media — see
 * MediaPlane.astro. This is scaffolding, not the intended finish.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*
   * Brand grounds, not embers. The palette was re-cut when the real identity
   * was recovered: these are the reds and the cream out of the logo and the
   * restaurant's own artwork, so a plane still waiting on a photograph reads
   * as a Le SMASH field rather than as a dark room.
   */
  var PALETTES = {
    hero:   { blooms: [[216, 53, 54], [162, 20, 22], [90, 8, 9]],   count: 4, sparks: 26, alpha: 0.26 },
    room:   { blooms: [[255, 217, 167], [216, 53, 54], [129, 7, 4]], count: 3, sparks: 10, alpha: 0.20 },
    sear:   { blooms: [[232, 81, 79], [200, 40, 40], [110, 10, 11]], count: 3, sparks: 18, alpha: 0.28 },
    ash:    { blooms: [[225, 232, 222], [190, 186, 172], [140, 132, 118]], count: 3, sparks: 6, alpha: 0.18 }
  };

  function rand(a, b) { return a + Math.random() * (b - a); }

  function start(canvas) {
    var palette = PALETTES[canvas.dataset.ember] || PALETTES.hero;
    var ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, blooms = [], sparks = [], raf = null;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = Math.max(rect.width, 1);
      h = Math.max(rect.height, 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      blooms = [];
      for (var i = 0; i < palette.count; i++) {
        blooms.push({
          // Weighted low and left: the heat sits under the type, the way light
          // comes off a pass rather than glowing out of the middle of a screen.
          x: rand(-0.05, 0.7) * w,
          y: rand(0.45, 1.05) * h,
          r: rand(0.24, 0.5) * Math.max(w, h),
          // Deliberately slow. The plane should feel like it is breathing,
          // not animating.
          vx: rand(-0.05, 0.05),
          vy: rand(-0.04, 0.02),
          c: palette.blooms[i % palette.blooms.length],
          a: rand(0.5, 1) * palette.alpha
        });
      }
      sparks = [];
      var n = Math.round(palette.sparks * Math.min(w / 900, 1.4));
      for (var j = 0; j < n; j++) sparks.push(newSpark(true));
    }

    function newSpark(anywhere) {
      return {
        x: rand(0, w),
        y: anywhere ? rand(0, h) : h + rand(0, 40),
        r: rand(0.6, 1.9),
        vy: -rand(0.12, 0.5),
        vx: rand(-0.14, 0.14),
        life: rand(0.35, 1)
      };
    }

    function frame() {
      ctx.fillStyle = '#4e0708';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < blooms.length; i++) {
        var b = blooms[i];
        if (!reduced) {
          b.x += b.vx; b.y += b.vy;
          if (b.x < -b.r * 0.5 || b.x > w + b.r * 0.5) b.vx *= -1;
          if (b.y < -b.r * 0.5 || b.y > h + b.r * 0.5) b.vy *= -1;
        }
        var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, 'rgba(' + b.c[0] + ',' + b.c[1] + ',' + b.c[2] + ',' + b.a + ')');
        g.addColorStop(0.55, 'rgba(' + b.c[0] + ',' + b.c[1] + ',' + b.c[2] + ',' + b.a * 0.22 + ')');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      }

      for (var s = 0; s < sparks.length; s++) {
        var p = sparks[s];
        if (!reduced) {
          p.y += p.vy; p.x += p.vx;
          if (p.y < -10) sparks[s] = newSpark(false);
        }
        ctx.fillStyle = 'rgba(255,217,167,' + (0.11 * p.life) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // Vignette — seats the plane behind the type instead of letting the
      // blooms run to the edge of the viewport.
      var v = ctx.createRadialGradient(w * 0.4, h * 0.72, Math.min(w, h) * 0.18, w * 0.45, h * 0.6, Math.max(w, h) * 0.85);
      v.addColorStop(0, 'rgba(78,7,8,0)');
      v.addColorStop(1, 'rgba(46,4,5,0.82)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);

      if (!reduced) raf = requestAnimationFrame(frame);
    }

    resize();
    frame();

    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(resize, 180);
    });

    // Stop drawing whatever is off screen — this runs on mid-range Android.
    if ('IntersectionObserver' in window && !reduced) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(frame); }
          else if (raf) { cancelAnimationFrame(raf); raf = null; }
        });
      }, { rootMargin: '120px' }).observe(canvas);
    }
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('canvas[data-ember]'), function (c) {
      if (c.dataset.emberStarted) return;
      c.dataset.emberStarted = '1';
      start(c);
    });
  }
  window.__lesmashEmber = init;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
