/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-news (sydney.edu.au .m-news-article-list).
 * Block table: 2 columns, one row per article: [image | linked H3 title + description].
 *
 * Canonical article data lives in the sibling .m-hidden list (child of the parent
 * .m-wrapper-news-article-list): each <li> has h2 title, div description,
 * a[href] article link and span image path (/content/dam/...).
 * The visible swiper cards (no links, truncated descriptions, possible loop
 * duplicates) are used only as a fallback/image source and are de-duplicated by title.
 * The "Related news" heading (.m-news-article-list__title) is a sibling and is NOT consumed.
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
  const wrapper = element.closest('.m-wrapper-news-article-list') || element.parentElement;
  const hiddenList = wrapper
    ? [...wrapper.children].find((c) => c.classList && c.classList.contains('m-hidden'))
      || wrapper.querySelector('.m-hidden')
    : null;

  // Visible swiper cards, de-duplicated by title
  const visible = new Map();
  element.querySelectorAll('.m-news-article-list__articles, .m-card').forEach((card) => {
    const titleEl = card.querySelector('.m-card__title, h2, h3');
    const title = norm(titleEl && titleEl.textContent);
    if (!title || visible.has(title)) return;
    const img = card.querySelector('img:not([src^="data:"])');
    const link = card.querySelector('a[href]');
    const desc = card.querySelector('.m-card__description');
    visible.set(title, {
      title,
      image: img ? absUrl(img.getAttribute('src')) : null,
      alt: img ? (img.getAttribute('alt') || '') : '',
      href: link ? absUrl(link.getAttribute('href')) : null,
      description: norm(desc && desc.textContent),
    });
  });

  // Canonical articles from hidden list
  const articles = [];
  const seen = new Set();
  if (hiddenList) {
    hiddenList.querySelectorAll(':scope > ul > li, li').forEach((li) => {
      const titleEl = li.querySelector('h1, h2, h3, h4');
      const title = norm(titleEl && titleEl.textContent);
      if (!title || seen.has(title)) return;
      seen.add(title);
      const v = visible.get(title) || {};
      const linkEl = li.querySelector('a[href]');
      const descEl = li.querySelector(':scope > div');
      const imgPath = [...li.querySelectorAll(':scope > span')]
        .map((s) => s.textContent.trim())
        .find((t) => /^(https?:\/\/[^\s]+|\/content\/dam\/[^\s]+)\.(jpe?g|png|webp|gif|svg)$/i.test(t));
      articles.push({
        title,
        href: linkEl ? absUrl(linkEl.getAttribute('href')) : v.href,
        description: norm(descEl && descEl.textContent) || v.description,
        image: v.image || (imgPath ? absUrl(imgPath) : null),
        alt: v.alt || '',
      });
    });
  }
  // Any visible-only articles not present in the hidden list
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-news', cells });
  element.replaceWith(block);
}
