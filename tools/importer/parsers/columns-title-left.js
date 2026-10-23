/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-title-left (sydney.edu.au .m-bespoke-layout--30-60-layout
 * without tabs / profile contacts / leading image).
 * Block table: one row, two columns.
 *   left:  optional ":icon-name:" paragraph, H2 heading,
 *          optional stat tile (bold linked figure paragraph + linked caption paragraph)
 *   right: body headings, paragraphs, lists, images, link/button paragraphs
 * The first meaningful child of the layout's inner wrapper is the left (30%) column,
 * everything after it is the right (60%) column.
 * Text-page row variant (.cmp-container--css-grid--section-layout): the left column is
 * #section-left-container-* (H2), the right column is #section-right-container-*
 * (rich text, links, buttons).
 * Container parser: runs after inner component parsers. Any block tables already
 * created inside the container (e.g. accordion) are moved to directly after this block.
 */
const ORIGIN = 'https://www.sydney.edu.au';

// Icon-tile SVGs are inlined as data: images; the DAM icon path lives in a .m-hidden
// div that the cleanup transformer removes first, so identify the SVG by fingerprint.
const ICON_FINGERPRINTS = [
  ['Microscope-2--Streamline', 'microscope'],
  ['Laboratory-Cell-Searching', 'laboratory-cell'],
  ['Lab-Tubes--Streamline', 'testtubes-multiple-lab'],
  ['M17.6919 9.01135L26.7666 14.2512', 'molecule-structure'],
  ['Laboratory-Chemistry-Tube-Check', 'testtube-tick-check'],
];

function absUrl(url) {
  if (!url) return url;
  const u = url.trim();
  if (/^https?:\/\//i.test(u) || u.startsWith('data:') || u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('#')) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function isHidden(el) {
  return el.classList && el.classList.contains('m-hidden');
}

/** visible text of a node, ignoring .m-hidden data copies */
function visibleText(node) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1 || isHidden(node)) return '';
  if (node.tagName === 'TABLE') return node.textContent;
  return [...node.childNodes].map(visibleText).join('');
}

function hasContent(node) {
  if (visibleText(node).trim()) return true;
  if (node.tagName === 'TABLE' || node.querySelector('table')) return true;
  return !!node.querySelector('img:not([src^="data:"])');
}

function decodeDataSvg(src) {
  try {
    const comma = src.indexOf(',');
    const data = src.slice(comma + 1);
    if (/;base64/i.test(src.slice(0, comma))) {
      if (typeof atob === 'function') return atob(data);
      return Buffer.from(data, 'base64').toString('utf8');
    }
    return decodeURIComponent(data);
  } catch (e) {
    return '';
  }
}

function iconName(scope) {
  // 1. hidden authoring data ("Icon: /content/dam/icons/.../name.svg") if still present
  const hidden = [...scope.querySelectorAll('.m-hidden p, .m-hidden')]
    .map((p) => p.textContent.match(/Icon:\s*(\S+\.svg)/i))
    .find(Boolean);
  if (hidden) return hidden[1].split('/').pop().replace(/\.svg$/i, '');
  // 2. fingerprint of the inline data: SVG
  const img = scope.querySelector('.m-icon-tile img[src^="data:image/svg"], .m-icon-tile__icon');
  if (!img) return null;
  const svg = img.tagName === 'IMG' ? decodeDataSvg(img.getAttribute('src') || '') : img.outerHTML;
  const hit = ICON_FINGERPRINTS.find(([fp]) => svg.includes(fp));
  if (hit) return hit[1];
  const id = (svg.match(/\bid="([^"]+)"/) || [])[1];
  if (id) return id.replace(/--Streamline.*$/i, '').replace(/\.svg$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return null;
}

function cleanClone(el, document) {
  const clone = el.cloneNode(true);
  clone.querySelectorAll('.m-hidden, .cmp-text__external-link-icon, img[src^="data:"], script, style').forEach((n) => n.remove());
  clone.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'))));
  clone.querySelectorAll('img[src]').forEach((i) => i.setAttribute('src', absUrl(i.getAttribute('src'))));
  clone.removeAttribute('class');
  clone.querySelectorAll('[class]').forEach((n) => n.removeAttribute('class'));
  clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  // drop empty anchors (duplicate trailing links, icon-only wrappers)
  clone.querySelectorAll('a').forEach((a) => {
    if (!a.textContent.trim() && !a.querySelector('img')) a.remove();
  });
  return clone;
}

// asButton: wrap the link in <strong> so EDS decorates it as a primary button
function linkPara(document, href, text, asButton = false) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = absUrl(href);
  a.textContent = text;
  if (asButton) {
    const strong = document.createElement('strong');
    strong.append(a);
    p.append(strong);
  } else {
    p.append(a);
  }
  return p;
}

