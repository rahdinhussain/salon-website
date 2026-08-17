/* ==========================================================================
   pages/testimonials.js — testimonials page only.
   Rating summary (average computed from config) · masonry of every
   testimonial · oversized featured quote. All data from SITE_CONFIG.
   Renders synchronously so main.js reveal hooks pick everything up.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var STAR =
    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 2l2.9 6.3 6.6.5-5 4.4 1.5 6.5L12 16.9 6 19.7l1.5-6.5-5-4.4 6.6-.5z"/></svg>';

  function stars(n, label) {
    var count = Math.max(0, Math.min(5, Math.round(n)));
    var html = "";
    for (var i = 0; i < count; i++) html += STAR;
    return (
      '<span class="stars" role="img" aria-label="' +
      esc(label || count + " out of 5 stars") +
      '">' + html + "</span>"
    );
  }

  /* -- Rating summary: average computed from all testimonial ratings ------- */
  function renderSummary() {
    var box = $("#ratingSummary");
    if (!box) return;
    var list = CFG.testimonials || [];
    if (!list.length) {
      box.style.display = "none";
      return;
    }
    var total = 0;
    var rated = 0;
    list.forEach(function (t) {
      var r = parseFloat(t.rating);
      if (!isNaN(r)) { total += r; rated++; }
    });
    var avg = rated ? total / rated : 0;
    box.innerHTML =
      '<div class="rating-summary-value">' + esc(avg.toFixed(1)) + "</div>" +
      "<div>" +
        stars(avg, avg.toFixed(1) + " out of 5 stars on average") +
        "<p>Average rating across " + esc(rated) +
        (rated === 1 ? " guest review." : " guest reviews.") + "</p>" +
      "</div>";
  }

  /* -- Masonry: every testimonial as a quote card --------------------------- */
  function renderCards() {
    var wall = $("#quoteMasonry");
    if (!wall) return;
    wall.innerHTML = (CFG.testimonials || [])
      .map(function (t) {
        return (
          '<article class="quote-card">' +
            '<span class="quote-card-mark" aria-hidden="true">“</span>' +
            '<p class="quote-card-text">' + esc(t.text) + "</p>" +
            '<div class="quote-card-author">' +
              '<img src="' + esc(t.avatar) + '" alt="Portrait of ' + esc(t.name) +
              '" width="44" height="44" loading="lazy" decoding="async">' +
              "<div>" +
                "<b>" + esc(t.name) + "</b>" +
                "<span>" + esc(t.service) + "</span>" +
              "</div>" +
            "</div>" +
            '<div style="margin-top:1.1rem">' + stars(t.rating) + "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  /* -- Featured quote: the first testimonial, oversized Cormorant italic ---- */
  function renderFeatured() {
    var box = $("#featuredQuote");
    if (!box) return;
    var t = (CFG.testimonials || [])[0];
    if (!t) return;
    box.innerHTML =
      '<p class="eyebrow eyebrow--center" style="justify-content:center">Featured Review</p>' +
      '<blockquote class="teaser-quote">' + esc(t.text) + "</blockquote>" +
      '<div style="margin-top:1.4rem">' + stars(t.rating) + "</div>" +
      '<p class="teaser-author"><b>' + esc(t.name) + "</b> — " + esc(t.service) + "</p>";
  }

  renderSummary();
  renderCards();
  renderFeatured();
})();