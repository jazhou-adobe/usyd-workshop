/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-orange-band (sydney.edu.au .m-wrapper-hero.m-hero--style-2).
 * Block table (1 column):
 *   row 1: background image
 *   row 2: H1 title, subheading paragraph(s), CTA link paragraph
 * Reads only the rendered desktop hero (.m-hero--desktop) to avoid duplicating
 * the raw data div / any mobile variant; falls back to the data div if needed.
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
  const hero = element.querySelector('.m-hero--desktop, .m-hero') || element;
  // Raw data div (first child without class) – fallback source only
  const dataDiv = [...element.children].find((c) => c.tagName === 'DIV' && !c.className);

  // --- Image ---
  let image = null;
  const srcImg = hero.querySelector('.m-hero--desktop__image-wrapper img, img');
  if (srcImg) {
    image = document.createElement('img');
    image.src = absUrl(srcImg.getAttribute('src'));
    image.alt = srcImg.getAttribute('alt') || '';
  } else if (dataDiv) {
    const pathP = [...dataDiv.querySelectorAll(':scope > p')]
      .find((p) => /\/content\/dam\/.+\.(jpe?g|png|webp|gif|svg)$/i.test(p.textContent.trim()));
    if (pathP) {
      image = document.createElement('img');
      image.src = absUrl(pathP.textContent.trim());
      image.alt = '';
    }
  }

  // --- Title ---
  let title = null;
  const srcTitle = hero.querySelector('.m-hero--desktop__title, h1');
  const titleText = srcTitle
    ? srcTitle.textContent.trim()
    : (dataDiv && dataDiv.querySelector('h1, h2') ? dataDiv.querySelector('h1, h2').textContent.trim() : '');
  if (titleText) {
    title = document.createElement('h1');
    title.textContent = titleText;
  }

  // --- Subheading ---
  const descriptions = [];
  const descWrap = hero.querySelector('.m-hero--desktop__description')
    || (dataDiv && dataDiv.querySelector(':scope > div'));
  if (descWrap) {
    const ps = [...descWrap.querySelectorAll('p')].filter((p) => p.textContent.trim());
    if (ps.length) {
      ps.forEach((p) => {
        const np = document.createElement('p');
        np.innerHTML = p.innerHTML.trim();
        descriptions.push(np);
      });
    } else if (descWrap.textContent.trim()) {
      const np = document.createElement('p');
      np.textContent = descWrap.textContent.trim();
      descriptions.push(np);
    }
  }

  // --- CTA ---
  const ctas = [];
  const ctaLinks = [...hero.querySelectorAll('.m-hero--desktop__cta a[href], .m-hero--desktop__cta-wrapper a[href]')];
  const seen = new Set();
  ctaLinks.forEach((a) => {
    const href = absUrl(a.getAttribute('href'));
    const text = (a.querySelector('.cmp-button__text') || a).textContent.trim();
    if (!href || !text || seen.has(href + text)) return;
    seen.add(href + text);
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    p.append(link);
    ctas.push(p);
  });
  if (!ctas.length && dataDiv) {
    dataDiv.querySelectorAll('ul > li').forEach((li) => {
      const spans = li.querySelectorAll('span');
      if (spans.length >= 2 && spans[0].textContent.trim() && spans[1].textContent.trim()) {
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = absUrl(spans[0].textContent.trim());
        link.textContent = spans[1].textContent.trim();
        p.append(link);
        ctas.push(p);
      }
    });
  }

  const cells = [];
  if (image) cells.push([image]);
  const content = [];
  if (title) content.push(title);
  content.push(...descriptions, ...ctas);
  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-orange-band', cells });
  element.replaceWith(block);
}
