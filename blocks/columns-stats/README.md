# Columns Stats

A row of statistic counters — each a large number with a caption below. No images. Adapted from the Block Collection `columns` block.

## Authoring

Build a `columns-stats` block table with **one row** and one cell per statistic:

| columns-stats |          |          |
| ------------- | -------- | -------- |
| ## 22k+<br>Employees Worldwide | ## 148<br>Rank on FORTUNE 500 | ## 26<br>Years on World's Most Admired |

- Each cell — a large number as a heading, plus a caption paragraph.

## Content model

- Single row, N cells
- Each cell → `columns-stats-item` (heading = number, paragraph = caption)

## Notes

Place inside a section with the `accent` style for the intended appearance. CSS is structural only.
