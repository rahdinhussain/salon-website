/* ==========================================================================
   pages/services.js — services page only.
   Mini-hero float card (config image pool) · lead with live counts ·
   category filter chips · service rows rendered from SITE_CONFIG with a
   light stagger on every filter change. Booking links via a[data-book].
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var SC = window.SalonComponents || {};
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function esc(s) { return String(s == null ? "" : s); }

  var SERVICES = CFG.services || [];
  var CATEGORIES = [];
  SERVICES.forEach(function (s) {
    if (s.category && CATEGORIES.indexOf(s.category) === -1) {
      CATEGORIES.push(s.category);
    }
  });

  var activeCategory = "All";

  /* -- Mini-hero float card: one image from the config pool ------------------ */
  function renderHeroCard() {
    var card = $("#servicesHeroCard");
    if (!card) return;
    var pool = (CFG.images && CFG.images.hero) || [];
    var src =
      pool[2] || pool[1] || pool[0] ||
      (CFG.images && CFG.images.about && CFG.images.about[0]);
    if (!src) return;
    var img = document.createElement("img");
    img.src = src;
    img.alt = "A finished look from the studio — beauty portrait";
    img.width = 800;
    img.height = 1000;
    img.loading = "lazy";
    img.decoding = "async";
    card.insertBefore(img, card.firstChild);
  }

  /* -- Lead line with live counts derived from config ------------------------- */
  function renderLead() {
    var lead = $("#servicesLead");
    if (!lead || !SERVICES.length) return;
    lead.textContent =
      SERVICES.length + " signature rituals across " + CATEGORIES.length +
      " categories — each one tailored to you in consultation.";
  }

  /* -- Filter chips: All + unique categories ------------------------------------ */
  function renderChips() {
    var wrap = $("#serviceChips");
    if (!wrap) return;
    wrap.innerHTML = ["All"].concat(CATEGORIES)
      .map(function (cat) {
        var on = cat === activeCategory;
        return (
          '<button type="button" class="chip' + (on ? " is-active" : "") +
          '" data-category="' + esc(cat) + '" aria-pressed="' + on + '">' +
          esc(cat) + "</button>"
        );
      })
      .join("");
  }

  /* -- Service rows ---------------------------------------------------------------- */
  function rowHTML(s, i) {
    var num = ("0" + (i + 1)).slice(-2);
    return (
      '<article class="service-row" data-category="' + esc(s.category) + '">' +
        '<span class="service-row-index" aria-hidden="true">' + num + "</span>" +
        '<div class="service-row-body">' +
          '<h3 class="service-row-name">' + esc(s.name) + "</h3>" +
          '<p class="service-row-desc">' + esc(s.description) + "</p>" +
        "</div>" +
        '<span class="service-row-duration">' + esc(s.duration) + "</span>" +
        '<span class="service-row-price">' + esc(s.price) + "</span>" +
        '<a class="service-row-link" data-book>Book <span aria-hidden="true">→</span></a>' +
      "</article>"
    );
  }

  function renderList(animate) {
    var list = $("#serviceList");
    if (!list) return;
    var items = SERVICES.filter(function (s) {
      return activeCategory === "All" || s.category === activeCategory;
    });
    list.innerHTML = items.map(rowHTML).join("");
    if (SC.wireBookingLinks) SC.wireBookingLinks(list);

    /* Light fade/stagger on user-initiated filter changes. Initial render is
       handled by main.js's [data-reveal-group] entrance instead. */
    if (animate && !REDUCED && hasGSAP) {
      window.gsap.fromTo(
        $$(".service-row", list),
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.55, stagger: 0.05, ease: "power3.out",
          overwrite: "auto", clearProps: "transform,opacity",
        }
      );
    }
    if (hasST) window.ScrollTrigger.refresh();
  }

  /* -- Chip interactions -------------------------------------------------------------- */
  function initChips() {
    var wrap = $("#serviceChips");
    if (!wrap) return;
    wrap.addEventListener("click", function (e) {
      var chip = e.target.closest ? e.target.closest(".chip") : null;
      if (!chip) return;
      var cat = chip.getAttribute("data-category");
      if (!cat || cat === activeCategory) return;
      activeCategory = cat;
      $$(".chip", wrap).forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      renderList(true);
    });
  }

  /* -- Boot (synchronous: scripts sit at end of <body>, so the DOM and
        SITE_CONFIG are ready, and main.js picks our nodes up on init) -------- */
  renderHeroCard();
  renderLead();
  renderChips();
  renderList(false);
  initChips();
})();