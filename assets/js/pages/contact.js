/* ==========================================================================
   pages/contact.js — contact page only.
   Info cards (Call / Email / Visit) · map iframe from config.mapsEmbedUrl ·
   contact form (validation → prefilled mailto + success state) · socials row
   (only non-empty entries) · hours. All data from SITE_CONFIG.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var SC = window.SalonComponents || {};

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

  var ICONS = {
    phone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
      '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z"/></svg>',
    mail:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
      '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    pin:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
      '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  };

  /* -- Info cards: Call / Email / Visit -------------------------------------- */
  function renderCards() {
    var row = $("#contactCards");
    if (!row) return;
    var address = (CFG.addressLines || []).map(esc).join("<br>");
    var mapsQuery = encodeURIComponent((CFG.addressLines || []).join(", "));
    var cards = [
      {
        icon: ICONS.phone,
        title: "Call",
        value: '<a href="' + esc(CFG.phoneLink || "#") + '">' + esc(CFG.phoneDisplay) + "</a>",
        note: "Fastest for same-week appointments and quick questions.",
      },
      {
        icon: ICONS.mail,
        title: "Email",
        value: '<a href="mailto:' + esc(CFG.email || "") + '">' + esc(CFG.email) + "</a>",
        note: "For events, collaborations, and anything detailed.",
      },
      {
        icon: ICONS.pin,
        title: "Visit",
        value:
          '<a href="https://www.google.com/maps/search/?api=1&query=' + mapsQuery +
          '" target="_blank" rel="noopener">' + address + "</a>",
        note: "Open in Google Maps for directions.",
      },
    ];
    row.innerHTML = cards
      .map(function (c) {
        return (
          '<div class="info-card">' +
            '<span class="info-card-icon">' + c.icon + "</span>" +
            '<h3 class="info-card-title">' + c.title + "</h3>" +
            '<div class="info-card-value">' + c.value + "</div>" +
            "<p>" + c.note + "</p>" +
          "</div>"
        );
      })
      .join("");
  }

  /* -- Map iframe -------------------------------------------------------------- */
  function renderMap() {
    var frame = $("#mapFrame");
    if (!frame) return;
    if (CFG.mapsEmbedUrl) {
      frame.src = CFG.mapsEmbedUrl;
      frame.title = "Map — " + (CFG.businessName || "the studio");
    }
  }

  /* -- Socials (only non-empty config.social entries) ---------------------------- */
  function renderSocials() {
    var box = $("#contactSocials");
    if (!box) return;
    var icons = SC.socialIcons || {};
    var social = CFG.social || {};
    var html = "";
    Object.keys(icons).forEach(function (key) {
      var url = social[key];
      if (url && String(url).length) {
        html +=
          '<a class="social-link" href="' + esc(url) +
          '" target="_blank" rel="noopener" aria-label="' + esc(key) + '">' +
          icons[key] + "</a>";
      }
    });
    box.innerHTML = html;
  }

  /* -- Hours ----------------------------------------------------------------------- */
  function renderHours() {
    var list = $("#contactHours");
    if (!list) return;
    list.innerHTML = (CFG.hours || [])
      .map(function (h) {
        return "<li><span>" + esc(h.days) + "</span><span>" + esc(h.time) + "</span></li>";
      })
      .join("");
  }

  /* -- Form: validation → prefilled mailto + success -------------------------------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function markInvalid(el, invalid) {
    if (!el) return;
    el.classList.toggle("is-invalid", invalid);
    if (invalid) el.setAttribute("aria-invalid", "true");
    else el.removeAttribute("aria-invalid");
  }

  function initForm() {
    var form = $("#contactForm");
    if (!form) return;
    var success = $("#contactSuccess");

    $$("input, textarea", form).forEach(function (el) {
      el.addEventListener("input", function () { markInvalid(el, false); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#ctName");
      var email = $("#ctEmail");
      var message = $("#ctMessage");

      var checks = [
        [name, !!(name && name.value.trim().length >= 2)],
        [email, !!(email && EMAIL_RE.test(email.value.trim()))],
        [message, !!(message && message.value.trim().length >= 5)],
      ];
      var firstBad = null;
      checks.forEach(function (pair) {
        markInvalid(pair[0], !pair[1]);
        if (!pair[1] && !firstBad) firstBad = pair[0];
      });
      if (firstBad) {
        firstBad.focus();
        return;
      }

      var body =
        "Name: " + name.value.trim() + "\n" +
        "Email: " + email.value.trim() + "\n\n" +
        message.value.trim();
      var mailto =
        "mailto:" + encodeURIComponent(CFG.email || "") +
        "?subject=" + encodeURIComponent("Website message from " + name.value.trim()) +
        "&body=" + encodeURIComponent(body);
      window.location.href = mailto;

      if (success) {
        success.innerHTML =
          "<h3>Your message is ready to send</h3>" +
          "<p>Your email app just opened with your message prefilled — hit send and " +
          "we'll get back to you as soon as we can.</p>";
        success.classList.add("is-visible");
        form.style.display = "none";
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  renderCards();
  renderMap();
  renderSocials();
  renderHours();

  document.addEventListener("DOMContentLoaded", function () {
    initForm();
    if (SC.wireBookingLinks) SC.wireBookingLinks();
  });
})();