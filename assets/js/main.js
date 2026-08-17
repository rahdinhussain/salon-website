/* ==========================================================================
   main.js — animation engine for ALL pages.
   Preloader · Lenis smooth scroll · custom cursor · magnetic · reveal system
   · marquee · counters · orbit badge · header state · floating CTA · overlay
   menu. Everything is guarded; prefers-reduced-motion is respected.
   Fires `salon:ready` on document once the intro has finished.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var SC = window.SalonComponents || {};
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE_POINTER = window.matchMedia("(pointer: fine)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  var lenis = null;

  if (hasST) window.gsap.registerPlugin(window.ScrollTrigger);

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function ready() {
    document.body.classList.add("loaded");
    document.dispatchEvent(new CustomEvent("salon:ready"));
  }

  /* ------------------------------------------------------------------ Lenis */
  function initLenis() {
    if (REDUCED || typeof window.Lenis === "undefined") return;
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGSAP) {
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
      if (hasST) lenis.on("scroll", window.ScrollTrigger.update);
    } else {
      var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* -------------------------------------------------------------- Preloader */
  function initPreloader(done) {
    var pre = $("#preloader");
    if (!pre) { done(); return; }
    var name = CFG.businessName || "Salon";

    var letters = name
      .split("")
      .map(function (ch) {
        return '<span class="preloader-letter">' + (ch === " " ? "&nbsp;" : ch) + "</span>";
      })
      .join("");
    pre.innerHTML =
      '<div class="preloader-letters">' + letters +
        '<span class="preloader-dot">.</span></div>' +
      '<div class="preloader-count">0%</div>';

    if (REDUCED || !hasGSAP) {
      pre.classList.add("is-done");
      done();
      return;
    }

    var counter = { v: 0 };
    var countEl = $(".preloader-count", pre);
    var tl = window.gsap.timeline({
      onComplete: function () {
        pre.classList.add("is-done");
        done();
      },
    });
    tl.to($$(".preloader-letter, .preloader-dot", pre), {
      y: 0,
      duration: 0.45,
      stagger: 0.04,
      ease: "power3.out",
    })
      .to(counter, {
        v: 100,
        duration: 0.75,
        ease: "power2.inOut",
        onUpdate: function () {
          if (countEl) countEl.textContent = Math.round(counter.v) + "%";
        },
      }, "<")
      .to(pre, { yPercent: -100, duration: 0.55, ease: "power4.inOut" }, "+=0.05");
    /* total ≈ 1.35s */
  }

  /* --------------------------------------------------------- Custom cursor */
  function initCursor() {
    if (REDUCED || !FINE_POINTER) return;
    var dot = $(".cursor-dot");
    var ring = $(".cursor-ring");
    if (!dot || !ring) return;
    if (!$(".cursor-label", ring)) {
      var label = document.createElement("span");
      label.className = "cursor-label";
      label.textContent = "View";
      ring.appendChild(label);
    }

    var mx = -100, my = -100, rx = -100, ry = -100;
    var visible = false;

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    });

    function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = "translate(" + (mx - 4) + "px," + (my - 4) + "px)";
      ring.style.transform =
        "translate(" + (rx - ring.offsetWidth / 2) + "px," + (ry - ring.offsetHeight / 2) + "px)";
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    var hoverSel = "a, button, .chip, input, select, textarea, [data-cursor]";
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest ? e.target.closest(hoverSel) : null;
      if (!t) return;
      if (t.closest('[data-cursor="view"]')) {
        ring.classList.add("is-view");
        dot.style.opacity = "0";
      } else {
        ring.classList.add("is-hover");
      }
    });
    document.addEventListener("mouseout", function (e) {
      var t = e.target.closest ? e.target.closest(hoverSel) : null;
      if (!t) return;
      ring.classList.remove("is-view", "is-hover");
      if (visible) dot.style.opacity = "1";
    });
  }

  /* ------------------------------------------------------------- Magnetic */
  function initMagnetic() {
    if (REDUCED || !FINE_POINTER || !hasGSAP) return;
    $$(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        window.gsap.to(el, { x: x * 0.28, y: y * 0.28, duration: 0.4, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", function () {
        window.gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" });
      });
    });
  }

  /* -------------------------------------------------------------- Reveals */
  function initReveals() {
    if (!hasST) return;
    var g = window.gsap;

    if (REDUCED) {
      g.set("[data-reveal], [data-reveal-group] > *", { clearProps: "all" });
      return;
    }

    $$("[data-reveal]").forEach(function (el) {
      var delay = parseFloat(el.getAttribute("data-delay") || 0);
      if (el.getAttribute("data-reveal") === "clip") {
        var img = el.querySelector("img");
        g.set(el, { clipPath: "inset(0 0 100% 0)" });
        if (img) g.set(img, { scale: 1.3 });
        window.ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: function () {
            g.to(el, { clipPath: "inset(0 0 0% 0)", duration: 1.2, delay: delay, ease: "power4.out" });
            if (img) g.to(img, { scale: 1, duration: 1.2, delay: delay, ease: "power4.out" });
          },
        });
      } else {
        g.set(el, { y: 24, opacity: 0 });
        window.ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: function () {
            g.to(el, { y: 0, opacity: 1, duration: 0.9, delay: delay, ease: "power3.out" });
          },
        });
      }
    });

    $$("[data-reveal-group]").forEach(function (group) {
      var children = Array.prototype.slice.call(group.children);
      if (!children.length) return;
      var delay = parseFloat(group.getAttribute("data-delay") || 0);
      g.set(children, { y: 24, opacity: 0 });
      window.ScrollTrigger.create({
        trigger: group,
        start: "top 86%",
        once: true,
        onEnter: function () {
          g.to(children, {
            y: 0, opacity: 1, duration: 0.85, stagger: 0.08, delay: delay, ease: "power3.out",
          });
        },
      });
    });
  }

  /* -------------------------------------------------------------- Marquee */
  function initMarquee() {
    $$(".marquee").forEach(function (marquee) {
      var track = $(".marquee-track", marquee);
      if (!track) return;
      /* duplicate content until track is at least 2× viewport, then ×2 for loop */
      var base = track.innerHTML;
      var guard = 0;
      while (track.scrollWidth < window.innerWidth * 2 && guard < 6) {
        track.innerHTML += base;
        guard++;
      }
      track.innerHTML += track.innerHTML;
      if (REDUCED) track.style.animation = "none";
    });
  }

  /* -------------------------------------------------------------- Counters */
  function formatNum(n) {
    return n >= 1000 ? Math.round(n).toLocaleString("en-US") : String(Math.round(n));
  }
  function initCounters() {
    $$("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      var render = function (v) { el.textContent = formatNum(v) + suffix; };
      if (REDUCED || !hasST) { render(target); return; }
      var obj = { v: 0 };
      render(0);
      window.ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: function () {
          window.gsap.to(obj, {
            v: target,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: function () { render(obj.v); },
          });
        },
      });
    });
  }

  /* ----------------------------------------------------------- Orbit badge */
  function initOrbitBadge() {
    $$("[data-orbit]").forEach(function (el) {
      var text = "BOOK YOUR APPOINTMENT • " + (CFG.businessName || "") + " • ";
      var href = SC.bookingHref ? SC.bookingHref() : "booking.html";
      var external = SC.isExternalBooking && SC.isExternalBooking();
      el.innerHTML =
        '<a href="' + href + '"' + (external ? ' target="_blank" rel="noopener"' : "") +
          ' aria-label="Book your appointment">' +
          '<svg viewBox="0 0 132 132" aria-hidden="true">' +
            '<defs><path id="orbit-path" d="M66,66 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0"/></defs>' +
            '<text><textPath href="#orbit-path">' + text + "</textPath></text>" +
          "</svg>" +
          '<span class="orbit-center">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
              '<path d="M7 17L17 7M17 7H8M17 7v9"/>' +
            "</svg>" +
          "</span>" +
        "</a>";
      var link = el.querySelector("a");
      if (link) {
        link.style.display = "contents";
        link.setAttribute("class", "orbit-link");
      }
    });
  }

  /* -------------------------------------------------- Header + floating CTA */
  function initChrome() {
    var header = $("#siteHeader");
    var floatCta = $("#floatCta");
    var footerVisible = false;

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-scrolled", y > 40);
      if (floatCta) {
        floatCta.classList.toggle("is-visible", y > 500 && !footerVisible);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if ("IntersectionObserver" in window) {
      var targets = $$("#site-footer, .booking-form, .form-grid").filter(Boolean);
      if (targets.length) {
        var io = new IntersectionObserver(function (entries) {
          footerVisible = entries.some(function (en) { return en.isIntersecting; });
          onScroll();
        }, { rootMargin: "0px 0px -10% 0px" });
        targets.forEach(function (t) { io.observe(t); });
      }
    }
  }

  /* ---------------------------------------------------------- Overlay menu */
  function initMenu() {
    var burger = $("#burger");
    var overlay = $("#menuOverlay");
    if (!burger || !overlay) return;

    function setOpen(open) {
      burger.classList.toggle("is-open", open);
      overlay.classList.toggle("is-open", open);
      overlay.setAttribute("aria-hidden", String(!open));
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("is-locked", open);
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    }

    burger.addEventListener("click", function () {
      setOpen(!overlay.classList.contains("is-open"));
    });
    $$(".menu-link", overlay).forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) setOpen(false);
    });
  }

  /* --------------------------------------------------------- Anchor scroll */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -70 });
        } else {
          target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
        }
      });
    });
  }

  /* ------------------------------------------------------------------ Boot */
  document.addEventListener("DOMContentLoaded", function () {
    initLenis();

    if (REDUCED) {
      var pre = $("#preloader");
      if (pre) pre.classList.add("is-done");
      ready();
    } else {
      initPreloader(ready);
    }

    /* Deferred one frame so page scripts that render dynamic content on
       DOMContentLoaded are picked up by the reveal/marquee/counter systems. */
    requestAnimationFrame(function () {
      if (document.body.hasAttribute("data-main-init")) return; /* never double-init */
      document.body.setAttribute("data-main-init", "1");
      initCursor();
      initMagnetic();
      initReveals();
      initMarquee();
      initCounters();
      initOrbitBadge();
      initChrome();
      initMenu();
      initAnchors();
      if (hasST) window.ScrollTrigger.refresh();
    });
  });
})();