# Salon Website Template

A premium, futuristic, highly-animated **white-label website template** for salons, spas,
nail bars, and barbershops. Pure white design + ONE accent color (default rose gold
`#B76E79`). Built with vanilla HTML/CSS/JS — **no build step, no frameworks** — with
GSAP + Lenis animations via CDN.

**100% config-driven:** every business detail lives in `assets/js/site-config.js`.
Re-skinning the site for a new business = editing that ONE file.

## Quick start

1. Open `index.html` in a browser (or serve the folder with any static server).
2. To personalize: edit `assets/js/site-config.js` — see the guide below.
3. Deploy the folder as-is (GitHub Pages / Netlify / Vercel).

## File map

```
salon-website/
├── index.html               Home (hero, intro+stats, services, steps, quote, gallery, CTA)
├── services.html            Service list with category filter chips
├── pricing.html             Price menu grouped by category + notes card
├── about.html               Story, values, team, stats
├── gallery.html             Filterable masonry gallery + lightbox
├── testimonials.html        Rating summary + masonry reviews
├── booking.html             Built-in booking form (or external booking link)
├── contact.html             Info cards, map, contact form
├── TEMPLATE.html            Canonical page skeleton — copy it to add a page
└── assets/
    ├── css/style.css        ENTIRE design system (all pages share this one file)
    └── js/
        ├── site-config.js   ★ ALL business data & images — edit this to re-skin
        ├── components.js    Theme, header, footer, floating CTA, page meta
        ├── main.js          Animation engine (preloader, Lenis, cursor, reveals…)
        └── pages/*.js       Per-page rendering & page-specific animation
```

## Admin Panel (easiest way to personalize)

No code editing needed. Open **`admin.html`** in your browser (double-click it, or
visit `https://<your-site>/admin.html` once deployed). It is a graphical back-office
that reads the live `SITE_CONFIG` and lets you edit everything — identity, brand
color (visual color picker), contacts, hours, socials, stats, services, testimonials,
team, gallery, page images, and SEO — with a live preview of the website beside the
editor. `admin.html` is not linked from any public page.

The save bar offers **three save modes**:

1. **Save & Apply** — stores your edits in the browser's `localStorage`
   (`salonConfigOverride`). Every page of the site merges this override on load, so
   the whole site updates instantly — but only in *this* browser. Great for trying
   things out. (`Ctrl/Cmd+S` works too; **Reset** clears the override.)
2. **Download site-config.js** — downloads a complete replacement config file.
   Replace `assets/js/site-config.js` in your project/repo with it to make the
   changes permanent for every visitor.
3. **Publish to GitHub** — commits the replacement `assets/js/site-config.js`
   straight to your repository; GitHub Pages rebuilds the live site in ~1 minute.

### Setting up Publish to GitHub (one time, ~2 minutes)

1. On GitHub, click your avatar → **Settings** → **Developer settings** (bottom left).
2. **Personal access tokens → Fine-grained tokens → Generate new token**.
3. Under **Repository access**, choose **Only select repositories** and pick this
   website's repository.
4. Under **Permissions → Repository permissions**, set **Contents** to
   **Read and Write** (nothing else is needed).
5. Generate the token, copy it, and paste it into the admin panel's
   **Publish to GitHub** panel (owner/repo/branch are prefilled).

⚠️ The token is stored **only in your own browser's `localStorage`** (key `ghPat`,
if you tick "remember token") — it is never sent anywhere except directly to
GitHub's API. Revoke it any time from the same GitHub settings page.

---

## Personalization guide (editing the file by hand)

### Step 1 — Open `assets/js/site-config.js`

Everything below is edited in that single file. Save, refresh, done.

### Step 2 — Change identity & color

```js
businessName: "GLOW BAR",          // appears in header, footer, preloader, favicon…
businessType: "Nail Bar & Spa",    // hero eyebrow, footer blurb
brandColor: "#7A9E7E",             // sage green — the ENTIRE site re-skins
```

`brandColor` drives every accent in the UI: buttons, eyebrow rules, marquee stars,
chips, cursor, preloader, selection color, and the auto-generated favicon. The hover
(`--accent-deep`) and tint (`--accent-soft`) shades are recomputed automatically via
`color-mix` — you never touch CSS.

### Step 3 — Update contacts, hours, socials, booking

- `bookingUrl`: paste an external link (Square, Fresha, Calendly…) and every
  "Book Now" button opens it in a new tab. Leave it `""` to use the built-in
  `booking.html` form (which submits via `mailto:` + offers WhatsApp).
- `social`: set any network to `""` to hide it everywhere.

### Step 4 — Replace services, testimonials, team, gallery, stats

Plain arrays — add, remove, or edit entries. Pages re-render automatically.

### Full config field reference

