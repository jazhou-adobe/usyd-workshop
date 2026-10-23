/* eslint-disable */
/* global WebImporter */

/**
 * Generic section transformer for the sydney.edu.au "section-page" template.
 *
 * The template has no fixed section list (sections: []); instead every top-level
 * component container in the main content column (the .cmp-container__inner that
 * holds the hero) becomes its own section.
 *
 * beforeTransform (parser targets still exist):
 *   - drops top-level spacer/separator wrappers (.cmp-wrapper-separator)
 *   - inserts <hr> before every top-level container after the first one
 *   - marks breaks of styled containers with temporary data attributes
 *       m-bespoke-layout--bg-grey-90 -> light-grey
 *       m-bespoke-layout--bg-sand    -> sand
 *       30-60 / 60-30 layout keeping default content beside a block -> split
 * afterTransform:
 *   - appends a Section Metadata block at the end of each marked section
 *   - removes temporary markers
 *
 * Only acts when payload.template.name === 'section-page'.
 */

const TEMPLATE_NAME = 'section-page';
const MARKER = 'data-excat-generic-section';
const FIRST = 'data-excat-generic-first';

// Elements that parsers turn into blocks (from page-templates.json section-page blocks)
const BLOCK_SELECTORS = [
  '.cmp-wrapper-tabs',
  '.cmp-wrapper-accordion',
  '.m-wrapper-js-profile-contact',
  '.m-wrapper-testimonial',
  '.cmp-wrapper-carousel',
  '.cmp-wrapper-call-to-action',
  '.m-wrapper-icon-tile',
  '.m-wrapper-news-article-list',
  '.cmp-wrapper-teaser',
];

const DEFAULT_CONTENT_SELECTORS = 'h1, h2, h3, h4, h5, h6, .cmp-text, p';

function hasClass(el, cls) {
  return !!(el && el.classList && el.classList.contains(cls));
}

function findMainColumn(root) {
  const hero = root.querySelector('.m-wrapper-hero');
  if (hero && hero.parentElement && hero.parentElement !== root) {
    return hero.parentElement;
  }
  // Fallback: the .cmp-container__inner with the most direct component containers
  let best = null;
  let bestCount = 0;
  root.querySelectorAll('.cmp-container__inner').forEach((inner) => {
    const count = [...inner.children].filter((c) => hasClass(c, 'm-component-wrapper')).length;
    if (count > bestCount) {
      best = inner;
      bestCount = count;
    }
  });
  return bestCount > 1 ? best : null;
}

function isSeparator(el) {
  return hasClass(el, 'cmp-wrapper-separator') || hasClass(el, 'separator');
}

function isEmpty(el) {
  if ((el.textContent || '').trim()) return false;
  return !el.querySelector('img, picture, video, iframe, table');
}

// A 30-60 container that parsers convert whole into a block
// (columns-title-left / cards-speaker) leaves no default content beside a block.
function isWholeContainerBlock(container) {
  if (!hasClass(container, 'm-bespoke-layout--30-60-layout')) return false;
  const inner = [...container.children].find((c) => hasClass(c, 'm-bespoke-layout__inner'));
  const first = inner && inner.firstElementChild;
  if (first && hasClass(first, 'cmp-wrapper-image')) return true; // cards-speaker
  return !container.querySelector('.cmp-wrapper-tabs, .m-wrapper-js-profile-contact'); // columns-title-left
}

function isSplit(container) {
  if (!hasClass(container, 'm-bespoke-layout--30-60-layout')
    && !hasClass(container, 'm-bespoke-layout--60-30-layout')) return false;
  if (isWholeContainerBlock(container)) return false;
  const blockSel = BLOCK_SELECTORS.join(', ');
  const blocks = [...container.querySelectorAll(blockSel)];
  if (!blocks.length) return false;
  const defaults = [...container.querySelectorAll(DEFAULT_CONTENT_SELECTORS)]
    .filter((el) => !el.closest(blockSel) && (el.textContent || '').trim());
  return defaults.length > 0;
}

