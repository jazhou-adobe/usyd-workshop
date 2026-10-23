/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-bleed-image (sydney.edu.au .cmp-wrapper-teaser .m-content-w-bleed-image).
 * Block table: one row, two columns [text panel | image].
 *   text: H2 title, description paragraphs, standalone links (one per paragraph)
 *   image: teaser photo (decorative arrow-icon data: images are skipped)
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

export default function parse(element, { document }) {
  // --- Text column ---
  const textCell = [];
  const content = element.querySelector('.m-content-w-bleed-image__content, .cmp-teaser-content') || element;

  const srcTitle = content.querySelector('.cmp-teaser-content__title, h1, h2, h3');
  if (srcTitle) {
    const h2 = document.createElement('h2');
    h2.textContent = srcTitle.textContent.trim();
    textCell.push(h2);
  }

  const desc = content.querySelector('.cmp-teaser-content__description');
  if (desc) {
    [...desc.children].forEach((child) => {
      if (!child.textContent.trim()) return;
      const clone = child.cloneNode(true);
      clone.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'))));
      textCell.push(clone);
    });
  }

  [...content.querySelectorAll('ul.m-list a[href]')].forEach((a) => {
    const text = (a.querySelector('.m-list__title') || a).textContent.trim();
    if (!text) return;
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = absUrl(a.getAttribute('href'));
    link.textContent = text;
    p.append(link);
    textCell.push(p);
  });

  // --- Image column ---
  const imageCell = [];
  const srcImg = element.querySelector('.m-content-w-bleed-image__image img:not([src^="data:"]), .m-content-w-bleed-image__image-container img:not([src^="data:"])');
  if (srcImg) {
    const img = document.createElement('img');
    img.src = absUrl(srcImg.getAttribute('src'));
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell.push(img);
  }

  const cells = [[textCell, imageCell.length ? imageCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-bleed-image', cells });
  element.replaceWith(block);
}
