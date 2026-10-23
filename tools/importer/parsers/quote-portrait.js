/* eslint-disable */
/* global WebImporter */

/**
 * Parser for quote-portrait (sydney.edu.au .m-wrapper-testimonial.m-testimonial--compact).
 * Block table (one column, three rows):
 *   row 1 = portrait image
 *   row 2 = quotation paragraph(s), without surrounding quote marks
 *   row 3 = name (strong) paragraph + position paragraph
 * Prefers the raw authored data in `.m-hidden` (img, p, h5 name, p position);
 * falls back to the rendered `.m-testimonial` markup.
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

function stripQuotes(text) {
  return text.replace(/\s+/g, ' ').trim()
    .replace(/^["“”‘'\s]+/, '')
    .replace(/["“”’'\s]+$/, '');
}

function imgSrc(img) {
  if (!img) return '';
  const src = img.getAttribute('data-src') || img.getAttribute('src') || '';
  if (src.startsWith('data:')) return '';
  return absUrl(src);
}

export default function parse(element, { document }) {
  const raw = element.querySelector('.m-hidden');
  const visible = element.querySelector('.m-testimonial') || element;

  // --- portrait image ---
  const srcImg = visible.querySelector('.m-testimonial__profile-image img, img')
    || (raw && raw.querySelector('img'));
  let src = imgSrc(srcImg);
  if (!src && raw) src = imgSrc(raw.querySelector('img'));

  // --- name / position ---
  let name = '';
  let position = '';
  const visName = visible.querySelector('.m-testimonial__profile-name, cite');
  const visPos = visible.querySelector('.m-testimonial__profile-designation');
  if (raw && raw.querySelector('h1, h2, h3, h4, h5, h6')) {
    const h = raw.querySelector('h1, h2, h3, h4, h5, h6');
    name = h.textContent.replace(/\s+/g, ' ').trim();
    const after = [...raw.children].slice([...raw.children].indexOf(h) + 1).find((n) => n.tagName === 'P');
    if (after) position = after.textContent.replace(/\s+/g, ' ').trim();
  }
  if (!name && visName) name = visName.textContent.replace(/\s+/g, ' ').trim();
  if (!position && visPos) position = visPos.textContent.replace(/\s+/g, ' ').trim();

  // --- quotation ---
  const quoteTexts = [];
  if (raw) {
    const h = raw.querySelector('h1, h2, h3, h4, h5, h6');
    [...raw.children].forEach((n) => {
      if (n.tagName !== 'P') return;
      if (h && (h.compareDocumentPosition(n) & 4)) return; // paragraphs after the name are the position
      const t = stripQuotes(n.textContent);
      if (t) quoteTexts.push(t);
    });
  }
  if (!quoteTexts.length) {
    visible.querySelectorAll('.m-testimonial__quote').forEach((q) => {
      const t = stripQuotes(q.textContent);
      if (t) quoteTexts.push(t);
    });
  }

  const cells = [];

  if (src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = (srcImg && srcImg.getAttribute('alt')) || name || '';
    cells.push([img]);
  }

  if (quoteTexts.length) {
    cells.push([quoteTexts.map((t) => {
      const p = document.createElement('p');
      p.textContent = t;
      return p;
    })]);
  }

  const attribution = [];
  if (name) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = name;
    p.append(strong);
    attribution.push(p);
  }
  if (position) {
    const p = document.createElement('p');
    p.textContent = position;
    attribution.push(p);
  }
  if (attribution.length) cells.push([attribution]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-portrait', cells });
  element.replaceWith(block);
}
