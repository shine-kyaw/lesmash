if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('mc-js');
  setTimeout(function () { if (!window.__mcReady) document.documentElement.classList.remove('mc-js'); }, 5000);
}
