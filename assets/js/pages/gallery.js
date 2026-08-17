/* ==========================================================================
   pages/gallery.js — gallery page only.
   Category filter chips + masonry grid (from SITE_CONFIG.gallery) with
   staggered fade on re-render, and a custom lightbox: open / close / prev /
   next, keyboard (arrows + Escape), scroll-lock while open, navigation that
   respects the active filter order. Everything guarded.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var GALLERY = CFG.gallery || [];
  var chipsEl = $("#galleryChips");
  var gridEl = $("#galleryGrid");
  var activeFilter = "All";
  var currentList = GALLERY.slice();

  /* -- Mini-hero eyebrow ----------------------------------------------------- */
  function renderHero() {
    var eyebrow = $("#galleryEyebrow");
    if (eyebrow) eyebrow.textContent = CFG.businessType || "";
  }

  /* -- Filter chips ------------------------------------------------------------ */
  function categories() {
    var seen = {};
    var cats = [];
    GALLERY.forEach(function (g) {
      if (g && g.category && !seen[g.category]) {
        seen[g.category] = true;
        cats.push(g.category);
      }
    });
    return cats;
  }

  function renderChips() {
    if (!chipsEl) return;
    var cats = ["All"].concat(categories());
    chipsEl.innerHTML = cats
      .map(function (c) {
        var active = c === activeFilter ? " is-active" : "";
        return (
          '<button class="chip' + active + '" type="button" data-filter="' + esc(c) +
          '" aria-pressed="' + (c === activeFilter) + '">' + esc(c) + "</button>"
        );
      })
      .join("");
    $$(".chip", chipsEl).forEach(function (chip) {
      chip.addEventListener("click", function () {
        var f = chip.getAttribute("data-filter");
        if (f && f !== activeFilter) setFilter(f);
      });
    });
  }

  /* -- Masonry grid -------------------------------------------------------------- */
  function itemHTML(g, i, withReveal) {
    return (
      '<div class="masonry-item" data-cursor="view" data-index="' + i + '" tabindex="0"' +
      ' role="button" aria-label="View image: ' + esc(g.alt) + '"' +
      (withReveal ? " data-reveal" : "") + ">" +
        '<img src="' + esc(g.src) + '" alt="' + esc(g.alt) + '" loading="lazy" decoding="async">' +
        '<div class="masonry-caption">' + esc(g.alt) + "<span>" + esc(g.category) + "</span></div>" +
      "</div>"
    );
  }

  function bindItems() {
    $$(".masonry-item", gridEl).forEach(function (item) {
      item.addEventListener("click", function () {
        openLightbox(parseInt(item.getAttribute("data-index"), 10) || 0);
      });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(parseInt(item.getAttribute("data-index"), 10) || 0);
        }
      });
    });
  }

  function animateIn() {
    if (REDUCED || !hasGSAP || !gridEl) return;
    var items = $$(".masonry-item", gridEl);
    if (!items.length) return;
    window.gsap.fromTo(
      items,
      { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power3.out", overwrite: true }
    );
  }

  function setFilter(cat) {
    activeFilter = cat;
    currentList = cat === "All"
      ? GALLERY.slice()
      : GALLERY.filter(function (g) { return g.category === cat; });
    $$(".chip", chipsEl).forEach(function (chip) {
      var on = chip.getAttribute("data-filter") === cat;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", String(on));
    });
    if (!gridEl) return;
    gridEl.innerHTML = currentList
      .map(function (g, i) { return itemHTML(g, i, false); })
      .join("");
    bindItems();
    animateIn();
    closeLightbox();
  }

  /* -- Lightbox ------------------------------------------------------------------- */
  var lb = $("#lightbox");
  var lbImg = $("#lightboxImg");
  var lbCaption = $("#lightboxCaption");
  var lbClose = $("#lightboxClose");
  var lbPrev = $("#lightboxPrev");
  var lbNext = $("#lightboxNext");
  var current = 0;
  var isOpen = false;

  function updateLightbox() {
    var g = currentList[current];
    if (!g || !lbImg) return;
    lbImg.src = g.src;
    lbImg.alt = g.alt;
    if (lbCaption) lbCaption.textContent = g.alt + " — " + g.category;
    if (hasGSAP && !REDUCED) {
      window.gsap.fromTo(
        lbImg,
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
      );
    }
  }

  function openLightbox(i) {
    if (!lb || !currentList.length) return;
    current = Math.max(0, Math.min(i, currentList.length - 1));
    updateLightbox();
    lb.classList.add("is-open");
    document.body.classList.add("is-locked"); /* locks scroll (style.css) */
    isOpen = true;
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    if (!lb || !isOpen) return;
    lb.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    isOpen = false;
    var item = gridEl ? $('.masonry-item[data-index="' + current + '"]', gridEl) : null;
    if (item) item.focus();
  }

  function step(d) {
    if (!currentList.length) return;
    current = (current + d + currentList.length) % currentList.length;
    updateLightbox();
  }

  function initLightbox() {
    if (!lb) return;
    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lbPrev) lbPrev.addEventListener("click", function () { step(-1); });
    if (lbNext) lbNext.addEventListener("click", function () { step(1); });
    /* click on the white backdrop (not the image/buttons) closes */
    lb.addEventListener("click", function (e) {
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!isOpen) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  }

  /* -- Boot (synchronous — initial items carry data-reveal for main.js) ---------- */
  renderHero();
  renderChips();
  if (gridEl) {
    gridEl.innerHTML = currentList
      .map(function (g, i) { return itemHTML(g, i, true); })
      .join("");
    bindItems();
  }
  initLightbox();
})();