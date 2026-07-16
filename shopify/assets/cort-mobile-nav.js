(function () {
  'use strict';

  var hamburger = document.getElementById('cort-hamburger');
  var drawer    = document.getElementById('cort-nav-drawer');
  var overlay   = document.getElementById('cort-nav-overlay');
  if (!hamburger || !drawer || !overlay) return;

  function openDrawer() {
    hamburger.classList.add('open');
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('cort-nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('cort-nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', function () {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  overlay.addEventListener('click', closeDrawer);

  // Close on nav link tap
  drawer.querySelectorAll('nav a').forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  // Mark active link based on URL
  var path = window.location.pathname;
  drawer.querySelectorAll('nav a').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (href && path === href) {
      link.classList.add('active');
    }
    // Home
    if ((href === '/' || href === '') && (path === '/' || path === '')) {
      link.classList.add('active');
    }
  });
})();
(function () {
  'use strict';
  // Mobile: keep all 7 tabs in the header menu row — stop overflow-list folding tabs into "More"
  var mq = window.matchMedia('(max-width: 989px)');
  function apply() {
    document.querySelectorAll('.header__navigation-bar-row overflow-list, header-menu overflow-list').forEach(function (ol) {
      if (mq.matches) { ol.setAttribute('disabled', 'true'); }
      else { ol.removeAttribute('disabled'); }
    });
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', apply); } else { apply(); }
  if (mq.addEventListener) { mq.addEventListener('change', apply); } else { mq.addListener(apply); }
  var n = 0, t = setInterval(function () { apply(); if (++n > 10) clearInterval(t); }, 500);
})();
