// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

// delay before a hovered nav item opens its dropdown (matches source hover intent)
const HOVER_DELAY = 250;

/**
 * Fetches the nav fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA/EDS).
 * @returns {Promise<HTMLElement|null>} container holding the fragment sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const container = document.createElement('div');
  container.innerHTML = await resp.text();
  // fragment image paths are relative to the fragment, not the current page
  container.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  // DA wraps the label of a list item that has a sub-list in <p>; unwrap it so
  // items read the same as hand-written markup (li > a + ul)
  container.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
  return container;
}

/**
 * Creates a button with a visually hidden or visible label.
 * @param {string} className class for the button
 * @param {string} label accessible label
 * @returns {HTMLButtonElement}
 */
function createButton(className, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  button.innerHTML = '<span class="nav-icon" aria-hidden="true"></span>';
  return button;
}

/**
 * Closes every open dropdown panel in the nav sections.
 * @param {Element} sections nav sections container
 * @param {Element} [except] item to leave open
 */
function closeAllPanels(sections, except) {
  sections.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((item) => {
    if (item !== except) item.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Builds the dropdown panel for a top-level item: heading (the item label) + link grid.
 * @param {Element} item top-level li
 * @param {Element} sections nav sections container
 */
function decorateDropdown(item, sections) {
  const link = item.querySelector(':scope > a');
  const list = item.querySelector(':scope > ul');
  if (!link || !list) return;
  item.classList.add('nav-drop');
  item.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  const inner = document.createElement('div');
  inner.className = 'nav-panel-inner';
  const heading = document.createElement('h2');
  heading.className = 'nav-panel-title';
  heading.textContent = link.textContent.trim();
  list.classList.add('nav-panel-links');
  inner.append(heading, list);
  panel.append(inner);
  item.append(panel);

  let timer;
  const open = () => {
    closeAllPanels(sections, item);
    item.setAttribute('aria-expanded', 'true');
  };
  const close = () => item.setAttribute('aria-expanded', 'false');

  item.addEventListener('mouseenter', () => {
    if (!isDesktop.matches) return;
    clearTimeout(timer);
    timer = setTimeout(open, HOVER_DELAY);
  });
  item.addEventListener('mouseleave', () => {
    if (!isDesktop.matches) return;
    clearTimeout(timer);
    close();
  });
  // keyboard users open the panel by focusing into the item
  item.addEventListener('focusin', () => { if (isDesktop.matches) open(); });
  item.addEventListener('focusout', (e) => {
    if (isDesktop.matches && !item.contains(e.relatedTarget)) close();
  });
}

/**
 * Builds the search panel (title, scope options, input, submit) from the search section.
 * Scope links in the fragment carry the search URL and scope value in their href.
 * @param {Element} section search section from the fragment
 * @returns {{panel: HTMLElement, toggle: HTMLButtonElement}}
 */
function buildSearch(section) {
  const title = section.querySelector('h1, h2, h3, h4, h5, h6');
  const placeholder = section.querySelector('p');
  const scopes = [...section.querySelectorAll('li > a')];
  const action = scopes[0] ? scopes[0].href.split('#')[0] : '/search';

  const panel = document.createElement('div');
  panel.className = 'nav-search';
  panel.id = 'nav-search';
  panel.hidden = true;

  const inner = document.createElement('div');
  inner.className = 'nav-search-inner';

  const closeBtn = createButton('nav-search-close', 'Close search');

  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.setAttribute('role', 'search');
  form.action = action;

  const head = document.createElement('div');
  head.className = 'nav-search-head';
  const label = document.createElement('label');
  label.className = 'nav-search-title';
  label.htmlFor = 'nav-search-input';
  label.textContent = title ? title.textContent.trim() : 'Search';
  head.append(label);

  if (scopes.length) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'nav-search-scopes';
    const legend = document.createElement('legend');
    legend.className = 'nav-visually-hidden';
    legend.textContent = 'Search in';
    fieldset.append(legend);
    scopes.forEach((a, i) => {
      const value = decodeURIComponent((a.hash.match(/f-commoncontenttype=([^&]*)/) || [])[1] || '');
      const option = document.createElement('label');
      option.className = 'nav-search-scope';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'scope';
      radio.value = value;
      radio.checked = i === 0;
      option.append(radio, document.createTextNode(a.textContent.trim()));
      fieldset.append(option);
    });
    head.append(fieldset);
  }

  const field = document.createElement('div');
  field.className = 'nav-search-field';
  const input = document.createElement('input');
  input.type = 'search';
  input.id = 'nav-search-input';
  input.name = 'q';
  input.autocomplete = 'off';
  input.placeholder = placeholder ? placeholder.textContent.trim() : '';
  const submit = createButton('nav-search-submit', 'Search');
  submit.type = 'submit';
  field.append(input, submit);
  form.append(head, field);

  // the University search reads its query from the URL hash
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const scope = form.querySelector('input[name="scope"]:checked');
    const params = [`q=${encodeURIComponent(input.value.trim())}`];
    if (scope && scope.value) params.push(`f-commoncontenttype=${encodeURIComponent(scope.value)}`);
    window.location.href = `${action}#${params.join('&')}`;
  });

  inner.append(closeBtn, form);
  panel.append(inner);

  const toggle = createButton('nav-search-toggle', 'Open search');
  toggle.setAttribute('aria-controls', panel.id);
  toggle.setAttribute('aria-expanded', 'false');

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close search' : 'Open search');
    if (open) input.focus();
  };
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  closeBtn.addEventListener('click', () => {
    setOpen(false);
    toggle.focus();
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      toggle.focus();
    }
  });

  return { panel, toggle, close: () => setOpen(false) };
}

