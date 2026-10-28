# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site for Sebastián Dinator, deployed to [sebadinator.com](https://sebadinator.com) via GitHub Pages. It's a single-page Jekyll site — no blog posts, no collections — just a bilingual (ES/EN) one-page portfolio.

## Local development

```bash
bundle install          # install dependencies (github-pages gem)
bundle exec jekyll serve --livereload   # serve at http://localhost:4000
bundle exec jekyll build                # build to _site/
```

Deployment is automatic: push to `main` triggers the GitHub Actions workflow (`.github/workflows/github-pages.yml`) which builds and deploys to GitHub Pages.

## Architecture

**Single scrolling page** — `index.html` stitches the `_includes/` sections inside two `.split` blocks: a reading column on the left and a sticky "stage" on the right whose photo crossfades to match the section being read. Between the two splits, `experience.html` is a full-width band (a white "printed sheet" with scalloped edges on ink). Order: hero → SyncDisp → experience → labs & open source → recognition → about → skills → contact.

**Stage photos** — each picture is declared once in `_data/fotos.yml` (src, size, bilingual alt and caption; `ui: true` for interface screenshots, shown whole on an ink field) and rendered by `_includes/figure.html`. A column zone points at its photo with `data-stage-for="<id>"`; the stage copy carries `data-stage="<id>"`. Below 1000px the stage is hidden and each section shows its own inline copy (`class="pic-inline"`).

**Bilingual system** — Language (ES/EN) is a class on `<html>` set before paint by the inline script in the layout and persisted in `localStorage` (`idiomaSeleccionado`). Text is written twice as `.es` / `.en` spans; alt text and aria-labels use `data-alt-es/en` and `data-label-es/en`, swapped by `main.js`.

**Key files:**
- `_layouts/default.html` — head (Google Fonts: Besley 800 + Libre Franklin), language init, footer
- `_includes/` — one file per section, plus `navbar.html` (inside the hero) and `figure.html`
- `style.css` — all styles; colour and type tokens on `:root` (orange `--bg`, blue-black `--ink`), square corners, no shadows or gradients
- `assets/js/main.js` — language switch, stage crossfade, staggered reveals (`data-reveal`, hidden only under `html.js` and skipped with reduced motion), the SyncDisp demo video, the contact day picker (marks days like SyncDisp and builds a `mailto:`), and the Konami easter egg
- `assets/img/` — `perfil-escenario.jpg`, `perfil-mini.jpg`, `syncdisp-*.jpg` (real screenshots of a sample event), `hackingctf-2024.jpg`, `campus-uai-vina.jpg` (Wikimedia Commons, CC BY-SA 4.0 — keep the credit in the footer); `assets/video/syncdisp-demo.mp4`

## Constraints

- The `github-pages` gem pins Jekyll to 3.x and restricts which plugins are allowed. Only [github-pages whitelisted plugins](https://pages.github.com/versions/) can be used.
- No SCSS pipeline — use plain CSS in `style.css`.
- No JS dependencies; `main.js` is plain browser JS.
- Cache-busting is manual: `?v=` query params on CSS/JS references in `_layouts/default.html`. Bump these when changing assets.
- Every heading must stay at two lines or fewer in both languages at 390px, 768px and 1440px.
