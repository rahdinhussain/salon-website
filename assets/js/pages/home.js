/* ==========================================================================
   pages/home.js — homepage only.
   Hero char-stagger intro · float-card mouse parallax + float loops + scroll
   parallax · dynamic rendering of marquee / intro / stats / top-6 services /
   testimonial teaser / gallery strip — all from SITE_CONFIG.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var SC = window.SalonComponents || {};
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE_POINTER = window.matchMedia("(pointer: fine)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function esc(s) { return String(s == null ? "" : s); }

  /* -- Hero text from config ---------------------------------------------- */
  function renderHeroText() {
    var eyebrow = $("#heroEyebrow");
    if (eyebrow) eyebrow.textContent = CFG.businessType || "";
    var sub = $("#heroSub");
    if (sub) sub.textContent = CFG.tagline || "";
  }

  /* -- Hero floating image cards ------------------------------------------- */
  function renderHeroCards() {
    var cards = $$(".float-card");
    var imgs = (CFG.images && CFG.images.hero) || [];
    var alts = [
      "Stylist giving a precision haircut in the studio",
      "Colorist mixing a bespoke shade",
      "Beauty portrait — the finished look",
    ];
    cards.forEach(function (card, i) {
      if (!imgs[i]) return;
      var img = document.createElement("img");
      img.src = imgs[i];
      img.alt = alts[i] || "Salon work";
      img.width = 900;
      img.height = 1200;
      img.decoding = "async";
      if (i > 0) img.loading = "lazy";
      card.insertBefore(img, card.firstChild);
    });
  }

  /* -- Hero headline: split into chars, stagger in after preloader ---------- */
  function splitChars(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      /* Group chars into .word spans so lines can only break BETWEEN
         words (never mid-word); spaces stay as plain text nodes. */
      node.textContent.split(/(\s+)/).forEach(function (piece) {
        if (!piece) return;
        if (/^\s+$/.test(piece)) {
          frag.appendChild(document.createTextNode(" "));
          return;
        }
        var word = document.createElement("span");
        word.className = "word";
        piece.split("").forEach(function (ch) {
          var s = document.createElement("span");
          s.className = "char";
          s.textContent = ch;
          word.appendChild(s);
        });
        frag.appendChild(word);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  function initHeroIntro() {
    var title = $("#heroTitle");
    if (!title) return;
    splitChars(title);
    var chars = $$(".char", title);
    var content = $(".hero-content");
    if (REDUCED || !hasGSAP) return;

    window.gsap.set(chars, { yPercent: 115 });
    if (content) {
      window.gsap.set([".hero-cta", "#heroSub"], { y: 20, opacity: 0 });
    }

    function play() {
      window.gsap.to(chars, {
        yPercent: 0,
        duration: 1.05,
        stagger: 0.022,
        ease: "power4.out",
      });
      if (content) {
        window.gsap.to(["#heroSub", ".hero-cta"], {
          y: 0, opacity: 1, duration: 0.9, stagger: 0.12, delay: 0.35, ease: "power3.out",
        });
      }
    }

    if (document.body.classList.contains("loaded")) {
      play();
    } else {
      document.addEventListener("salon:ready", play, { once: true });
      /* safety net */
      setTimeout(function () {
        if (!document.body.classList.contains("loaded")) {
          document.body.classList.add("loaded");
        }
      }, 2500);
    }
  }

  /* -- Float-card parallax: float loops + mousemove + scroll ---------------- */
  function initFloatCards() {
    var cards = $$(".float-card");
    if (!cards.length || REDUCED || !hasGSAP) return;

    /* gentle float loops */
    cards.forEach(function (card, i) {
      window.gsap.to(card, {
        y: "+=" + (10 + i * 4),
        duration: 2.6 + i * 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    });

    /* mouse parallax via data-depth */
    var hero = $(".hero");
    if (hero && FINE_POINTER) {
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        cards.forEach(function (card) {
          var depth = parseFloat(card.getAttribute("data-depth") || 20);
          window.gsap.to(card, {
            x: nx * depth,
            duration: 0.9,
            ease: "power3.out",
            overwrite: "auto",
          });
        });
      });
    }

    /* scroll parallax */
    if (hasST) {
      cards.forEach(function (card, i) {
        window.gsap.to(card, {
          yPercent: (i % 2 === 0 ? -1 : 1) * (10 + i * 6),
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
        });
      });
    }
  }

  /* -- Marquee: service names separated by accent ✦ -------------------------- */
  function renderMarquee() {
    var track = $("#homeMarquee");
    if (!track) return;
    var names = (CFG.services || []).map(function (s) { return s.name; });
    track.innerHTML = names
      .map(function (n) {
        return (
          '<span class="marquee-item">' + esc(n) + '</span>' +
          '<span class="marquee-star">✦</span>'
        );
      })
      .join("");
  }

  /* -- Intro copy + image ----------------------------------------------------- */
  function renderIntro() {
    var img = $("#introImg");
    var about = (CFG.images && CFG.images.about) || [];
    if (img && about[0]) {
      img.src = about[0];
      img.alt = "Inside " + (CFG.businessName || "the studio") + " — bright salon interior";
    }
    var text = $("#introText");
    if (text) {
      text.textContent =
        "Since " + (CFG.established || "") + ", " + (CFG.businessName || "our studio") +
        " has been a quiet sanctuary in the neighborhood — a " +
        (CFG.businessType || "salon").toLowerCase() +
        " where craft, calm, and conversation carry equal weight.";
    }
  }

  /* -- Stats counters ---------------------------------------------------------- */
  function renderStats() {
    var row = $("#homeStats");
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

  /* -- Signature services: top 6 ------------------------------------------------ */
  function renderServices() {
    var grid = $("#homeServices");
    if (!grid) return;
    grid.innerHTML = (CFG.services || [])
      .slice(0, 6)
      .map(function (s) {
        return (
          '<article class="service-card">' +
            '<span class="service-card-dot" aria-hidden="true"></span>' +
            '<h3 class="service-card-name">' + esc(s.name) + "</h3>" +
            '<p class="service-card-desc">' + esc(s.description) + "</p>" +
            '<div class="service-card-meta"><span>' + esc(s.duration) + "</span><b>" + esc(s.price) + "</b></div>" +
            '<a class="service-card-link" href="services.html">Discover <span aria-hidden="true">→</span></a>' +
          "</article>"
        );
      })
      .join("");
  }

  /* -- Testimonial teaser ---------------------------------------------------------- */
  function renderQuote() {
    var box = $("#homeQuote");
    if (!box) return;
    var t = (CFG.testimonials || [])[0];
    if (!t) return;
    box.innerHTML =
      '<blockquote class="teaser-quote">' + esc(t.text) + "</blockquote>" +
      '<p class="teaser-author"><b>' + esc(t.name) + "</b> — " + esc(t.service) + "</p>";
  }

  /* -- Gallery strip: 6 images ------------------------------------------------------- */
  function renderGallery() {
    var strip = $("#homeGallery");
    if (!strip) return;
    strip.innerHTML = (CFG.gallery || [])
      .slice(0, 6)
      .map(function (g) {
        return (
          '<a class="gallery-strip-item" href="gallery.html">' +
            '<img src="' + esc(g.src) + '" alt="' + esc(g.alt) +
            '" width="600" height="800" loading="lazy" decoding="async">' +
          "</a>"
        );
      })
      .join("");
  }

  /* -- Boot --------------------------------------------------------------------- */
  renderHeroText();
  renderHeroCards();
  renderMarquee();
  renderIntro();
  renderStats();
  renderServices();
  renderQuote();
  renderGallery();

  document.addEventListener("DOMContentLoaded", function () {
    initHeroIntro();
    initFloatCards();
    if (SC.wireBookingLinks) SC.wireBookingLinks();
  });
})();