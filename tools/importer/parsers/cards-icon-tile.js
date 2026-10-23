/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon-tile (sydney.edu.au .m-wrapper-icon-tile).
 * Block table: 2 columns, one row per tile: [icon | linked title].
 * The visible icon is an inline data: SVG, so the icon cell is emitted as an
 * `:icon-name:` paragraph; the name comes from the hidden config's
 * "Icon: /content/dam/icons/approved-icons/<name>.svg" entry (SVG saved to icons/<name>.svg).
 * Title is authored as a strong linked paragraph (chevron is decorative CSS).
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
  const re = new RegExp(`^${label}\\s*:\\s*`, 'i');
  const el = [...hidden.querySelectorAll('p, h1, h2, h3, h4')].find((n) => re.test(norm(n.textContent)));
  return el ? norm(norm(el.textContent).replace(re, '')) : '';
}

export default function parse(element, { document }) {
  const hidden = element.querySelector('.m-hidden');
  const tiles = [...element.querySelectorAll('.m-icon-tile')];
  const cells = [];

  const iconPath = hiddenValue(hidden, 'Icon');
  let iconName = iconPath
    ? iconPath.split('/').pop().replace(/\.svg$/i, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-')
    : '';
  // The cleanup transformer removes .m-hidden before parsing, so fall back to
  // identifying the inline data: SVG icon by a distinctive path signature.
  if (!iconName) {
    const iconImg = element.querySelector('.m-icon-tile > img[src^="data:image/svg"], img.m-icon-tile__icon');
    const inlineSvg = element.querySelector('svg.m-icon-tile__icon, .m-icon-tile > svg');
    let svg = inlineSvg ? inlineSvg.outerHTML : '';
    if (!svg && iconImg) {
      const src = iconImg.getAttribute('src') || '';
      const b64 = src.split('base64,')[1];
      try {
        svg = b64 ? atob(b64) : decodeURIComponent(src.split(',').slice(1).join(','));
      } catch (e) {
        svg = '';
      }
    }
    if (svg) {
      const known = [
        { name: 'globe-information', sig: 'M34.5 40.5V34.5' },
      ];
      const hit = known.find((k) => svg.includes(k.sig));
      if (hit) iconName = hit.name;
    }
  }

  const buildRow = (tile) => {
    const titleEl = tile && tile.querySelector('.m-icon-tile__title, h1, h2, h3, h4');
    const title = norm(titleEl && titleEl.textContent) || hiddenValue(hidden, 'Title');

    let href = '';
    const linkEl = tile && tile.closest('a[href]');
    if (linkEl) href = linkEl.getAttribute('href');
    if (!href) href = hiddenValue(hidden, 'Link URL');

    let iconCell = '';
    if (iconName) {
      const p = document.createElement('p');
      p.textContent = `:${iconName}:`;
      iconCell = p;
    } else {
      const img = tile && tile.querySelector('img.m-icon-tile__icon:not([src^="data:"]), img:not([src^="data:"])');
      if (img) {
        const i = document.createElement('img');
        i.src = absUrl(img.getAttribute('src'));
        i.alt = img.getAttribute('alt') || '';
        iconCell = i;
      }
    }

    const body = [];
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      if (href) {
        const a = document.createElement('a');
        a.href = absUrl(href);
        a.textContent = title;
        strong.append(a);
      } else {
        strong.textContent = title;
      }
      p.append(strong);
      body.push(p);
    }
    const desc = hiddenValue(hidden, 'Description');
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      body.push(p);
    }
    if (iconCell || body.length) cells.push([iconCell, body]);
  };

  if (tiles.length) tiles.forEach(buildRow);
  else buildRow(null);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-tile', cells });
  element.replaceWith(block);
}
