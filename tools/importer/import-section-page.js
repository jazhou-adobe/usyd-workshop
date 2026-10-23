/* eslint-disable */
/* global WebImporter */

import heroOrangeSplitParser from './parsers/hero-orange-split.js';
import heroImageOverlayParser from './parsers/hero-image-overlay.js';
import tabsUnderlineParser from './parsers/tabs-underline.js';
import accordionPlusParser from './parsers/accordion-plus.js';
import cardsProfileParser from './parsers/cards-profile.js';
import quotePortraitParser from './parsers/quote-portrait.js';
import carouselGalleryParser from './parsers/carousel-gallery.js';
import cardsCtaParser from './parsers/cards-cta.js';
import cardsIconTileParser from './parsers/cards-icon-tile.js';
import tableKeyValueParser from './parsers/table-key-value.js';
import carouselNewsParser from './parsers/carousel-news.js';
import cardsNewsListParser from './parsers/cards-news-list.js';
import columnsBleedImageParser from './parsers/columns-bleed-image.js';
import cardsSpeakerParser from './parsers/cards-speaker.js';
import columnsTitleLeftParser from './parsers/columns-title-left.js';
import columnsContactParser from './parsers/columns-contact.js';
import sydneyCleanupTransformer from './transformers/sydney-cleanup.js';
import sydneyGenericSectionsTransformer from './transformers/sydney-generic-sections.js';
import sydneySectionsTransformer from './transformers/sydney-sections.js';

const PAGE_TEMPLATE = {
  "name": "section-page",
  "urls": [
    "https://www.sydney.edu.au/drug-discovery/about-us.html",
    "https://www.sydney.edu.au/drug-discovery/news-and-events.html",
    "https://www.sydney.edu.au/drug-discovery/news-and-events/news.html",
    "https://www.sydney.edu.au/drug-discovery/news-and-events/drug-discovery-symposium.html",
    "https://www.sydney.edu.au/drug-discovery/our-research.html",
    "https://www.sydney.edu.au/drug-discovery/our-research/cancer.html",
    "https://www.sydney.edu.au/drug-discovery/our-research/cardiovascular-disease.html",
    "https://www.sydney.edu.au/drug-discovery/our-research/infectious-diseases.html",
    "https://www.sydney.edu.au/drug-discovery/our-research/neurological-and-cns-disorders.html",
    "https://www.sydney.edu.au/drug-discovery/our-research/sydney-anti-bacterial-accelerator.html",
    "https://www.sydney.edu.au/drug-discovery/our-research/tdp-43-research-cluster.html",
    "https://www.sydney.edu.au/drug-discovery/our-research/what-is-drug-discovery-.html",
    "https://www.sydney.edu.au/drug-discovery/partnerships.html",
    "https://www.sydney.edu.au/drug-discovery/get-involved/researcher-development.html"
  ],
  "representativeUrl": "https://www.sydney.edu.au/drug-discovery/about-us.html",
  "description": "Modern Drug Discovery section pages: hero followed by stacked components (text, teaser, tabs, accordion, carousel, tiles, testimonial, news list) and the Stay in touch band",
  "blocks": [
    {
      "name": "hero-orange-split",
      "instances": [
        ".m-wrapper-hero.m-hero--style-3"
      ]
    },
    {
      "name": "hero-image-overlay",
      "instances": [
        ".m-wrapper-hero.m-hero--style-1"
      ]
    },
    {
      "name": "tabs-underline",
      "instances": [
        ".cmp-wrapper-tabs"
      ]
    },
    {
      "name": "accordion-plus",
      "instances": [
        ".cmp-wrapper-accordion"
      ]
    },
    {
      "name": "cards-profile",
      "instances": [
        ".m-wrapper-js-profile-contact"
      ]
    },
    {
      "name": "quote-portrait",
      "instances": [
        ".m-wrapper-testimonial.m-testimonial--compact"
      ]
    },
    {
      "name": "carousel-gallery",
      "instances": [
        ".cmp-wrapper-carousel"
      ]
    },
    {
      "name": "cards-cta",
      "instances": [
        ".cmp-wrapper-call-to-action"
      ]
    },
    {
      "name": "cards-icon-tile",
      "instances": [
        ".m-bespoke-layout--bg-grey-90 .m-wrapper-icon-tile"
      ]
    },
    {
      "name": "table-key-value",
      "instances": [
        ".cmp-text table"
      ]
    },
    {
      "name": "carousel-news",
      "instances": [
        ".m-news-article-list"
      ]
    },
    {
      "name": "cards-news-list",
      "instances": [
        ".m-news-article-list__vertical-container"
      ]
    },
    {
      "name": "columns-bleed-image",
      "instances": [
        ".cmp-wrapper-teaser .m-content-w-bleed-image",
        ".cmp-wrapper-teaser.cmp-teaser--std"
      ]
    },
    {
      "name": "cards-speaker",
      "instances": [
        ".m-bespoke-layout--30-60-layout:has(> .m-bespoke-layout__inner > .cmp-wrapper-image:first-child)"
      ]
    },
    {
      "name": "columns-title-left",
      "instances": [
        ".m-bespoke-layout--30-60-layout:not(:has(.cmp-wrapper-tabs, .m-wrapper-js-profile-contact)):not(:has(> .m-bespoke-layout__inner > .cmp-wrapper-image:first-child))"
      ]
    },
    {
      "name": "columns-contact",
      "instances": [
        ".m-bespoke-layout--bg-grey-90:has(.cmp-wrapper-list) > .m-bespoke-layout__inner"
      ]
    }
  ],
  "urlPattern": "/drug-discovery/*",
  "sections": [],
  "sectionStrategy": "generic: one section per top-level component container in the main column; bg-grey-90 -> light-grey, bg-sand -> sand; 30-60/60-30 containers with default content beside a block -> split"
};

const parsers = {
  'hero-orange-split': heroOrangeSplitParser,
  'hero-image-overlay': heroImageOverlayParser,
  'tabs-underline': tabsUnderlineParser,
  'accordion-plus': accordionPlusParser,
  'cards-profile': cardsProfileParser,
  'quote-portrait': quotePortraitParser,
  'carousel-gallery': carouselGalleryParser,
  'cards-cta': cardsCtaParser,
  'cards-icon-tile': cardsIconTileParser,
  'table-key-value': tableKeyValueParser,
  'carousel-news': carouselNewsParser,
  'cards-news-list': cardsNewsListParser,
  'columns-bleed-image': columnsBleedImageParser,
  'cards-speaker': cardsSpeakerParser,
  'columns-title-left': columnsTitleLeftParser,
  'columns-contact': columnsContactParser,
};

const transformers = [sydneyCleanupTransformer, sydneyGenericSectionsTransformer, sydneySectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

// blocks are parsed in template order: inner components before container blocks
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
      if (!block.element.isConnected) return;
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
