import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// footer sections in authored order
const SECTIONS = ['newsletter', 'contact', 'links', 'brand', 'legal'];

const SOCIAL = /(facebook|linkedin|instagram|youtube|twitter)\.com/i;

/**
 * Wraps each heading and the content after it (up to the next heading) in a
 * `.footer-column`; anything before the first heading goes into `.footer-lead`.
 * @param {Element} wrapper The section's default content wrapper
 */
function groupColumns(wrapper) {
  const children = [...wrapper.children];
  if (!children.some((el) => /^H[1-6]$/.test(el.tagName))) return;
  let current = null;
  children.forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName)) {
      current = document.createElement('div');
      current.className = 'footer-column';
      wrapper.append(current);
    } else if (!current) {
      current = document.createElement('div');
      current.className = 'footer-lead';
      wrapper.append(current);
    }
    current.append(el);
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  if (fragment) {
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  }

  [...footer.children].forEach((section, i) => {
    if (SECTIONS[i]) section.classList.add(`footer-${SECTIONS[i]}`);
  });

  // social links render as icons; the link text stays as the accessible name
  footer.querySelectorAll('a[href]').forEach((a) => {
    const match = a.getAttribute('href').match(SOCIAL);
    if (!match) return;
    a.classList.add('footer-social', `footer-social-${match[1].toLowerCase()}`);
    a.closest('ul')?.classList.add('footer-social-list');
  });

  const brand = footer.querySelector('.footer-brand .default-content-wrapper');
  const logo = brand?.querySelector(':scope > p a[href]');
  if (logo) logo.classList.add('footer-logo');

  ['.footer-links', '.footer-brand'].forEach((sel) => {
    const wrapper = footer.querySelector(`${sel} .default-content-wrapper`);
    if (wrapper) groupColumns(wrapper);
  });

  block.append(footer);
}
