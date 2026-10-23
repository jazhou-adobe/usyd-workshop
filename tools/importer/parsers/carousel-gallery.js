/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-gallery (sydney.edu.au .cmp-wrapper-carousel).
 * Block table: one row per slide, two columns:
 *   photo slide: [image | caption paragraph]
 *   quote slide: [empty | quotation paragraph, bold-only name paragraph, position paragraph]
 * Slide order follows the indicator buttons (`{id}-tab` -> `{id}-tabpanel`), which keep the
 * authored order even when swiper loop mode has rotated the slides in the DOM. Swiper clones
 * (.swiper-slide-duplicate / repeated ids) are skipped. Lazy images prefer data-src.
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

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function stripQuotes(text) {
  return clean(text)
    .replace(/^["“”‘'\s]+/, '')
    .replace(/["“”’'\s]+$/, '');
}

function realSrc(img) {
  if (!img) return '';
  const candidates = [
    img.getAttribute('data-src'),
    img.getAttribute('data-lazy-src'),
    img.getAttribute('src'),
  ];
  const srcset = img.getAttribute('data-srcset') || img.getAttribute('srcset');
  if (srcset) candidates.push(srcset.split(',')[0].trim().split(/\s+/)[0]);
  const src = candidates.find((s) => s && !s.trim().startsWith('data:'));
  return src ? absUrl(src) : '';
}

function para(document, text, bold = false) {
  const p = document.createElement('p');
  if (bold) {
    const strong = document.createElement('strong');
    strong.textContent = text;
    p.append(strong);
  } else {
    p.textContent = text;
  }
  return p;
}

function orderedSlides(element) {
  const all = [...element.querySelectorAll('.cmp-carousel__item')]
    .filter((s) => !s.classList.contains('swiper-slide-duplicate'));

  // de-duplicate by id, keep first occurrence
  const seen = new Set();
  const unique = all.filter((s) => {
    const id = s.getAttribute('id');
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  // reorder by indicator buttons when they cover every slide
  const indicators = [...element.querySelectorAll('.cmp-carousel__indicator[id]')];
  if (indicators.length === unique.length) {
    const byId = new Map(unique.map((s) => [s.getAttribute('id'), s]));
    const ordered = indicators
      .map((btn) => byId.get(btn.getAttribute('id').replace(/-tab$/, '-tabpanel')))
      .filter(Boolean);
    if (ordered.length === unique.length) return ordered;
  }
  return unique;
}

function quoteRow(slide, document) {
  const raw = slide.querySelector('.m-hidden');
  const visible = slide.querySelector('.m-testimonial') || slide;
  let name = '';
  let position = '';
  const quotes = [];

  const h = raw && raw.querySelector('h1, h2, h3, h4, h5, h6');
  if (raw) {
    [...raw.children].forEach((n) => {
      if (n.tagName !== 'P') return;
      if (h && (h.compareDocumentPosition(n) & 4)) {
        if (!position) position = clean(n.textContent);
        return;
      }
      const t = stripQuotes(n.textContent);
      if (t) quotes.push(t);
    });
    if (h) name = clean(h.textContent);
  }
  if (!quotes.length) {
    visible.querySelectorAll('.m-testimonial__quote').forEach((q) => {
      const t = stripQuotes(q.textContent);
      if (t) quotes.push(t);
    });
  }
  if (!name) name = clean((visible.querySelector('.m-testimonial__profile-name, cite') || {}).textContent);
  if (!position) position = clean((visible.querySelector('.m-testimonial__profile-designation') || {}).textContent);

  const content = quotes.map((t) => para(document, t));
  if (name) content.push(para(document, name, true));
  if (position) content.push(para(document, position));
  return content.length ? ['', content] : null;
}

function photoRow(slide, document) {
  const srcImg = slide.querySelector('.cmp-image img, img');
  const src = realSrc(srcImg);
  let caption = clean((slide.querySelector('.cmp-image__title') || {}).textContent);
  if (!caption) {
    const rawP = slide.querySelector('.m-hidden p');
    if (rawP) caption = clean(rawP.textContent);
  }
  if (!src && !caption) return null;

  let imgCell = '';
  if (src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = clean(srcImg.getAttribute('alt')) || caption || '';
    imgCell = img;
  }
  return [imgCell, caption ? [para(document, caption)] : ''];
}

export default function parse(element, { document }) {
  const cells = [];
  orderedSlides(element).forEach((slide) => {
    const isQuote = slide.querySelector('.m-wrapper-testimonial, .m-testimonial');
    const row = isQuote ? quoteRow(slide, document) : photoRow(slide, document);
    if (row) cells.push(row);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
