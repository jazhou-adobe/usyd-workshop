/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-contact (sydney.edu.au .m-bespoke-layout--bg-grey-90 > .m-bespoke-layout__inner).
 * Block table: one row, three columns:
 *   [H2 heading | icon + link paragraphs | contact headings + mailto links]
 * Icon paths come from the list component's raw data div
 * (li > a[href] + span "/content/dam/icons/...svg"); visible icons are inline data: SVGs.
 */
const ORIGIN = 'https://www.sydney.edu.au';

function absUrl(url) {
  if (!url) return url;
  const u = url.trim();
  if (/^https?:\/\//i.test(u) || u.startsWith('data:') || u.startsWith('mailto:') || u.startsWith('tel:')) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

export default function parse(element, { document }) {
  // --- Column 1: heading ---
  const headingCell = [];
  const srcHeading = element.querySelector('.cmp-title .cmp-title__text, .cmp-title h2');
  if (srcHeading) {
    const h2 = document.createElement('h2');
    h2.textContent = srcHeading.textContent.trim();
    headingCell.push(h2);
  }

  // --- Column 2: icon links ---
  const linksCell = [];
  const list = element.querySelector('.cmp-wrapper-list');
  if (list) {
    // icon map from raw data div: href -> svg path
    const iconMap = {};
    const dataDiv = [...list.children].find((c) => c.tagName === 'DIV');
    if (dataDiv) {
      dataDiv.querySelectorAll('li').forEach((li) => {
        const a = li.querySelector('a[href]');
        // html2md unwraps the <span>s before parsing, so match the path in the item text
        const match = li.textContent.match(/\S+\.(svg|png|jpe?g|webp|gif)\b/i);
        const path = match && match[0];
        // SVG images are dropped on import, so emit an EDS :icon: token served from /icons/
        if (a && path) iconMap[a.getAttribute('href')] = path.split('/').pop().replace(/\.[a-z]+$/i, '');
      });
    }
    const items = [...list.querySelectorAll('ul.m-list a[href]')];
    const source = items.length ? items : (dataDiv ? [...dataDiv.querySelectorAll('li > a[href]')] : []);
    source.forEach((a) => {
      const rawHref = a.getAttribute('href');
      const text = (a.querySelector('.m-list__title, span') || a).textContent.trim();
      if (!text) return;
      const p = document.createElement('p');
      if (iconMap[rawHref]) p.append(`:${iconMap[rawHref]}: `);
      const link = document.createElement('a');
      link.href = absUrl(rawHref);
      link.textContent = text;
      p.append(link);
      linksCell.push(p);
    });
  }

  // --- Column 3: contact headings + mailto links ---
  const contactCell = [];
  const text = element.querySelector('.cmp-wrapper-js-text .cmp-text, .cmp-text .cmp-text');
  if (text) {
    [...text.children].forEach((child) => {
      if (!child.textContent.trim()) return;
      if (/^H[1-6]$/.test(child.tagName)) {
        const h = document.createElement('h3');
        h.textContent = child.textContent.trim();
        contactCell.push(h);
      } else {
        const clone = child.cloneNode(true);
        clone.querySelectorAll('br').forEach((br) => {
          if (!br.nextSibling || !br.nextSibling.textContent.trim()) br.remove();
        });
        clone.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'))));
        contactCell.push(clone);
      }
    });
  }

  const cells = [[
    headingCell.length ? headingCell : '',
    linksCell.length ? linksCell : '',
    contactCell.length ? contactCell : '',
  ]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
