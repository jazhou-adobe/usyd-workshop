/**
 * Turns heading text into a URL-safe id that is unique in the document.
 * @param {string} text
 * @returns {string}
 */
function uniqueId(text) {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
  let id = base;
  let i = 1;
  while (document.getElementById(id)) {
    id = `${base}-${i}`;
    i += 1;
  }
  return id;
}

/**
 * toc-on-this-page: "On this page" list of anchor links to every H2 in main.
 * Authoring: an empty block, or one row whose text is the list title
 * (defaults to "On this page"). Links are built at runtime, so they stay in
 * sync with the page headings. When the page has no H2s the block removes
 * itself and hides its section if nothing else is left in it.
 * @param {Element} block
 */
export default function decorate(block) {
  const title = block.textContent.trim().replace(/\s+/g, ' ') || 'On this page';
  const main = block.closest('main') || document.querySelector('main') || document.body;

  const headings = [...main.querySelectorAll('h2')]
    .filter((h2) => !h2.closest('.toc-on-this-page') && h2.textContent.trim());

  if (!headings.length) {
    const wrapper = block.closest('.toc-on-this-page-wrapper') || block;
    const section = wrapper.closest('.section');
    wrapper.remove();
    if (section && !section.querySelector(':scope > :not(.section-metadata)')) {
      section.hidden = true;
    }
    return;
  }

  const nav = document.createElement('nav');
  nav.className = 'toc-on-this-page-nav';

  const heading = document.createElement('p');
  heading.className = 'toc-on-this-page-title';
  heading.id = uniqueId(`toc-${title}`);
  heading.textContent = title;
  nav.setAttribute('aria-labelledby', heading.id);

  const list = document.createElement('ol');
  list.className = 'toc-on-this-page-list';
  headings.forEach((h2) => {
    if (!h2.id) h2.id = uniqueId(h2.textContent.trim());
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${h2.id}`;
    a.textContent = h2.textContent.trim().replace(/\s+/g, ' ');
    li.append(a);
    list.append(li);
  });

  nav.append(heading, list);
  block.replaceChildren(nav);
}
