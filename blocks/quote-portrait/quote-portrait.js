import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * quote-portrait: compact testimonial with a round portrait, the quotation
 * and an attribution (bold name + position).
 * Authoring: row 1 = portrait image, row 2 = quotation paragraph(s),
 * row 3 = name (strong) + position paragraph. Any row may be missing; with
 * only two text rows the last one is treated as the attribution.
 * @param {Element} block
 */
export default function decorate(block) {
  const figure = document.createElement('figure');
  figure.className = 'quote-portrait-figure';

  const picture = block.querySelector('picture');
  if (picture) {
    const portrait = document.createElement('div');
    portrait.className = 'quote-portrait-image';
    const img = picture.querySelector('img');
    portrait.append(img
      ? createOptimizedPicture(img.src, img.alt || '', false, [{ width: '240' }])
      : picture);
    const parentP = picture.parentElement;
    picture.remove();
    if (parentP && parentP.tagName === 'P' && !parentP.textContent.trim() && !parentP.children.length) parentP.remove();
    figure.append(portrait);
  }

  const textCells = [...block.querySelectorAll(':scope > div > div')]
    .filter((cell) => cell.textContent.trim());

  // attribution: the last text cell when there are 2+ cells, or a cell
  // that starts with a strong-only paragraph
  let attributionCell = null;
  if (textCells.length > 1) {
    attributionCell = textCells[textCells.length - 1];
  } else if (textCells.length === 1) {
    const ps = [...textCells[0].querySelectorAll(':scope > p')];
    const nameIdx = ps.findIndex((p, i) => i > 0 && p.querySelector('strong') && p.textContent.trim() === p.querySelector('strong').textContent.trim());
    if (nameIdx > 0) {
      attributionCell = document.createElement('div');
      attributionCell.append(...ps.slice(nameIdx));
    }
  }

  const quote = document.createElement('blockquote');
  quote.className = 'quote-portrait-quote';
  textCells.filter((c) => c !== attributionCell).forEach((cell) => {
    [...cell.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.textContent.trim()) return;
        const p = document.createElement('p');
        p.textContent = node.textContent.trim();
        quote.append(p);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        quote.append(node);
      }
    });
  });
  if (quote.children.length) figure.append(quote);

  if (attributionCell) {
    const caption = document.createElement('figcaption');
    caption.className = 'quote-portrait-attribution';
    [...attributionCell.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.textContent.trim()) return;
        const p = document.createElement('p');
        p.textContent = node.textContent.trim();
        caption.append(p);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        caption.append(node);
      }
    });
    const first = caption.firstElementChild;
    if (first) first.classList.add('quote-portrait-name');
    figure.append(caption);
  }

  block.replaceChildren(figure);
}
