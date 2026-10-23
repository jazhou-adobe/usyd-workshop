import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * hero-image-overlay: full-bleed background photo with the title,
 * subheading and CTA overlaid on the left.
 * Authoring: row 1 = background image, row 2 = H1, subheading paragraph(s),
 * optional CTA link (its own paragraph). Tolerates rows in any order, the
 * image in the text row, or a missing image.
 * @param {Element} block
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');

  const media = document.createElement('div');
  media.className = 'hero-image-overlay-image';
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
    const parentP = picture.parentElement;
    picture.remove();
    if (parentP && parentP.tagName === 'P' && !parentP.textContent.trim() && !parentP.children.length) parentP.remove();
    media.append(optimized);
  }

  const content = document.createElement('div');
  content.className = 'hero-image-overlay-content';

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
      if (/^H[1-6]$/.test(node.tagName)) node.classList.add('hero-image-overlay-title');
      const link = node.tagName === 'P' ? node.querySelector('a') : null;
      if (link && node.textContent.trim() === link.textContent.trim()) {
        node.classList.add('button-container');
        link.classList.add('button');
      }
      content.append(node);
    });
  });

  const children = [];
  if (media.children.length) children.push(media);
  if (content.children.length) children.push(content);
  block.replaceChildren(...children);
  if (!media.children.length) block.classList.add('no-image');
}
