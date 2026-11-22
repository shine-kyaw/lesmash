/* Music Video page: swap the poster for the privacy-enhanced YouTube player on
   press. A plain file loaded by src, so the live CSP (script-src 'self') allows it;
   Vite would inline a script this small. */
document.querySelectorAll('[data-mv-player]').forEach(function (box) {
  var btn = box.querySelector('[data-mv-play]');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + box.dataset.yt + '?autoplay=1&rel=0&playsinline=1';
    f.title = box.dataset.title || 'Music video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    box.replaceChildren(f);
    f.focus();
  });
});
