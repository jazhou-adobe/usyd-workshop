import { createOptimizedPicture } from '../../scripts/aem.js';

const PAGE_SIZE = 10;

/**
 * Builds a pagination button.
 * @param {string} label visible text (empty for arrow buttons)
 * @param {string} className
 * @param {string} [ariaLabel]
 * @returns {HTMLButtonElement}
 */
function createButton(label, className, ariaLabel) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  if (label) button.textContent = label;
  if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
  return button;
}

/**
 * Renders the pagination controls for the current page and shows only
 * that page's items.
 * @param {Element} block
 * @param {HTMLLIElement[]} items
 * @param {HTMLElement} nav
 * @param {number} page 1-based page number
 * @param {boolean} [focus] move focus to the active page after re-render
 */
function showPage(block, items, nav, page, focus = false) {
  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const current = Math.min(Math.max(page, 1), pageCount);
  items.forEach((item, i) => {
    item.hidden = Math.floor(i / PAGE_SIZE) + 1 !== current;
  });

  const list = document.createElement('ul');
  list.className = 'cards-news-list-pagination-list';
  const addItem = (el) => {
    const li = document.createElement('li');
    li.append(el);
    list.append(li);
  };

  const go = (target) => {
    showPage(block, items, nav, target, true);
    const { top } = block.getBoundingClientRect();
    if (top < 0) block.scrollIntoView({ block: 'start' });
  };

  if (current > 1) {
    const prev = createButton('', 'cards-news-list-page cards-news-list-prev', 'Previous page');
    prev.addEventListener('click', () => go(current - 1));
    addItem(prev);
  }
  for (let p = 1; p <= pageCount; p += 1) {
    if (p === current) {
      const active = document.createElement('span');
      active.className = 'cards-news-list-page is-active';
      active.setAttribute('aria-current', 'page');
      active.tabIndex = -1;
      active.textContent = p;
      addItem(active);
    } else {
      const btn = createButton(String(p), 'cards-news-list-page', `Page ${p}`);
      btn.addEventListener('click', () => go(p));
      addItem(btn);
    }
  }
  if (current < pageCount) {
    const next = createButton('', 'cards-news-list-page cards-news-list-next', 'Next page');
    next.addEventListener('click', () => go(current + 1));
    addItem(next);
  }
  nav.replaceChildren(list);
  if (focus) nav.querySelector('.is-active')?.focus({ preventScroll: true });
}

/**
 * cards-news-list: vertical list of articles, image left, linked H3 title
 * and summary right, paginated client-side (10 per page) when there are
 * more than 10 items. Authoring: one row per article,
 * [image | H3 title (linked), summary]. Missing image/link is tolerated.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-news-list-items';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-news-list-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) div.className = 'cards-news-list-card-image';
      else if (!div.textContent.trim() && !div.querySelector('picture')) div.remove();
      else div.className = 'cards-news-list-card-body';
    });
    const image = li.querySelector('.cards-news-list-card-image');
    if (image) li.prepend(image);
    else li.classList.add('no-image');

    const link = li.querySelector('.cards-news-list-card-body :is(h1, h2, h3, h4, h5, h6) a')
      || li.querySelector('.cards-news-list-card-body a');
    if (link) {
      link.classList.remove('button', 'primary', 'secondary');
      const container = link.closest('.button-container');
      if (container) container.classList.remove('button-container');
      link.classList.add('cards-news-list-card-link');
      li.classList.add('is-linked');
    }
    if (li.children.length) ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(
    createOptimizedPicture(img.src, img.alt || '', false, [{ width: '400' }]),
  ));
  block.replaceChildren(ul);

  const items = [...ul.children];
  if (items.length > PAGE_SIZE) {
    const nav = document.createElement('nav');
    nav.className = 'cards-news-list-pagination';
    nav.setAttribute('aria-label', 'Pagination');
    block.append(nav);
    showPage(block, items, nav, 1);
  }
}
