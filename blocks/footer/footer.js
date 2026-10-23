const IMAGE_LINK = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;

/**
 * Fetches the footer fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA/EDS).
 * @returns {Promise<HTMLElement|null>} container holding the fragment sections
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const container = document.createElement('div');
  container.innerHTML = await resp.text();
  // fragment-relative image and media paths resolve against the fragment, not the page
  container.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  container.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!/^([a-z]+:|#|\/)/i.test(href)) a.href = new URL(href, resp.url).href;
  });
  return container;
}

/**
 * Wraps the children of a section in a content-width container.
 * @param {Element} section
 * @param {string} className section class
 * @returns {HTMLElement} the inner container
 */
function frame(section, className) {
  section.className = className;
  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  inner.append(...section.childNodes);
  section.append(inner);
  return inner;
}

/**
 * Text + image band: copy and links on the left, image paragraph(s) on the right.
 * @param {Element} section
 */
function decorateBand(section) {
  const inner = frame(section, 'footer-band');
  const media = document.createElement('div');
  media.className = 'footer-band-media';
  const text = document.createElement('div');
  text.className = 'footer-band-text';
  [...inner.children].forEach((el) => (el.querySelector('img') ? media : text).append(el));
  const cta = [...text.querySelectorAll('p')].find((p) => {
    const a = p.querySelector('a');
    return a && p.textContent.trim() === a.textContent.trim();
  });
  if (cta) cta.classList.add('footer-band-cta');
  inner.replaceChildren(text, media);
}

/**
 * Heading + list pairs become link columns.
 * @param {Element} section
 */
function decorateColumns(section) {
  const inner = frame(section, 'footer-links');
  const columns = [];
  [...inner.children].forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName) || !columns.length) {
      const col = document.createElement('div');
      col.className = 'footer-column';
      columns.push(col);
    }
    columns[columns.length - 1].append(el);
  });
  inner.replaceChildren(...columns);
}

/**
 * A link whose target is an image opens that image in a small popover (e.g. a QR code).
 * @param {HTMLAnchorElement} link
 */
function decorateImagePopover(link) {
  const icon = link.querySelector('img');
  const label = icon ? icon.alt : link.textContent.trim();
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'footer-popover-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', label);
  if (icon) {
    icon.alt = '';
    button.append(icon);
  }
  const popover = document.createElement('div');
  popover.className = 'footer-popover';
  popover.hidden = true;
  const img = document.createElement('img');
  img.src = link.href;
  img.alt = label;
  img.loading = 'lazy';
  img.width = 90;
  img.height = 90;
  popover.append(img);

  const setOpen = (open) => {
    popover.hidden = !open;
    button.setAttribute('aria-expanded', open);
  };
  button.addEventListener('click', () => setOpen(popover.hidden));
  button.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  document.addEventListener('click', (e) => {
    if (!popover.hidden && !button.parentElement.contains(e.target)) setOpen(false);
  });
  link.replaceWith(button, popover);
}

/**
 * Icon list (left) and logo list (right).
 * @param {Element} section
 */
function decorateIconRow(section) {
  const inner = frame(section, 'footer-icons');
  const [icons, logos] = inner.querySelectorAll(':scope > ul');
  if (icons) {
    icons.className = 'footer-social';
    icons.querySelectorAll('a[href]').forEach((a) => {
      if (IMAGE_LINK.test(new URL(a.href).pathname)) {
        decorateImagePopover(a);
      } else {
        const icon = a.querySelector('img');
        if (icon) {
          a.setAttribute('aria-label', icon.alt);
          icon.alt = '';
        }
      }
    });
  }
  if (logos) logos.className = 'footer-partners';
}

/**
 * Legal links (left) and fine print paragraphs (right).
 * @param {Element} section
 */
function decorateBottom(section) {
  const inner = frame(section, 'footer-bottom');
  const list = inner.querySelector(':scope > ul');
  if (list) list.className = 'footer-legal';
  const notes = document.createElement('div');
  notes.className = 'footer-fineprint';
  notes.append(...inner.querySelectorAll(':scope > p'));
  if (notes.children.length) inner.append(notes);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.children].filter((el) => el.tagName === 'DIV');
  sections.forEach((section) => {
    const lists = section.querySelectorAll(':scope > ul');
    if (section.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4')) {
      decorateColumns(section);
    } else if (lists.length > 1 && section.querySelector('ul img')) {
      decorateIconRow(section);
    } else if (lists.length) {
      decorateBottom(section);
    } else {
      decorateBand(section);
    }
  });

  // icon row and legal row share the dark band with the link columns
  const main = document.createElement('div');
  main.className = 'footer-main';
  sections.filter((s) => s.className !== 'footer-band').forEach((s) => main.append(s));
  const band = sections.find((s) => s.className === 'footer-band');

  const footer = document.createElement('div');
  if (band) footer.append(band);
  footer.append(main);
  block.append(footer);
}
