/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-speaker (sydney.edu.au symposium speakers:
 * .m-bespoke-layout--30-60-layout whose inner starts with .cmp-wrapper-image).
 * Block table: 2 columns, one row per speaker: [photo (or empty) | H3 name, bio paragraphs].
 * Each speaker is its own 30-60 container on the source page, separated by
 * .cmp-wrapper-separator rules. The parser for the FIRST speaker collects all
 * consecutive sibling speaker containers (skipping separators) into ONE block
 * and removes the merged siblings and the separators between them.
 */
const ORIGIN = 'https://www.sydney.edu.au';

function absUrl(url) {
  if (!url) return url;
  const u = url.trim();
  if (/^https?:\/\//i.test(u) || u.startsWith('data:') || u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('#')) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function isSeparator(el) {
  return el.classList.contains('cmp-wrapper-separator') || el.classList.contains('separator')
    || (!el.textContent.trim() && !el.querySelector('img, picture, table'));
}

function innerOf(el) {
  return el.querySelector(':scope > .m-bespoke-layout__inner') || el;
}

/** a 30-60 container holding one speaker: leading image and/or an H3 name */
function isSpeaker(el) {
  if (!el || !el.classList || !el.classList.contains('m-bespoke-layout--30-60-layout')) return false;
  const inner = innerOf(el);
  const first = inner.firstElementChild;
  if (first && first.classList.contains('cmp-wrapper-image')) return true;
  return !!inner.querySelector('.cmp-text h3, h3') && !el.querySelector('.cmp-wrapper-tabs, .m-wrapper-js-profile-contact, table');
}

/** split a paragraph on <br><br> into separate paragraphs */
function splitParagraph(p, document) {
  const out = [];
  let cur = document.createElement('p');
  const nodes = [...p.childNodes];
  for (let i = 0; i < nodes.length; i += 1) {
    const n = nodes[i];
    const isBr = n.nodeType === 1 && n.tagName === 'BR';
    if (isBr) {
      // look ahead past whitespace for a second <br>
      let j = i + 1;
      while (j < nodes.length && nodes[j].nodeType === 3 && !nodes[j].textContent.trim()) j += 1;
      if (j < nodes.length && nodes[j].nodeType === 1 && nodes[j].tagName === 'BR') {
        if (cur.textContent.trim()) out.push(cur);
        cur = document.createElement('p');
        i = j;
        continue;
      }
    }
    cur.append(n.cloneNode(true));
  }
  if (cur.textContent.trim()) out.push(cur);
  out.forEach((np) => {
    while (np.lastChild && np.lastChild.nodeType === 1 && np.lastChild.tagName === 'BR') np.lastChild.remove();
  });
  return out;
}

function speakerRow(container, document) {
  const inner = innerOf(container);

  // --- photo ---
  let imageCell = '';
  const srcImg = [...inner.querySelectorAll('.cmp-wrapper-image img:not([src^="data:"]), .cmp-image img:not([src^="data:"])')]
    .find((i) => !i.closest('.m-hidden'));
  if (srcImg) {
    const img = document.createElement('img');
    img.src = absUrl(srcImg.getAttribute('src'));
    img.alt = srcImg.getAttribute('alt') || '';
    imageCell = img;
  }

  // --- name + bio ---
  const textCell = [];
  let nameDone = false;
  // the component wrapper also carries .cmp-text: use the innermost .cmp-text only
  [...inner.querySelectorAll('.cmp-text')].filter((t) => !t.querySelector('.cmp-text')).forEach((text) => {
    if (text.closest('.m-hidden')) return;
    [...text.children].forEach((child) => {
      if (!child.textContent.trim()) return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document.createElement(nameDone ? 'h4' : 'h3');
        h.textContent = child.textContent.replace(/\s+/g, ' ').trim();
        textCell.push(h);
        nameDone = true;
        return;
      }
      const clone = child.cloneNode(true);
      clone.querySelectorAll('.m-hidden, .cmp-text__external-link-icon, img[src^="data:"]').forEach((n) => n.remove());
      clone.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'))));
      clone.querySelectorAll('a:not([href])').forEach((a) => a.replaceWith(...a.childNodes));
      clone.querySelectorAll('[class], [id]').forEach((n) => { n.removeAttribute('class'); n.removeAttribute('id'); });
      if (clone.tagName === 'P') textCell.push(...splitParagraph(clone, document));
      else textCell.push(clone);
    });
  });
  // name given as a bold-only paragraph instead of a heading
  if (!nameDone && textCell.length && textCell[0].tagName === 'P') {
    const first = textCell[0];
    const b = first.querySelector('b, strong');
    if (b && b.textContent.trim() === first.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = first.textContent.trim();
      textCell[0] = h;
    }
  }

  return [imageCell, textCell.length ? textCell : ''];
}

export default function parse(element, { document }) {
  // already merged into a previous speaker block
  if (!element.parentElement) return;

  const containers = [element];
  const toRemove = [];
  let next = element.nextElementSibling;
  const pending = [];
  while (next) {
    if (isSpeaker(next)) {
      containers.push(next);
      toRemove.push(...pending, next);
      pending.length = 0;
    } else if (isSeparator(next)) {
      pending.push(next);
    } else {
      break;
    }
    next = next.nextElementSibling;
  }

  const cells = containers.map((c) => speakerRow(c, document));
  toRemove.forEach((n) => n.remove());

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-speaker', cells });
  element.replaceWith(block);
}
