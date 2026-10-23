import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * hero-orange-band: full-bleed image above a coloured band holding the
 * title (left) and subheading + CTA (right).
 * Authoring: row 1 = image, row 2 = heading, paragraph(s), CTA link.
 * Tolerates the image and text arriving in the same row or any order.
 * @param {Element} block
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');

  const media = document.createElement('div');
  media.className = 'hero-orange-band-image';
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt || '', true, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }])
      : picture;
    const optimizedImg = optimized.querySelector('img');
    if (optimizedImg) {
      optimizedImg.loading = 'eager';
      optimizedImg.fetchPriority = 'high';
    }
    media.append(optimized);
    // drop now-empty wrapper paragraph
    const parentP = picture.parentElement;
    picture.remove();
    if (parentP && parentP.tagName === 'P' && !parentP.textContent.trim() && !parentP.children.length) parentP.remove();
  }

  const band = document.createElement('div');
  band.className = 'hero-orange-band-content';
  const title = document.createElement('div');
  title.className = 'hero-orange-band-title';
  const body = document.createElement('div');
  body.className = 'hero-orange-band-body';

  if (heading) title.append(heading);

  // Collect every remaining element from the cells into the body column.
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    [...cell.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const p = document.createElement('p');
        p.textContent = node.textContent.trim();
        body.append(p);
      } else {
        body.append(node);
      }
    });
  });

  body.querySelectorAll('a').forEach((a) => {
    const p = a.closest('p');
    if (p && p.textContent.trim() === a.textContent.trim()) {
      a.classList.add('button');
      p.classList.add('button-container');
    }
  });

  if (title.children.length) band.append(title);
  if (body.children.length) band.append(body);

  const children = [];
  if (media.children.length) children.push(media);
  if (band.children.length) children.push(band);
  block.replaceChildren(...children);
  if (!media.children.length) block.classList.add('no-image');
}
