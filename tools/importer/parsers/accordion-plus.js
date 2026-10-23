/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-plus (sydney.edu.au .cmp-wrapper-accordion).
 * Block table: one row per item, two columns: [title | content].
 * Repeating unit: .cmp-accordion__item (title in .cmp-accordion__title,
 * content in .cmp-accordion__panel .cmp-text). Bold sub-labels (<p><b>..</b></p>)
 * stay as bold paragraphs, not headings.
 */
const ORIGIN = 'https://www.sydney.edu.au';

function absUrl(url) {
  if (!url) return url;
  const u = url.trim();
  if (/^(https?:|data:|mailto:|tel:|#)/i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function cleanContent(root, document) {
  root.querySelectorAll('.cmp-text__external-link-icon, script, style, button').forEach((n) => n.remove());
  root.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'))));
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('data-src') || img.getAttribute('src');
    if (src) img.setAttribute('src', absUrl(src));
  });
  // merge adjacent same-type lists (source often splits one list into many single-item <ul>s)
  [...root.querySelectorAll('ul, ol')].forEach((list) => {
    if (!list.isConnected) return;
    let next = list.nextElementSibling;
    while (next && next.tagName === list.tagName) {
      list.append(...next.children);
      const after = next.nextElementSibling;
      next.remove();
      next = after;
    }
  });
  // normalise <b> to <strong> so bold sub-labels survive as bold text
  root.querySelectorAll('b').forEach((b) => {
    const strong = document.createElement('strong');
    strong.append(...b.childNodes);
    b.replaceWith(strong);
  });
}

export default function parse(element, { document }) {
  const accordion = element.querySelector('.cmp-accordion') || element;
  // only direct items of this accordion (ignore any nested accordions)
  const items = [...accordion.querySelectorAll('.cmp-accordion__item')]
    .filter((item) => item.parentElement.closest('.cmp-accordion') === accordion);

  const cells = [];
  items.forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title')
      || item.querySelector('.cmp-accordion__button')
      || item.querySelector('.cmp-accordion__header');
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!title) return;

    const panel = item.querySelector('.cmp-accordion__panel');
    const content = [];
    if (panel) {
      const textRoots = [...panel.querySelectorAll('.cmp-text')];
      const roots = textRoots.length ? textRoots : [panel.querySelector('.cmp-accordion__panel-inner') || panel];
      roots.forEach((root) => {
        cleanContent(root, document);
        [...root.children].forEach((child) => {
          if (child.textContent.trim() || child.querySelector('img')) content.push(child);
        });
      });
    }

    cells.push([title, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-plus', cells });
  element.replaceWith(block);
}
