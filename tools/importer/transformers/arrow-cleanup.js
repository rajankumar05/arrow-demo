/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: arrow.com site-wide cleanup.
 *
 * Removes non-authorable Material-UI / AEM shell chrome so the import contains
 * only page-level authorable content. Header and footer are migrated separately
 * as nav.plain.html / footer.plain.html and must not appear in page content.
 *
 * All selectors verified against migration-work/cleaned.html:
 *   - OneTrust cookie consent:  #onetrust-consent-sdk (wraps #onetrust-banner-sdk
 *     and #onetrust-pc-sdk), plus <iframe class="ot-text-resize"> (line ~1457, 1741)
 *   - Header:  <header class="MuiBox-root css-3tpgen"> inside #container-4ded00a870 (lines 8-197)
 *   - Footer:  <footer id="footer-bb589c5071"> inside #container-7758dfac9c (lines 1037-1445)
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie/consent overlays block parsing and are never authorable content.
    // #onetrust-consent-sdk wraps the banner and preference-center subtrees;
    // remove the sibling ids too, defensively, in case markup shifts.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      'iframe.ot-text-resize',
    ]);

    // Collapse redundant single-child span wrappers (Material-UI emits many
    // <span><span>text</span></span> nestings) so parsers see clean text.
    element.querySelectorAll('span > span:only-child').forEach((span) => {
      span.replaceWith(span.textContent);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site shell. Removing <header>/<footer> also strips the
    // utility nav, search, cart, and newsletter/footer nav they contain.
    // #container-4ded00a870 and #container-7758dfac9c are the empty MUI
    // wrappers left once their header/footer child is gone.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      '#container-4ded00a870',
      '#container-7758dfac9c',
      'iframe',
    ]);
  }
}
