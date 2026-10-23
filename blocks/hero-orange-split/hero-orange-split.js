import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * hero-orange-split: coloured band with the title, subheading and CTAs on
 * the left and a photo on the right that sits inside the band at the top
 * and overhangs its bottom edge.
 * Authoring: row 1 = image, row 2 = H1, subheading paragraph(s), optional
 * CTA links (one per paragraph). Tolerates rows in any order, the image in
 * the text row, a missing image or missing CTAs.
 * @param {Element} block
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');

  const media = document.createElement('div');
  media.className = 'hero-orange-split-image';
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt || '', true, [{ media: '(min-width: 900px)', width: '1200' }, { width: '900' }])
      : picture;
    const optimizedImg = optimized.querySelector('img');
    if (optimizedImg) {
      optimizedImg.loading = 'eager';
      optimizedImg.fetchPriority = 'high';
    }
    const parentP = picture.parentElement;
    picture.remove();
    if (parentP && parentP.tagName === 'P' && !parentP.textContent.trim() && !parentP.children.length) parentP.remove();
    media.append(optimized);
  }

  const content = document.createElement('div');
  content.className = 'hero-orange-split-content';
  const actions = document.createElement('div');
  actions.className = 'hero-orange-split-actions';

  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    [...cell.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.textContent.trim()) return;
        const p = document.createElement('p');
        p.textContent = node.textContent.trim();
        content.append(p);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (/^H[1-6]$/.test(node.tagName)) {
        node.classList.add('hero-orange-split-title');
        content.append(node);
        return;
      }
      const link = node.tagName === 'P' ? node.querySelector('a') : null;
      if (link && node.textContent.trim() === link.textContent.trim()) {
        actions.append(node);
        return;
      }
      content.append(node);
    });
  });

  // CTAs: first is the filled (primary) button, the rest are outlined
  [...actions.children].forEach((p, i) => {
    const a = p.querySelector('a');
    p.classList.add('button-container');
    a.classList.remove('primary', 'secondary');
    a.classList.add('button', i === 0 ? 'primary' : 'secondary');
  });

  if (actions.children.length) content.append(actions);

  const children = [];
  if (content.children.length) children.push(content);
  if (media.children.length) children.push(media);
  block.replaceChildren(...children);
  if (!media.children.length) block.classList.add('no-image');
}
