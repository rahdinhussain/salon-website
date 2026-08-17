/* ==========================================================================
   components.js — theme + shared chrome (header / footer / floating CTA /
   page meta). All content comes from window.SITE_CONFIG — nothing hardcoded.
   Exposes window.SalonComponents and auto-runs on DOMContentLoaded.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};

  function bookingHref() {
    return CFG.bookingUrl && CFG.bookingUrl.length ? CFG.bookingUrl : "booking.html";
  }
  function isExternalBooking() {
    return /^https?:\/\//i.test(bookingHref());
  }
  function bookAttrs() {
    return isExternalBooking() ? ' target="_blank" rel="noopener"' : "";
  }
  function esc(s) {
    return String(s == null ? "" : s);
  }

  /* -- 1. applyTheme: --accent from config + derived shades + favicon ------ */
  function applyTheme() {
    var root = document.documentElement;
    var color = CFG.brandColor || "#B76E79";
    root.style.setProperty("--accent", color);
    root.style.setProperty(
      "--accent-deep",
      "color-mix(in srgb, " + color + " 78%, black)"
    );
    root.style.setProperty(
      "--accent-soft",
      "color-mix(in srgb, " + color + " 12%, transparent)"
    );

    /* Dynamic favicon: accent circle + first letter of businessName */
    try {
      var size = 64;
      var canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 34px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText((CFG.businessName || "S").charAt(0).toUpperCase(), size / 2, size / 2 + 2);
      var link =
        document.querySelector('link[rel="icon"]') ||
        document.createElement("link");
      link.rel = "icon";
      link.href = canvas.toDataURL("image/png");
      document.head.appendChild(link);
    } catch (e) {
      /* favicon is decorative — never break the page */
    }
  }

  /* -- Social icons (minimal inline SVG) ------------------------------------ */
  var SOCIAL_ICONS = {
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1M12 0C8.7 0 8.3 0 7.1.1 5.8.2 5 .4 4.3.7c-.7.3-1.3.7-1.9 1.3C1.8 2.6 1.4 3.2 1.1 3.9.8 4.6.6 5.4.5 6.7.4 7.9.4 8.3.4 11.6s0 3.6.1 4.8c.1 1.3.3 2.1.6 2.8.3.7.7 1.3 1.3 1.9.6.6 1.2 1 1.9 1.3.7.3 1.5.5 2.8.6 1.2.1 1.6.1 4.9.1s3.6 0 4.8-.1c1.3-.1 2.1-.3 2.8-.6.7-.3 1.3-.7 1.9-1.3.6-.6 1-1.2 1.3-1.9.3-.7.5-1.5.6-2.8.1-1.2.1-1.6.1-4.8s0-3.6-.1-4.8c-.1-1.3-.3-2.1-.6-2.8-.3-.7-.7-1.3-1.3-1.9C21 1.4 20.4 1 19.7.7c-.7-.3-1.5-.5-2.8-.6C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.8-10.4a1.4 1.4 0 1 1-2.9 0 1.4 1.4 0 0 1 2.9 0z"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 0 1-5.2 1.74 2.9 2.9 0 0 1 2.31-4.64c.3 0 .58.05.85.13V9.4a6.33 6.33 0 0 0-.85-.05A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>',
    pinterest:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.17-.11-.95-.2-2.4.04-3.44.22-.93 1.4-5.94 1.4-5.94s-.36-.72-.36-1.78c0-1.66.97-2.9 2.17-2.9 1.02 0 1.51.77 1.51 1.69 0 1.03-.65 2.57-1 4-.28 1.18.6 2.14 1.76 2.14 2.12 0 3.75-2.23 3.75-5.45 0-2.85-2.05-4.84-4.98-4.84-3.39 0-5.38 2.54-5.38 5.17 0 1.02.4 2.12.88 2.72.1.12.11.22.08.34l-.33 1.36c-.05.22-.18.27-.4.16-1.5-.7-2.43-2.89-2.43-4.65 0-3.78 2.75-7.26 7.93-7.26 4.16 0 7.4 2.97 7.4 6.93 0 4.14-2.6 7.47-6.23 7.47-1.21 0-2.36-.63-2.75-1.38l-.75 2.85c-.27 1.04-1 2.35-1.49 3.15 1.12.35 2.31.53 3.55.53 6.63 0 12-5.37 12-12S18.63 0 12 0z"/></svg>',
  };

  function socialLinksHTML() {
    var social = CFG.social || {};
    var html = "";
    Object.keys(SOCIAL_ICONS).forEach(function (key) {
      var url = social[key];
      if (url && url.length) {
        html +=
          '<a class="social-link" href="' + esc(url) +
          '" target="_blank" rel="noopener" aria-label="' + key + '">' +
          SOCIAL_ICONS[key] + "</a>";
      }
    });
    return html;
  }

  /* -- 2. renderHeader ------------------------------------------------------- */
  var NAV = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "about", label: "About", href: "about.html" },
    { id: "services", label: "Services", href: "services.html" },
    { id: "pricing", label: "Pricing", href: "pricing.html" },
    { id: "gallery", label: "Gallery", href: "gallery.html" },
    { id: "testimonials", label: "Testimonials", href: "testimonials.html" },
    { id: "contact", label: "Contact", href: "contact.html" },
  ];

  function renderHeader() {
    var mount = document.getElementById("site-header");
    if (!mount) return;
    var page = document.body.getAttribute("data-page") || "";

    var navHTML = NAV.map(function (item) {
      var active = item.id === page ? " is-active" : "";
      return (
        '<a class="nav-link' + active + '" data-nav="' + item.id +
        '" href="' + item.href + '">' + item.label + "</a>"
      );
    }).join("");

    var overlayLinks = NAV.map(function (item, i) {
      var active = item.id === page ? " is-active" : "";
      return (
        '<a class="menu-link' + active + '" data-nav="' + item.id +
        '" href="' + item.href + '" style="--d:' + (0.06 * i + 0.08).toFixed(2) +
        's"><span>' + item.label + "</span></a>"
      );
    }).join("");

    mount.innerHTML =
      '<header class="site-header" id="siteHeader">' +
        '<div class="header-inner container">' +
          '<a class="brand" href="index.html">' + esc(CFG.businessName) +
            '<span class="brand-dot">.</span></a>' +
          '<nav class="site-nav" aria-label="Primary">' + navHTML + "</nav>" +
          '<div class="header-actions">' +
            '<a class="btn btn-small nav-book magnetic" href="' + bookingHref() + '"' + bookAttrs() + ">Book Now</a>" +
            '<button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="menuOverlay">' +
              "<span></span><span></span>" +
            "</button>" +
          "</div>" +
        "</div>" +
      "</header>" +
      '<div class="menu-overlay" id="menuOverlay" aria-hidden="true">' +
        "<nav aria-label=\"Mobile\">" + overlayLinks + "</nav>" +
        '<div class="menu-foot">' +
          '<div class="socials">' + socialLinksHTML() + "</div>" +
          '<a class="btn magnetic" href="' + bookingHref() + '"' + bookAttrs() +
            '>Book Now <span class="btn-arrow">→</span></a>' +
        "</div>" +
      "</div>";
  }

  /* -- 3. renderFooter ------------------------------------------------------- */
  function renderFooter() {
    var mount = document.getElementById("site-footer");
    if (!mount) return;

    var explore = NAV.map(function (item) {
      return '<li><a href="' + item.href + '">' + item.label + "</a></li>";
    }).join("");

    var address = (CFG.addressLines || [])
      .map(function (l) { return esc(l); })
      .join("<br>");

    var hours = (CFG.hours || [])
      .map(function (h) {
        return "<li><span>" + esc(h.days) + "</span><span>" + esc(h.time) + "</span></li>";
      })
      .join("");

    mount.innerHTML =
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="footer-cta">' +
            "<h2>Ready for your <span class=\"accent-word\">" + esc(CFG.tagline ? CFG.tagline.toLowerCase() : "ritual") +
            "</span>?</h2>" +
            '<a class="btn magnetic" href="' + bookingHref() + '"' + bookAttrs() +
              '>Book Now <span class="btn-arrow">→</span></a>' +
          "</div>" +
          '<div class="footer-grid">' +
            '<div class="footer-brand">' +
              '<a class="brand" href="index.html">' + esc(CFG.businessName) +
                '<span class="brand-dot">.</span></a>' +
              "<p>" + esc(CFG.businessType) + " — " + esc(CFG.tagline) + ". Est. " + esc(CFG.established) + ".</p>" +
              '<div class="socials">' + socialLinksHTML() + "</div>" +
            "</div>" +
            '<div class="footer-col"><h4>Explore</h4><ul>' + explore + "</ul></div>" +
            '<div class="footer-col"><h4>Contact</h4><ul>' +
              '<li><a href="' + esc(CFG.phoneLink) + '">' + esc(CFG.phoneDisplay) + "</a></li>" +
              '<li><a href="mailto:' + esc(CFG.email) + '">' + esc(CFG.email) + "</a></li>" +
              "<li><address style=\"font-style:normal\">" + address + "</address></li>" +
            "</ul></div>" +
            '<div class="footer-col"><h4>Hours</h4><ul class="footer-hours">' + hours + "</ul></div>" +
          "</div>" +
          '<div class="footer-bar">' +
            "<span>© " + new Date().getFullYear() + " " + esc(CFG.businessName) + " — All rights reserved.</span>" +
            "<span>" + esc(CFG.businessType) + "</span>" +
          "</div>" +
        "</div>" +
      "</footer>";
  }

  /* -- 4. renderFloatingCTA --------------------------------------------------- */
  function renderFloatingCTA() {
    var el = document.createElement("a");
    el.className = "float-cta btn btn-small magnetic";
    el.id = "floatCta";
    el.href = bookingHref();
    if (isExternalBooking()) {
      el.target = "_blank";
      el.rel = "noopener";
    }
    el.innerHTML = 'Book Now <span class="btn-arrow">→</span>';
    document.body.appendChild(el);
  }

  /* -- 5. setPageMeta ---------------------------------------------------------- */
  function setPageMeta() {
    var title = document.body.getAttribute("data-page-title");
    if (title) {
      document.title = title + " — " + (CFG.businessName || "Salon");
    }
    var seo = CFG.seo || {};
    setMeta("description", seo.description || "");
    setMeta("keywords", seo.keywords || "");
    setMeta('og:title', document.title, true);
    setMeta("og:description", seo.description || "", true);
    setMeta("og:type", "website", true);
  }
  function setMeta(name, content, isProperty) {
    if (!content) return;
    var attr = isProperty ? "property" : "name";
    var tag = document.querySelector("meta[" + attr + '="' + name + '"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  /* -- 6. wireBookingLinks: every <a data-book> routes to bookingUrl || booking.html */
  function wireBookingLinks(root) {
    var links = (root || document).querySelectorAll("a[data-book]");
    Array.prototype.forEach.call(links, function (a) {
      a.setAttribute("href", bookingHref());
      if (isExternalBooking()) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
      }
    });
  }

  /* -- public API + auto-run --------------------------------------------------- */
  window.SalonComponents = {
    applyTheme: applyTheme,
    renderHeader: renderHeader,
    renderFooter: renderFooter,
    renderFloatingCTA: renderFloatingCTA,
    setPageMeta: setPageMeta,
    bookingHref: bookingHref,
    isExternalBooking: isExternalBooking,
    wireBookingLinks: wireBookingLinks,
    socialIcons: SOCIAL_ICONS,
  };

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme();
    setPageMeta();
    renderHeader();
    renderFooter();
    renderFloatingCTA();
    wireBookingLinks();
  });
})();