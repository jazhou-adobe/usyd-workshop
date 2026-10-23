/**
 * accordion-plus: expandable items separated by thin rules, with a plus/minus icon.
 * Authoring: one row per item, [title | content].
 * Each title is a real <button> with aria-expanded/aria-controls; panels start collapsed.
 * Panels slide open/closed (source: 200ms height animation after a 10ms delay).
 * @param {Element} block
 */

let accordionId = 0;

const OPEN_EASING = 'cubic-bezier(0.2, 0.62, 0.24, 0.98)';
const CLOSE_EASING = 'cubic-bezier(0.22, 1.04, 0.82, 1)';
const DURATION = 200;
const DELAY = 10;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setExpanded(item, expand) {
  const button = item.querySelector('.accordion-plus-button');
  const panel = item.querySelector('.accordion-plus-panel');
  if (!button || !panel) return;

  button.setAttribute('aria-expanded', expand ? 'true' : 'false');
  item.classList.toggle('is-open', expand);

  if (panel.accordionAnimation) panel.accordionAnimation.cancel();

  if (prefersReducedMotion() || typeof panel.animate !== 'function') {
    panel.hidden = !expand;
    return;
  }

  const startHeight = panel.hidden ? 0 : panel.getBoundingClientRect().height;
  panel.hidden = false;
  const endHeight = expand ? panel.scrollHeight : 0;
  const animation = panel.animate(
    [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
    {
      duration: DURATION,
      delay: DELAY,
      easing: expand ? OPEN_EASING : CLOSE_EASING,
      fill: 'backwards',
    },
  );
  panel.accordionAnimation = animation;
  panel.classList.add('is-animating');
  animation.onfinish = () => {
    panel.accordionAnimation = null;
    panel.classList.remove('is-animating');
    panel.hidden = !expand;
  };
  animation.oncancel = () => {
    panel.classList.remove('is-animating');
  };
}

/**
 * Source pages place the accordion in the right-hand column of a 30/60 layout.
 * When the preceding columns-title-left block has an empty body column, the
 * accordion is that column's only content, so move the block into it.
 * @param {Element} block
 */
function placeBesideTitle(block) {
  const wrapper = block.parentElement;
  const prev = wrapper?.previousElementSibling;
  if (!wrapper?.classList.contains('accordion-plus-wrapper')
    || !prev?.classList.contains('columns-title-left-wrapper')) return;
  const titleBlock = prev.querySelector(':scope > .columns-title-left');
  const row = titleBlock?.querySelector(':scope > div:last-child');
  const bodyCell = row?.querySelector(':scope > .columns-title-left-body')
    || row?.children[1];
  if (!bodyCell || bodyCell.children.length || bodyCell.textContent.trim()) return;
  bodyCell.append(wrapper);
}

export default function decorate(block) {
  placeBesideTitle(block);

  accordionId += 1;
  const id = accordionId;
  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.children.length && row.textContent.trim());

  const items = rows.map((row, idx) => {
    const [titleCell, ...contentCells] = [...row.children];
    const buttonId = `accordion-plus-${id}-button-${idx}`;
    const panelId = `accordion-plus-${id}-panel-${idx}`;

    const item = document.createElement('div');
    item.className = 'accordion-plus-item';

    const heading = document.createElement('h3');
    heading.className = 'accordion-plus-heading';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-plus-button';
    button.id = buttonId;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', panelId);
    const label = document.createElement('span');
    label.className = 'accordion-plus-title';
    const labelSource = titleCell.querySelector('p, h1, h2, h3, h4, h5, h6') || titleCell;
    label.innerHTML = labelSource.innerHTML;
    label.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
    const icon = document.createElement('span');
    icon.className = 'accordion-plus-icon';
    icon.setAttribute('aria-hidden', 'true');
    button.append(label, icon);
    heading.append(button);

    const panel = document.createElement('div');
    panel.className = 'accordion-plus-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', buttonId);
    panel.hidden = true;
    const inner = document.createElement('div');
    inner.className = 'accordion-plus-panel-inner';
    contentCells.forEach((cell) => inner.append(...cell.childNodes));
    panel.append(inner);

    item.append(heading, panel);
    return item;
  });

  block.replaceChildren(...items);

  block.addEventListener('click', (e) => {
    const button = e.target.closest('.accordion-plus-button');
    if (!button || button.closest('.accordion-plus') !== block) return;
    const item = button.closest('.accordion-plus-item');
    setExpanded(item, button.getAttribute('aria-expanded') !== 'true');
  });
}
