/*
 * Reveal al hacer scroll — Trip Parque
 *
 * Añade la clase `.is-visible` a los elementos `.reveal` cuando entran en el
 * viewport. Respeta `prefers-reduced-motion`: si el usuario prefiere menos
 * movimiento (o el navegador no soporta IntersectionObserver), muestra todo
 * de inmediato sin animar.
 */
(function () {
  'use strict';

  function init() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
