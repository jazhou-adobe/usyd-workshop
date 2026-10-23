/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-news-list (sydney.edu.au news.html .m-news-article-list__vertical-container).
 * Block table: 2 columns, one row per article: [image | linked H3 title + summary].
 *
 * The visible list is paginated (first page only, no links), so the canonical article
 * data is read from the hidden full list: closest .m-wrapper-news-article-list >
 * div.m-hidden > ul > li (h2 title, div summary, a[href] article link, span image path).
 * Visible items are used as a fallback (and for any article missing from the hidden list).
 * The "All news" H2 (.m-news-article-list__title) is preserved as default content
 * before the block, and the pagination UI is dropped.
 */
const ORIGIN = 'https://www.sydney.edu.au';

function absUrl(url) {
  if (!url) return url;
  const u = url.trim();
  if (/^https?:\/\//i.test(u) || u.startsWith('data:')) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function norm(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const wrapper = element.closest('.m-wrapper-news-article-list');
  const hiddenList = wrapper
    ? ([...wrapper.children].find((c) => c.classList && c.classList.contains('m-hidden'))
      || wrapper.querySelector('.m-hidden'))
    : null;

  // Visible items (first page), keyed by title
  const visible = new Map();
  element.querySelectorAll('.m-news-article-list--vertical').forEach((item) => {
    const titleEl = item.querySelector('.m-news-article-list--vertical__title, h3, h2');
    const title = norm(titleEl && titleEl.textContent);
    if (!title || visible.has(title)) return;
    const img = item.querySelector('img:not([src^="data:"])');
    const link = item.querySelector('a[href]');
    const desc = item.querySelector('.m-news-article-list--vertical__description, p');
    visible.set(title, {
      title,
      image: img ? absUrl(img.getAttribute('src')) : null,
      alt: img ? (img.getAttribute('alt') || '') : '',
      href: link ? absUrl(link.getAttribute('href')) : null,
      description: norm(desc && desc.textContent),
    });
  });

  // Canonical articles from the hidden full list
  const articles = [];
  const seen = new Set();
  if (hiddenList) {
    let items = [...hiddenList.querySelectorAll(':scope > ul > li')];
    if (!items.length) items = [...hiddenList.querySelectorAll('li')];
    items.forEach((li) => {
      const titleEl = li.querySelector('h1, h2, h3, h4');
      const title = norm(titleEl && titleEl.textContent);
      if (!title || seen.has(title)) return;
      seen.add(title);
      const v = visible.get(title) || {};
      const linkEl = li.querySelector('a[href]');
      const descEl = li.querySelector(':scope > div');
      // html2md unwraps the <span>s before parsing, so fall back to matching the path in the item text
      const imgPath = [...li.querySelectorAll(':scope > span')]
        .map((s) => s.textContent.trim())
        .find((t) => /^(https?:\/\/\S+|\/content\/dam\/\S+)\.(jpe?g|png|webp|gif|svg)$/i.test(t))
        || (li.textContent.match(/(https?:\/\/\S+|\/content\/dam\/\S+?)\.(jpe?g|png|webp|gif|svg)(?=\s|$)/i) || [])[0];
      articles.push({
        title,
        href: linkEl ? absUrl(linkEl.getAttribute('href')) : v.href,
        description: norm(descEl && descEl.textContent) || v.description,
        image: imgPath ? absUrl(imgPath) : v.image,
        alt: v.alt || '',
      });
    });
  }
  visible.forEach((v, title) => {
    if (seen.has(title)) return;
    seen.add(title);
    articles.push(v);
  });

  const cells = [];
  articles.forEach((art) => {
    let imageCell = '';
    if (art.image) {
      const img = document.createElement('img');
      img.src = art.image;
      img.alt = art.alt || '';
      imageCell = img;
    }
    const body = [];
    const h3 = document.createElement('h3');
    if (art.href) {
      const a = document.createElement('a');
      a.href = art.href;
      a.textContent = art.title;
      h3.append(a);
    } else {
      h3.textContent = art.title;
    }
    body.push(h3);
    if (art.description) {
      const p = document.createElement('p');
      p.textContent = art.description;
      body.push(p);
    }
    cells.push([imageCell, body]);
  });

  // Keep the "All news" heading as default content before the block
  const heading = element.querySelector(':scope > .m-news-article-list__title, :scope > h2');
  if (heading && norm(heading.textContent)) {
    const h2 = document.createElement('h2');
    h2.textContent = norm(heading.textContent);
    element.before(h2);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news-list', cells });
  element.replaceWith(block);
}
