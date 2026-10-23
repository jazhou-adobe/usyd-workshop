/**
 * cards-cta: call-to-action link boxes. Authoring: one row per box,
 * [title (linked), optional description]. The whole box links to the first
 * link in the row. Options (block classes): `ochre` for the orange box.
 * Links that open externally (another site or a file) get an
 * external-link icon instead of the arrow. Absolute links to the
 * source site (sydney.edu.au) count as internal.
 * @param {Element} block
 */
const SITE_HOST = /(^|\.)sydney\.edu\.au$/i;

function isExternal(href) {
  try {
    const url = new URL(href, window.location.href);
    if (/\.(pdf|docx?|xlsx?|pptx?)$/i.test(url.pathname)) return true;
    return url.host !== window.location.host && !SITE_HOST.test(url.hostname);
  } catch (e) {
    return false;
  }
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-cta-card';
    const body = document.createElement('div');
    body.className = 'cards-cta-card-body';
    [...row.children].forEach((cell) => {
      while (cell.firstChild) body.append(cell.firstChild);
    });
    // wrap stray text nodes so the body only has element children
    [...body.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const p = document.createElement('p');
        node.replaceWith(p);
        p.append(node);
      } else if (node.nodeType === Node.TEXT_NODE) node.remove();
    });
    if (!body.children.length) return;

    const link = body.querySelector(':is(h1, h2, h3, h4, h5, h6) a') || body.querySelector('a');
    const titleEl = (link && link.closest('p, h1, h2, h3, h4, h5, h6')) || body.firstElementChild;
    if (titleEl) titleEl.classList.add('cards-cta-card-title');
    [...body.children].forEach((el) => {
      if (el !== titleEl) el.classList.add('cards-cta-card-description');
    });

    if (link) {
      link.classList.add('cards-cta-card-link');
      // authored buttons: drop the button styling inside the box
      link.classList.remove('button', 'primary', 'secondary');
      const container = link.closest('.button-container');
      if (container) container.classList.remove('button-container');
      li.classList.add('is-linked');
      if (isExternal(link.href)) {
        li.classList.add('is-external');
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    }
    const icon = document.createElement('span');
    icon.className = 'cards-cta-card-icon';
    icon.setAttribute('aria-hidden', 'true');
    li.append(body, icon);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
