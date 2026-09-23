/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: arrow.com section breaks + Section Metadata.
 *
 * Maps the homepage template's 5 sections (page-templates.json) to EDS section
 * boundaries: section-1-hero, section-2-guidance, section-3-stories (dark),
 * section-4-stats (accent), section-5-careers. 4 breaks between the 5 sections;
 * Section Metadata tables only for section-3 (dark) and section-4 (accent).
 *
 * Selectors come verbatim from page-templates.json `sections[].selector`
 * (each entry DOM-verified during page analysis) — not re-derived here.
 *
 * Follows the canonical two-hook / reverse-iteration / marker pattern from
 * references/generate-import-transformer.md: breaks are inserted in
 * beforeTransform (while every section element still exists, before block
 * parsers replace them), and Section Metadata blocks are anchored in
 * afterTransform to the surviving marker <hr> (or the original element).
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — try each in order,
// first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    // Reverse order so inserts never shift an unprocessed section.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break needed
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // selector didn't match this page — skip, never guess

      const hr = element.ownerDocument.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists:
    // the marker <hr> placed above, or (first section) the original element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(element.ownerDocument, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
