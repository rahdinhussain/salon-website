/* ==========================================================================
   pages/about.js — about page only.
   Renders hero copy, editorial-split story + images, team grid, stats and
   marquee exclusively from window.SITE_CONFIG. Runs synchronously at parse
   time (scripts sit at the end of <body>) so main.js picks up every
   [data-reveal] / [data-count] / .marquee hook on boot.
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

  /* -- Mini-hero copy ------------------------------------------------------- */
  function renderHero() {
    var eyebrow = $("#aboutEyebrow");
    if (eyebrow) eyebrow.textContent = CFG.businessType || "";
    var lead = $("#aboutHeroLead");
    if (lead) {
      lead.textContent =
        "The story of a " + String(CFG.businessType || "salon").toLowerCase() +
        " built on craft, care, and community — " +
        String(CFG.tagline || "").toLowerCase() + ".";
    }
  }

  /* -- Editorial split: images + story --------------------------------------- */
  function renderStory() {
    var imgs = (CFG.images && CFG.images.about) || [];
    var img1 = $("#aboutImg1");
    var img2 = $("#aboutImg2");
    if (img1 && imgs[0]) {
      img1.src = imgs[0];
      img1.alt = "Inside " + (CFG.businessName || "the studio") + " — bright, calm salon interior";
    }
    if (img2 && imgs[1]) {
      img2.src = imgs[1];
      img2.alt = "Artist at work — shaping a style with precision";
    }

    var kicker = $("#storyEyebrow");
    if (kicker) kicker.textContent = "Est. " + (CFG.established || "");

    var p1 = $("#storyText1");
    if (p1) {
      p1.textContent =
        "Founded in " + (CFG.established || "") + ", " + (CFG.businessName || "our studio") +
        " began as a single chair and a simple conviction: a " +
        String(CFG.businessType || "salon").toLowerCase() +
        " should feel less like an appointment and more like a ritual — " +
        String(CFG.tagline || "").toLowerCase() + ".";
    }
    var p2 = $("#storyText2");
    if (p2) {
      p2.textContent =
        "Years later, that conviction still shapes every detail: the unhurried consultations, " +
        "the warm towels, the honest advice. Trends pass through our doors; craftsmanship stays.";
    }
  }

  /* -- Team grid -------------------------------------------------------------- */
  function renderTeam() {
    var grid = $("#teamGrid");
    if (!grid) return;
    grid.innerHTML = (CFG.team || [])
      .map(function (m) {
        return (
          '<article class="team-card">' +
            '<div class="team-card-photo" data-reveal="clip">' +
              '<img src="' + esc(m.photo) + '" alt="' + esc(m.name) + ", " + esc(m.role) +
              '" loading="lazy" decoding="async">' +
            "</div>" +
            '<h3 class="team-card-name">' + esc(m.name) + "</h3>" +
            '<p class="team-card-role">' + esc(m.role) + "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  /* -- Stats counters ----------------------------------------------------------- */
  function renderStats() {
    var row = $("#aboutStats");
    if (!row) return;
    row.innerHTML = (CFG.stats || [])
      .map(function (s) {
        return (
          '<div class="stat">' +
            '<div class="stat-value"><span data-count="' + esc(s.value) +
              '" data-suffix="' + esc(s.suffix) + '">' + esc(s.value) + esc(s.suffix) + "</span></div>" +
            '<div class="stat-label">' + esc(s.label) + "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  /* -- Marquee ----------------------------------------------------------------- */
  function renderMarquee() {
    var track = $("#aboutMarquee");
    if (!track) return;
    var words = ["Craft", "Care", "Community", "Ritual", "Artistry", "Precision"];
    track.innerHTML = words
      .map(function (w) {
        return (
          '<span class="marquee-item">' + esc(w) + "</span>" +
          '<span class="marquee-star">✦</span>'
        );
      })
      .join("");
  }

  /* -- Boot (synchronous — main.js init happens after DOMContentLoaded) -------- */
  renderHero();
  renderStory();
  renderTeam();
  renderStats();
  renderMarquee();
})();