/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-cta (sydney.edu.au .cmp-wrapper-call-to-action).
 * Block table: 1 column, one row per box: [title (linked), optional description].
 * Grey boxes (cmp-call-to-action--grey) emit "cards-cta"; orange boxes
 * (cmp-call-to-action--ochre) emit "cards-cta (ochre)".
 * The .m-hidden config dump is used only as a fallback and never emitted.
 */
const ORIGIN = 'https://www.sydney.edu.au';

function absUrl(url) {
  if (!url) return url;
  const u = url.trim();
  if (/^https?:\/\//i.test(u) || u.startsWith('data:')) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function norm(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const hidden = element.querySelector('.m-hidden');
  const boxes = [...element.querySelectorAll('a.cmp-call-to-action, .cmp-call-to-action:not(a)')]
    .filter((el, i, arr) => !arr.some((o) => o !== el && o.contains(el)));

  const isOchre = element.classList.contains('cmp-call-to-action--ochre')
    || !!element.querySelector('.cmp-call-to-action__bg--ochre');

  const cells = [];
  const buildRow = (box) => {
    const titleEl = box && box.querySelector('.cmp-call-to-action__title');
    const descEl = box && box.querySelector('.cmp-call-to-action__description');
    let title = norm(titleEl && titleEl.textContent);
    if (!title && hidden) title = norm((hidden.querySelector('h1, h2, h3, h4') || {}).textContent);
    const description = norm(descEl && descEl.textContent);

    let href = '';
    const linkEl = box && (box.matches('a[href]') ? box : box.querySelector('a[href]'));
    if (linkEl) href = linkEl.getAttribute('href');
    if (!href && hidden) {
      const hl = hidden.querySelector('a[href]');
      href = hl ? hl.getAttribute('href') : '';
    }

    const content = [];
    if (title) {
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        a.href = absUrl(href);
        a.textContent = title;
        p.append(a);
      } else {
        p.textContent = title;
      }
      content.push(p);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description;
      content.push(p);
    }
    if (content.length) cells.push([content]);
  };

  if (boxes.length) boxes.forEach(buildRow);
  else buildRow(null);

  const name = isOchre ? 'cards-cta (ochre)' : 'cards-cta';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
