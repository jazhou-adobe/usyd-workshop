import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * carousel-gallery: one slide per view with page dots, prev/next arrows and
 * play/pause. Slides are either captioned photos or text quotes.
 * Authoring: one row per slide, [image | text].
 *  - Photo slide: image in the first cell, caption paragraph in the second.
 *  - Quote slide: empty (or missing) image cell; text cell holds the quotation
 *    paragraph(s), then the attribution name (bold) and the position.
 * Autoplay starts only when the user does not prefer reduced motion, and pauses
 * on hover/focus. Inactive slides are inert.
 * @param {Element} block
 */

const AUTOPLAY_DELAY = 5000;
let carouselId = 0;

// source icons (48x48 viewBox, non-scaling strokes, rendered at 12px)
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">${body}</svg>`;
const ICONS = {
  prev: svg('<path d="M32 44 12.4 24.94a1.27 1.27 0 0 1-.3-.43 1.26 1.26 0 0 1 0-1.02 1.27 1.27 0 0 1 .3-.43L32 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'),
  next: svg('<path d="m12 4 19.6 19.06a1.27 1.27 0 0 1 .3.43 1.26 1.26 0 0 1 0 1.02 1.27 1.27 0 0 1-.3.43L12 44" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'),
  play: svg('<path class="carousel-gallery-icon-play" d="M12 44V4l32 20-32 20Z" fill="currentColor" stroke="currentColor" stroke-width="0.75" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'
    + '<g class="carousel-gallery-icon-pause" fill="currentColor" stroke="currentColor" stroke-width="0.75" stroke-linejoin="round" vector-effect="non-scaling-stroke"><rect x="2.57" y="2.57" width="14.57" height="42.86"/><rect x="30.86" y="2.57" width="14.57" height="42.86"/></g>'),
};

function isStrongOnly(p) {
  const strong = p.querySelector(':scope > strong, :scope > b');
  return strong && strong.textContent.trim() === p.textContent.trim();
}

function decorateQuote(content) {
  const blockquote = content.querySelector('blockquote');
  const paras = [...content.querySelectorAll(':scope > p')];
  const nameIdx = paras.findIndex(isStrongOnly);

  const figure = document.createElement('figure');
  figure.className = 'carousel-gallery-quote';
  const quote = document.createElement('blockquote');
  quote.className = 'carousel-gallery-quote-text';
  const attribution = document.createElement('figcaption');
  attribution.className = 'carousel-gallery-quote-attribution';

  if (blockquote) {
    quote.append(...blockquote.childNodes);
    blockquote.remove();
    attribution.append(...content.childNodes);
  } else if (nameIdx > 0) {
    quote.append(...paras.slice(0, nameIdx));
    attribution.append(...paras.slice(nameIdx));
  } else if (paras.length > 2) {
    // no bold name: treat the last two paragraphs as name and position
    quote.append(...paras.slice(0, -2));
    attribution.append(...paras.slice(-2));
  } else {
    quote.append(...content.childNodes);
  }

  const [name, ...position] = [...attribution.children];
  if (name) name.classList.add('carousel-gallery-quote-name');
  position.forEach((p) => p.classList.add('carousel-gallery-quote-position'));

  figure.append(quote);
  if (attribution.children.length || attribution.textContent.trim()) figure.append(attribution);
  content.replaceChildren(figure);
}

