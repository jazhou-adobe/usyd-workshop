import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';

const ICON_TOKEN = /^:([a-z0-9-]+):$/;

/**
 * Turns `:icon-name:` text paragraphs into EDS icon spans. The aem.page
 * pipeline normally does this server-side; previews that still carry the
 * raw token are converted here so the icon renders either way.
 * @param {Element} cell
 */
function decorateIconTokens(cell) {
  cell.querySelectorAll(':scope > p').forEach((p) => {
    if (p.children.length) return;
    const match = p.textContent.trim().match(ICON_TOKEN);
    if (!match) return;
    const span = document.createElement('span');
    span.className = `icon icon-${match[1]}`;
    p.replaceChildren(span);
    decorateIcons(p);
  });
}

/**
 * Turns everything after the heading in the title cell into a stat tile.
 * A bold-only paragraph (strong, or a strong link already turned into a
 * button by decorateButtons) is the stat value; if the tile carries one
 * link, the whole tile becomes that link.
 * @param {Element} cell
 * @param {Element[]} nodes elements that follow the heading
 */
function buildStatTile(cell, nodes) {
  const links = nodes.flatMap((n) => [...n.querySelectorAll('a')]);
  const href = links.length && links.every((a) => a.href === links[0].href) ? links[0].href : null;

  const tile = document.createElement(href ? 'a' : 'div');
  tile.className = 'columns-title-left-stat';
  if (href) tile.href = href;

  nodes.forEach((node) => {
    const bold = node.querySelector('strong, b, a.button.primary, a.button.accent');
    const isValue = bold && node.textContent.trim() === bold.textContent.trim();
    // flatten links (and button decoration) when the whole tile links
    if (href) {
      node.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
      node.classList.remove('button-wrapper', 'button-container');
    }
    node.classList.add(isValue ? 'columns-title-left-stat-value' : 'columns-title-left-stat-caption');
    tile.append(node);
  });
  cell.append(tile);
}

/**
 * columns-title-left: narrow title column beside a wide body column.
 * Authoring: each row = [optional icon + heading + optional stat tile
 * (strong value paragraph + caption paragraph) | body copy]. Extra cells
 * are appended to the body column.
 * Layout: an instance alone in its section gets the 30/60 layout and a
 * thin rule when the previous section also ends with this block; several
 * instances stacked in one section get the ruled 1/3 + 2/3 list layout.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-title-left-row');
    const [titleCell, ...bodyCells] = [...row.children];
    if (!titleCell) return;
    titleCell.className = 'columns-title-left-title';
    decorateIconTokens(titleCell);

    // optional icon above the heading (image or :icon: span)
    const heading = titleCell.querySelector('h1, h2, h3, h4, h5, h6');
    const iconEl = titleCell.querySelector('picture, img, span.icon');
    const titleNodes = [...titleCell.querySelectorAll('*')];
    const iconFirst = iconEl
      && (!heading || titleNodes.indexOf(iconEl) < titleNodes.indexOf(heading));
    if (iconFirst) {
      const icon = document.createElement('div');
      icon.className = 'columns-title-left-icon';
      const holder = iconEl.closest('p') || iconEl;
      const img = iconEl.tagName === 'IMG' ? iconEl : iconEl.querySelector('img');
      if (img && !/\.svg(\?|$)/i.test(img.src) && iconEl.tagName === 'PICTURE') {
        icon.append(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '160' }]));
      } else {
        icon.append(iconEl);
      }
      if (iconEl.isConnected && !icon.contains(iconEl)) iconEl.remove();
      if (holder !== iconEl && holder.isConnected && !holder.textContent.trim()) holder.remove();
      titleCell.prepend(icon);
      titleCell.classList.add('has-icon');
    }

    // anything after the heading in the title cell is a stat tile
    if (heading && heading.parentElement === titleCell) {
      const after = [];
      let next = heading.nextElementSibling;
      while (next) {
        if (next.textContent.trim()) after.push(next);
        next = next.nextElementSibling;
      }
      if (after.length) buildStatTile(titleCell, after);
    }

    const body = bodyCells.shift();
    if (body) {
      body.className = 'columns-title-left-body';
      bodyCells.forEach((cell) => {
        body.append(...cell.childNodes);
        cell.remove();
      });
      body.querySelectorAll('picture').forEach((pic) => {
        const img = pic.querySelector('img');
        if (img) pic.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ media: '(min-width: 900px)', width: '900' }, { width: '750' }]));
      });
    } else {
      row.classList.add('no-body');
    }
  });

  const wrapper = block.parentElement;
  const section = wrapper && wrapper.parentElement;
  if (!wrapper || !section) return;

  // several instances in one section: stacked, ruled list layout
  const siblings = [...section.children].filter((el) => el.querySelector(':scope > .columns-title-left'));
  if (siblings.length > 1) {
    block.classList.add('stacked');
    const prevWrapper = wrapper.previousElementSibling;
    if (prevWrapper && siblings.includes(prevWrapper)) block.classList.add('follows-sibling');
    return;
  }

  // single instance whose previous section ends with this block: thin rule
  const prevSection = section.previousElementSibling;
  const prev = prevSection && prevSection.lastElementChild;
  if (prev && prev.querySelector(':scope > .columns-title-left:not(.stacked)')) {
    block.classList.add('follows-sibling');
  }
}
