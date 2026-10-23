/**
 * tabs-underline: accessible tablist with an underline active indicator.
 * Authoring: one row per tab, [tab label | panel content (paragraphs, lists)].
 * Rows without a label are skipped; a row with a single cell uses it as the label
 * and gets an empty panel. When the tabs overflow (mobile) prev/next scroll
 * buttons are shown, matching the source swiper behaviour.
 * @param {Element} block
 */

let tabsId = 0;

const CHEVRON = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M5.5 0.75L16.22 11.47a.75.75 0 0 1 0 1.06L5.5 23.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const BLOCK_TAGS = 'p, ul, ol, h1, h2, h3, h4, h5, h6, div, table, blockquote, pre, picture';

/**
 * Wraps bare inline content of a cell in a paragraph so panels with plain
 * text get the same paragraph spacing as authored paragraphs.
 * @param {Element} cell
 * @returns {Node[]}
 */
function cellContent(cell) {
  const nodes = [...cell.childNodes];
  const hasBlock = nodes.some((n) => n.nodeType === Node.ELEMENT_NODE && n.matches(BLOCK_TAGS));
  if (hasBlock || !cell.textContent.trim()) return nodes;
  const p = document.createElement('p');
  p.append(...nodes);
  return [p];
}

function createScrollButton(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `tabs-underline-scroll tabs-underline-scroll-${direction}`;
  button.setAttribute('aria-label', label);
  button.tabIndex = -1;
  button.hidden = true;
  button.innerHTML = CHEVRON;
  return button;
}

export default function decorate(block) {
  tabsId += 1;
  const id = tabsId;
  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.children.length && row.firstElementChild.textContent.trim());

  const tablist = document.createElement('div');
  tablist.className = 'tabs-underline-list';
  tablist.setAttribute('role', 'tablist');

  const panels = rows.map((row, idx) => {
    const [labelCell, ...contentCells] = [...row.children];
    const tabId = `tabs-underline-${id}-tab-${idx}`;
    const panelId = `tabs-underline-${id}-panel-${idx}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-underline-tab';
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);
    // keep inline formatting but drop block wrappers from the label
    const labelSource = labelCell.querySelector('p, h1, h2, h3, h4, h5, h6') || labelCell;
    tab.innerHTML = labelSource.innerHTML;
    tab.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
    tablist.append(tab);

    const panel = document.createElement('div');
    panel.className = 'tabs-underline-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.tabIndex = 0;
    contentCells.forEach((cell) => panel.append(...cellContent(cell)));
    return { tab, panel };
  });

  const select = (index, focus = false) => {
    panels.forEach(({ tab, panel }, idx) => {
      const active = idx === index;
      tab.setAttribute('aria-selected', active);
      tab.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
      if (active) {
        if (focus) tab.focus({ preventScroll: true });
        // keep the selected tab visible inside the horizontal tablist only
        const list = tablist.getBoundingClientRect();
        const rect = tab.getBoundingClientRect();
        if (rect.left < list.left) tablist.scrollBy({ left: rect.left - list.left });
        else if (rect.right > list.right) tablist.scrollBy({ left: rect.right - list.right });
      }
    });
  };

  tablist.addEventListener('click', (e) => {
    const tab = e.target.closest('.tabs-underline-tab');
    if (!tab) return;
    select(panels.findIndex((p) => p.tab === tab));
  });

  tablist.addEventListener('keydown', (e) => {
    const current = panels.findIndex(({ tab }) => tab === document.activeElement);
    if (current < 0) return;
    let next;
    if (e.key === 'ArrowRight') next = (current + 1) % panels.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + panels.length) % panels.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = panels.length - 1;
    else return;
    e.preventDefault();
    select(next, true);
  });

  // overflow scroll buttons (source shows a chevron with a white fade on mobile)
  const prev = createScrollButton('prev', 'Scroll tabs left');
  const next = createScrollButton('next', 'Scroll tabs right');
  const nav = document.createElement('div');
  nav.className = 'tabs-underline-nav';
  nav.append(tablist, prev, next);

  const updateScrollButtons = () => {
    const max = tablist.scrollWidth - tablist.clientWidth;
    prev.hidden = tablist.scrollLeft <= 1;
    next.hidden = max <= 1 || tablist.scrollLeft >= max - 1;
  };

  const scrollTabs = (dir) => {
    const { left, right } = tablist.getBoundingClientRect();
    const tabs = panels.map(({ tab }) => tab);
    const target = dir > 0
      ? tabs.find((t) => t.getBoundingClientRect().right > right + 1)
      : tabs.reverse().find((t) => t.getBoundingClientRect().left < left - 1);
    if (!target) return;
    const offset = dir > 0
      ? target.getBoundingClientRect().left - left
      : target.getBoundingClientRect().right - right;
    tablist.scrollBy({ left: offset, behavior: 'smooth' });
  };

  prev.addEventListener('click', () => scrollTabs(-1));
  next.addEventListener('click', () => scrollTabs(1));
  tablist.addEventListener('scroll', updateScrollButtons, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(updateScrollButtons).observe(tablist);

  const panelsWrapper = document.createElement('div');
  panelsWrapper.className = 'tabs-underline-panels';
  panelsWrapper.append(...panels.map(({ panel }) => panel));

  block.replaceChildren(nav, panelsWrapper);
  if (panels.length) select(0);
  updateScrollButtons();
}
