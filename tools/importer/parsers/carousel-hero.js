/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://www.arrow.com/ (#carousel-93d4912ab9)
 * Generated: 2026-09-23
 *
 * Source model: a Swiper carousel. `.swiper-wrapper > .swiper-slide` (×4) each
 * holds one slide: <picture><img> background, an <h4> heading, a <p> paragraph,
 * and one button-styled CTA <a>. The digest (structure.json) reports the slides
 * as iterationSafe (flat siblings, no nested interactive elements), so iterating
 * `.swiper-slide` is safe.
 *
 * Output model (library-description.txt): 2-column carousel table, one row per
 * slide — cell 1 = image, cell 2 = heading + paragraph + CTA. DM/Scene7 images
 * are left as <picture>/<img>; the DM transformer (afterTransform) converts them
 * to carrier anchors afterwards.
 */
// Business-line tab labels shown beneath the hero (01.–04.), tied to slides by
// index. The source renders these in a separate Swiper thumbnail nav whose text
// is split across nested spans that don't extract cleanly, so the stable,
// well-known Arrow business-line names are emitted here as a 3rd cell per row.
// The block renders them as the numbered tab navigation.
const TAB_LABELS = [
  'Electronic Components',
  'Enterprise Computing Solutions',
  'Intelligent Solutions',
  'Supply Chain Solutions',
];

export default function parse(element, { document }) {
  // Prefer the real slide wrappers; fall back to the swiper-wrapper's direct
  // children if the class-based query comes up empty on a variant DOM.
  let slides = Array.from(element.querySelectorAll(':scope .swiper-wrapper > .swiper-slide'));
  if (!slides.length) {
    slides = Array.from(element.querySelectorAll('.swiper-slide'));
  }

  const cells = [];

  slides.forEach((slide, idx) => {
    // Cell 1: the slide background image (prefer <picture>, fall back to <img>).
    const picture = slide.querySelector('picture') || slide.querySelector('img');

    // Cell 2: heading + paragraph + CTA.
    const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
    const paragraph = slide.querySelector('p');
    // The CTA is the button-styled anchor; the prev/next arrows are <button>s,
    // so an <a> selector never captures them. Anchor by class first, then any
    // href-bearing anchor as a fallback.
    const cta = slide.querySelector('a.MuiButton-root') || slide.querySelector('a[href]');

    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (paragraph) contentCell.push(paragraph);
    if (cta) contentCell.push(cta);

    // Only emit a row that has real content.
    if (picture || contentCell.length) {
      const label = TAB_LABELS[idx] || `Slide ${idx + 1}`;
      cells.push([picture || '', contentCell.length ? contentCell : '', label]);
    }
  });

  // Empty-block guard: nothing usable found → unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
