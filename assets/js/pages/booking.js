/* ==========================================================================
   pages/booking.js — booking page only.
   Branching: if SITE_CONFIG.bookingUrl is non-empty, a prominent card links
   out to the external booking partner (target _blank) — the built-in form is
   ALWAYS rendered as well. Form validates client-side (.is-invalid), then
   opens a prefilled mailto:{SITE_CONFIG.email} and shows the success state.
   WhatsApp ghost button links config.whatsappLink. Side panel (image, hours,
   address, phone) renders entirely from config.
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

  /* -- External booking partner card (only when bookingUrl is set) ---------- */
  function renderExternal() {
    var mount = $("#externalBooking");
    if (!mount) return;
    var url = CFG.bookingUrl;
    if (!url || !String(url).length) return;
    mount.innerHTML =
      '<div class="card" data-reveal style="margin-bottom:3rem">' +
        '<p class="eyebrow">Fastest Option</p>' +
        '<h2 class="section-title" style="font-size:clamp(1.5rem,3vw,2.3rem);margin-bottom:1rem">' +
          'Book instantly with our <span class="accent-word">booking partner</span></h2>' +
        '<p class="text-soft" style="margin-bottom:1.6rem;max-width:56ch">' +
          "This link opens our external booking partner in a new tab, where you can see " +
          "live availability and confirm in seconds. Prefer a personal touch? " +
          "Use the request form below instead.</p>" +
        '<a class="btn magnetic" href="' + esc(url) + '" target="_blank" rel="noopener">' +
          'Continue to Booking <span class="btn-arrow">→</span></a>' +
      "</div>";
  }

  /* -- Service select from config.services ----------------------------------- */
  function renderServices() {
    var select = $("#bkService");
    if (!select) return;
    (CFG.services || []).forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s.name;
      opt.textContent = s.name + " — " + s.duration + " · " + s.price;
      select.appendChild(opt);
    });
  }

  /* -- Time slots aligned to config.hours ------------------------------------- */
  function parseTime(str) {
    var m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(String(str || ""));
    if (!m) return null;
    var h = parseInt(m[1], 10) % 12;
    if (/pm/i.test(m[3])) h += 12;
    return h * 60 + parseInt(m[2], 10);
  }
  function fmtTime(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    var suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + (m < 10 ? "0" + m : m) + " " + suffix;
  }
  function renderTimeSlots() {
    var select = $("#bkTime");
    if (!select) return;
    var start = null;
    var end = null;
    (CFG.hours || []).forEach(function (row) {
      if (/closed/i.test(row.time)) return;
      var times = String(row.time).match(/\d{1,2}:\d{2}\s*(?:AM|PM)/gi) || [];
      if (times.length >= 2) {
        var s = parseTime(times[0]);
        var e = parseTime(times[times.length - 1]);
        if (s != null && (start == null || s < start)) start = s;
        if (e != null && (end == null || e > end)) end = e;
      }
    });
    if (start == null || end == null || end <= start) {
      start = 9 * 60;
      end = 18 * 60;
    }
    /* last appointment starts one hour before the earliest closing */
    for (var t = start; t <= end - 60; t += 30) {
      var opt = document.createElement("option");
      opt.value = fmtTime(t);
      opt.textContent = fmtTime(t);
      select.appendChild(opt);
    }
  }

  /* -- Date: no past dates ------------------------------------------------------ */
  function initDate() {
    var input = $("#bkDate");
    if (!input) return;
    var d = new Date();
    var iso =
      d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
    input.min = iso;
  }

  /* -- Side panel: image, hours, address, phone ----------------------------------- */
  function renderSidePanel() {
    var img = $("#bookingImg");
    var src = CFG.images && CFG.images.booking;
    if (img && src) {
      img.src = src;
      img.alt = "Inside " + (CFG.businessName || "the studio") + " — the space awaiting your visit";
    }
    var hours = $("#bookingHours");
    if (hours) {
      hours.innerHTML = (CFG.hours || [])
        .map(function (h) {
          return "<li><span>" + esc(h.days) + "</span><span>" + esc(h.time) + "</span></li>";
        })
        .join("");
    }
    var addr = $("#bookingAddress");
    if (addr) {
      addr.innerHTML = (CFG.addressLines || []).map(esc).join("<br>");
    }
    var phone = $("#bookingPhone");
    var phoneText = $("#bookingPhoneText");
    if (phone && CFG.phoneLink) phone.setAttribute("href", CFG.phoneLink);
    if (phoneText) phoneText.textContent = CFG.phoneDisplay || "Call us";
    var wa = $("#whatsappBtn");
    if (wa) {
      if (CFG.whatsappLink) {
        wa.setAttribute("href", CFG.whatsappLink);
      } else {
        wa.style.display = "none";
      }
    }
  }

  /* -- Validation + mailto submit --------------------------------------------------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[+()\-.\s\d]{7,}$/;

  function markInvalid(el, invalid) {
    if (!el) return;
    el.classList.toggle("is-invalid", invalid);
    if (invalid) el.setAttribute("aria-invalid", "true");
    else el.removeAttribute("aria-invalid");
  }

  function initForm() {
    var form = $("#bookingForm");
    if (!form) return;
    var success = $("#bookingSuccess");

    /* clear invalid state as the user types */
    $$("input, select, textarea", form).forEach(function (el) {
      el.addEventListener("input", function () { markInvalid(el, false); });
      el.addEventListener("change", function () { markInvalid(el, false); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#bkName");
      var phone = $("#bkPhone");
      var email = $("#bkEmail");
      var service = $("#bkService");
      var date = $("#bkDate");
      var time = $("#bkTime");
      var notes = $("#bkNotes");

      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var picked = date && date.value ? new Date(date.value + "T00:00:00") : null;

      var checks = [
        [name, !!(name && name.value.trim().length >= 2)],
        [phone, !!(phone && PHONE_RE.test(phone.value.trim()))],
        [email, !!(email && EMAIL_RE.test(email.value.trim()))],
        [service, !!(service && service.value)],
        [date, !!(picked && !isNaN(picked) && picked >= today)],
        [time, !!(time && time.value)],
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

      var lines = [
        "Name: " + name.value.trim(),
        "Phone: " + phone.value.trim(),
        "Email: " + email.value.trim(),
        "Service: " + service.value,
        "Preferred date: " + date.value,
        "Preferred time: " + time.value,
      ];
      if (notes && notes.value.trim()) lines.push("Notes: " + notes.value.trim());

      var mailto =
        "mailto:" + encodeURIComponent(CFG.email || "") +
        "?subject=" + encodeURIComponent("Booking request — " + service.value) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      window.location.href = mailto;

      if (success) {
        success.innerHTML =
          "<h3>Your request is ready to send</h3>" +
          "<p>Your email app just opened with everything prefilled — hit send and " +
          "we'll confirm your appointment shortly. Prefer instant answers? " +
          "Message us on WhatsApp instead.</p>";
        success.classList.add("is-visible");
        form.style.display = "none";
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  renderExternal();
  renderServices();
  renderTimeSlots();
  initDate();
  renderSidePanel();

  document.addEventListener("DOMContentLoaded", function () {
    initForm();
    if (SC.wireBookingLinks) SC.wireBookingLinks();
  });
})();