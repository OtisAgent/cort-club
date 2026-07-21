/**
 * cørt pack picker — multi-buy strip on the grip socks page.
 * Reads live prices from the store's own product JSON so the
 * pack price shown is always the price charged at checkout
 * (each tile adds a real 2-Pack variant — no discount codes).
 */
(function () {
  'use strict';

  var SINGLE_HANDLE = 'cort-grip-socks-v1';
  var PACK_HANDLE = 'cort-grip-socks-2-pack';

  if (location.pathname.indexOf('/products/' + SINGLE_HANDLE) === -1) return;

  function money(cents) {
    return '£' + (cents / 100).toFixed(2).replace(/\.00$/, '');
  }

  function fetchProduct(handle) {
    return fetch('/products/' + handle + '.js').then(function (r) {
      return r.ok ? r.json() : null;
    });
  }

  // colour dots for each pack (drawn, not emoji)
  function dots(colours) {
    return '<span class="cb-dots">' + colours.map(function (c) {
      return '<span class="cb-dot cb-dot--' + c + '"></span>';
    }).join('') + '</span>';
  }

  var PACKS = [
    { value: 'Black × 2', label: 'black × 2', dots: ['blk', 'blk'] },
    { value: 'White × 2', label: 'white × 2', dots: ['wht', 'wht'] },
    { value: 'Mixed', label: 'mixed — 1 black + 1 white', dots: ['blk', 'wht'] }
  ];

  function variantFor(pack, packValue, size) {
    for (var i = 0; i < pack.variants.length; i++) {
      var v = pack.variants[i];
      if (v.option1 === packValue && v.option2 === size) return v;
    }
    return null;
  }

  function mountPoint() {
    var form = document.querySelector('form[action*="/cart/add"]');
    if (!form) return null;
    var d = document.createElement('div');
    d.id = 'cort-bundle';
    form.parentNode.insertBefore(d, form.nextSibling);
    return d;
  }

  function render(host, single, pack) {
    var unit = single.variants[0] ? single.variants[0].price : 0;
    var size = 'Medium';

    function tiles() {
      return PACKS.map(function (p) {
        var v = variantFor(pack, p.value, size);
        if (!v || !v.available) return '';
        var full = unit * 2;
        var pct = full > v.price ? Math.round((1 - v.price / full) * 100) : 0;
        return (
          '<button type="button" class="cb-tier" data-variant="' + v.id + '">' +
            dots(p.dots) +
            '<span class="cb-main">' +
              '<span class="cb-label">' + p.label + '</span>' +
              (pct > 0
                ? '<span class="cb-sub"><s>' + money(full) + '</s> save ' + pct + '%</span>'
                : '') +
            '</span>' +
            '<span class="cb-badge">' + money(v.price) + '</span>' +
          '</button>'
        );
      }).join('');
    }

    function draw() {
      host.innerHTML =
        '<div class="cb">' +
          '<p class="cb-h">buy in packs</p>' +
          '<p class="cb-s">two pairs, one price — pick your combo</p>' +
          '<div class="cb-sizes" role="group" aria-label="Pack size">' +
            ['Medium', 'Large'].map(function (s) {
              return '<button type="button" class="cb-size' +
                (s === size ? ' is-on' : '') + '" data-size="' + s + '">' +
                s.toLowerCase() + '</button>';
            }).join('') +
          '</div>' +
          '<div class="cb-tiers">' + tiles() + '</div>' +
        '</div>';

      host.querySelectorAll('.cb-size').forEach(function (b) {
        b.addEventListener('click', function () {
          size = b.getAttribute('data-size');
          draw();
        });
      });

      host.querySelectorAll('.cb-tier').forEach(function (b) {
        b.addEventListener('click', function () {
          b.disabled = true;
          b.classList.add('is-busy');
          fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: [{ id: parseInt(b.getAttribute('data-variant'), 10), quantity: 1 }]
            })
          }).then(function (r) {
            if (!r.ok) throw new Error('cart');
            location.href = '/cart';
          }).catch(function () {
            b.disabled = false;
            b.classList.remove('is-busy');
            alert('Sorry — could not add that pack to your basket.');
          });
        });
      });
    }

    injectStyle();
    draw();
  }

  function injectStyle() {
    if (document.getElementById('cort-bundle-style')) return;
    var css =
      '.cb{margin:1.6rem 0 0;padding-top:1.3rem;border-top:1px solid rgba(255,255,255,.14)}' +
      '.cb-h{margin:0 0 .2rem;font-size:1.35rem;font-weight:800;letter-spacing:.01em;color:#fff}' +
      '.cb-s{margin:0 0 .9rem;font-size:.95rem;color:rgba(255,255,255,.65)}' +
      '.cb-sizes{display:flex;gap:.5rem;margin:0 0 .8rem}' +
      '.cb-size{cursor:pointer;background:transparent;color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.3);' +
        'border-radius:99px;padding:.35rem 1rem;font-size:.9rem;font-weight:600}' +
      '.cb-size.is-on{background:#FFEA00;border-color:#FFEA00;color:#000}' +
      '.cb-tiers{display:flex;flex-direction:column;gap:.6rem}' +
      '.cb-tier{display:flex;align-items:center;gap:.9rem;width:100%;text-align:left;cursor:pointer;' +
        'padding:.85rem 1rem;border:2px solid rgba(255,255,255,.22);border-radius:.8rem;background:transparent;color:#fff;' +
        'transition:border-color .15s}' +
      '.cb-tier:hover{border-color:#FFEA00}' +
      '.cb-tier.is-busy{opacity:.55}' +
      '.cb-dots{display:flex;flex-shrink:0}' +
      '.cb-dot{width:1.15rem;height:1.15rem;border-radius:50%;border:2px solid rgba(255,255,255,.85)}' +
      '.cb-dot+.cb-dot{margin-left:-.35rem}' +
      '.cb-dot--blk{background:#111}' +
      '.cb-dot--wht{background:#fff}' +
      '.cb-main{display:flex;flex-direction:column;gap:.15rem;flex:1;min-width:0}' +
      '.cb-label{font-weight:700;font-size:1.05rem}' +
      '.cb-sub{font-size:.9rem;color:rgba(255,255,255,.6)}.cb-sub s{margin-right:.35rem}' +
      '.cb-badge{flex-shrink:0;background:#FFEA00;color:#000;font-weight:800;font-size:1.15rem;' +
        'padding:.5rem .95rem;border-radius:.6rem;white-space:nowrap}' +
      '@media (max-width:749px){.cb-label{font-size:1rem}.cb-badge{font-size:1.05rem;padding:.45rem .8rem}}';
    var el = document.createElement('style');
    el.id = 'cort-bundle-style';
    el.textContent = css;
    document.head.appendChild(el);
  }

  function boot() {
    Promise.all([fetchProduct(SINGLE_HANDLE), fetchProduct(PACK_HANDLE)])
      .then(function (res) {
        var single = res[0], pack = res[1];
        if (!single || !pack) return;
        var host = mountPoint();
        if (host) render(host, single, pack);
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}());
