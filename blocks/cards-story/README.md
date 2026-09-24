# Cards Story

A grid of text-rich editorial story cards — each with an image, a description, and a "Read more" link pinned to the bottom. Designed to sit on a dark section. Adapted from the Block Collection `cards` block.

## Authoring

Build a `cards-story` block table. Each **row** is one story card with two cells:

| cards-story |                                             |
| ----------- | ------------------------------------------- |
| ![.lumen]   | Short story description.<br>[Read more](/path) |
| ![SAM Car]  | Short story description.<br>[Read more](/path) |

- **Cell 1** — the story image.
- **Cell 2** — a description paragraph and a "Read more" link.

## Content model

- Row → story card
- Cell 1 → `cards-story-image`
- Cell 2 → `cards-story-body`

## Notes

Place inside a section with the `dark` style for the intended appearance. CSS here is structural only.
