/* ==========================================================================
   pages/pricing.js — pricing page only.
   Mini-hero float card (config image pool) · price menus grouped by
   category, rendered from SITE_CONFIG with dotted-leader rows.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function esc(s) { return String(s == null ? "" : s); }

  var SERVICES = CFG.services || [];

  /* -- Mini-hero float card: one image from the config pool ------------------ */
  function renderHeroCard() {
    var card = $("#pricingHeroCard");
    if (!card) return;
    var pool = (CFG.images && CFG.images.hero) || [];
    var src =
      pool[1] || pool[0] ||
      (CFG.images && CFG.images.about && CFG.images.about[0]);
    if (!src) return;
    var img = document.createElement("img");
    img.src = src;
    img.alt = "The craft behind every service — inside the studio";
    img.width = 800;
    img.height = 1000;
    img.loading = "lazy";
    img.decoding = "async";
    card.insertBefore(img, card.firstChild);
  }

  /* -- Price menus: one card per category, in first-appearance order ---------- */
  function renderMenus() {
    var wrap = $("#priceMenus");
    if (!wrap) return;

    var order = [];
    var groups = {};
    SERVICES.forEach(function (s) {
      var cat = s.category || "Other";
      if (!groups[cat]) {
        groups[cat] = [];
        order.push(cat);
      }
      groups[cat].push(s);
    });

    wrap.innerHTML = order
      .map(function (cat) {
        var rows = groups[cat]
          .map(function (s) {
            return (
              '<div class="price-row">' +
                '<span class="price-row-name">' + esc(s.name) + "</span>" +
                '<span class="price-row-duration">' + esc(s.duration) + "</span>" +
                '<span class="price-row-leader" aria-hidden="true"></span>' +
                '<span class="price-row-price">' + esc(s.price) + "</span>" +
              "</div>"
            );
          })
          .join("");
        return (
          '<div class="price-menu">' +
            '<h3 class="price-menu-title">' + esc(cat) + "</h3>" + rows +
          "</div>"
        );
      })
      .join("");
  }

  /* -- Boot (synchronous — see services.js) ------------------------------------ */
  renderHeroCard();
  renderMenus();
})();