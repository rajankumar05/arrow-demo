/* eslint-disable */
/* global WebImporter */

/**
 * Footer fragment import for arrow.com.
 * Rebuilds the source footer (.cmp-footer) as five authorable sections, in order:
 *   1. newsletter banner   — heading + "Sign up" link
 *   2. contact band        — heading + social links + "Contact us" link
 *   3. link columns        — heading + link list, per column
 *   4. brand row           — logo link + tagline, then Businesses / About / Connect columns
 *   5. legal bar           — copyright + legal links
 * The footer block (blocks/footer) tags and styles these sections by position.
 */

const SOCIAL_NAMES = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitter: 'X',
};

const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

function make(document, tag, content) {
  const el = document.createElement(tag);
  if (content) el.textContent = content;
  return el;
}

function link(document, href, label) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  return a;
}

/** A <ul> of the text links found in `scope` (skips icon-only links). */
function linkList(document, scope) {
  const ul = document.createElement('ul');
  scope.querySelectorAll('li a[href]').forEach((a) => {
    const label = text(a);
    if (!label) return;
    const li = document.createElement('li');
    li.append(link(document, a.getAttribute('href'), label));
    ul.append(li);
  });
  return ul;
}

/** The social network a link points at, or null (icons are an icon font, so match by domain). */
function socialKey(a) {
  const m = (a.getAttribute('href') || '').match(/(facebook|linkedin|instagram|youtube|twitter)\.com/i);
  return m ? m[1].toLowerCase() : null;
}

/** A <ul> of the social links in `scope`, labelled with the network name. */
function socialList(document, scope) {
  const ul = document.createElement('ul');
  scope.querySelectorAll('a[href]').forEach((a) => {
    const key = socialKey(a);
    if (!key) return;
    const li = document.createElement('li');
    li.append(link(document, a.getAttribute('href'), SOCIAL_NAMES[key]));
    ul.append(li);
  });
  return ul;
}

function paragraphLink(document, a) {
  const p = document.createElement('p');
  if (a) p.append(link(document, a.getAttribute('href'), text(a)));
  return p;
}

export default {
  transform: ({ document, html }) => {
    // Read from a pristine parse of the raw page: the importer's DOM cleanup strips
    // icon-only links (the social icons) before transform runs.
    const pristine = html ? new DOMParser().parseFromString(html, 'text/html') : document;
    const src = pristine.querySelector('footer .cmp-footer') || document.querySelector('footer .cmp-footer');
    const main = document.createElement('main');
    if (!src) return [{ element: main, path: '/footer', report: { error: 'no .cmp-footer' } }];

    const section = (...nodes) => {
      if (main.children.length) main.append(document.createElement('hr'));
      nodes.filter(Boolean).forEach((n) => main.append(n));
    };

    // 1. newsletter banner
    const banner = src.querySelector('.cmp-email-sign-up-banner');
    if (banner) {
      section(
        make(document, 'h2', text(banner.querySelector('h1, h2, h3, h4, h5, h6'))),
        paragraphLink(document, banner.querySelector('a[href]')),
      );
    }

    // 2. contact band: heading, social links, then the "Contact us" CTA
    const contact = src.querySelector('.cmp-footer--ec_contact_us');
    if (contact) {
      const cta = [...contact.querySelectorAll('a[href]')].find((a) => !socialKey(a) && text(a));
      section(
        make(document, 'h3', text(contact.querySelector('h1, h2, h3, h4, h5, h6'))),
        socialList(document, contact),
        paragraphLink(document, cta),
      );
    }

    // 3. link columns: each column is a heading paragraph followed by a list
    const firstNav = src.querySelector('.cmp-footer--first_nav');
    if (firstNav) {
      const nodes = [];
      firstNav.querySelectorAll('ul').forEach((ul) => {
        const heading = ul.previousElementSibling;
        nodes.push(make(document, 'h3', text(heading)), linkList(document, ul.parentElement));
      });
      section(...nodes);
    }

    // 4. brand row: logo + tagline, then heading/list columns (last one is social)
    const secondNav = src.querySelector('.cmp-footer--second_nav');
    if (secondNav) {
      const nodes = [
        paragraphLink(document, null),
        make(document, 'p', 'Five Years Out'),
      ];
      nodes[0].append(link(document, '/', 'Arrow Electronics')); // logo → this site's home
      secondNav.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
        const col = h.parentElement;
        const isSocial = [...col.querySelectorAll('a[href]')].some((a) => socialKey(a));
        nodes.push(make(document, 'h3', text(h)), isSocial ? socialList(document, col) : linkList(document, col));
      });
      section(...nodes);
    }

    // 5. legal bar
    const copyright = src.querySelector('.cmp-footer--copyright');
    if (copyright) {
      section(
        make(document, 'p', text(copyright.querySelector('p'))),
        linkList(document, copyright),
      );
    }

    return [{
      element: main,
      path: '/footer',
      report: { title: 'footer', sections: main.querySelectorAll('hr').length + 1 },
    }];
  },
};