function createSlide(row, idx, id, total) {
  const slide = document.createElement('li');
  slide.className = 'carousel-gallery-slide';
  slide.id = `carousel-gallery-${id}-slide-${idx}`;
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${idx + 1} of ${total}`);

  const cells = [...row.children];
  const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
  const textCells = cells.filter((cell) => cell !== imageCell && cell.textContent.trim());

  if (imageCell) {
    slide.classList.add('is-photo');
    const figure = document.createElement('figure');
    figure.className = 'carousel-gallery-photo';
    const img = imageCell.querySelector('img');
    const media = document.createElement('div');
    media.className = 'carousel-gallery-image';
    media.append(createOptimizedPicture(img.src, img.alt || '', idx === 0, [
      { media: '(width >= 900px)', width: '2000' },
      { width: '750' },
    ]));
    figure.append(media);
    const captionText = textCells.length ? textCells : [...imageCell.querySelectorAll('p')]
      .filter((p) => !p.querySelector('picture') && p.textContent.trim());
    if (captionText.length) {
      const caption = document.createElement('figcaption');
      caption.className = 'carousel-gallery-caption';
      captionText.forEach((cell) => caption.append(...(cell.tagName === 'P' ? [cell] : cell.childNodes)));
      figure.append(caption);
    }
    slide.append(figure);
  } else {
    slide.classList.add('is-quote');
    const content = document.createElement('div');
    content.className = 'carousel-gallery-content';
    textCells.forEach((cell) => content.append(...cell.childNodes));
    decorateQuote(content);
    slide.append(content);
  }
  return slide;
}

export default function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.children.length && (row.textContent.trim() || row.querySelector('img')));

  block.id = `carousel-gallery-${id}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  if (!block.getAttribute('aria-label')) block.setAttribute('aria-label', 'Gallery');

  const container = document.createElement('div');
  container.className = 'carousel-gallery-slides-container';
  const track = document.createElement('ul');
  track.className = 'carousel-gallery-slides';
  track.setAttribute('aria-live', 'off');
  const slides = rows.map((row, idx) => createSlide(row, idx, id, rows.length));
  track.append(...slides);
  container.append(track);

  const controls = document.createElement('div');
  controls.className = 'carousel-gallery-controls';
  const indicators = document.createElement('div');
  indicators.className = 'carousel-gallery-indicators';
  indicators.setAttribute('role', 'group');
  indicators.setAttribute('aria-label', 'Choose slide');
  slides.forEach((slide, idx) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-gallery-indicator';
    dot.setAttribute('aria-label', `Show slide ${idx + 1} of ${slides.length}`);
    dot.setAttribute('aria-controls', slide.id);
    indicators.append(dot);
  });

  const buttons = document.createElement('div');
  buttons.className = 'carousel-gallery-buttons';
  buttons.innerHTML = `
    <button type="button" class="carousel-gallery-prev" aria-label="Previous slide">${ICONS.prev}</button>
    <button type="button" class="carousel-gallery-play" aria-label="Play slideshow">${ICONS.play}</button>
    <button type="button" class="carousel-gallery-next" aria-label="Next slide">${ICONS.next}</button>`;
  controls.append(indicators, buttons);

  block.replaceChildren(container, controls);
  if (slides.length < 2) {
    block.classList.add('is-single');
    controls.hidden = true;
  }

  let active = 0;
  const setActive = (index) => {
    active = (index + slides.length) % slides.length;
    track.style.setProperty('--carousel-gallery-index', active);
    slides.forEach((slide, idx) => {
      const isActive = idx === active;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', !isActive);
      slide.inert = !isActive;
    });
    [...indicators.children].forEach((dot, idx) => {
      if (idx === active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const playBtn = buttons.querySelector('.carousel-gallery-play');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer;
  let playing = false;
  let hovered = false;
  let focused = false;

  const stopTimer = () => {
    clearInterval(timer);
    timer = undefined;
  };
  const startTimer = () => {
    stopTimer();
    if (playing && !hovered && !focused && slides.length > 1) {
      timer = setInterval(() => setActive(active + 1), AUTOPLAY_DELAY);
    }
  };
  const setPlaying = (value) => {
    playing = value;
    block.classList.toggle('is-playing', playing);
    playBtn.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
    track.setAttribute('aria-live', playing ? 'off' : 'polite');
    startTimer();
  };

  const goTo = (index) => {
    setActive(index);
    startTimer();
  };

  indicators.addEventListener('click', (e) => {
    const dot = e.target.closest('.carousel-gallery-indicator');
    if (dot) goTo([...indicators.children].indexOf(dot));
  });
  buttons.querySelector('.carousel-gallery-prev').addEventListener('click', () => goTo(active - 1));
  buttons.querySelector('.carousel-gallery-next').addEventListener('click', () => goTo(active + 1));
  playBtn.addEventListener('click', () => setPlaying(!playing));

  block.addEventListener('mouseenter', () => { hovered = true; stopTimer(); });
  block.addEventListener('mouseleave', () => { hovered = false; startTimer(); });
  // pause while focus is inside the slides (controls keep the user's play/pause choice)
  block.addEventListener('focusin', (e) => {
    focused = !e.target.closest('.carousel-gallery-controls');
    if (focused) stopTimer();
  });
  block.addEventListener('focusout', (e) => {
    const next = e.relatedTarget;
    if (focused && (!next || !container.contains(next))) { focused = false; startTimer(); }
  });

  // swipe support
  let touchX = null;
  track.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? active + 1 : active - 1);
  }, { passive: true });

  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) setPlaying(false); });

  setActive(0);
  // source carousels start paused; the "autoplay" variant starts playing
  setPlaying(block.classList.contains('autoplay') && !reducedMotion.matches && slides.length > 1);
}
