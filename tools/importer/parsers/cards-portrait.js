/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-portrait (sydney.edu.au .m-bespoke-layout--bg-white .m-bespoke-layout--3-cols).
 * Block table: 2 columns, one row per card: [portrait image | linked heading + description].
 * Each card is a .m-wrapper-card; the link URL comes from its raw data div
 * (first child <div> containing <a href>), visible content from .m-card.
 * The section "Explore" H2 sits outside the element and is left as default content.
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
  const cells = [];
  const cards = [...element.querySelectorAll('.m-wrapper-card')];

  cards.forEach((card) => {
    const visible = card.querySelector('.m-card') || card;
    const dataDiv = [...card.children].find((c) => c.tagName === 'DIV' && !c.classList.contains('m-card'));

    // Image
    let imageCell = '';
    const srcImg = visible.querySelector('.m-card__image-wrapper img, img');
    if (srcImg && srcImg.getAttribute('src')) {
      const img = document.createElement('img');
      img.src = absUrl(srcImg.getAttribute('src'));
      img.alt = srcImg.getAttribute('alt') || '';
      imageCell = img;
    }

    // Link (from visible card first, then raw data div)
    const linkEl = visible.querySelector('a[href]') || (dataDiv && dataDiv.querySelector('a[href]'));
    const href = linkEl ? absUrl(linkEl.getAttribute('href')) : null;

    // Title
    const srcTitle = visible.querySelector('.m-card__title') || (dataDiv && dataDiv.querySelector('h1, h2, h3, h4'));
    const titleText = srcTitle ? srcTitle.textContent.trim() : '';

    const body = [];
    if (titleText) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = titleText;
        h3.append(a);
      } else {
        h3.textContent = titleText;
      }
      body.push(h3);
    }

    // Description
    const desc = visible.querySelector('.m-card__description')
      || (dataDiv && [...dataDiv.querySelectorAll('div')].find((d) => d.querySelector('p')));
    if (desc) {
      const ps = [...desc.querySelectorAll('p')].filter((p) => p.textContent.trim());
      if (ps.length) {
        ps.forEach((p) => {
          const np = document.createElement('p');
          np.innerHTML = p.innerHTML.trim();
          body.push(np);
        });
      } else if (desc.textContent.trim()) {
        const np = document.createElement('p');
        np.textContent = desc.textContent.trim();
        body.push(np);
      }
    }

    if (imageCell || body.length) cells.push([imageCell, body.length ? body : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-portrait', cells });
  element.replaceWith(block);
}
