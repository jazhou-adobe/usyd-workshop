import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-speaker: stacked speaker rows with a photo left and a name heading
 * plus bio right, thin rules between rows. Authoring: one row per speaker,
 * [photo | H3 name, bio paragraphs]. The photo cell may be empty or
 * missing; such rows render text-only at full width.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-speaker-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) div.className = 'cards-speaker-card-image';
      else if (!div.textContent.trim() && !div.querySelector('picture')) div.remove();
      else div.className = 'cards-speaker-card-body';
    });
    // keep the photo first regardless of authored cell order
    const image = li.querySelector('.cards-speaker-card-image');
    if (image) li.prepend(image);
    else li.classList.add('no-image');
    if (li.children.length) ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(
    createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]),
  ));
  block.replaceChildren(ul);
}
