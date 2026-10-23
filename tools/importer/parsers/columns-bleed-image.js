/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-bleed-image (sydney.edu.au teasers).
 * Handles:
 *   - featured bleed-image teaser: `.cmp-wrapper-teaser .m-content-w-bleed-image`
 *     (home "Our research", about-us "Our network")
 *   - std teaser: `.cmp-wrapper-teaser.cmp-teaser--std` (news-and-events event teaser)
 * Block table: one row, two columns.
 *   default:          [text panel | image]
 *   image-left teaser: [image | text panel]  (m-content-w-image--image-left)
 *   text panel: optional date eyebrow paragraph (pretitle), H2 title,
 *               description paragraphs, standalone links (one per paragraph)
 * Options: wrapper class m-content-w-image--sandstone -> "columns-bleed-image (sandstone)".
 * Decorative arrow-icon data: images are skipped.
 */
const ORIGIN = 'https://www.sydney.edu.au';

function absUrl(url) {
  if (!url) return url;
  const u = url.trim();
  if (/^https?:\/\//i.test(u) || u.startsWith('data:') || u.startsWith('mailto:') || u.startsWith('tel:')) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

export default function parse(element, { document }) {
  const wrapper = element.closest('.cmp-wrapper-teaser') || element;
  const wrapperClasses = wrapper.className || '';

  // --- Text column ---
  const textCell = [];
  const content = element.querySelector('.cmp-teaser-content')
    || element.querySelector('.m-content-w-bleed-image__content')
    || element;

  const pretitle = content.querySelector('.cmp-teaser-content__pretitle');
  if (pretitle && pretitle.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = pretitle.textContent.trim();
    textCell.push(p);
  }

  const srcTitle = content.querySelector('.cmp-teaser-content__title') || content.querySelector('h1, h2, h3');
  if (srcTitle && srcTitle.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = srcTitle.textContent.trim();
    textCell.push(h2);
  }

  const desc = content.querySelector('.cmp-teaser-content__description');
  if (desc) {
    const blocks = [...desc.children].filter((c) => /^(P|UL|OL|H[1-6]|BLOCKQUOTE)$/.test(c.tagName));
    if (blocks.length) {
      blocks.forEach((child) => {
        if (!child.textContent.trim()) return;
        const clone = child.cloneNode(true);
        clone.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'))));
        textCell.push(clone);
      });
    } else if (desc.textContent.trim()) {
      // plain text description (std teaser)
      const p = document.createElement('p');
      [...desc.childNodes].forEach((n) => {
        if (n.nodeType === 3 || n.nodeType === 1) p.append(n.cloneNode(true));
      });
      p.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'))));
      if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, '');
      if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/\s+$/, '');
      textCell.push(p);
    }
  }

  const seen = new Set();
  const addLink = (href, text) => {
    if (!href || !text || seen.has(href + text)) return;
    seen.add(href + text);
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = absUrl(href);
    link.textContent = text;
    p.append(link);
    textCell.push(p);
  };
  // arrow-link list (home)
  content.querySelectorAll('ul.m-list a[href]').forEach((a) => {
    addLink(a.getAttribute('href'), (a.querySelector('.m-list__title') || a).textContent.trim());
  });
  // CTA button(s) (about-us, news-and-events)
  content.querySelectorAll('.cmp-teaser-content__cta-holder a[href]').forEach((a) => {
    addLink(a.getAttribute('href'), (a.querySelector('.cmp-button__text') || a).textContent.trim());
  });

  // --- Image column ---
  const imageCell = [];
  const srcImg = element.querySelector('.m-content-w-bleed-image__image img:not([src^="data:"]), .m-content-w-image-std__image img:not([src^="data:"])')
    || [...element.querySelectorAll('img:not([src^="data:"])')].find((img) => !img.closest('.cmp-teaser-content'));
  if (srcImg) {
    const img = document.createElement('img');
    img.src = absUrl(srcImg.getAttribute('src'));
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell.push(img);
  }

  const imageLeft = /\bm-content-w-image--image-left\b/.test(wrapperClasses);
  const imgCol = imageCell.length ? imageCell : '';
  const cells = [imageLeft ? [imgCol, textCell] : [textCell, imgCol]];

  const name = /\bm-content-w-image--sandstone\b/.test(wrapperClasses)
    ? 'columns-bleed-image (sandstone)'
    : 'columns-bleed-image';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
