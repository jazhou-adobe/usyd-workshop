/* eslint-disable */
/* global WebImporter */

import heroOrangeBandParser from './parsers/hero-orange-band.js';
import columnsBleedImageParser from './parsers/columns-bleed-image.js';
import cardsPortraitParser from './parsers/cards-portrait.js';
import carouselNewsParser from './parsers/carousel-news.js';
import columnsContactParser from './parsers/columns-contact.js';
import sydneyCleanupTransformer from './transformers/sydney-cleanup.js';
import sydneySectionsTransformer from './transformers/sydney-sections.js';

const PAGE_TEMPLATE = {
  "name": "drug-discovery",
  "urls": [
    "https://www.sydney.edu.au/drug-discovery/"
  ],
  "representativeUrl": "https://www.sydney.edu.au/drug-discovery/",
  "description": "Centre for Drug Discovery Innovation landing page: orange-band hero, intro copy, featured research teaser, explore cards, related news carousel and stay-in-touch contact band",
  "urlPattern": "/*",
  "blocks": [
    {
      "name": "hero-orange-band",
      "instances": [
        ".m-wrapper-hero.m-hero--style-2",
        ".m-wrapper-hero"
      ]
    },
    {
      "name": "columns-bleed-image",
      "instances": [
        ".cmp-wrapper-teaser .m-content-w-bleed-image"
      ]
    },
    {
      "name": "cards-portrait",
      "instances": [
        ".m-bespoke-layout--bg-white .m-bespoke-layout--3-cols"
      ]
    },
    {
      "name": "carousel-news",
      "instances": [
        ".m-news-article-list"
      ]
    },
    {
      "name": "columns-contact",
      "instances": [
        ".m-bespoke-layout--bg-grey-90 > .m-bespoke-layout__inner"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Hero",
      "selector": [
        ".m-wrapper-hero.m-hero--style-2",
        ".m-wrapper-hero"
      ],
      "style": null,
      "blocks": [
        "hero-orange-band"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Introduction",
      "selector": [
        ".m-bespoke-layout--60-30-layout"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".m-bespoke-layout--60-30-layout .m-bespoke-layout__inner"
      ]
    },
    {
      "id": "section-3",
      "name": "Our research",
      "selector": [
        ".cmp-wrapper-teaser.cmp-teaser--featured",
        ".cmp-wrapper-teaser"
      ],
      "style": null,
      "blocks": [
        "columns-bleed-image"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Explore",
      "selector": [
        ".m-bespoke-layout--bg-white:has(.m-bespoke-layout--3-cols)"
      ],
      "style": null,
      "blocks": [
        "cards-portrait"
      ],
      "defaultContent": [
        ".m-bespoke-layout--bg-white .cmp-title--h2-serif"
      ]
    },
    {
      "id": "section-5",
      "name": "Related news",
      "selector": [
        ".m-bespoke-layout--bg-white:has(.m-news-article-list)"
      ],
      "style": null,
      "blocks": [
        "carousel-news"
      ],
      "defaultContent": [
        ".m-news-article-list__title"
      ]
    },
    {
      "id": "section-6",
      "name": "Stay in touch",
      "selector": [
        ".m-bespoke-layout--bg-grey-90"
      ],
      "style": "light-grey",
      "blocks": [
        "columns-contact"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'hero-orange-band': heroOrangeBandParser,
  'columns-bleed-image': columnsBleedImageParser,
  'cards-portrait': cardsPortraitParser,
  'carousel-news': carouselNewsParser,
  'columns-contact': columnsContactParser,
};

const transformers = [sydneyCleanupTransformer, sydneySectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        // skip elements already matched by an earlier instance selector
        if (pageBlocks.some((b) => b.element === element)) return;
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // folder URLs (trailing slash) map to <folder>/index so the EDS URL matches the source
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '/index')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
