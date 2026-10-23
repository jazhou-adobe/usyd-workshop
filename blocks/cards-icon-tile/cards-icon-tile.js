import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';

const ICON_TOKEN = /^\s*:([a-z0-9-]+):\s*$/i;

/**
 * Turns a cell whose only text is an `:icon-name:` token into a `span.icon`.
 * The EDS pipeline already does this on aem.page/aem.live; this is a
 * fallback so un-processed markup renders the same.
 * @param {Element} cell
 */
function iconizeToken(cell) {
  if (cell.querySelector('picture, img, .icon')) return;
  const match = cell.textContent.match(ICON_TOKEN);
  if (!match) return;
  const span = document.createElement('span');
  span.className = `icon icon-${match[1].toLowerCase()}`;
  cell.replaceChildren(span);
  decorateIcons(cell);
}

/**
 * cards-icon-tile: transparent link tiles with a large icon above a bold
 * linked title and a chevron. Authoring: one row per tile,
 * [icon image | linked title]. The icon may also be an authored :icon:
 * token/span; a missing icon or link is tolerated.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-icon-tile-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      iconizeToken(div);
      const hasMedia = div.querySelector('picture, img, .icon');
      if (hasMedia && !div.textContent.trim()) div.className = 'cards-icon-tile-card-icon';
      else if (!div.textContent.trim()) div.remove();
      else div.className = 'cards-icon-tile-card-body';
    });
    // keep the icon above the title regardless of authored cell order
    const icon = li.querySelector('.cards-icon-tile-card-icon');
    if (icon) li.prepend(icon);

    const bodies = [...li.querySelectorAll('.cards-icon-tile-card-body')];
    const link = li.querySelector('.cards-icon-tile-card-body :is(h1, h2, h3, h4, h5, h6) a[href]')
      || li.querySelector('.cards-icon-tile-card-body a[href]');
    if (link) {
      // undo the global button decoration: the title is a plain tile link
      link.classList.remove('button', 'primary', 'secondary', 'accent');
      link.closest('.button-wrapper, .button-container')?.classList.remove('button-wrapper', 'button-container');
      link.classList.add('cards-icon-tile-card-link');
      let titleEl = link.closest('p, h1, h2, h3, h4, h5, h6');
      if (!titleEl) {
        // bare link directly in the cell: give it a title paragraph
        titleEl = document.createElement('p');
        link.replaceWith(titleEl);
        titleEl.append(link);
      }
      titleEl.classList.add('cards-icon-tile-card-title');
      // label span carries the hover underline bar
      const label = document.createElement('span');
      label.className = 'cards-icon-tile-card-label';
      label.append(...link.childNodes);
      link.append(label);
      li.classList.add('is-linked');
    } else if (bodies[0]?.firstElementChild) {
      bodies[0].firstElementChild.classList.add('cards-icon-tile-card-title');
    }
    if (li.children.length) ul.append(li);
  });
  // raster icons get optimized; SVG icons are kept as-is
  ul.querySelectorAll('picture > img').forEach((img) => {
    if (/\.svg(\?|$)/i.test(img.src)) return;
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt || '', false, [{ width: '200' }]),
    );
  });
  block.replaceChildren(ul);
}