/**
 * Walk a column node and push authorable content into `out`; block tables
 * produced by earlier parsers are collected into `tables` instead.
 */
function collect(node, out, tables, document) {
  if (node.nodeType === 3) {
    const t = node.textContent.trim();
    if (t) {
      const p = document.createElement('p');
      p.textContent = t;
      out.push(p);
    }
    return;
  }
  if (node.nodeType !== 1 || isHidden(node)) return;
  const { tagName: tag, classList } = node;

  if (tag === 'TABLE') { tables.push(node); return; }
  if (/^(SCRIPT|STYLE|NOSCRIPT|BUTTON|SVG|HR)$/i.test(tag)) return;
  if (classList.contains('cmp-wrapper-separator') || classList.contains('cmp-separator')) return;
  // button wrappers may hold only the .m-hidden data copy, so let them through
  if (!hasContent(node) && !classList.contains('cmp-wrapper-button')) return;

  // title component
  if (classList.contains('cmp-title') && !node.querySelector('table')) {
    const h = node.querySelector('h1, h2, h3, h4, h5, h6');
    if (h) {
      const nh = document.createElement(h.tagName.toLowerCase());
      nh.textContent = h.textContent.trim();
      out.push(nh);
      return;
    }
  }
  // image component
  if ((classList.contains('cmp-wrapper-image') || classList.contains('cmp-image')) && !node.querySelector('table')) {
    const src = node.querySelector('img:not([src^="data:"])');
    if (src) {
      const img = document.createElement('img');
      img.src = absUrl(src.getAttribute('src'));
      img.alt = src.getAttribute('alt') || '';
      out.push(img);
    }
    return;
  }
  // button component
  if (classList.contains('cmp-wrapper-button')) {
    const seen = new Set();
    [...node.querySelectorAll('a[href]')].filter((a) => !a.closest('.m-hidden')).forEach((a) => {
      const text = (a.querySelector('.cmp-button__text') || a).textContent.trim();
      const href = a.getAttribute('href');
      if (!text || seen.has(href + text)) return;
      seen.add(href + text);
      out.push(linkPara(document, href, text, true));
    });
    // fallback: authoring data copy of the button (only if the rendered button is absent)
    if (!seen.size) {
      [...node.querySelectorAll('.m-hidden a[href]')].forEach((a) => {
        const text = a.textContent.replace(/\s+/g, ' ').trim();
        const href = a.getAttribute('href');
        if (!text || seen.has(href + text)) return;
        seen.add(href + text);
        out.push(linkPara(document, href, text, true));
      });
    }
    return;
  }
  // standalone fact tile in the body column
  if (classList.contains('m-wrapper-fact-tile')) {
    out.push(...factTile(node, document));
    return;
  }
  // semantic leaf content
  if (/^(P|UL|OL|BLOCKQUOTE|H[1-6])$/.test(tag)) {
    if (tag === 'P' && node.querySelector('table')) {
      [...node.childNodes].forEach((c) => collect(c, out, tables, document));
      return;
    }
    out.push(cleanClone(node, document));
    return;
  }
  if (tag === 'IMG') {
    const img = document.createElement('img');
    img.src = absUrl(node.getAttribute('src'));
    img.alt = node.getAttribute('alt') || '';
    out.push(img);
    return;
  }
  if (tag === 'A' && node.getAttribute('href')) {
    if (!node.textContent.trim()) return;
    out.push(linkPara(document, node.getAttribute('href'), node.textContent.trim()));
    return;
  }
  // containers (rich text wrappers, nested bespoke layouts, unknown wrappers)
  [...node.childNodes].forEach((c) => collect(c, out, tables, document));
}

