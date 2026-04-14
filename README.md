# Siba E-Motion

Static export hardening and interactive enhancement layer for the Siba E-Motion EV dealership site.

## Repository Structure

```
.
├── media/                          # Mirrored asset host (fonts, video, product images)
├── site/                           # Mirrored site pages
│   ├── index.html                  # English homepage
│   ├── tr/index.html               # Turkish homepage
│   ├── assets/
│   │   ├── model-switcher.css      # Premium model switcher styles
│   │   ├── model-switcher.js       # Progressive enhancement mount
│   │   ├── model-switcher-data.json# Manifest-driven switcher content
│   │   └── hero-reactive.js        # Canvas overlay — pointer-reactive hero video
│   └── <brand>/<model>.html        # Detail pages per vehicle
└── README.md
```

## Enhancements

The site is a hardened static export from Framer. Rather than modifying generated bundles, custom behavior is mounted as an isolated enhancement layer that degrades gracefully if JavaScript is unavailable.

### Model Switcher

A manifest-driven brand/model switcher replaces the compiled tab component inside `section#pricing`.

- Mount point: `section#pricing` — original markup stays as no-JS fallback
- All injected nodes use `data-siba-*` attributes, not compiler-generated class names
- Content driven by `site/assets/model-switcher-data.json`
- Liquid-glass tab rail with geometry-accurate active indicator
- Magnetic pointer response on inactive brand tabs
- Depth-based card transitions between brands
- Pointer parallax on card media
- Mobile scroll-snap carousel with reduced-motion fallbacks

### Hero Reactive Overlay

A Canvas 2D layer sits above the hero video and responds to pointer input.

- Radial spotlight tracks the pointer with eased interpolation
- Expanding ring ripples fire on click/tap
- `mix-blend-mode: screen` — composites cleanly over any video content
- Trail fade via `destination-out` composite operation
- DPR-aware, resize-aware, `prefers-reduced-motion` respected
- Mounts with a retry loop for late-rendered video elements

## Local Preview

Serve from the repository root so both `site/` and `media/` resolve correctly:

```bash
python3 -m http.server 8124
```

Then open:

- `http://127.0.0.1:8124/site/index.html`
- `http://127.0.0.1:8124/site/tr/index.html`

## Known Constraints

- The Turkish homepage is partially localized in the source export.
- Remote CDN assets (fonts, hero video, product images) are preserved as live upstream URLs — they are runtime dependencies of the Framer export and were not mirrored locally.
- Some detail pages contain minor naming inconsistencies inherited from the source export (e.g. Ridarra route naming).
- Map embeds require a live browser context to verify.
