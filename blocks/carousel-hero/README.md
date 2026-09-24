# Carousel Hero

Full-bleed rotating hero banner. Each slide has a background image with an overlaid content panel (heading, paragraph, CTA). Numbered slide indicators and previous/next navigation buttons are generated automatically. Adapted from the Block Collection `carousel` block.

## Authoring

Build a `carousel-hero` block table. Each **row** is one slide with two cells:

| carousel-hero |            |
| ------------- | ---------- |
| ![slide 1 background] | ## Slide 1 heading<br>Slide 1 supporting copy<br>[CTA label](/path) |
| ![slide 2 background] | ## Slide 2 heading<br>Slide 2 supporting copy<br>[CTA label](/path) |

- **Cell 1** — the full-bleed background image for the slide.
- **Cell 2** — heading, paragraph, and a call-to-action link (rendered as a button).

A single-row table renders as a static hero (no indicators/navigation). Two or more rows enable rotation controls.

## Content model

- Row → slide
- Cell 1 → `carousel-hero-slide-image`
- Cell 2 → `carousel-hero-slide-content`

## Notes

CSS here is structural only (layout, overlay, controls). Brand color, typography, and spacing come from the site design system.
