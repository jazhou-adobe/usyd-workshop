/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-profile (sydney.edu.au .m-wrapper-js-profile-contact).
 * Block table: 2 columns, one row per profile: [portrait image | name (linked), position].
 * Visible markup: a.m-profile--link > .m-profile > (.m-profile--image img, .m-profile--details
 * p.m-profile--name, p.m-profile--designation). The .m-hidden config dump is used only as a
 * fallback (name/description/image path) and is never emitted.
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

function hiddenValue(hidden, label) {
  if (!hidden) return '';
  const el = [...hidden.querySelectorAll('h2, h3, p')]
    .find((n) => norm(n.textContent).toLowerCase().startsWith(`${label.toLowerCase()} :`));
  if (!el) return '';
  return norm(norm(el.textContent).slice(label.length).replace(/^\s*:\s*/, ''));
}

export default function parse(element, { document }) {
  const hidden = element.querySelector('.m-hidden');
  const profiles = [...element.querySelectorAll('.m-profile')];
  const cells = [];

  const buildRow = (profile) => {
    const linkEl = profile ? profile.closest('a[href]') : null;
    let href = linkEl ? linkEl.getAttribute('href') : '';
    if (!href) {
      const hiddenLink = hidden && hidden.querySelector('a[href]');
      href = hiddenLink ? hiddenLink.getAttribute('href') : '';
    }

    const nameEl = profile && profile.querySelector('.m-profile--name');
    const posEl = profile && profile.querySelector('.m-profile--designation');
    const name = norm(nameEl && nameEl.textContent) || hiddenValue(hidden, 'Manual Name');
    const position = norm(posEl && posEl.textContent) || hiddenValue(hidden, 'Manual Description');

    let src = '';
    const imgEl = profile && profile.querySelector('.m-profile--image img:not([src^="data:"])');
    if (imgEl) src = imgEl.getAttribute('src');
    if (!src) {
      const hImg = hidden && hidden.querySelector('img[src]');
      src = (hImg && hImg.getAttribute('src')) || hiddenValue(hidden, 'Profile image');
    }

    let imageCell = '';
    if (src) {
      const img = document.createElement('img');
      img.src = absUrl(src);
      img.alt = name || '';
      imageCell = img;
    }

    const body = [];
    if (name) {
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        a.href = absUrl(href);
        a.textContent = name;
        p.append(a);
      } else {
        p.textContent = name;
      }
      body.push(p);
    }
    if (position) {
      const p = document.createElement('p');
      p.textContent = position;
      body.push(p);
    }
    if (imageCell || body.length) cells.push([imageCell, body]);
  };

  if (profiles.length) profiles.forEach(buildRow);
  else buildRow(null);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });
  element.replaceWith(block);
}
