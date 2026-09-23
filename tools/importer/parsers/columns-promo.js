/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-promo. Base: columns.
 * Source: https://www.arrow.com/ (#container-7c76fe84b1 — the careers-promo row
 * wrapper that holds BOTH the image column and the text column.)
 * Generated: 2026-09-23
 *
 * Source model: a two-column promo row. The wrapper has two grid columns:
 *   - an image column: <picture><img alt="careers at arrow"> (Arrow HQ), and
 *   - a text column (#container-de5f09d838): <h2>Careers at Arrow</h2>, a
 *     supporting <p>, and an "Explore careers" CTA anchor.
 * There is no default content in this section, so the whole promo is the block.
 * The matched element already contains both halves, so no reaching across
 * siblings is needed. structure.json reports the two columns as the repeating
 * unit (count 2), with no invalid nesting.
 *
 * Output model (README/contentModel): ONE row, TWO cells — cell 1 = image,
 * cell 2 = heading + paragraph + CTA (image-left).
 *
 * The image is a Scene7 asset; it is kept as <picture>/<img> so the DM
 * transformer (afterTransform) converts it to a carrier anchor.
 */
export default function parse(element, { document }) {
  // Cell 1: the promo image.
  const image = element.querySelector('picture') || element.querySelector('img') || '';

  // Cell 2: heading + description paragraph + CTA.
  const heading = element.querySelector('h1, h2, h3, h4');
  const cta = element.querySelector('a[href]');
  const paragraphs = Array.from(element.querySelectorAll('p'));
  // Description = a text paragraph that is not merely the CTA's wrapper and does
  // not itself contain an image.
  const description = paragraphs.find(
    (p) => p.textContent.trim()
      && !p.querySelector('img, picture')
      && (!cta || !p.contains(cta)),
  );

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  if (cta) {
    const p = document.createElement('p');
    p.appendChild(cta);
    contentCell.push(p);
  }

  // Empty-block guard.
  if (!image && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[image || '', contentCell.length ? contentCell : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
