# Frontend Web Performance

## Core Web Vitals

- **LCP (Largest Contentful Paint):** < 2.5s. Measures loading performance. Optimize: server-side rendering, preload hero images, eliminate render-blocking resources, use CDN.
- **FID (First Input Delay) / INP (Interaction to Next Paint):** < 200ms. Measures interactivity. Optimize: code splitting, long task splitting, avoid heavy JS on main thread, use `requestIdleCallback`.
- **CLS (Cumulative Layout Shift):** < 0.1. Measures visual stability. Optimize: explicit dimensions on images/embeds, avoid injecting content above existing content, use `aspect-ratio` CSS, reserve space for ads/dynamic content.

---

## Lighthouse & PageSpeed Insights

- Run Lighthouse in CI via Lighthouse CI (`lhci`): `lhci autorun`
- Audited categories: Performance, Accessibility, Best Practices, SEO, PWA
- Key diagnostics: Total Blocking Time (TBT), Time to Interactive (TTI), Speed Index
- Use `lighthouse-viewer` package to programmatically parse reports
- PageSpeed Insights uses CrUX (Chrome User Experience Report) for field data + Lighthouse for lab data

---

## Bundle Optimization

- **Code splitting:** React.lazy + Suspense, dynamic `import()`
- **Tree shaking:** Use ES module imports, sideEffects: false in package.json
- **Manual chunks:** Configure in bundler (webpack `splitChunks`, Vite `build.rollupOptions.output.manualChunks`)
- **Module/nomodule pattern:** Serve modern ES modules to modern browsers, legacy bundle to older ones
- **Bundle analysis:** `vite-bundle-visualizer`, `webpack-bundle-analyzer`, `source-map-explorer`

```js
// webpack splitChunks example
splitChunks: {
  cacheGroups: {
    vendor: { test: /[\\/]node_modules[\\/]/, name: 'vendor', chunks: 'all' },
  },
}
```

---

## Image Optimization

- **Lazy loading:** `<img loading="lazy" />` natively supported in modern browsers
- **Formats:** WebP (lossy ~25-35% smaller than JPEG), AVIF (up to 50% smaller than WebP)
- **Responsive images:** `srcset` with `w` descriptors and `sizes` attribute
- **Adaptive loading:** Serve different resolutions based on viewport
- **CDN image transformations:** Use Imgix, Cloudinary, imgproxy for on-the-fly resizing
- **Blur-up placeholders:** Low-quality image placeholders (LQIP) or dominant color backgrounds

```html
<img
  src="photo-800.webp"
  srcset="photo-400.webp 400w, photo-800.webp 800w, photo-1200.webp 1200w"
  sizes="(max-width: 600px) 100vw, 800px"
  loading="lazy"
  alt="Description"
/>
```

---

## Font Optimization

- Use `font-display: swap` or `font-display: optional` to prevent invisible text
- Subset fonts to include only needed characters (use `glyphhanger` or `subfont`)
- Preload critical fonts: `<link rel="preload" as="font" crossorigin />`
- Self-host fonts instead of using Google Fonts CDN (fewer DNS lookups)
- Use variable fonts (single file, multiple weights) to reduce total font file count
- Use `size-adjust` in `@font-face` to prevent CLS from font swap

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153;
}
```

---

## JavaScript Optimization

- **Long tasks:** Tasks > 50ms block main thread. Split with `setTimeout()` or `scheduler.yield()`
- **Main thread:** Minimize time by deferring non-critical JS (`<script defer>`)
- **Web Workers:** Offload heavy computation (parsing, image processing, data transformation)
- **Idle scheduling:** Use `requestIdleCallback` for non-urgent work
- **Avoid:** document.write(), inline scripts blocking paint, excessive DOM size (> 1500 nodes)
- **Third-party scripts:** Load async/defer, use `rel="preconnect"` for origins, sandbox iframes

---

## CSS Optimization

- **Critical CSS:** Inline above-the-fold styles, load remaining asynchronously via `loadCSS`
- **Unused CSS removal:** Use PurgeCSS (Tailwind built-in), `uncss`
- **CSS containment:** Use `contain: layout style paint` to isolate subtrees
- **Avoid `@import`:** It blocks parallel downloads; use `<link>` instead
- **Minimize specificity:** Avoid !important, deeply nested selectors
- `content-visibility: auto` — skips rendering of off-screen elements

---

## Resource Hints

- `<link rel="preload" as="image">` — critical resources that must load early
- `<link rel="prefetch">` — resources for the next navigation (low priority)
- `<link rel="preconnect">` — establish early connection to cross-origin server
- `<link rel="dns-prefetch">` — resolve DNS early for cross-origin domains
- `<link rel="modulepreload">` — preload ES modules with their dependency graph

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://analytics.example.com" />
```

---

## CDN & Caching

- **CDN:** Edge caching for static assets (Cloudflare, Fastly, AWS CloudFront, Vercel Edge)
- **Cache-Control:** `public, max-age=31536000, immutable` for fingerprinted assets
- **Cache-Control:** `no-cache` for HTML (validate with ETag/Last-Modified)
- **Service worker:** Cache-first for assets, network-first for API responses (Workbox library)
- **Stale-while-revalidate:** Serve cached content, update in background

---

## RUM & Synthetic Monitoring

- **Web Vitals library:** `web-vitals` npm package — captures CLS, LCP, FID/INP, FCP, TTFB
- **RUM providers:** Datadog RUM, New Relic Browser, Sentry Performance, OpenTelemetry
- **Synthetic monitoring:** Lighthouse CI, Sitespeed.io, Playwright with performance traces
- **Key RUM metrics:** Page load time by percentile, JS error rate, Apdex score
- **CrUX API:** Query field performance data per origin/URL via `chrome-ux-report` in BigQuery or REST API
- **Performance Observer API:** Programmatic access to performance entries in browser

```js
import { onCLS, onLCP, onFID } from 'web-vitals';

onCLS(console.log);
onLCP(console.log);
onFID(console.log);
```
