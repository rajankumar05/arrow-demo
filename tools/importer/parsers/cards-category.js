/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-category. Base: cards.
 * Source: https://www.arrow.com/ (#container-472bd4b54d — the tile grid; the
 * section heading/paragraph "Guidance for every endeavor" live in a SIBLING
 * container and stay as default content, so they are intentionally not here.)
 * Generated: 2026-09-23
 *
 * Source model: a responsive grid of 10 category tiles. Each tile is a
 * `.container-simple` holding two anchors that share the category href — one
 * wrapping the tile <picture><img> and one wrapping a <span> label. The two
 * anchors sit in separate <p> parents, so html2md's inline-merge pass cannot
 * fold them together. structure.json reports no invalid nesting for this grid.
 *
 * Output model (library-description.txt): 2-column cards table, one row per
 * tile — cell 1 = image, cell 2 = linked label. Keeping the image inside its
 * anchor lets the DM transformer (afterTransform) turn the Scene7 <img> into a
 * carrier anchor that still links to the category page.
 */
export default function parse(element, { document }) {
  // Iterate the stable per-tile wrapper. Fall back to any element that holds
  // both an image and a labelled link if the class is absent on a variant DOM.
  let tiles = Array.from(element.querySelectorAll(':scope .container-simple'))
    .filter((t) => t.querySelector('img, picture') && t.querySelector('a'));
  if (!tiles.length) {
    // Fallback: group by the label anchors and walk to their nearest wrapper.
    const labels = Array.from(element.querySelectorAll('a')).filter((a) => a.querySelector('span') && a.textContent.trim());
    const seen = new Set();
    tiles = labels
      .map((a) => a.closest('div'))
      .filter((t) => t && !seen.has(t) && seen.add(t));
  }

  // De-duplicate responsive copies by the tile link (some grids ship hidden
  // breakpoint variants of the same tile).
  const seenHref = new Set();
  const cells = [];

  tiles.forEach((tile) => {
    const anchors = Array.from(tile.querySelectorAll('a'));
    const imageAnchor = anchors.find((a) => a.querySelector('img, picture'));
    const labelAnchor = anchors.find((a) => a.querySelector('span') && a.textContent.trim())
      || anchors.find((a) => a.textContent.trim() && !a.querySelector('img, picture'));

    const key = (labelAnchor && labelAnchor.getAttribute('href'))
      || (imageAnchor && imageAnchor.getAttribute('href'))
      || tile.textContent.trim();
    if (seenHref.has(key)) return;
    seenHref.add(key);

    // Cell 1: the tile image, kept inside its linking anchor when present so the
    // DM transformer preserves both the image and its category link.
    const imageCell = imageAnchor || tile.querySelector('picture') || tile.querySelector('img') || '';

    // Cell 2: the linked category label.
    const labelCell = labelAnchor || '';

    if (imageCell || labelCell) cells.push([imageCell, labelCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
