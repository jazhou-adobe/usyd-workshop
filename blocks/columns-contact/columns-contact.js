import { decorateIcons } from '../../scripts/aem.js';

const ICON_TOKEN = /^\s*:([a-z0-9-]+):\s*/i;

/**
 * Converts leading `:icon-name:` text tokens into `span.icon` elements.
 * The EDS pipeline already does this on aem.page/aem.live; this is a
 * fallback so un-processed markup renders the same.
 * @param {Element} cell
 */
function iconizeTokens(cell) {
  let found = false;
  cell.querySelectorAll(':scope > p, :scope > ul > li').forEach((item) => {
    const first = item.firstChild;
    if (!first || first.nodeType !== Node.TEXT_NODE) return;
    const match = first.textContent.match(ICON_TOKEN);
    if (!match) return;
    first.textContent = first.textContent.slice(match[0].length);
    const span = document.createElement('span');
    span.className = `icon icon-${match[1].toLowerCase()}`;
    item.prepend(span);
    found = true;
  });
  if (found) decorateIcons(cell);
}

/**
 * Makes the icon part of the link (whole row clickable, as on the source)
 * and exposes the icon file as a CSS mask so it can be tinted.
 * @param {Element} item paragraph or list item holding an icon and a link
 */
function decorateIconLink(item) {
  item.classList.add('columns-contact-icon-link');
  const a = item.querySelector('a');
  const icon = item.querySelector('.icon');
  if (!a || !icon) return;
  if (!a.contains(icon)) a.prepend(icon);
  const img = icon.querySelector('img');
  if (img && img.src) icon.style.setProperty('--icon-mask', `url("${img.src}")`);
  [...item.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node.remove();
  });
  [...a.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const label = document.createElement('span');
      label.className = 'columns-contact-icon-link-label';
      label.textContent = node.textContent.trim();
      node.replaceWith(label);
    }
  });
}

/**
 * columns-contact: contact band with up to three columns
 * [heading | icon link list | contact headings + mailto links].
 * Authoring: one row; any number of cells (2-4 work). Cells are tagged
 * by content so missing/extra cells degrade gracefully.
 * @param {Element} block
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const colCount = firstRow ? firstRow.children.length : 0;
  block.classList.add(`columns-contact-${colCount}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-contact-row');
    [...row.children].forEach((cell) => {
      cell.classList.add('columns-contact-col');
      iconizeTokens(cell);
      const links = [...cell.querySelectorAll('a')];
      const hasMailto = links.some((a) => a.href.startsWith('mailto:'));
      const hasIcons = cell.querySelector('.icon, picture, img');
      if (hasMailto) cell.classList.add('columns-contact-col-email');
      else if (links.length && hasIcons) cell.classList.add('columns-contact-col-icon-links');
      else if (cell.querySelector('h1, h2, h3, h4, h5, h6') && !links.length) cell.classList.add('columns-contact-col-heading');

      // icon links: paragraphs/list items that pair an icon with a link
      cell.querySelectorAll(':scope > p, :scope > ul > li').forEach((item) => {
        if (item.querySelector('a') && item.querySelector('.icon, picture, img')) {
          decorateIconLink(item);
        }
      });
      cell.querySelectorAll(':scope > ul').forEach((ul) => ul.classList.add('columns-contact-list'));
    });
  });
}
