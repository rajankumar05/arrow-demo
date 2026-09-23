# Cards Category

A responsive grid of image-dominant navigation tiles. Each tile is a photo with a short category label overlaid at the bottom, linking to a category page. Adapted from the Block Collection `cards` block.

## Authoring

Build a `cards-category` block table. Each **row** is one tile with two cells:

| cards-category |                          |
| -------------- | ------------------------ |
| ![Supply Chain] | [Supply Chain](/path)   |
| ![Cloud]        | [Cloud](/path)          |

- **Cell 1** — the tile image.
- **Cell 2** — a short linked category label.

## Content model

- Row → tile
- Cell 1 → `cards-category-image`
- Cell 2 → `cards-category-body` (label overlay)

## Notes

CSS is structural only (grid layout, image ratio, overlay). Brand color and typography come from the site design system.