/**
 * Builds the desktop utility drawer (close control + link list) that slides in from the right.
 * The toggle is wired by the caller because it also drives the mobile menu.
 * @param {Element} section utility section from the fragment
 * @param {HTMLButtonElement} toggle the header button that opens the drawer
 * @returns {{drawer: HTMLElement, open: Function, close: Function}}
 */
function buildUtility(section, toggle) {
  const closeText = section.querySelector('p');
  const list = section.querySelector('ul');

  const drawer = document.createElement('div');
  drawer.className = 'nav-utility';
  drawer.id = 'nav-utility';
  drawer.hidden = true;

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-utility-backdrop';

  const panel = document.createElement('div');
  panel.className = 'nav-utility-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'Utility menu');

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'nav-utility-close';
  closeBtn.innerHTML = '<span class="nav-icon" aria-hidden="true"></span>';
  closeBtn.append(document.createTextNode(closeText ? closeText.textContent.trim() : 'Close'));

  panel.append(closeBtn);
  if (list) {
    list.classList.add('nav-utility-links');
    panel.append(list);
  }
  drawer.append(backdrop, panel);

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', open);
    if (open) {
      drawer.hidden = false;
      // next frame so the slide-in transition runs
      requestAnimationFrame(() => drawer.classList.add('is-open'));
      document.body.style.overflowY = 'hidden';
      closeBtn.focus();
    } else {
      drawer.classList.remove('is-open');
      document.body.style.overflowY = '';
      drawer.addEventListener('transitionend', () => {
        if (!drawer.classList.contains('is-open')) drawer.hidden = true;
      }, { once: true });
      toggle.focus();
    }
  };
  closeBtn.addEventListener('click', () => setOpen(false));
  backdrop.addEventListener('click', () => setOpen(false));
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  return {
    drawer,
    open: () => setOpen(true),
    close: () => { if (!drawer.hidden) setOpen(false); },
  };
}

/**
 * Creates a chevron link/button row used in the mobile menu.
 * @param {string} tag 'a' or 'button'
 * @param {string} className row class
 * @param {string} text label
 * @returns {HTMLElement}
 */
function createRow(tag, className, text) {
  const row = document.createElement(tag);
  row.className = className;
  if (tag === 'button') row.type = 'button';
  const label = document.createElement('span');
  label.textContent = text;
  row.append(label);
  return row;
}

/**
 * Builds the full-screen mobile menu: site link bar, section items (items with children
 * open a slide-in sub-panel with a back button) and the utility links.
 * Reads copies of the fragment content so the desktop structure is untouched.
 * @param {Element|null} titleLink site title link
 * @param {Element|null} menuList top-level section list
 * @param {Element|null} utilityList utility link list
 * @param {HTMLButtonElement} toggle the header button that opens the menu
 * @returns {{menu: HTMLElement, toggle: Function, close: Function}}
 */
