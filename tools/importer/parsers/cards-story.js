/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-story. Base: cards.
 * Source: https://www.arrow.com/ (#container-2e47d118c3 — the story grid; the
 * section headings "The advantage of thinking Five Years Out" / "Our featured
 * stories" live in SIBLING containers and stay as default content.)
 * Generated: 2026-09-23
 *
 * Source model: 3 story cards. Each card is a `.container-simple` wrapping a
 * single `<a href="…/stories/…">` that contains the story <img>, an <h4>, a
 * description <p>, and a "Read more" <button>.
 *
 * 🚨 Invalid-nesting trap (structure.json warning): the "Read more" control is a
 * <button> INSIDE that <a>. button-in-anchor is invalid HTML, so html2md's
 * re-parse flattens it and the button count differs between the live DOM and the
 * importer path. We therefore key iteration on the stable per-story wrapper
 * (`.container-simple`), never on the anchor or the button, and read each part
 * scoped to its own wrapper — no walking up to a shared ancestor (after
 * flattening every part shares one ancestor, which would return the first
 * story's parts for every row).
 *
 * Output model (library-description.txt): 2-column cards table, one row per
 * story — cell 1 = image, cell 2 = description paragraph + a real "Read more"
 * link. The source CTA is a <button> with no href, so we rebuild it as an <a>
 * pointing at the card's story URL.
 */
export default function parse(element, { document }) {
  // Per-story wrappers. Fall back to the card anchors' nearest wrapper if the
  // class is missing on a variant DOM (still one entry per story href).
  let stories = Array.from(element.querySelectorAll(':scope .container-simple'))
    .filter((c) => c.querySelector('img, picture') && c.querySelector('a[href]'));
  if (!stories.length) {
    const seen = new Set();
    stories = Array.from(element.querySelectorAll('a[href]'))
      .filter((a) => a.querySelector('img, picture'))
      .map((a) => a.closest('div'))
      .filter((c) => c && !seen.has(c) && seen.add(c));
  }

  const seenHref = new Set();
  const cells = [];

  stories.forEach((story) => {
    // The card anchor carries the story URL and wraps the image.
    const cardLink = story.querySelector('a[href]');
    const href = cardLink ? cardLink.getAttribute('href') : null;
    if (href) {
      if (seenHref.has(href)) return;
      seenHref.add(href);
    }

    // Cell 1: the story image (scoped to this wrapper). Keep it standalone so the
    // DM transformer converts the Scene7 <img> to a carrier anchor.
    const image = story.querySelector('picture') || story.querySelector('img') || '';

    // Cell 2: description paragraph + a rebuilt "Read more" link.
    const contentCell = [];
    const description = story.querySelector('p');
    if (description) contentCell.push(description);

    // The CTA is a <button> (no href) — rebuild it as an anchor to the story.
    const cta = story.querySelector('button');
    const ctaText = cta ? cta.textContent.trim() : '';
    if (href && ctaText) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = ctaText;
      const p = document.createElement('p');
      p.appendChild(a);
      contentCell.push(p);
    }

    if (image || contentCell.length) {
      cells.push([image, contentCell.length ? contentCell : '']);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-story', cells });
  element.replaceWith(block);
}