// The background class may sit on a container nested inside single-child wrappers
// (e.g. infectious-diseases wraps its sand testimonial band in a plain bespoke container).
function hasBg(container, cls) {
  let el = container;
  while (el) {
    if (hasClass(el, cls)) return true;
    const kids = [...el.children].filter((c) => !isEmpty(c));
    el = kids.length === 1 ? kids[0] : null;
  }
  return false;
}

// A plain wrapper (no background or column layout of its own) that groups several
// bands, at least one with its own background, yields one section per band.
const LAYOUT_CLASS = /m-bespoke-layout--(bg-|30-60|60-30|\d-cols)/;
function sectionUnits(container) {
  if (!hasClass(container, 'm-bespoke-layout') || LAYOUT_CLASS.test(container.className)) return [container];
  const inner = [...container.children].find((c) => hasClass(c, 'm-bespoke-layout__inner'));
  if (!inner) return [container];
  const bands = [...inner.children].filter((c) => !isSeparator(c) && !isEmpty(c));
  const hasBgBand = bands.some((b) => /m-bespoke-layout--bg-(grey-90|sand)/.test(b.className));
  return bands.length > 1 && hasBgBand ? bands : [container];
}

function getStyle(container) {
  const styles = [];
  if (hasBg(container, 'm-bespoke-layout--bg-grey-90')) styles.push('light-grey');
  else if (hasBg(container, 'm-bespoke-layout--bg-sand')) styles.push('sand');
  // split-heading: narrow heading column + content (30-60); split-aside: content + narrow aside box (60-30)
  if (isSplit(container)) styles.push(hasClass(container, 'm-bespoke-layout--30-60-layout') ? 'split-heading' : 'split-aside');
  return styles.join(',');
}

// "text-page" (older layout): intro + contents list form the first section; the
// heading/content row groups start the second. A row group holding a Formstack
// form keeps its heading beside the embed block, so it is "split".
// The CMS-generated side navigation repeats the header nav and is dropped.
function textPageSections(element, document) {
  element.querySelectorAll('.cmp-wrapper-navigation').forEach((n) => n.remove());
  const rows = [...element.querySelectorAll('.cmp-container--css-grid--section-layout')];
  if (!rows.length) return;
  const hr = document.createElement('hr');
  if (rows.some((r) => r.querySelector('.m-formstack-wrapper'))) hr.setAttribute(MARKER, 'split-heading');
  rows[0].parentNode.insertBefore(hr, rows[0]);
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  if (!template || ![TEMPLATE_NAME, 'text-page'].includes(template.name)) return;
  const document = element.ownerDocument;

  if (hookName === 'beforeTransform' && template.name === 'text-page') {
    textPageSections(element, document);
    return;
  }

  if (hookName === 'beforeTransform') {
    const column = findMainColumn(element);
    if (!column) return;

    // Drop top-level spacers/separators and empty wrappers so they don't open empty sections
    [...column.children].forEach((child) => {
      if (isSeparator(child) || (child.tagName !== 'HR' && isEmpty(child))) child.remove();
    });

    const containers = [...column.children].filter((c) => c.tagName !== 'HR').flatMap(sectionUnits);
    containers.forEach((container, i) => {
      const style = getStyle(container);
      const parent = container.parentNode;
      if (i === 0) {
        if (style) {
          // temporary marker for a styled first section; removed in afterTransform
          const hr = document.createElement('hr');
          hr.setAttribute(MARKER, style);
          hr.setAttribute(FIRST, 'true');
          parent.insertBefore(hr, container);
        }
        return;
      }
      const hr = document.createElement('hr');
      if (style) hr.setAttribute(MARKER, style);
      parent.insertBefore(hr, container);
    });
  }

  if (hookName === 'afterTransform') {
    const markers = [...element.querySelectorAll(`hr[${MARKER}]`)];
    markers.reverse().forEach((marker) => {
      const style = marker.getAttribute(MARKER);
      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style },
      });

      // End of section: last sibling before the next <hr>, else end of the column
      let last = marker;
      while (last.nextElementSibling && last.nextElementSibling.tagName !== 'HR') {
        last = last.nextElementSibling;
      }
      last.parentNode.insertBefore(metadata, last.nextSibling);

      if (marker.getAttribute(FIRST) === 'true') {
        marker.remove();
      } else {
        marker.removeAttribute(MARKER);
      }
    });
  }
}
