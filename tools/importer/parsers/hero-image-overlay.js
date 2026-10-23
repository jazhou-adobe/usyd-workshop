/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-image-overlay (sydney.edu.au .m-wrapper-hero.m-hero--style-1).
 * Block table (1 column):
 *   row 1: background image
 *   row 2: H1 title, subheading paragraph, optional CTA link (own paragraph)
 * Reads the rendered desktop hero (.m-hero--desktop); falls back to the raw
 * data div (first unclassed child div) when the rendered markup is missing.
 * The source has a visually hidden H1 plus a visible H2 with the same text;
 * only one H1 is emitted.
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
  const hero = element.querySelector('.m-hero--desktop') || element;
  const dataDiv = [...element.children].find((c) => c.tagName === 'DIV' && !c.className && !c.querySelector('.m-hero'));

  // --- Image ---
  let image = null;
  const srcImg = hero.querySelector('.m-hero--desktop__image-wrapper img:not([src^="data:"]), img:not([src^="data:"])');
  if (srcImg) {
    image = document.createElement('img');
    image.src = absUrl(srcImg.getAttribute('src'));
    image.alt = srcImg.getAttribute('alt') || '';
  } else if (dataDiv) {
    const pathP = [...dataDiv.querySelectorAll(':scope > p')]
      .find((p) => /\/content\/dam\/.+\.(jpe?g|png|webp|gif)$/i.test(p.textContent.trim()));
    if (pathP) {
      image = document.createElement('img');
      image.src = absUrl(pathP.textContent.trim());
      image.alt = '';
    }
  }

  // --- Title ---
  const srcTitle = hero.querySelector('.m-hero--desktop__title')
    || hero.querySelector('h1')
    || (dataDiv && dataDiv.querySelector('h1, h2'));
  let title = null;
  if (srcTitle && srcTitle.textContent.trim()) {
    title = document.createElement('h1');
    title.textContent = srcTitle.textContent.trim();
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

  // --- CTAs ---
  const ctas = [];
  const seen = new Set();
  const addCta = (href, text) => {
    if (!href || !text || seen.has(href + text)) return;
    seen.add(href + text);
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = absUrl(href);
    link.textContent = text;
    p.append(link);
    ctas.push(p);
  };
  hero.querySelectorAll('.m-hero--desktop__cta a[href]').forEach((a) => {
    addCta(a.getAttribute('href'), (a.querySelector('.cmp-button__text') || a).textContent.trim());
  });
  if (!ctas.length && dataDiv) {
    dataDiv.querySelectorAll('ul > li').forEach((li) => {
      const spans = li.querySelectorAll('span');
      if (spans.length >= 2) addCta(spans[0].textContent.trim(), spans[1].textContent.trim());
    });
  }

  const cells = [];
  if (image) cells.push([image]);
  const content = [];
  if (title) content.push(title);
  content.push(...descriptions, ...ctas);
  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-image-overlay', cells });
  element.replaceWith(block);
}
