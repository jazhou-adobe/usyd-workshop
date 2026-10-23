/**
 * Returns the Formstack public form URL authored in the block, or null.
 * @param {Element} block
 * @returns {URL|null}
 */
function getFormUrl(block) {
  const candidates = [
    ...[...block.querySelectorAll('a[href]')].map((a) => a.href),
    block.textContent.trim(),
  ];
  for (let i = 0; i < candidates.length; i += 1) {
    try {
      const url = new URL(candidates[i]);
      if (url.protocol === 'https:' && /(^|\.)formstack\.com$/.test(url.hostname)) return url;
    } catch (e) {
      // not a URL; try the next candidate
    }
  }
  return null;
}

/**
 * Builds the plain link shown before the form loads and if it cannot load.
 * @param {URL} url
 * @param {string} label
 * @returns {HTMLParagraphElement}
 */
function buildFallbackLink(url, label) {
  const p = document.createElement('p');
  p.className = 'embed-formstack-fallback';
  const a = document.createElement('a');
  a.href = url.href;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = `Open the ${label} in a new tab`;
  p.append(a);
  return p;
}

/**
 * Builds the sandboxed iframe of the Formstack public form.
 * @param {URL} url
 * @param {string} label
 * @returns {HTMLIFrameElement}
 */
function buildFrame(url, label) {
  const iframe = document.createElement('iframe');
  iframe.className = 'embed-formstack-frame';
  iframe.src = url.href;
  iframe.title = label;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.setAttribute('sandbox', [
    'allow-scripts',
    'allow-forms',
    'allow-same-origin',
    'allow-popups',
    'allow-popups-to-escape-sandbox',
  ].join(' '));
  iframe.allow = 'clipboard-write';
  return iframe;
}

/**
 * embed-formstack: renders a live Formstack form from the authored URL.
 * Authoring: one row holding the Formstack public form link
 * (https://<account>.formstack.com/forms/<slug>); optional link text is used
 * as the accessible name of the form region.
 *
 * Formstack's js.php embed writes the form with document.write, which
 * browsers ignore for asynchronously inserted scripts, so the block embeds
 * the form page in a sandboxed iframe once it nears the viewport.
 * @param {Element} block
 */
export default function decorate(block) {
  const url = getFormUrl(block);
  if (!url) {
    block.replaceChildren();
    block.closest('.embed-formstack-wrapper')?.remove();
    return;
  }

  const authoredText = block.querySelector('a')?.textContent.trim() || '';
  const label = authoredText && !/^https?:\/\//.test(authoredText) ? authoredText : 'Online form';

  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', label);

  const fallback = buildFallbackLink(url, label.toLowerCase() === 'online form' ? 'form' : label);
  block.replaceChildren(fallback);

  // the form autofocuses its first field; don't let that pull focus (and scroll)
  // away from the reader before they have interacted with the form
  let interacted = false;
  const markInteracted = () => { interacted = true; };
  block.addEventListener('pointerdown', markInteracted, { once: true });
  block.addEventListener('focusin', (e) => { if (e.target !== block.querySelector('iframe')) markInteracted(); });

  // the cross-origin form cannot report its height, so the frame starts at the
  // first-screen height and grows to the full-form height (CSS) once the reader
  // engages with it, keeping conditional fields out of an inner scrollbar
  const expand = () => block.classList.add('embed-formstack-expanded');

  const load = () => {
    if (block.querySelector('.embed-formstack-frame')) return;
    const iframe = buildFrame(url, label);
    block.classList.add('embed-formstack-loading');
    const { scrollX, scrollY } = window;
    let settled = false;
    // a cross-origin frame reports no pointer or focus events to the page; the
    // page window blurring onto the frame is the signal that the reader
    // clicked, tapped or tabbed into the form (the form's own autofocus,
    // undone below, happens before `settled`)
    const onWindowBlur = () => {
      if (!settled || document.activeElement !== iframe) return;
      window.removeEventListener('blur', onWindowBlur);
      expand();
    };
    window.addEventListener('blur', onWindowBlur);
    iframe.addEventListener('load', () => {
      block.classList.remove('embed-formstack-loading');
      block.classList.add('embed-formstack-loaded');
      // the form focuses itself shortly after load; return focus to the page
      [0, 300, 1000].forEach((delay) => setTimeout(() => {
        if (!interacted && document.activeElement === iframe) {
          iframe.blur();
          window.scrollTo(scrollX, scrollY);
        }
        if (delay === 1000) settled = true;
      }, delay));
    }, { once: true });
    // keep the link after the frame so the form stays reachable if framing fails
    block.prepend(iframe);
  };

  if (!('IntersectionObserver' in window)) {
    load();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: '400px 0px' });
  observer.observe(block);
}
