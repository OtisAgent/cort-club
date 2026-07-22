/* cørt — swap raw "→" text glyphs in shop CTAs for the drawn .cx-arw arrow.
   CSS-only can't remove a text glyph, so this runs once and replaces it. */
(function () {
  'use strict';
  function swap(el) {
    if (!el || el.querySelector('.cx-arw')) return;
    if (/[→⟶➔]\s*$/.test(el.textContent)) {
      el.innerHTML = el.innerHTML.replace(/\s*[→⟶➔]\s*$/, '') +
        '<span class="cx-arw" aria-hidden="true"></span>';
    }
  }
  function run() {
    document.querySelectorAll(
      '.cortv2 .cat-cta, .cortv2 .featured-cta, .cortv2 .pillar-link'
    ).forEach(swap);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}());
