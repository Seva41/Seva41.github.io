# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio site for Sebastián Dinator, deployed to [sebadinator.com](https://sebadinator.com) via GitHub Pages. It's a single-page Jekyll site — no blog posts, no collections — just a bilingual (ES/EN) portfolio with tabbed views.

## Local development

```bash
bundle install          # install dependencies (github-pages gem)
bundle exec jekyll serve --livereload   # serve at http://localhost:4000
bundle exec jekyll build                # build to _site/
```

Deployment is automatic: push to `main` triggers the GitHub Actions workflow (`.github/workflows/github-pages.yml`) which builds and deploys to GitHub Pages.

## Architecture

**Tabbed views** — `index.html` holds six views (`<section class="view">`): `inicio`, `syncdisp`, `experiencia`, `proyectos`, `sobre-mi`, `contacto`. The URL hash picks the view: the inline script in `_layouts/default.html` sets `data-view` on `<html>` before paint (with aliases for old anchors like `#habilidades`), CSS shows only that view, and `assets/js/main.js` switches on `hashchange` using the View Transitions API (Back works; reduced motion skips the transition). Sub-anchors (`#habilidades`, `#reconocimientos`) open their view and scroll to the block. Without JS every view is shown stacked. `navbar.html` is the sticky tab bar with a sliding indicator.

**View photo** — most views are two columns: text on the left and a sticky photo on the right (`.view-pic`, `view-transition-name: foto`, so it crossfades between views). Photos are declared once in `_data/fotos.yml` (bilingual alt and caption; `ui: true` for interface screenshots shown whole on a dark field) and rendered by `_includes/figure.html`. Inside a view, a text block points at its photo with `data-stage-for="<id>"` and the photo switches as you scroll. Below 1000px the photo column is hidden and each block shows its own inline copy (`class="pic-inline"`). `experiencia` is full width with no photo.

**Bilingual system** — Language (ES/EN) is a class on `<html>` persisted in `localStorage` (`idiomaSeleccionado`). Text is written twice as `.es` / `.en` spans; alt text and aria-labels use `data-alt-es/en` and `data-label-es/en`, swapped by `main.js`.

**Contact card** — the day picker in `contact.html` (`.sd`, marked `data-ui`) copies SyncDisp's light theme on purpose (a white card on the dark page): its colour tokens, Bricolage Grotesque, 6–8px radii, borders and logo, with "Powered by SyncDisp". It shows two weeks of weekdays, cycles off → can → maybe, and builds a `mailto:` — nothing is stored. Keep it in sync with SyncDisp's look rather than with the rest of the site.

**Key files:**
- `_layouts/default.html` — head (Google Fonts: Schibsted Grotesk for the site, Bricolage Grotesque for the SyncDisp card), language and view init, footer
- `_includes/` — one file per view (`hero.html` is Inicio; `about.html` + `skills.html` + `recognition.html` form Sobre mí), plus `navbar.html` and `figure.html`
- `style.css` — all styles; tokens on `:root` (night `--bg #0a0d14`, cornflower `--accent #5a9bfc`), pill buttons, no shadows or gradients
- `assets/js/main.js` — views and tab indicator, language, photo switching, staggered reveals (`data-reveal`, hidden only under `html.js` and without reduced motion), demo videos, the contact picker, and the Konami easter egg
- `assets/img/` — `perfil-escenario.jpg`, `syncdisp-*.jpg` (real screenshots of a sample event), `mini-*.jpg` (Inicio thumbnails), `hackingctf-2024.jpg`, `campus-uai-vina.jpg` (Wikimedia Commons, CC BY-SA 4.0 — keep the credit in the footer); `assets/video/syncdisp-demo.mp4`

## Constraints

- The `github-pages` gem pins Jekyll to 3.x and restricts which plugins are allowed. Only [github-pages whitelisted plugins](https://pages.github.com/versions/) can be used.
- No SCSS pipeline — use plain CSS in `style.css`.
- No JS dependencies; `main.js` is plain browser JS.
- Cache-busting is manual: `?v=` query params on CSS/JS references in `_layouts/default.html`. Bump these when changing assets.
- A new view needs its id in three places: the `vistas` list in the layout's inline script, `VISTAS` in `main.js`, and the `html.js[data-view=…]` selector list in `style.css`.
- Don't set `font-variant-numeric: tabular-nums` globally: in Schibsted Grotesk it also spaces out punctuation. Use it only on dates and numbers.
