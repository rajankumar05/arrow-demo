/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsStoryParser from './parsers/cards-story.js';
import columnsStatsParser from './parsers/columns-stats.js';
import columnsPromoParser from './parsers/columns-promo.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/arrow-cleanup.js';
import dmImagesTransformer from './transformers/arrow-dm-images.js';
import sectionsTransformer from './transformers/arrow-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards-category': cardsCategoryParser,
  'cards-story': cardsStoryParser,
  'columns-stats': columnsStatsParser,
  'columns-promo': columnsPromoParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Arrow.com homepage: hero carousel, category-tile grid, featured stories, company stats, careers promo.',
  urls: ['https://www.arrow.com/'],
  blocks: [
    { name: 'carousel-hero', instances: ['#carousel-93d4912ab9'], section: null },
    { name: 'cards-category', instances: ['#container-472bd4b54d'], section: null },
    { name: 'cards-story', instances: ['#container-2e47d118c3'], section: 'dark' },
    { name: 'columns-stats', instances: ['#container-dda2f3a3dd'], section: 'accent' },
    { name: 'columns-promo', instances: ['#container-7c76fe84b1'], section: null },
  ],
  sections: [
    { id: 'section-1-hero', name: 'Hero carousel', selector: ['#carousel-93d4912ab9'], style: null, blocks: ['carousel-hero'], defaultContent: [] },
    { id: 'section-2-guidance', name: 'Guidance / category tiles', selector: ['#container-0e04600504'], style: null, blocks: ['cards-category'], defaultContent: ['#container-0e04600504 h2', '#container-0e04600504 p'] },
    { id: 'section-3-stories', name: 'Five Years Out / featured stories', selector: ['#container-04f9321bcc'], style: 'dark', blocks: ['cards-story'], defaultContent: ['#container-04f9321bcc h2', '#container-04f9321bcc p'] },
    { id: 'section-4-stats', name: 'Company stats', selector: ['#container-3cb03f99f9'], style: 'accent', blocks: ['columns-stats'], defaultContent: ['#container-3cb03f99f9 h2', '#container-3cb03f99f9 p'] },
    { id: 'section-5-careers', name: 'Careers promo', selector: ['#container-7c76fe84b1', '#container-de5f09d838'], style: null, blocks: ['columns-promo'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
// cleanup handles beforeTransform + afterTransform; dm-images and sections run
// in afterTransform only. dm-images must precede sections so DM <img> become
// carrier anchors before section metadata/breaks are inserted.
const transformers = [
  cleanupTransformer,
  dmImagesTransformer,
  sectionsTransformer,
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced/detached)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (DM images -> carrier anchors, section breaks + metadata, final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map homepage root to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