| Field | Type | Example | Used for |
|---|---|---|---|
| `businessName` | string | `"LUMIÈRE"` | Logo, preloader, footer, favicon, titles |
| `businessType` | string | `"Hair Salon & Beauty Studio"` | Hero eyebrow, footer blurb, SEO |
| `tagline` | string | `"Where artistry becomes ritual"` | Hero sub-line, footer CTA |
| `established` | number | `2012` | About/intro copy, footer |
| `brandColor` | hex string | `"#B76E79"` | Every accent in the design |
| `email` | string | `"hello@example.com"` | Footer, contact page, booking `mailto:` |
| `phoneDisplay` | string | `"+1 (212) 555-0148"` | Visible phone number |
| `phoneLink` | string | `"tel:+12125550148"` | Click-to-call href |
| `whatsappLink` | string | `"https://wa.me/12125550148"` | Booking page WhatsApp button |
| `addressLines` | string[] | `["128 Bloom Street, SoHo", "New York, NY 10012"]` | Footer, contact page |
| `mapsEmbedUrl` | string | Google Maps `?output=embed` URL | Contact page map iframe |
| `bookingUrl` | string | `""` or external URL | All Book CTAs (empty = built-in form) |
| `hours` | `{days, time}[]` | `{days:"Saturday", time:"9:00 AM — 6:00 PM"}` | Footer, contact, booking |
| `social` | `{instagram, facebook, tiktok, pinterest}` | URL or `""` (hidden) | Footer, mobile menu, contact |
| `stats` | `{value, suffix, label}[]` | `{value:12, suffix:"+", label:"Years of craft"}` | Animated counters |
| `services` | `{name, category, duration, price, description}[]` | 10–12 entries; categories: Hair, Color, Spa, Nails, Treatments | Home grid, services, pricing, booking select, marquee |
| `testimonials` | `{name, service, rating, text, avatar}[]` | 6 entries | Testimonials page, home teaser |
| `team` | `{name, role, photo}[]` | 4 entries | About page team strip |
| `gallery` | `{src, alt, category}[]` | 10–12 entries; categories: Hair, Color, Spa, Nails, Interior | Gallery page, home strip |
| `images.hero` | string[3] | w=1600 Pexels URLs | Home floating cards |
| `images.about` | string[2] | w=1600 Pexels URLs | Home intro + about page |
| `images.booking` | string | w=1600 URL | Booking page side panel |
| `images.contactSide` | string | w=1600 URL | Contact page side image |
| `seo.description` / `seo.keywords` | string | — | `<meta>` tags on every page |

## Changing images

All images are hotlinked from the Pexels CDN using this pattern:

```
https://images.pexels.com/photos/{PHOTO_ID}/pexels-photo-{PHOTO_ID}.jpeg?auto=compress&cs=tinysrgb&w={WIDTH}
```

1. Find a photo on [pexels.com](https://www.pexels.com) and copy its numeric ID from the URL.
2. Build the CDN URL with the pattern above (`w=1600` for hero/large, `w=1000` for
   cards/gallery, `w=200` for avatars).
3. Paste it into the right slot in `site-config.js`.
4. Verify it loads (open the URL in a browser — it should return the image, HTTP 200).

You can also swap in self-hosted images — just drop files into `assets/img/` and use
relative paths instead. Every `<img>` already carries `alt`, `loading="lazy"`, and
fixed dimensions to prevent layout shift.

## Deployment

**GitHub Pages**
1. Push this folder to a GitHub repository.
2. Repo → **Settings → Pages → Build and deployment**.
3. Source: **Deploy from a branch** → Branch: **main**, folder: **/ (root)** → Save.
4. Your site goes live at `https://<user>.github.io/<repo>/` within a minute.

**Netlify**: drag-and-drop the folder onto [app.netlify.com/drop](https://app.netlify.com/drop),
or import the Git repository (no build command needed; publish directory = root).

**Vercel**: `vercel` CLI in the folder, or import the repo — framework preset "Other",
no build command, output directory = root.

Any static host (Cloudflare Pages, S3, nginx…) works the same way: upload the folder.

## Image credits (Pexels)

All photography via [Pexels](https://www.pexels.com) (free to use). Verified photo IDs
used in the demo config:

- Hair & styling: 3993442, 3993447, 3993449, 10593034, 10028673, 3065171
- Color: 3993314
- Spa & wellness: 3865676, 3998011
- Nails: 939836, 704815, 887352
- Interiors: 7750099, 7750124, 7195801, 4974566, 853427
- Portraits (team/avatars): 733872, 2379004, 1239291, 614810, 415829, 1130626,
  1181686, 1065084, 1036623, 2709388, 774909

## Tech notes

- Libraries via CDN: GSAP 3.12.5 + ScrollTrigger (cdnjs), Lenis 1.1.18 (jsDelivr).
- Fonts: Unbounded, Manrope, Cormorant Garamond (single Google Fonts request).
- Honors `prefers-reduced-motion`: preloader skipped, smooth scroll/cursor/animation disabled.
- Accessibility: guarded JS (no console errors), keyboard-closable menu/lightbox,
  descriptive alts, semantic landmarks.
