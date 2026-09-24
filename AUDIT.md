# mbfctracy.com — Audit Log (2026-08-05)

Lighthouse mobile scores: Performance 48, Best Practices 58, Accessibility 97, SEO 100 (technical only).

## Critical
1. **Hero image lazy-loaded** — the largest on-screen element (LCP) takes 15.9s to appear (target: under 2.5s). Theme applies `loading="lazy"` + no `fetchpriority="high"` to the banner image.
2. **No address, phone, or hours on the homepage.** Only present on /pages/contact-us. Kills local-search trust signals.
3. **No LocalBusiness structured data.** Only generic Organization/WebSite JSON-LD. Google can't confirm store address/hours from the site.

## High
4. **"Consignment" missing from homepage title tag** — title is "MBFC Tracy | Women's Fashion Boutique – My Best Friend's Closet Tracy" (brand twice, key search term absent). Site ranked last on page 1 for "consignment shop Tracy CA"; Yelp dominates.
5. **Page weight 3.5 MB**; ~720 KB unused JavaScript.
6. **Duplicate Google tracking** — 4–5 separate gtag/GTM script loads (G-XGLJKX9FF5 twice, AW-10992078587 twice, GT-573JX39). Total blocking time 1,240 ms; time-to-interactive 20.9s.
7. **Consignment page (money page) has no address, hours, booking CTA, or email** — phone buried mid-paragraph; dense wall of policy text; no FAQ.
8. **Theme is Dawn v2.3.0** (current is ~v15) — missing years of performance/accessibility fixes.

## Medium
9. **Color contrast failures**: announcement bar text, "As Seen on TikTok" button, app-download button, collection "View all" buttons.
10. **Empty hero headline** — banner H1/heading slot has no text; page H1 is the header logo image.
11. **Shopify Forms app extension**: 239 KB loaded, almost entirely unused.
12. **og:image points to http:// (insecure) logo URL** — weak/broken social link previews.
13. **Third-party cookies** (Pinterest, Shop app) + deprecated Attribution Reporting API warning.
14. **Contact page**: no map, no email, no booking link.
15. **Thin content**: only 4 content pages total (consignment, contact, permanent jewelry, hat bar).

## Notes
- robots.txt contains Shopify-injected instructions aimed at AI agents (including a promo for shop.app skill). Ignored; FYI only.
- Assets pulled from live site → `assets/current-site/` (logo.webp, hero-1.jpg, hero-2.jpg, favicon-source.jpg).
- Field data (real-user Core Web Vitals): unavailable — site likely below traffic threshold.
