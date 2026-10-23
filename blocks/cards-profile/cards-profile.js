import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-profile: person profile rows with a round portrait, a linked name
 * and a position. Authoring: one row per profile, [portrait | name (linked),
 * position]. A missing portrait or link is tolerated.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-profile-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) div.className = 'cards-profile-card-image';
      else if (!div.textContent.trim() && !div.children.length) div.remove();
      else div.className = 'cards-profile-card-body';
    });
    if (!li.querySelector('.cards-profile-card-image')) li.classList.add('no-image');

    // the first link is the name; stretch it over the whole row
    const body = li.querySelector('.cards-profile-card-body');
    const link = body && (body.querySelector(':is(h1, h2, h3, h4, h5, h6) a') || body.querySelector('a'));
    if (link) {
      link.classList.add('cards-profile-card-link');
      const nameEl = link.closest('p, h1, h2, h3, h4, h5, h6');
      if (nameEl) nameEl.classList.add('cards-profile-card-name');
      li.classList.add('is-linked');
    } else if (body && body.firstElementChild) {
      body.firstElementChild.classList.add('cards-profile-card-name');
    }
    if (li.children.length) ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(
    createOptimizedPicture(img.src, img.alt || '', false, [{ width: '200' }]),
  ));
  block.replaceChildren(ul);
}
