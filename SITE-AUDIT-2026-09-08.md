# My Best Friend's Closet: site and clone audit

Audited September 8, 2026. Live site: https://my-best-friends-closet.jabach0811.chatgpt.site/ . Original: https://mbfctracy.com/ .

## Verdict

The new design is a stronger local boutique introduction, but it is not a full clone or an independent online store. It reproduces selected content and a product snapshot, then sends purchases to the original Shopify product pages. The largest problems are inaccurate consignment promises, incomplete/stale inventory, and missing shopping functions. Those matter more than another visual redesign.

Keep the warm cream/teal design, real shop photography, clear address and phone, and straightforward service pages. Complete the content and shopping experience around them.

## What was checked

- Opened the live homepage, shop, brands, consignment, jewelry, hats, product detail, and explicit 404 page. All eight HTML paths returned 200; the explicit 404 document being accessible is separate from the server's missing-route behavior.
- Compared the original homepage, published consignment policy, contact page, jewelry page, and hat page. Inventoried original navigation and collections.
- Compared 222 shop links with the live 211-product JSON snapshot. Live product data matched local product data at audit time.
- Read the original public catalog: 219 products returned with a 250-item limit; 34 handles were absent from our snapshot. This is a public-catalog comparison, not an administrative inventory export.
- Checked category filtering, empty search results, product breadcrumbs, product purchase destinations, and mobile layouts at 375px and a representative product at 320px.
- Checked six directly referenced local resources successfully. This is not a complete image-CDN crawl. One homepage product image failed in the browser.
- Compared served HTML with local HTML: the first differences were a hosting-injected script near the closing body, not evidence of an older homepage deployment.
- Checked robots.txt, sitemap.xml, and a nonexistent route. All returned 404; the nonexistent route displayed plain “Not Found,” bypassing the designed 404 page.

No orders, bookings, subscriptions, payments, or messages were submitted. No administrative Shopify access was used. No live changes were published. Screen-reader testing, real-user performance, every image, all product variants, and payment completion remain unverified. Older performance figures in AUDIT.md are not current measurements.

## Priority findings

### 1. High: consignment copy changes the original agreement

The new homepage and consign.html simplify the policy into promises the original does not make: automatic monthly payments, joint pricing at the appointment, and asking before donating unsold goods. The original instead requires a payout request and a minimum balance, allows pricing after drop-off, and makes donation dependent on the contract. Fees and other material conditions are also omitted.

Recommendation: restore an accurate plain-language overview and a complete, owner-approved policy section. Do not publish the current simplified promises as a faithful clone. Confirm current business terms rather than inventing friendlier ones. Source: https://mbfctracy.com/pages/consignment-made-easy .

### 2. High: catalog completeness and freshness

The shop advertises 222 pieces; only 211 have product detail records. Eleven links therefore reach an unavailable-product screen. Originally that screen asserted the item sold, although missing data does not prove a sale.

The original public catalog returned 219 products, including 34 missing from our snapshot. Examples: Bracha Reese Heart Hand Chain; RD Style Neave cardigan; RD Style Myrtle sweater; RD Style Formica cardigan; Wishlist striped tube knit jumpsuit. In a four-product spot check, three prices and availability values matched; the Reset By Jane Cocoa Pull On Pants endpoint returned 404 while our record still described it as available. One cached record is already marked sold out, but the shop cards do not use availability data.

Cause in source: scripts/refresh-products.mjs refreshes only handles already hard-coded in shop.html. It does not discover new catalog items or rebuild cards, prices, availability, or homepage features from the updated data. Consequently, running refresh alone cannot produce a complete clone.

Recommendation: use one catalog source for cards, details, counts, featured products, and stock state. Import all published products and collections, refresh consistently, show sold/unavailable states before the click, and record freshness. Preserve curated placement separately from inventory facts.

### 3. High: purchases still leave the new site

All 211 stored purchase URLs point to https://mbfctracy.com/products/... . product.js renders them as “Buy it online” or “Check the online store,” opening another tab. Sizes are informational list items, not selectable purchase options. There is no local cart, quantity control, checkout, or customer account flow.

