/* eslint-disable */
/* global WebImporter */

/**
 * Parser for table-key-value (sydney.edu.au plain <table> inside .cmp-text).
 * Block table: 2 columns, one row per entry: [label | value]. No header row.
 * Labels are emitted as plain text (the block renders them as bold row headers);
 * values keep links and inline formatting.
 */
const ORIGIN = 'https://www.sydney.edu.au';

function absUrl(url) {
  if (!url) return url;
  const u = url.trim();
  if (/^(https?:|mailto:|tel:|data:|#)/i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function norm(text) {
  return (text || '').replace(/[\s ]+/g, ' ').trim();
}

function valueContent(cell, document) {
  const frag = document.createElement('div');
  [...cell.childNodes].forEach((n) => frag.append(n.cloneNode(true)));
  frag.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'))));
  frag.querySelectorAll('img[src]').forEach((img) => img.setAttribute('src', absUrl(img.getAttribute('src'))));
  // trim non-breaking/whitespace padding from text nodes at the edges
  const walker = document.createTreeWalker(frag, 4 /* NodeFilter.SHOW_TEXT */);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((t) => { t.textContent = t.textContent.replace(/ /g, ' '); });
  if (texts.length) {
    texts[0].textContent = texts[0].textContent.replace(/^\s+/, '');
    const last = texts[texts.length - 1];
    last.textContent = last.textContent.replace(/\s+$/, '');
  }
  return [...frag.childNodes].filter((n) => n.nodeType !== 3 || n.textContent.trim());
}

export default function parse(element, { document }) {
  const table = element.matches('table') ? element : element.querySelector('table');
  const rows = table
    ? [...table.querySelectorAll(':scope > tbody > tr, :scope > thead > tr, :scope > tr')]
    : [];
  const cells = [];

  rows.forEach((tr) => {
    const tds = [...tr.querySelectorAll(':scope > td, :scope > th')];
    if (!tds.length || !norm(tr.textContent)) return;
    const label = norm(tds[0].textContent);
    const valueCells = tds.slice(1);
    let value = '';
    if (valueCells.length) {
      const content = [];
      valueCells.forEach((td, i) => {
        if (i > 0) content.push(document.createTextNode(' '));
        content.push(...valueContent(td, document));
      });
      value = content;
    }
    cells.push([label, value]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-key-value', cells });
  element.replaceWith(block);
}