function buildMobileMenu(titleLink, menuList, utilityList, toggle) {
  const menu = document.createElement('div');
  menu.className = 'nav-mobile';
  menu.id = 'nav-mobile';
  menu.hidden = true;

  if (titleLink) {
    const site = titleLink.cloneNode(true);
    site.className = 'nav-mobile-site';
    menu.append(site);
  }

  const body = document.createElement('div');
  body.className = 'nav-mobile-body';
  const main = document.createElement('ul');
  main.className = 'nav-mobile-main';
  body.append(main);

  const panels = [];
  const closePanels = () => panels.forEach(({ panel, trigger }) => {
    panel.classList.remove('is-open');
    panel.inert = true;
    trigger.setAttribute('aria-expanded', 'false');
  });

  [...(menuList ? menuList.querySelectorAll(':scope > li') : [])].forEach((item, i) => {
    const link = item.querySelector(':scope > a');
    const children = item.querySelector(':scope > ul');
    if (!link) return;
    const li = document.createElement('li');
    if (!children) {
      const row = createRow('a', 'nav-mobile-item', link.textContent.trim());
      row.href = link.href;
      li.append(row);
      main.append(li);
      return;
    }
    // items with children open a sub-panel (text and chevron both expand, as on the source)
    const trigger = createRow('button', 'nav-mobile-item has-children', link.textContent.trim());
    trigger.setAttribute('aria-expanded', 'false');
    const panel = document.createElement('div');
    panel.className = 'nav-mobile-panel';
    panel.id = `nav-mobile-panel-${i}`;
    panel.inert = true;
    trigger.setAttribute('aria-controls', panel.id);

    const back = createRow('button', 'nav-mobile-back', 'Back');
    const landing = createRow('a', 'nav-mobile-landing', link.textContent.trim());
    landing.href = link.href;
    const list = children.cloneNode(true);
    list.className = 'nav-mobile-links';
    panel.append(back, landing, list);
    body.append(panel);
    panels.push({ panel, trigger });

    trigger.addEventListener('click', () => {
      closePanels();
      panel.inert = false;
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      back.focus({ preventScroll: true });
    });
    back.addEventListener('click', () => {
      closePanels();
      trigger.focus({ preventScroll: true });
    });
    li.append(trigger);
    main.append(li);
  });
  menu.append(body);

  if (utilityList) {
    const util = utilityList.cloneNode(true);
    util.className = 'nav-mobile-utility';
    menu.append(util);
  }

  const setOpen = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflowY = open ? 'hidden' : '';
    if (!open) closePanels();
  };
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      toggle.focus();
    }
  });

  return {
    menu,
    toggle: () => setOpen(menu.hidden),
    close: () => { if (!menu.hidden) setOpen(false); },
  };
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.children].filter((el) => el.tagName === 'DIV');
  const brandSection = sections.find((s) => s.querySelector('img'));
  const menuSection = sections.find((s) => s.querySelector('li > ul'));
  const searchSection = sections.find((s) => s.querySelector('h1, h2, h3, h4, h5, h6'));
  const utilitySection = sections.find((s) => ![brandSection, menuSection, searchSection].includes(s) && s.querySelector('ul'));

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  // row 0: brand + tools
  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  const [logoLink, titleLink] = brandSection ? brandSection.querySelectorAll('a') : [];
  if (brandSection) {
    brandSection.className = 'nav-brand';
    if (logoLink) logoLink.classList.add('nav-logo');
    if (titleLink) titleLink.classList.add('nav-title');
    bar.append(brandSection);
  }
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  bar.append(tools);
  nav.append(bar);

  let search;
  if (searchSection) {
    search = buildSearch(searchSection);
    tools.append(search.toggle);
  }

  // one menu button: utility drawer on desktop, full-screen menu on mobile
  const menuToggle = createButton('nav-utility-toggle', 'Open menu');
  menuToggle.setAttribute('aria-expanded', 'false');
  tools.append(menuToggle);
  const mobile = buildMobileMenu(
    titleLink,
    menuSection && menuSection.querySelector(':scope > ul'),
    utilitySection && utilitySection.querySelector('ul'),
    menuToggle,
  );
  let utility;
  if (utilitySection) utility = buildUtility(utilitySection, menuToggle);
  const syncToggle = () => {
    menuToggle.setAttribute('aria-controls', isDesktop.matches && utility ? utility.drawer.id : mobile.menu.id);
    menuToggle.setAttribute('aria-label', isDesktop.matches ? 'Open utility menu' : 'Open menu');
  };
  syncToggle();
  menuToggle.addEventListener('click', () => {
    if (isDesktop.matches) {
      if (utility) utility.open();
    } else {
      if (search) search.close();
      mobile.toggle();
    }
  });
  if (search) search.toggle.addEventListener('click', () => mobile.close());

  // row 1: section links with dropdown panels
  if (menuSection) {
    menuSection.className = 'nav-sections';
    menuSection.querySelectorAll(':scope > ul > li').forEach((item) => decorateDropdown(item, menuSection));
    nav.append(menuSection);
  }
  if (search) nav.append(search.panel);
  nav.append(mobile.menu);
  if (utility) nav.append(utility.drawer);

  // reset open panels when the viewport crosses the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    if (menuSection) closeAllPanels(menuSection);
    if (search) search.close();
    if (utility) utility.close();
    mobile.close();
    syncToggle();
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