function factTile(node, document) {
  const tile = node.querySelector('.m-fact-tile');
  if (!tile) return [];
  const href = tile.tagName === 'A' ? tile.getAttribute('href') : (tile.querySelector('a[href]') || { getAttribute: () => null }).getAttribute('href');
  const fig = tile.querySelector('.m-fact-tile__figure');
  const figureText = fig ? fig.textContent.trim() : '';
  const content = tile.querySelector('.m-fact-tile__content') || tile;
  const captionText = [...content.childNodes]
    .filter((n) => n !== fig)
    .map((n) => n.textContent)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  const res = [];
  const wrapLink = (child) => {
    if (!href) return child;
    const a = document.createElement('a');
    a.href = absUrl(href);
    a.append(child);
    return a;
  };
  if (figureText) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = figureText;
    p.append(wrapLink(strong));
    res.push(p);
  }
  if (captionText) {
    const p = document.createElement('p');
    p.append(wrapLink(document.createTextNode(captionText)));
    res.push(p);
  }
  return res;
}

export default function parse(element, { document }) {
  let leftNode;
  let rightNodes;
  const sectionLeft = element.querySelector('[id^="section-left-container-"]');
  const sectionRight = element.querySelector('[id^="section-right-container-"]');
  if (sectionLeft || sectionRight) {
    // text-page row: .cmp-container--css-grid--section-layout
    leftNode = sectionLeft && hasContent(sectionLeft) ? sectionLeft : null;
    rightNodes = sectionRight ? [sectionRight] : [];
  } else {
    const inner = element.querySelector(':scope > .m-bespoke-layout__inner') || element;
    const kids = [...inner.children].filter((c) => !isHidden(c) && hasContent(c));
    [leftNode, ...rightNodes] = kids;
  }

  const tables = [];

  // --- Left (title) column ---
  const leftCell = [];
  if (leftNode) {
    const icon = iconName(leftNode);
    if (icon) {
      const p = document.createElement('p');
      p.textContent = `:${icon}:`;
      leftCell.push(p);
    }
    const heading = [...leftNode.querySelectorAll('.cmp-title__text, .m-icon-tile__title, h1, h2, h3, h4, h5, h6')]
      .find((h) => !h.closest('.m-hidden, table') && h.textContent.trim());
    if (heading) {
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      leftCell.push(h2);
    }
    const fact = leftNode.classList.contains('m-wrapper-fact-tile') ? leftNode : leftNode.querySelector('.m-wrapper-fact-tile');
    if (fact) leftCell.push(...factTile(fact, document));
    // any other left-column content (rich text) besides title / icon tile / fact tile
    const extra = [];
    [...(leftNode.querySelector(':scope > .m-bespoke-layout__inner') || leftNode).children].forEach((c) => {
      if (c.classList.contains('cmp-title') || c.classList.contains('m-wrapper-icon-tile')
        || c.classList.contains('m-wrapper-fact-tile') || c === heading) return;
      if (leftNode.classList.contains('cmp-title') || leftNode.classList.contains('m-wrapper-icon-tile')) return;
      if (heading && c.contains(heading)) {
        // rich text holding the heading plus copy: keep the copy that follows the heading
        const rest = c.cloneNode(true);
        const dup = [...rest.querySelectorAll(heading.tagName)]
          .find((h) => h.textContent.trim() === heading.textContent.trim());
        if (dup) dup.remove();
        if (visibleText(rest)) collect(rest, extra, tables, document);
        return;
      }
      collect(c, extra, tables, document);
    });
    leftCell.push(...extra);
  }

  // --- Right (body) column ---
  const rightCell = [];
  rightNodes.forEach((n) => collect(n, rightCell, tables, document));

  const cells = [[leftCell.length ? leftCell : '', rightCell.length ? rightCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-title-left', cells });
  element.replaceWith(block);
  // nested blocks are not allowed: place already-converted inner blocks after this one
  if (tables.length) block.after(...tables);
}
