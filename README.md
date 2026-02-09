# Presentations

Reveal.js presentations running in a Podman container with a Fedora theme.

## Quick start

```bash
just start <presentation-folder>
# open http://localhost:8000
# press S for speaker notes
```

## Available commands

Check documentation how to open, create and start presentations with:

```bash
just
```

## Repository structure

```
├── index.html          # shared Fedora theme (all presentations use this)
├── assets/             # shared assets
├── server.js           # HTTP server (baked into container image)
├── Containerfile       # container image definition
├── justfile            # recipe file
└── <presentation>/     # one folder per presentation
    ├── slides.md       # slide content (Markdown)
    ├── slides.pdf      # generated PDF
    ├── materials/      # other materials for presentation
    └── assets/         # presentation-specific images
```

## Creating a new presentation

1. Create a folder with `slides.md` inside
2. Run `just start <folder-name>`
3. Edit `slides.md`, refresh browser

## Generating PDF

```bash
# terminal 1
just start <presentation-folder>

# terminal 2
just pdf <presentation-folder>
```

## Editing slides

Slides are written in Markdown. Each slide is separated by `---` on its own line.
Speaker notes start with `Note:` on its own line.

Custom CSS classes (`box`, `box-warn`, `three-cards`, `two-col`, …) are defined in `index.html`.
