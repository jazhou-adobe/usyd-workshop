import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * columns-bleed-image: text panel beside an image that bleeds to the
 * viewport edge. Authoring: one row, [text + links | image]. The image
 * cell may be first or second; additional rows repeat the pattern.
 * Image cell first = event/news teaser: the image sits inset inside the
 * band (no bleed/overlap). A short paragraph before the heading becomes a
 * date eyebrow. A single standalone link renders as an underlined text
 * link; two or more become a ruled arrow-link list.
 * Options (block classes): sandstone = sandstone panel colour.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-bleed-image-row');
    const cells = [...row.children];
    cells.forEach((cell) => {
      const pic = cell.querySelector('picture');
      const onlyImage = pic && !cell.textContent.trim();
      if (onlyImage) {
        cell.className = 'columns-bleed-image-img-col';
        const img = pic.querySelector('img');
        if (img) pic.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]));
      } else {
        cell.className = 'columns-bleed-image-text-col';
        // standalone links become a ruled link list
        const linkParas = [...cell.querySelectorAll(':scope > p')].filter((p) => {
          const a = p.querySelector('a');
          return a && p.children.length === 1 && p.textContent.trim() === a.textContent.trim();
        });
        const linkCount = linkParas.length
          + [...cell.querySelectorAll(':scope > ul')].reduce((n, ul) => n + ul.querySelectorAll('a').length, 0);
        if (linkCount === 1 && linkParas.length === 1) {
          // single CTA: underlined text link, undo default button styling
          const p = linkParas[0];
          p.classList.remove('button-container');
          p.classList.add('columns-bleed-image-cta');
          p.querySelector('a').classList.remove('button', 'primary', 'secondary');
        } else {
          linkParas.forEach((p) => p.classList.add('columns-bleed-image-link'));
        }
        // eyebrow (e.g. event date): a short plain paragraph before the heading
        const heading = cell.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4');
        if (heading) {
          let prev = heading.previousElementSibling;
          while (prev) {
            if (prev.tagName === 'P' && !prev.querySelector('a, picture')) prev.classList.add('columns-bleed-image-eyebrow');
            prev = prev.previousElementSibling;
          }
        }
        cell.querySelectorAll(':scope > ul').forEach((ul) => {
          if ([...ul.children].every((li) => li.querySelector('a'))) ul.classList.add('columns-bleed-image-links');
        });
      }
    });
    if (cells.length > 1 && cells[0].classList.contains('columns-bleed-image-img-col')) row.classList.add('image-first');
  });
}
