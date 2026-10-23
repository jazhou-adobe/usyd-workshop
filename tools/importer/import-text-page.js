/* eslint-disable */
/* global WebImporter */

import tocOnThisPageParser from './parsers/toc-on-this-page.js';
import embedFormstackParser from './parsers/embed-formstack.js';
import columnsTitleLeftParser from './parsers/columns-title-left.js';
import sydneyCleanupTransformer from './transformers/sydney-cleanup.js';
import sydneyGenericSectionsTransformer from './transformers/sydney-generic-sections.js';
import sydneySectionsTransformer from './transformers/sydney-sections.js';

const PAGE_TEMPLATE = {
  "name": "text-page",
  "urls": [
    "https://www.sydney.edu.au/drug-discovery/get-involved.html",
    "https://www.sydney.edu.au/drug-discovery/get-involved/become-a-member.html",
    "https://www.sydney.edu.au/drug-discovery/get-involved/become-a-member/thank-you.html",
    "https://www.sydney.edu.au/drug-discovery/about-us/our-facilities.html"
  ],
  "representativeUrl": "https://www.sydney.edu.au/drug-discovery/get-involved.html",
  "description": "Older-layout Drug Discovery pages: breadcrumb, table of contents, rich text, side navigation, embedded Formstack form",
  "blocks": [
    {
      "name": "toc-on-this-page",
      "instances": [
        ".cmp-wrapper-table-of-contents"
      ]
    },
    {
      "name": "embed-formstack",
      "instances": [
        ".m-formstack-wrapper"
      ]
    },
    {
      "name": "columns-title-left",
      "instances": [
        ".cmp-container--css-grid--section-layout:not(:has(.m-formstack-wrapper))"
      ]
    }
  ],
  "urlPattern": "/drug-discovery/*",
  "sections": [],
  "sectionStrategy": "generic: section 1 = title, intro, contents list and lead-in; a section break before the first .cmp-container--css-grid--section-layout row group; a row group holding the Formstack form is style \"split\""
};

const parsers = {
  'toc-on-this-page': tocOnThisPageParser,
  'embed-formstack': embedFormstackParser,
  'columns-title-left': columnsTitleLeftParser,
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
