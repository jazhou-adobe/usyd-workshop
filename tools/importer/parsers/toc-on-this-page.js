/* eslint-disable */
/* global WebImporter */

/**
 * Parser for toc-on-this-page (sydney.edu.au .cmp-wrapper-table-of-contents).
 * The source list is generated client-side from the page H2s, so the block is
 * authored empty apart from an optional title row; the EDS block rebuilds the list.
 * Block table: one optional row, one column = title text ("On this page").
 *
 * - First TOC on the page  -> toc-on-this-page block.
 * - Any further TOC on the same page (e.g. our-facilities, get-involved have two) -> removed.
 * - Page without content H2s (e.g. thank-you: empty TOC) -> removed, no block.
 */
const BLOCK_NAME = 'toc-on-this-page';
const processed = new WeakSet();

function tocBlockExists(document) {
  const header = WebImporter.Blocks.computeBlockName
    ? WebImporter.Blocks.computeBlockName(BLOCK_NAME).toLowerCase()
    : 'toc on this page';
  return [...document.querySelectorAll('table')].some((t) => {
    const first = t.querySelector('tr > th, tr > td');
    return first && first.textContent.trim().toLowerCase() === header;
  });
}

function pageHasContentH2(element, document) {
  // the generated list itself is the most reliable signal
  if ([...element.querySelectorAll('a[href^="#"]')].some((a) => a.textContent.trim())) return true;
  return [...document.querySelectorAll('h2')].some((h) => h.textContent.trim()
    && !h.closest('.cmp-wrapper-table-of-contents, footer, header, nav, .exf-footer, .m-global-footer, .m-global-footer-wrapper, .m-local-desktop-nav'));
}

export default function parse(element, { document }) {
  const firstToc = document.querySelector('.cmp-wrapper-table-of-contents');
  const isDuplicate = processed.has(document)
    || tocBlockExists(document)
    || (firstToc && firstToc !== element && !element.contains(firstToc));

  if (isDuplicate || !pageHasContentH2(element, document)) {
    element.remove();
    return;
  }

  const heading = [...element.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .find((h) => h.textContent.trim());
  const title = heading ? heading.textContent.trim() : 'On this page';

  const cells = [[title]];
  const block = WebImporter.Blocks.createBlock(document, { name: BLOCK_NAME, cells });
  element.replaceWith(block);
  processed.add(document);
}
