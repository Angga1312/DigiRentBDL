# DigiRent.bdl — static website

A responsive, hand-built static website for a camera rental microbusiness in Kedaton, Bandar Lampung. Built with semantic HTML, custom CSS and vanilla JavaScript. Tailwind is intentionally not required at runtime, so the design stays quick and consistent without a CDN dependency.

## Run locally
- Open `index.html` directly, or preferably run a local server:
  - Python: `python -m http.server 8000`
  - Then visit `http://localhost:8000`
- Deploy the folder to GitHub Pages, Cloudflare Pages, Netlify, or another static host.

## Before launch
1. Open `js/config.js` and set `gaMeasurementId` to the real GA4 ID (`G-XXXXXXXXXX`). The provided academic reference `20262-DIGMAREG-KLKx` is **not** a valid GA4 Measurement ID.
2. Replace placeholder camera and gallery images in `assets/images/` with real product/customer images you have permission to publish. Current images use remote Unsplash image URLs.
3. Confirm all prices, availability, rental terms, pickup instructions, and accessory package prices with the business owner. Fujifilm 24h/48h rates are explicitly marked as estimates.
4. In GA4 Admin → Property access management, add `muji@feb.unila.ac.id` with Viewer access (requires property administrator).
5. Test event delivery using GA4 Realtime / DebugView and verify WhatsApp links on a mobile device.

## Pages
1. Home — `index.html`
2. Camera details — `pages/catalog.html`
3. Cost calculator — `pages/calculator.html`
4. Price list & packages — `pages/pricing.html`
5. Terms & safety — `pages/terms.html`
6. Booking & pickup guide — `pages/booking.html`
7. About — `pages/about.html`
8. Gallery — `pages/gallery.html`
9. Camera literacy & FAQ — `pages/learn.html`

## Tracking
- `click_wa_booking`: booking CTA click with camera/duration/date
- `use_calculator`: successful cost calculation
- `view_tnc_page`: terms page view
- `download_order_format`: copy order template (action_type=copy)
- Additional events: `click_wa_contact`, `view_camera_detail`, `gallery_filter`, `faq_open`
- GA4 data collection only works after a real Measurement ID is configured.
