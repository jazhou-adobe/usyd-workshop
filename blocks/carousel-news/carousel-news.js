import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * carousel-news: multi-up news card slider (3 per view on desktop,
 * fewer on smaller screens) with page dots and prev/next arrows.
 * Authoring: one row per article, [image | linked title + description].
 * Slides-per-view is read from the CSS custom property
 * --carousel-news-per-view so layout stays in CSS.
 * @param {Element} block
 */

let carouselId = 0;

function getPerView(block) {
  const value = parseInt(getComputedStyle(block).getPropertyValue('--carousel-news-per-view'), 10);
  return Number.isNaN(value) || value < 1 ? 1 : value;
}

function createSlide(row, idx, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-news-slide';
  slide.id = `carousel-news-${id}-slide-${idx}`;
  slide.dataset.slideIndex = idx;
  [...row.children].forEach((cell) => {
    const isImage = cell.querySelector('picture') && !cell.textContent.trim();
    cell.className = isImage ? 'carousel-news-slide-image' : 'carousel-news-slide-content';
    slide.append(cell);
  });
  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    if (!heading.id) heading.id = `${slide.id}-title`;
    slide.setAttribute('aria-labelledby', heading.id);
  }
  const link = slide.querySelector('.carousel-news-slide-content :is(h1, h2, h3, h4, h5, h6) a')
    || slide.querySelector('.carousel-news-slide-content a');
  if (link) {
    link.classList.add('carousel-news-slide-link');
    slide.classList.add('is-linked');
  }
  slide.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(
    createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]),
  ));
  return slide;
}

export default function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  const rows = [...block.querySelectorAll(':scope > div')].filter((r) => r.children.length);

  block.id = `carousel-news-${id}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.className = 'carousel-news-slides-container';
  const track = document.createElement('ul');
  track.className = 'carousel-news-slides';
  rows.forEach((row, idx) => track.append(createSlide(row, idx, id)));
  container.append(track);

  const controls = document.createElement('div');
  controls.className = 'carousel-news-controls';
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Carousel slide controls');
  const indicators = document.createElement('ol');
  indicators.className = 'carousel-news-slide-indicators';
  nav.append(indicators);
  const arrows = document.createElement('div');
  arrows.className = 'carousel-news-navigation-buttons';
  arrows.innerHTML = `
    <button type="button" class="slide-prev" aria-label="Previous slides"></button>
    <button type="button" class="slide-next" aria-label="Next slides"></button>`;
  controls.append(nav, arrows);

  block.replaceChildren(container, controls);

  const slides = [...track.children];
  const spacer = document.createElement('li');
  spacer.className = 'carousel-news-spacer';
  spacer.setAttribute('aria-hidden', 'true');
  spacer.hidden = true;
  track.append(spacer);
  let pageCount = 1;
  let activePage = 0;

  const setActive = (page) => {
    activePage = page;
    block.dataset.activePage = page;
    const perView = getPerView(block);
    slides.forEach((slide, idx) => {
      const visible = Math.floor(idx / perView) === page;
      slide.setAttribute('aria-hidden', !visible);
      slide.querySelectorAll('a').forEach((a) => {
        if (visible) a.removeAttribute('tabindex');
        else a.setAttribute('tabindex', '-1');
      });
    });
    [...indicators.children].forEach((li, idx) => {
      const btn = li.querySelector('button');
      if (idx === page) {
        btn.setAttribute('aria-current', 'true');
        btn.disabled = true;
      } else {
        btn.removeAttribute('aria-current');
        btn.disabled = false;
      }
    });
  };

  const goTo = (page) => {
    const target = Math.max(0, Math.min(page, pageCount - 1));
    const first = slides[target * getPerView(block)];
    if (first) track.scrollTo({ left: first.offsetLeft - track.firstElementChild.offsetLeft, behavior: 'smooth' });
    setActive(target);
  };

  const build = () => {
    const perView = getPerView(block);
    pageCount = Math.max(1, Math.ceil(slides.length / perView));
    block.classList.toggle('is-single-page', pageCount < 2);
    // pad the last page so it can scroll fully into view (source shows a partial last page)
    const empty = pageCount * perView - slides.length;
    spacer.hidden = empty === 0 || pageCount < 2;
    spacer.style.setProperty('--carousel-news-empty', empty);
    indicators.replaceChildren();
    for (let i = 0; i < pageCount; i += 1) {
      const li = document.createElement('li');
      li.className = 'carousel-news-slide-indicator';
      li.innerHTML = `<button type="button" aria-label="Show page ${i + 1} of ${pageCount}"></button>`;
      li.querySelector('button').addEventListener('click', () => goTo(i));
      indicators.append(li);
    }
    setActive(Math.min(activePage, pageCount - 1));
  };

  // arrows loop around, matching the source slider
  arrows.querySelector('.slide-prev').addEventListener('click', () => goTo((activePage - 1 + pageCount) % pageCount));
  arrows.querySelector('.slide-next').addEventListener('click', () => goTo((activePage + 1) % pageCount));

  let scrollTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const width = (track.clientWidth + gap) || 1;
      const page = Math.round(track.scrollLeft / width);
      if (page !== activePage) setActive(Math.max(0, Math.min(page, pageCount - 1)));
    }, 100);
  }, { passive: true });

  let lastPerView = 0;
  const onResize = () => {
    const perView = getPerView(block);
    if (perView !== lastPerView) {
      lastPerView = perView;
      activePage = 0;
      track.scrollTo({ left: 0 });
      build();
    }
  };
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(block);
  onResize();
}
