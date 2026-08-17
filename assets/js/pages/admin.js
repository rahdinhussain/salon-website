/* ==========================================================================
   admin.js — back-office editor for admin.html.
   Reads window.SITE_CONFIG (already merged with any saved local override),
   renders a graphical editor, and offers three save modes:
     1. Save & Apply      → localStorage override (this browser, instant)
     2. Download          → a complete replacement site-config.js file
     3. Publish to GitHub → commits the replacement file via the REST API
   No external libraries. All element access guarded.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "salonConfigOverride";
  var TOKEN_KEY = "ghPat";

  /* Exact override layer appended to site-config.js and to generated files. */
  var OVERRIDE_SNIPPET =
    "/* --- admin override layer (added for admin.html): applies saved overrides --- */\n" +
    "(function(){try{var o=JSON.parse(localStorage.getItem('salonConfigOverride')||'null');" +
    "if(!o)return;function m(t,s){for(var k in s){if(Object.prototype.hasOwnProperty.call(s,k))" +
    "{var v=s[k];if(v&&typeof v==='object'&&!Array.isArray(v)&&t[k]&&typeof t[k]==='object'" +
    "&&!Array.isArray(t[k])){m(t[k],v);}else{t[k]=v;}}}}m(window.SITE_CONFIG,o);}catch(e)" +
    "{console.warn('[admin] override ignored:',e);}})();";

  /* ---- state ----------------------------------------------------------- */
  var CFG = window.SITE_CONFIG || {};
  var state;
  try {
    state = JSON.parse(JSON.stringify(CFG));
  } catch (e) {
    state = {};
  }
  var isDirty = false;

  /* ---- tiny helpers ----------------------------------------------------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function getPath(obj, path) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function setPath(obj, path, value) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (cur[parts[i]] == null || typeof cur[parts[i]] !== "object") {
        cur[parts[i]] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      }
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }

  /* ---- toasts ------------------------------------------------------------ */
  function toast(msg, type) {
    var box = $("adminToasts");
    if (!box) return;
    var el = document.createElement("div");
    el.className = "admin-toast" + (type === "error" ? " is-error" : "");
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-hiding");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
    }, 4000);
  }

  /* ---- dirty state --------------------------------------------------------- */
  function markDirty() {
    isDirty = true;
    var dot = $("dirtyDot");
    if (dot) dot.hidden = false;
  }
  function clearDirty() {
    isDirty = false;
    var dot = $("dirtyDot");
    if (dot) dot.hidden = true;
  }

  /* ---- admin theme (accent from config) ------------------------------------- */
  function applyAdminTheme(color) {
    if (!color) return;
    var root = document.documentElement.style;
    root.setProperty("--accent", color);
    root.setProperty("--accent-deep", "color-mix(in srgb, " + color + " 78%, black)");
    root.setProperty("--accent-soft", "color-mix(in srgb, " + color + " 12%, transparent)");
  }

  /* ---- editor schema ----------------------------------------------------------
     Scalar sections list fields with config paths; repeatable sections name a
     group whose rows render from state arrays. No business facts live here —
     everything is prefilled from window.SITE_CONFIG at runtime.                */
  var GROUPS = {
    hours: {
      singular: "Row",
      item: function () { return { days: "", time: "" }; },
      layout: "row",
      fields: [
        { key: "days", label: "Days", grow: true },
        { key: "time", label: "Time", grow: true }
      ]
    },
    stats: {
      singular: "Stat",
      item: function () { return { value: 0, suffix: "", label: "" }; },
      layout: "row",
      fields: [
        { key: "value", label: "Value", type: "number" },
        { key: "suffix", label: "Suffix" },
        { key: "label", label: "Label", grow: true }
      ]
    },
    services: {
      singular: "Service",
      item: function () { return { name: "", category: "", duration: "", price: "", description: "" }; },
      fields: [
        { key: "name", label: "Name", grow: true },
        { key: "category", label: "Category", list: "admin-categories" },
        { key: "duration", label: "Duration" },
        { key: "price", label: "Price" },
        { key: "description", label: "Description", type: "textarea", full: true }
      ]
    },
    testimonials: {
      singular: "Testimonial",
      item: function () { return { name: "", service: "", rating: 5, text: "", avatar: "" }; },
      fields: [
        { key: "name", label: "Name" },
        { key: "service", label: "Service" },
        { key: "rating", label: "Rating (1–5)", type: "number", min: 1, max: 5 },
        { key: "text", label: "Text", type: "textarea", full: true },
        { key: "avatar", label: "Avatar URL", type: "url", thumb: true, full: true }
      ]
    },
    team: {
      singular: "Team member",
      item: function () { return { name: "", role: "", photo: "" }; },
      fields: [
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "photo", label: "Photo URL", type: "url", thumb: true, full: true }
      ]
    },
    gallery: {
      singular: "Image",
      item: function () { return { src: "", alt: "", category: "" }; },
      fields: [
        { key: "src", label: "Image URL", type: "url", thumb: true, full: true },
        { key: "alt", label: "Alt text", grow: true },
        { key: "category", label: "Category" }
      ]
    }
  };

  var SECTIONS = [
    {
      id: "identity", title: "Identity",
      fields: [
        { path: "businessName", label: "Business name" },
        { path: "businessType", label: "Business type" },
        { path: "tagline", label: "Tagline" },
        { path: "established", label: "Established (year)", type: "number" },
        { path: "brandColor", label: "Brand color", type: "color" }
      ]
    },
    {
      id: "contact", title: "Contact",
      fields: [
        { path: "email", label: "Email", type: "email" },
        { path: "phoneDisplay", label: "Phone (display)" },
        { path: "phoneLink", label: "Phone (link)", hint: "Click-to-call format: tel: followed by the full number, digits only (e.g. tel:+15551234567)." },
        { path: "whatsappLink", label: "WhatsApp link", hint: "Format: https://wa.me/ followed by the full number, digits only." }
      ]
    },
    {
      id: "location", title: "Location",
      fields: [
        { path: "addressLines.0", label: "Address line 1" },
        { path: "addressLines.1", label: "Address line 2" },
        { path: "mapsEmbedUrl", label: "Google Maps embed URL",
          hint: "Google Maps → find your business → Share → Embed a map → copy the src URL from the snippet." }
      ]
    },
    {
      id: "booking", title: "Booking",
      fields: [
        { path: "bookingUrl", label: "External booking URL",
          hint: "Paste the business's booking link — e.g. Calendly/Fresha/Booksy. Leave empty to use the built-in booking form." }
      ]
    },
    { id: "hours", title: "Hours", group: "hours" },
    {
      id: "social", title: "Social",
      note: "Leave a field empty to hide that network on the site.",
      fields: [
        { path: "social.instagram", label: "Instagram URL" },
        { path: "social.facebook", label: "Facebook URL" },
        { path: "social.tiktok", label: "TikTok URL" },
        { path: "social.pinterest", label: "Pinterest URL" }
      ]
    },
    { id: "stats", title: "Stats", group: "stats" },
    { id: "services", title: "Services", group: "services" },
    { id: "testimonials", title: "Testimonials", group: "testimonials" },
    { id: "team", title: "Team", group: "team" },
    { id: "gallery", title: "Gallery", group: "gallery" },
    {
      id: "images", title: "Page Images",
      fields: [
        { path: "images.hero.0", label: "Hero image 1", type: "url", thumb: true },
        { path: "images.hero.1", label: "Hero image 2", type: "url", thumb: true },
        { path: "images.hero.2", label: "Hero image 3", type: "url", thumb: true },
        { path: "images.about.0", label: "About image 1", type: "url", thumb: true },
        { path: "images.about.1", label: "About image 2", type: "url", thumb: true },
        { path: "images.booking", label: "Booking page image", type: "url", thumb: true },
        { path: "images.contactSide", label: "Contact page side image", type: "url", thumb: true }
      ]
    },
    {
      id: "seo", title: "SEO",
      fields: [
        { path: "seo.description", label: "Meta description", type: "textarea" },
        { path: "seo.keywords", label: "Meta keywords", hint: "Comma-separated." }
      ]
    }
  ];

  /* ---- field renderers ------------------------------------------------------- */
  function attrsFor(def, path, value) {
    var a = ' data-bind="' + esc(path) + '"';
    if (def.type === "number") {
      a += ' data-num="1"';
      if (def.min != null) a += ' min="' + def.min + '"';
      if (def.max != null) a += ' max="' + def.max + '"';
    }
    if (def.list) a += ' list="' + esc(def.list) + '"';
    if (def.thumb) a += ' data-thumb="1"';
    return a;
  }

  function thumbHTML(value) {
    return '<img class="admin-thumb" src="' + esc(value || "") + '" alt="" loading="lazy"' +
      (value ? "" : " hidden") + ' onerror="this.hidden=true" onload="this.hidden=false">';
  }

  function fieldInnerHTML(def, path, value) {
    var input;
    if (def.type === "textarea") {
      input = '<textarea rows="3"' + attrsFor(def, path, value) + ">" + esc(value) + "</textarea>";
    } else if (def.type === "color") {
      var hex = /^#[0-9a-fA-F]{6}$/.test(value || "") ? value : "#B76E79";
      input =
        '<div class="admin-colorrow">' +
          '<input type="color" value="' + esc(hex) + '" data-bind="' + esc(path) + '" data-color="picker" aria-label="Pick color">' +
          '<input type="text" value="' + esc(value) + '" data-bind="' + esc(path) + '" data-color="hex" spellcheck="false" placeholder="#RRGGBB">' +
          '<span class="admin-swatch" data-swatch="' + esc(path) + '" style="background:' + esc(hex) + '"></span>' +
        "</div>";
    } else {
      var type = def.type === "number" ? "number" : def.type === "email" ? "email" : def.type === "url" ? "url" : "text";
      input = '<input type="' + type + '" value="' + esc(value) + '"' + attrsFor(def, path, value) + ' spellcheck="false">';
    }
    var html = '<span class="admin-label">' + esc(def.label) + "</span>";
    if (def.thumb) {
      html += '<div class="admin-imgurl"><div class="admin-imgurl-main">' + input +
        (def.hint ? '<span class="admin-hint">' + esc(def.hint) + "</span>" : "") +
        "</div>" + thumbHTML(value) + "</div>";
    } else {
      html += input + (def.hint ? '<span class="admin-hint">' + esc(def.hint) + "</span>" : "");
    }
    return html;
  }

  function fieldHTML(def, path, value) {
    var cls = "admin-field" + (def.full ? " admin-field--full" : "") + (def.grow ? " admin-field--grow" : "");
    return '<label class="' + cls + '">' + fieldInnerHTML(def, path, value) + "</label>";
  }

  /* ---- repeatable group renderer ------------------------------------------------ */
  function groupItemsHTML(groupKey) {
    var g = GROUPS[groupKey];
    var items = state[groupKey];
    if (!Array.isArray(items)) items = [];
    var html = "";
    for (var i = 0; i < items.length; i++) {
      var row = "";
      var fieldsHtml = "";
      for (var j = 0; j < g.fields.length; j++) {
        var f = g.fields[j];
        fieldsHtml += fieldHTML(f, groupKey + "." + i + "." + f.key, items[i][f.key]);
      }
      if (g.layout === "row") fieldsHtml = '<div class="admin-row">' + fieldsHtml + "</div>";
      html +=
        '<div class="admin-repeat-item" data-item="' + i + '">' +
          '<div class="admin-repeat-head">' +
            '<span class="admin-repeat-title">' + esc(g.singular) + " " + (i + 1) + "</span>" +
            '<button type="button" class="admin-remove" data-action="remove" data-group="' + esc(groupKey) +
              '" data-index="' + i + '">Remove</button>' +
          "</div>" +
          fieldsHtml +
        "</div>";
    }
    html +=
      '<button type="button" class="admin-add" data-action="add" data-group="' + esc(groupKey) +
        '">+ Add ' + esc(g.singular.toLowerCase()) + "</button>";
    return html;
  }

  function categoryDatalistHTML() {
    var seen = {};
    var base = ["Hair", "Color", "Spa", "Nails", "Treatments"];
    base.forEach(function (c) { seen[c] = true; });
    (state.services || []).forEach(function (s) {
      if (s && s.category && !seen[s.category]) seen[s.category] = true;
    });
    var opts = Object.keys(seen).map(function (c) { return '<option value="' + esc(c) + '">'; }).join("");
    return '<datalist id="admin-categories">' + opts + "</datalist>";
  }

  /* ---- sections renderer ---------------------------------------------------------- */
  function renderSections() {
    var mount = $("adminSections");
    if (!mount) return;
    var html = categoryDatalistHTML();
    SECTIONS.forEach(function (sec, idx) {
      var count = "";
      if (sec.group && Array.isArray(state[sec.group])) {
        count = '<span class="admin-section-count">' + state[sec.group].length + "</span>";
      }
      var body = "";
      if (sec.note) body += '<p class="admin-hint" style="margin-bottom:14px">' + esc(sec.note) + "</p>";
      if (sec.group) {
        body += '<div data-group-body="' + esc(sec.group) + '">' + groupItemsHTML(sec.group) + "</div>";
      } else {
        var fieldsHtml = "";
        sec.fields.forEach(function (f) {
          fieldsHtml += fieldHTML(f, f.path, getPath(state, f.path));
        });
        body += '<div class="admin-row">' + fieldsHtml + "</div>";
      }
      html +=
        '<section class="admin-section' + (idx === 0 ? " is-open" : "") + '" data-section="' + esc(sec.id) + '">' +
          '<button type="button" class="admin-section-head" data-action="toggle" aria-expanded="' + (idx === 0) + '">' +
            "<h2>" + esc(sec.title) + "</h2>" + count +
            '<span class="admin-section-caret" aria-hidden="true">+</span>' +
          "</button>" +
          '<div class="admin-section-body"><div class="admin-section-body-inner">' + body + "</div></div>" +
        "</section>";
    });
    mount.innerHTML = html;

    /* open the first section */
    var first = mount.querySelector(".admin-section.is-open .admin-section-body");
    if (first) first.style.maxHeight = first.scrollHeight + "px";
  }

  function refreshGroup(groupKey) {
    var body = document.querySelector('[data-group-body="' + groupKey + '"]');
    if (!body) return;
    body.innerHTML = groupItemsHTML(groupKey);
    /* refresh count badge + keep the open panel sized correctly */
    var section = body.closest(".admin-section");
    if (section) {
      var badge = section.querySelector(".admin-section-count");
      var n = Array.isArray(state[groupKey]) ? state[groupKey].length : 0;
      if (badge) badge.textContent = n;
      var panel = section.querySelector(".admin-section-body");
      if (panel && section.classList.contains("is-open")) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    }
  }

  /* ---- accordion --------------------------------------------------------------------- */
  function toggleSection(headBtn) {
    var section = headBtn.closest(".admin-section");
    if (!section) return;
    var panel = section.querySelector(".admin-section-body");
    if (!panel) return;
    var open = section.classList.toggle("is-open");
    headBtn.setAttribute("aria-expanded", String(open));
    panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
  }

  /* ---- preview --------------------------------------------------------------------------- */
  function reloadPreview(reason) {
    var frame = $("adminFrame");
    var status = $("previewStatus");
    if (frame) {
      var base = frame.getAttribute("src").split("?")[0];
      frame.setAttribute("src", base + "?v=" + Date.now());
    }
    if (status) {
      var t = new Date();
      var hh = String(t.getHours()).padStart(2, "0");
      var mm = String(t.getMinutes()).padStart(2, "0");
      var ss = String(t.getSeconds()).padStart(2, "0");
      status.textContent = "index.html · reloaded " + hh + ":" + mm + ":" + ss + (reason ? " — " + reason : "");
    }
  }

  /* ---- override badge ---------------------------------------------------------------------- */
  function syncOverrideBadge() {
    var badge = $("overrideBadge");
    if (!badge) return;
    var has = false;
    try { has = !!localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    badge.hidden = !has;
  }

  /* ---- save mode 1: local override ------------------------------------------------------------- */
  function saveApply(quiet) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      toast("Could not save locally: " + e.message, "error");
      return false;
    }
    clearDirty();
    syncOverrideBadge();
    reloadPreview("saved");
    if (!quiet) toast("Saved — the site now shows these details in this browser ✓");
    return true;
  }

  /* ---- save mode 2: downloadable replacement file -------------------------------------------------- */
  function buildConfigFile() {
    return (
      "/* Business configuration — edit via admin.html */\n" +
      "window.SITE_CONFIG = " + JSON.stringify(state, null, 2) + ";\n\n" +
      OVERRIDE_SNIPPET + "\n"
    );
  }

  function downloadConfig() {
    var content = buildConfigFile();
    try {
      var blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "site-config.js";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      toast("Downloaded — replace assets/js/site-config.js in your repo with this file to make it permanent.");
    } catch (e) {
      toast("Download failed: " + e.message, "error");
    }
  }

  /* ---- save mode 3: publish to GitHub ------------------------------------------------------------------ */
  function publishToGitHub() {
    var owner = ($("ghOwner") && $("ghOwner").value.trim()) || "";
    var repo = ($("ghRepo") && $("ghRepo").value.trim()) || "";
    var branch = ($("ghBranch") && $("ghBranch").value.trim()) || "main";
    var token = ($("ghToken") && $("ghToken").value.trim()) || "";
    var remember = $("ghRemember") && $("ghRemember").checked;
    var btn = $("btnPublish");

    if (!owner || !repo || !token) {
      toast("Owner, repository and token are required.", "error");
      return;
    }

    /* keep the local browser consistent with what we publish */
    saveApply(true);

    try {
      if (remember) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) { /* storage unavailable — non-fatal */ }

    if (btn) { btn.disabled = true; btn.textContent = "Publishing…"; }
    function done() { if (btn) { btn.disabled = false; btn.textContent = "Publish"; } }

    var api = "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" +
      encodeURIComponent(repo) + "/contents/assets/js/site-config.js";
    var headers = {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json"
    };
    var content = buildConfigFile();

    fetch(api + "?ref=" + encodeURIComponent(branch), { headers: headers })
      .then(function (res) {
        /* 404 = file not on that branch yet — create it without a sha */
        if (res.status === 404) return null;
        if (!res.ok) throw { status: res.status };
        return res.json();
      })
      .then(function (data) {
        var body = {
          message: "Update business info via admin panel",
          content: btoa(unescape(encodeURIComponent(content))),
          branch: branch
        };
        if (data && data.sha) body.sha = data.sha;
        return fetch(api, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(body)
        });
      })
      .then(function (res) {
        if (!res.ok) throw { status: res.status };
        done();
        clearDirty();
        toast("Published ✓ — your live site updates in ~1 minute (GitHub Pages rebuild)");
      })
      .catch(function (err) {
        done();
        var status = err && err.status;
        if (status === 401) toast("Publish failed: bad or expired token (401). Generate a new fine-grained token.", "error");
        else if (status === 403) toast("Publish failed: token lacks permission (403). Grant Contents: Read and Write on the repo.", "error");
        else if (status === 404) toast("Publish failed: repo or path not found (404). Check owner/repo/branch.", "error");
        else if (status) toast("Publish failed: GitHub returned " + status + ".", "error");
        else toast("Publish failed: network error — check your connection and try again.", "error");
      });
  }

  /* ---- reset ----------------------------------------------------------------------------------------------- */
  function resetAll() {
    if (!window.confirm("Remove all local overrides and restore the values from site-config.js?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    toast("Overrides removed — restoring defaults…");
    setTimeout(function () { window.location.reload(); }, 600);
  }

  /* ---- input handling (event delegation) --------------------------------------------------------------------- */
  function coerceValue(input) {
    if (input.getAttribute("data-num")) {
      var n = parseFloat(input.value);
      return isNaN(n) ? 0 : n;
    }
    return input.value;
  }

  function syncColorUI(source) {
    var hex = state.brandColor;
    var valid = /^#[0-9a-fA-F]{6}$/.test(hex || "");
    var picker = document.querySelector('[data-color="picker"]');
    var hexInput = document.querySelector('[data-color="hex"]');
    var swatch = document.querySelector('[data-swatch="brandColor"]');
    if (source !== picker && picker && valid) picker.value = hex;
    if (source !== hexInput && hexInput) hexInput.value = hex;
    if (swatch && valid) swatch.style.background = hex;
    if (valid) applyAdminTheme(hex);
  }

  function onInput(e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    var path = t.getAttribute("data-bind");
    if (!path) return;
    setPath(state, path, coerceValue(t));
    markDirty();

    if (path === "brandColor") syncColorUI(t);
    if (path === "businessName") {
      var brand = $("adminBrandName");
      if (brand) brand.textContent = t.value || "Admin";
    }
    if (t.getAttribute("data-thumb")) {
      var wrap = t.closest(".admin-imgurl");
      var img = wrap && wrap.querySelector(".admin-thumb");
      if (img) { img.src = t.value; img.hidden = !t.value; }
    }
  }

  function onClick(e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-action]") : null;
    if (!t) return;
    var action = t.getAttribute("data-action");

    if (action === "toggle") { toggleSection(t); return; }

    var groupKey = t.getAttribute("data-group");
    if (!groupKey || !GROUPS[groupKey]) return;
    if (!Array.isArray(state[groupKey])) state[groupKey] = [];

    if (action === "add") {
      state[groupKey].push(GROUPS[groupKey].item());
      refreshGroup(groupKey);
      markDirty();
    } else if (action === "remove") {
      var idx = parseInt(t.getAttribute("data-index"), 10);
      if (isNaN(idx)) return;
      var item = t.closest(".admin-repeat-item");
      var doRemove = function () {
        state[groupKey].splice(idx, 1);
        refreshGroup(groupKey);
        markDirty();
      };
      if (item) {
        item.classList.add("is-leaving");
        setTimeout(doRemove, 220);
      } else {
        doRemove();
      }
    }
  }

  /* ---- wiring -------------------------------------------------------------------------------------------------- */
  function init() {
    renderSections();

    var brand = $("adminBrandName");
    if (brand) brand.textContent = state.businessName || "Admin";
    applyAdminTheme(state.brandColor || "#B76E79");
    syncOverrideBadge();

    var sections = $("adminSections");
    if (sections) {
      sections.addEventListener("input", onInput);
      sections.addEventListener("click", onClick);
    }

    var btnSave = $("btnSave");
    if (btnSave) btnSave.addEventListener("click", function () { saveApply(false); });

    var btnDl = $("btnDownload");
    if (btnDl) btnDl.addEventListener("click", downloadConfig);

    var btnPubToggle = $("btnPublishToggle");
    var panel = $("publishPanel");
    if (btnPubToggle && panel) {
      btnPubToggle.addEventListener("click", function () {
        var open = panel.hidden;
        panel.hidden = !open;
        btnPubToggle.setAttribute("aria-expanded", String(open));
      });
    }

    /* publish panel prefills */
    var owner = $("ghOwner"); if (owner && !owner.value) owner.value = "rahdinhussain";
    var repo = $("ghRepo"); if (repo && !repo.value) repo.value = "salon-website";
    var branch = $("ghBranch"); if (branch && !branch.value) branch.value = "main";
    var tokenInput = $("ghToken");
    var remember = $("ghRemember");
    try {
      var savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken && tokenInput) { tokenInput.value = savedToken; if (remember) remember.checked = true; }
    } catch (e) { /* ignore */ }

    var btnPub = $("btnPublish");
    if (btnPub) btnPub.addEventListener("click", publishToGitHub);

    var btnReset = $("btnReset");
    if (btnReset) btnReset.addEventListener("click", resetAll);

    /* Ctrl/Cmd+S = Save & Apply */
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        saveApply(false);
      }
    });

    /* mobile preview toggle */
    var preview = $("adminPreview");
    var toggle = $("previewToggle");
    var close = $("previewClose");
    if (toggle && preview) {
      toggle.addEventListener("click", function () { preview.classList.toggle("is-visible"); });
    }
    if (close && preview) {
      close.addEventListener("click", function () { preview.classList.remove("is-visible"); });
    }

    /* status line once the initial preview loads */
    var frame = $("adminFrame");
    if (frame) {
      frame.addEventListener("load", function () {
        var status = $("previewStatus");
        if (status && !/reloaded/.test(status.textContent)) {
          status.textContent = "index.html · live preview";
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
