# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site for Sebastián Dinator, deployed to [sebadinator.com](https://sebadinator.com) via GitHub Pages. It's a single-page Jekyll site — no blog posts, no collections — just a bilingual (ES/EN) portfolio with tabbed sections.

## Local development

```bash
bundle install          # install dependencies (github-pages gem)
bundle exec jekyll serve --livereload   # serve at http://localhost:4000
bundle exec jekyll build                # build to _site/
```

Deployment is automatic: push to `main` triggers the GitHub Actions workflow (`.github/workflows/github-pages.yml`) which builds and deploys to GitHub Pages.

## Architecture

**Single-page tabbed layout** — `index.html` loads `_layouts/default.html` which stitches together the `_includes/` sections (about, experience, skills, contact). All navigation is JS-driven; there are no separate pages.

**Bilingual system** — Language state (ES/EN) is managed by `assets/js/main.js` via a CSS class on `<html>` and persisted in `localStorage`. HTML elements carry both `data-lang-es` and `data-lang-en` attributes, or are wrapped in `.lang-es`/`.lang-en` elements that are shown/hidden by CSS.

**Tab persistence** — The active tab is also stored in `localStorage` and restored on page load.

**Key files:**
- `_layouts/default.html` — master HTML shell (head, navbar, footer, JS imports)
- `_includes/` — one file per section (about, experience, skills, contact, navbar, footer)
- `style.css` — all styles (no SCSS/preprocessor)
- `assets/js/main.js` — language switching, mobile menu, tab management
- `assets/js/experience-detail.js` — modal/detail expansion for experience items
- `assets/js/particles.js` — initializes the canvas particle background (uses `particles.min.js` from CDN)

## Constraints

- The `github-pages` gem pins Jekyll to 3.x and restricts which plugins are allowed. Only [github-pages whitelisted plugins](https://pages.github.com/versions/) can be used.
- No SCSS pipeline — use plain CSS in `style.css`.
- External JS dependency: `particles.min.js` v2.0.0 loaded from CDN; `assets/js/particles.js` is just a thin init wrapper around it.
- Cache-busting is manual: `?v=1.0` query params on CSS/JS references in `_layouts/default.html`. Bump these when changing assets.
