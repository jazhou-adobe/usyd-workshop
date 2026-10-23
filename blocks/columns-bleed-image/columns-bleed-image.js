import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * columns-bleed-image: text panel beside an image that bleeds to the
 * viewport edge. Authoring: one row, [text + links | image]. The image
 * cell may be first or second; additional rows repeat the pattern.
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
        linkParas.forEach((p) => p.classList.add('columns-bleed-image-link'));
        cell.querySelectorAll(':scope > ul').forEach((ul) => {
          if ([...ul.children].every((li) => li.querySelector('a'))) ul.classList.add('columns-bleed-image-links');
        });
      }
    });
    if (cells.length && cells[0].classList.contains('columns-bleed-image-img-col')) row.classList.add('image-first');
  });
}