These are deliberate dependencies, not isolated forgotten menu links. Replacing those URLs with local product links would create a loop, not a working checkout. The mbfctracy.com references in the shop/product document heads are connection hints, not customer navigation. Product images also depend on Shopify's CDN; that is an asset dependency rather than an old-site page link.

Recommendation: retain Shopify as the commerce system and connect the new storefront to real product options, stock, cart, and checkout. Alternatively, implement the accepted design as a Shopify theme so commerce stays together. A full functional clone means preserving shopping behavior and content, not merely copying HTML. The final implementation needs store access and a decision on the production domain; neither was established by this audit.

### 4. High: narrow-phone product overflow

The representative five-image product rendered a 418px-wide document in a 320px viewport. The thumbnail row's minimum width forced the gallery beyond the screen.

Local repair: constrain the gallery to available width and wrap thumbnail buttons. Retest: document width 305px within the 320px viewport, gallery approximately 265px. This change is not deployed.

### 5. Medium: broken category return path

Product breadcrumbs used shop.html#Tops%20%26%20Layers, but filtering reads the category query parameter. Clicking returned all 222 items with “Everything” selected. The secondary category link also opened the unfiltered shop.

Local repair: both use ?category=. Retest selected “Tops & Layers,” showed 55 products, and exposed the selected button with aria-pressed=true.

### 6. Medium: missing store sections and support paths

| Original content/function | New site status | Recommended treatment |
| --- | --- | --- |
| New arrivals and general shopping | Partial static snapshot | Complete catalog and truthful newest ordering |
| As Seen on TikTok | No equivalent collection | Restore collection membership and entry point |
| Best sellers | No equivalent collection | Restore from source, not guessed popularity |
| Sale | No equivalent collection or sale-price presentation | Carry sale membership and original/current prices |
| Seasonal/resort collections | Broad categories only | Restore meaningful collections without crowding the header |
| Cart, account, variant selection | Missing locally | Connect commerce functionality |
| Contact page | Address/hours in homepage section | Keep quick visit section; add a dedicated contact destination |
| Terms and refund policy links | Missing from new footer | Restore approved policy pages and footer links |
| Email signup | Replaced by an SMS instruction | Restore connected signup; verify any SMS service before promising enrollment |
| Mobile app download/live sales | App link absent; copy points to Instagram | Original describes app-based live sales; verify channel and restore correct destination |
| Jewelry service and pricing | Broadly reproduced | Pricing values matched the original service page |
| Hat bar | Main offerings reproduced | Add real service imagery and confirmed planning details |
| Luxury/Baby & Kids tiles | Original tiles lack links; new design offers alternatives | Do not reproduce dead tiles; preserve clear browse/visit paths |

Original contact information and listed hours matched the new site. Sources: original homepage, https://mbfctracy.com/pages/contact-us , https://mbfctracy.com/pages/permanent-jewelry-%E2%9C%A8 , https://mbfctracy.com/pages/hat-bar .

### 7. Medium: mobile shopping hierarchy

At 375px, the homepage displays a tall photo before its headline and primary actions. The hero action group starts about 878px from the top, below an 812px first screen. The header gives consignment the prominent button even when the visitor's intent may be shopping.

Recommendation: put the short headline and shopping action above or alongside a shorter mobile image. Keep a secondary consignment action. Aim for a clear shop action in the first screen, then featured products. Avoid adding more homepage copy.

### 8. Medium: navigation and service discovery

“Jewelry & Hats” points to jewelry.html on most pages but hats.html on the hat page. The same label has different destinations. Finding hats from the jewelry page requires reaching a later cross-link.

Recommendation: use one consistent “Experiences” destination with both options clearly visible, or separate links in a compact menu. On service pages, make “Call to book” the prominent contextual action. Label telephone actions as calls; “Book an Appointment” currently launches a phone handler rather than an online booking calendar.

### 9. Medium: accessibility and recovery

Good foundations: skip links on the main content pages, visible focus CSS, named search/sort fields, a live result count, semantic navigation, and reduced-motion CSS. Product thumbnail buttons have accessible names.

