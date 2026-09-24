/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-stats. Base: columns.
 * Source: https://www.arrow.com/ (#container-dda2f3a3dd — the stats row; the
 * section heading "We connect people with technology…" and its CTA live in a
 * SIBLING container and stay as default content.)
 * Generated: 2026-09-23
 *
 * Source model: 3 stat items side by side. Each is a `.container-simple` holding
 * two paragraphs — a big number (`<p><b>22k+</b></p>`, styled h3) and a caption
 * (`<p>Employees Worldwide</p>`). No images, no links. structure.json reports
 * the 3 stat columns as the repeating unit, iterationSafe, no invalid nesting.
 *
 * Output model (library-description.txt / README): ONE row with 3 cells (one per
 * stat). Each cell = the number as a heading + the caption paragraph. Per the
 * columns model, additional stat columns (if a variant had more) would extend
 * the same single row, so the whole row is emitted as one `cells` entry.
 */
export default function parse(element, { document }) {
  // Each stat is a leaf container holding the number + caption. Iterate those.
  let stats = Array.from(element.querySelectorAll(':scope .container-simple'))
    .filter((c) => c.querySelectorAll('p').length >= 1 && !c.querySelector('.container-simple'));
  if (!stats.length) {
    // Fallback: any leaf div carrying a bold number.
    stats = Array.from(element.querySelectorAll('div'))
      .filter((c) => c.querySelector('b') && c.querySelectorAll('p').length >= 2 && !c.querySelector('div div p'));
  }

  const row = [];

  stats.forEach((stat) => {
    const paragraphs = Array.from(stat.querySelectorAll('p')).filter((p) => p.textContent.trim());
    if (!paragraphs.length) return;

    const cell = [];
    // First paragraph = the big number → promote to a heading so it renders large.
    const numberP = paragraphs[0];
    const heading = document.createElement('h3');
    heading.textContent = numberP.textContent.trim();
    cell.push(heading);

    // Remaining paragraphs = caption(s).
    paragraphs.slice(1).forEach((p) => {
      const caption = document.createElement('p');
      caption.textContent = p.textContent.trim();
      cell.push(caption);
    });

    row.push(cell);
  });

  if (!row.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single row, N cells (one per stat).
  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-stats', cells });
  element.replaceWith(block);
}
