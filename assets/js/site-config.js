/* ============================================================
   SITE CONFIG — the ONLY file you edit to re-skin this template.
   Every business fact (name, color, contacts, services, images…)
   lives here. Pages render exclusively from window.SITE_CONFIG.
   ============================================================ */

/* Pexels CDN helper: every ID below was verified HTTP 200.
   Pattern: https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg */
(function () {
  var px = function (id, w) {
    return (
      "https://images.pexels.com/photos/" +
      id +
      "/pexels-photo-" +
      id +
      ".jpeg?auto=compress&cs=tinysrgb&w=" +
      (w || 1000)
    );
  };

  window.SITE_CONFIG = {
    /* ---- Identity ------------------------------------------------ */
    businessName: "LUMIÈRE",
    businessType: "Hair Salon & Beauty Studio",
    tagline: "Where artistry becomes ritual",
    established: 2012,
    brandColor: "#B76E79", // rose gold — change this ONE value to re-skin

    /* ---- Contact -------------------------------------------------- */
    email: "hello@lumierestudio.com",
    phoneDisplay: "+1 (212) 555-0148",
    phoneLink: "tel:+12125550148",
    whatsappLink: "https://wa.me/12125550148",
    addressLines: ["128 Bloom Street, SoHo", "New York, NY 10012"],
    mapsEmbedUrl:
      "https://www.google.com/maps?q=SoHo,+New+York,+NY&output=embed",

    /* External booking link. Leave "" to route all Book CTAs to the
       built-in booking.html page + form. */
    bookingUrl: "",

    /* ---- Hours & social ("" = hidden) ----------------------------- */
    hours: [
      { days: "Monday — Friday", time: "9:00 AM — 8:00 PM" },
      { days: "Saturday", time: "9:00 AM — 6:00 PM" },
      { days: "Sunday", time: "Closed" },
    ],
    social: {
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
      tiktok: "https://tiktok.com",
      pinterest: "",
    },

    /* ---- Stats (counters animate; suffix preserved) --------------- */
    stats: [
      { value: 12, suffix: "+", label: "Years of craft" },
      { value: 4800, suffix: "+", label: "Happy clients" },
      { value: 15, suffix: "", label: "Expert artists" },
      { value: 40, suffix: "+", label: "Signature services" },
    ],

    /* ---- Services (categories: Hair, Color, Spa, Nails, Treatments) */
    services: [
      {
        name: "Precision Haircut",
        category: "Hair",
        duration: "60 min",
        price: "$85",
        description:
          "A tailored cut sculpted to your bone structure, finished with a signature blow-dry and styling lesson.",
      },
      {
        name: "Signature Blowout",
        category: "Hair",
        duration: "45 min",
        price: "$65",
        description:
          "Weightless volume and mirror shine — a ritual wash, scalp massage, and a finish that lasts for days.",
      },
      {
        name: "Bridal & Event Styling",
        category: "Hair",
        duration: "90 min",
        price: "$150",
        description:
          "Editorial up-dos and soft waves designed around your dress, your light, and your moment.",
      },
      {
        name: "Full Balayage",
        category: "Color",
        duration: "180 min",
        price: "$220",
        description:
          "Hand-painted dimension that grows out gracefully — sun-kissed, seamless, and entirely bespoke.",
      },
      {
        name: "Gloss & Toner",
        category: "Color",
        duration: "60 min",
        price: "$95",
        description:
          "A translucent veil of color that refreshes tone, seals the cuticle, and restores glass-like shine.",
      },
      {
        name: "Root Retouch",
        category: "Color",
        duration: "75 min",
        price: "$110",
        description:
          "Flawless, feathered coverage matched precisely to your existing shade — no lines, no compromise.",
      },
      {
        name: "Aromatherapy Head Spa",
        category: "Spa",
        duration: "60 min",
        price: "$120",
        description:
          "Warm oil massage, steam, and pressure-point therapy that melts tension and awakens the scalp.",
      },
      {
        name: "Restorative Facial",
        category: "Spa",
        duration: "75 min",
        price: "$140",
        description:
          "Deep cleansing, lymphatic massage, and a bespoke mask — skin left luminous, calm, and renewed.",
      },
      {
        name: "Luxury Gel Manicure",
        category: "Nails",
        duration: "60 min",
        price: "$70",
        description:
          "Precision shaping, cuticle care, and a chip-proof gel finish in the shade of the season.",
      },
      {
        name: "Spa Pedicure",
        category: "Nails",
        duration: "75 min",
        price: "$85",
        description:
          "A warm soak, exfoliation, and hot-towel massage finished with immaculate polish.",
      },
      {
        name: "Keratin Smoothing Treatment",
        category: "Treatments",
        duration: "150 min",
        price: "$260",
        description:
          "Frizz erased for months. Hair becomes silkier, faster to style, and endlessly touchable.",
      },
      {
        name: "Bond Repair Ritual",
        category: "Treatments",
        duration: "45 min",
        price: "$75",
        description:
          "An intensive in-salon treatment that rebuilds broken bonds from the inside out.",
      },
    ],

    /* ---- Testimonials --------------------------------------------- */
    testimonials: [
      {
        name: "Amara Chen",
        service: "Full Balayage",
        rating: 5,
        text: "I have never loved my hair more. The balayage grows out so softly that months later it still looks intentional. This place is pure artistry.",
        avatar: px(415829, 200),
      },
      {
        name: "Sofia Marchetti",
        service: "Bridal & Event Styling",
        rating: 5,
        text: "They styled my entire bridal party and every single look photographed like a magazine editorial. Calm, precise, and genuinely joyful to be around.",
        avatar: px(1130626, 200),
      },
      {
        name: "Danielle Okafor",
        service: "Keratin Smoothing Treatment",
        rating: 5,
        text: "My morning routine went from forty minutes to five. The keratin treatment was worth every penny — my hair has never felt this healthy.",
        avatar: px(1181686, 200),
      },
      {
        name: "Priya Raman",
        service: "Aromatherapy Head Spa",
        rating: 5,
        text: "The head spa is the most relaxing hour in this city. I floated out. Book it, thank me later.",
        avatar: px(1065084, 200),
      },
      {
        name: "Grace Lindqvist",
        service: "Luxury Gel Manicure",
        rating: 5,
        text: "Immaculate attention to detail. Three weeks later and not a single chip. The studio itself is gorgeous — all white and rose gold.",
        avatar: px(1036623, 200),
      },
      {
        name: "Isabella Moreau",
        service: "Precision Haircut",
        rating: 5,
        text: "Finally, a stylist who listens. The cut moves beautifully and somehow looks even better as it grows. I will never go anywhere else.",
        avatar: px(2709388, 200),
      },
    ],

    /* ---- Team ------------------------------------------------------ */
    team: [
      {
        name: "Élodie Laurent",
        role: "Founder & Creative Director",
        photo: px(733872, 1000),
      },
      {
        name: "Marcus Bennett",
        role: "Master Colorist",
        photo: px(2379004, 1000),
      },
      {
        name: "Yuki Tanaka",
        role: "Senior Stylist",
        photo: px(1239291, 1000),
      },
      {
        name: "Adrian Cole",
        role: "Spa & Wellness Lead",
        photo: px(614810, 1000),
      },
    ],

    /* ---- Gallery (categories: Hair, Color, Spa, Nails, Interior) --- */
    gallery: [
      {
        src: px(10593034, 1000),
        alt: "Close-up of a stylist trimming a client's hair with precision scissors",
        category: "Hair",
      },
      {
        src: px(3993447, 1000),
        alt: "Hairdresser cutting hair with scissors and comb in a bright studio",
        category: "Hair",
      },
      {
        src: px(3993449, 1000),
        alt: "Client enjoying a relaxing hair wash at a salon backwash basin",
        category: "Hair",
      },
      {
        src: px(3993314, 1000),
        alt: "Colorist mixing a bespoke hair color formula in a bowl",
        category: "Color",
      },
      {
        src: px(10028673, 1000),
        alt: "Stylist blow-drying a client's hair smooth with a round brush",
        category: "Hair",
      },
      {
        src: px(3865676, 1000),
        alt: "Spa arrangement of smooth stones, towels, and candles",
        category: "Spa",
      },
      {
        src: px(3998011, 1000),
        alt: "Client receiving a deeply relaxing back massage at the spa",
        category: "Spa",
      },
      {
        src: px(939836, 1000),
        alt: "Fresh pastel-pink manicure on a client's hand",
        category: "Nails",
      },
      {
        src: px(704815, 1000),
        alt: "Finished emerald-green gel manicure with a botanical accent nail",
        category: "Nails",
      },
      {
        src: px(887352, 1000),
        alt: "Close-up of a flawless fresh gel manicure",
        category: "Nails",
      },
      {
        src: px(7195801, 1000),
        alt: "Elegant salon interior with backwash chairs and glowing mirrors",
        category: "Interior",
      },
      {
        src: px(4974566, 1000),
        alt: "Chic modern beauty salon interior with styling stations",
        category: "Interior",
      },
    ],

    /* ---- Named image slots (large = w1600) ------------------------- */
    images: {
      hero: [
        px(3993442, 1600), // stylist cutting a woman's hair
        px(3993314, 1600), // colorist mixing color
        px(774909, 1600), // beauty portrait, makeup artistry
      ],
      about: [
        px(7750124, 1600), // bright salon interior, round mirrors
        px(3065171, 1600), // stylist shaping a curly hairstyle
      ],
      booking: px(7750099, 1600), // sleek modern salon interior
      contactSide: px(853427, 1600), // row of black salon chairs
    },

    /* ---- SEO -------------------------------------------------------- */
    seo: {
      description:
        "LUMIÈRE is a hair salon & beauty studio in SoHo, New York — precision cuts, hand-painted color, head spa rituals, and luxury nail care. Book your chair.",
      keywords:
        "hair salon, balayage, haircut, head spa, gel manicure, keratin treatment, SoHo, New York, beauty studio",
    },
  };
})();

/* --- admin override layer (added for admin.html): applies saved overrides --- */
(function(){try{var o=JSON.parse(localStorage.getItem('salonConfigOverride')||'null');if(!o)return;function m(t,s){for(var k in s){if(Object.prototype.hasOwnProperty.call(s,k)){var v=s[k];if(v&&typeof v==='object'&&!Array.isArray(v)&&t[k]&&typeof t[k]==='object'&&!Array.isArray(t[k])){m(t[k],v);}else{t[k]=v;}}}}m(window.SITE_CONFIG,o);}catch(e){console.warn('[admin] override ignored:',e);}})();