Gaps: filter selection was visual only; mobile header links measured about 36.6px tall; horizontal category chips hide their scrollbar; empty search has advice but no one-click reset; thumbnails do not announce selection. Product content requires JavaScript. Full contrast compliance was not measured, so no accessibility score is claimed.

Local repairs: aria-pressed on filter buttons, safe fallback for invalid sort values, and reduced-motion-aware back-to-top behavior. Next: enlarge tap areas where practical, make filter overflow discoverable, add “Clear filters,” announce the selected thumbnail, and provide a useful no-JavaScript product fallback. The UI/UX skill's accessibility and interaction checklist guided these checks.

### 10. Medium: image quality and content confidence

The homepage's Reformation Monette image failed to load in the browser. Test/reimport that source and add a graceful image fallback. Jewelry and hats reuse broad shop photos; close-ups of chains and actual hat-making would explain the experiences better. Product photos are cropped to a fixed portrait frame, which should be checked against accessories and wider images.

Claims needing business verification include the 24-hour hold promise, the SMS “arrivals” enrollment, automatic consignment payments, live-sale channel, and hard-coded social follower count. The Instagram strip is a hand-maintained set of posts, not a live feed. “New this season” is assigned to any card not explicitly marked consigned, not derived from a publication date.

### 11. Medium: discoverability and missing-route handling

robots.txt and sitemap.xml returned 404. This does not itself block indexing, but there is no explicit crawl guidance or discoverable sitemap at those standard paths. Product pages have a generic HTML head and rely on JavaScript for title/content; there is no product-specific canonical in the template. Missing routes return plain text rather than the designed recovery page.

Recommendation: generate a sitemap from actual published routes/products, provide deliberate robots guidance, route unknown paths to the branded 404 with a 404 status, and produce product-specific metadata. Define old-path redirects only as part of the actual domain migration. A nicer title or schema alone is not proof of improved search rankings.

## Local changes completed during this audit

- product.js: repaired both category links; changed missing-data messaging so it does not falsely assert a sale.
- shop.js: added selected-filter semantics and invalid-sort fallback.
- styles.css: fixed narrow-screen gallery overflow by allowing thumbnail wrapping and constraining gallery width.
- site.js: back-to-top respects reduced motion.
- scripts/audit-site.mjs: repeatable read-only source/link/catalog diagnostic.

Verification: JavaScript syntax checks passed. Browser verified the fixed category result (55 Tops & Layers items), aria-pressed state, invalid-sort fallback, and the repaired 320px gallery. Live filters also correctly produced 49 dresses and zero results for an unmatched search. These are targeted checks, not full regression certification. Existing workspace changes were preserved. No deployment was performed.

## Recommended next work, in order

1. Correct the consignment summary against the current approved policy and remove unsupported business promises.
2. Replace the fixed card list with a complete, synchronized catalog; repair missing products and broken imagery.
3. Connect shopping options, cart, and checkout to Shopify; restore collections, policies, signup, and app links needed for parity.
4. Improve the mobile hero, consistent experience navigation, contextual actions, and filter recovery.
5. Verify all routes, representative available/sold/unavailable products, keyboard flows, phone widths, cart/checkout handoff, redirects, and metadata before publishing.

The best next release is a content-correct, complete shopping experience in this design. Calling the current version a full clone would overstate what works.

## Eleven shop handles without a product record

```text
hope-sunshine-cotton-crochet-short-sleeve-shrug-cardigan-for-women-white-missy-one-size
lets-see-style-tg-solar-1-brown-pvd-standard-63-73-84-94-104
reset-by-jane-chelsea-silky-skirt-black
girl-dangerous-i-3-cowboys-tank-top
rd-style-tia-signature-second-skin-tank-black
sage-the-label-cape-cod-romper
elan-silky-lace-midi-skirt-black
reset-by-jane-jeannie-top-charcoal
blue-b-deep-v-neck-pintuck-denim-romper
pinch-solid-belted-maxi-dress-camel
girl-dangerous-tequila-time-graphic-crewneck
```
