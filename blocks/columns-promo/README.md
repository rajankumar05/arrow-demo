# Columns Promo

A two-column promo: an image on one side and a heading, paragraph, and call-to-action on the other. Stacks vertically on mobile. Adapted from the Block Collection `columns` block.

## Authoring

Build a `columns-promo` block table with **one row** and two cells:

| columns-promo |                                                        |
| ------------- | ------------------------------------------------------ |
| ![Careers]    | ## Careers at Arrow<br>Supporting copy.<br>[Explore careers](/path) |

- **Cell 1** — the promo image.
- **Cell 2** — heading, paragraph, and a CTA link.

Put the image cell first for image-left, or second for image-right.

## Content model

- Single row, two cells
- Image-only cell → `columns-promo-img-col`

## Notes

CSS is structural only (two-column layout, stacking). Brand styling comes from the site design system.
