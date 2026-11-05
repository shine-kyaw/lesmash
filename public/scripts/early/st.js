if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('st-js');
  setTimeout(function () { if (!window.__stReady) document.documentElement.classList.remove('st-js'); }, 5000);
}
