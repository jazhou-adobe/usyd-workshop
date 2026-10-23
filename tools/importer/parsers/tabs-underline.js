/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-underline (sydney.edu.au .cmp-wrapper-tabs).
 * Block table: one row per tab, two columns: [tab label | panel content].
 * Tabs are paired to panels by id (`{id}-tab` -> `{id}-tabpanel`), falling back to
 * document order. Every tab label is kept, even when its panel is empty.
 */
const ORIGIN = 'https://www.sydney.edu.au';

function absUrl(url) {
  if (!url) return url;
  const u = url.trim();
  if (/^(https?:|data:|mailto:|tel:|#)/i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function cleanContent(root) {
  root.querySelectorAll('.cmp-text__external-link-icon, script, style, button').forEach((n) => n.remove());
  root.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'))));
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('data-src') || img.getAttribute('src');
    if (src) img.setAttribute('src', absUrl(src));
  });
  // merge adjacent same-type lists (source often splits one list into many single-item <ul>s)
  [...root.querySelectorAll('ul, ol')].forEach((list) => {
    if (!list.isConnected) return;
    let next = list.nextElementSibling;
    while (next && next.tagName === list.tagName) {
      list.append(...next.children);
      const after = next.nextElementSibling;
      next.remove();
      next = after;
    }
  });
}

export default function parse(element, { document }) {
  const tabs = [...element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab')];
  const panels = [...element.querySelectorAll('.cmp-tabs__tabpanel')];

  const cells = [];
  tabs.forEach((tab, idx) => {
    const label = tab.textContent.replace(/\s+/g, ' ').trim();
    if (!label) return;

    let panel = null;
    const tabId = tab.getAttribute('id');
    if (tabId) {
      const panelId = tabId.replace(/-tab$/, '-tabpanel');
      panel = panels.find((p) => p.getAttribute('id') === panelId) || null;
    }
    if (!panel) panel = panels[idx] || null;

    const content = [];
    if (panel) {
      const textRoots = [...panel.querySelectorAll('.cmp-text')];
      const roots = textRoots.length ? textRoots : [panel];
      roots.forEach((root) => {
        cleanContent(root);
        [...root.children].forEach((child) => {
          if (child.textContent.trim() || child.querySelector('img')) content.push(child);
        });
      });
    }

    cells.push([label, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-underline', cells });
  element.replaceWith(block);
}
