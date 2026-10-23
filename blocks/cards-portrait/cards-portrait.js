import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-portrait: tall portrait-image cards where the whole card is
 * clickable. Authoring: one row per card, [image | title (linked) +
 * description]. Missing image or body cells are tolerated.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-portrait-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) div.className = 'cards-portrait-card-image';
      else div.className = 'cards-portrait-card-body';
    });
    // whole-card link: prefer the heading link, else the first link
    const link = li.querySelector('.cards-portrait-card-body :is(h1, h2, h3, h4, h5, h6) a')
      || li.querySelector('.cards-portrait-card-body a');
    if (link) {
      link.classList.add('cards-portrait-card-link');
      li.classList.add('is-linked');
    }
    if (li.children.length) ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(
    createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]),
  ));
  block.replaceChildren(ul);
}
