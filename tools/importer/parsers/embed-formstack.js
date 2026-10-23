/* eslint-disable */
/* global WebImporter */

/**
 * Parser for embed-formstack (sydney.edu.au .m-formstack-wrapper).
 * Block table (embed convention): one row, one column = link to the public form URL
 *   https://<account>.formstack.com/forms/<slug>
 * URL source order:
 *   1. wrapper script src  .../forms/js.php/<slug>
 *   2. <noscript> fallback link (may be parsed or raw text)
 *   3. any formstack.com/forms/<slug> link inside the wrapper
 *   4. rendered form: action host + known form id -> slug
 * Link text: the heading of the enclosing row (e.g. "Membership form"), else the URL.
 */
const ORIGIN = 'https://www.sydney.edu.au';

// Rendered forms carry only the numeric id; map ids seen on the source site to slugs.
const KNOWN_FORMS = {
  3543756: { account: 'facultyofscienceuniversityofsydney', slug: 'drug_discovery_initiative_membership' },
};

function absUrl(url) {
  if (!url) return url;
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function publicUrl(raw) {
  if (!raw) return null;
  const m = absUrl(raw).match(/^https?:\/\/([a-z0-9-]+)\.formstack\.com\/forms\/(?:js\.php\/)?([A-Za-z0-9_-]+)/i);
  if (!m || /^(index|js)$/i.test(m[2])) return null;
  return `https://${m[1]}.formstack.com/forms/${m[2]}`;
}

function formUrl(element) {
  // 1. embed script
  for (const s of element.querySelectorAll('script[src]')) {
    const u = publicUrl(s.getAttribute('src'));
    if (u) return u;
  }
  // 2. noscript fallback (content may be text in some DOM implementations)
  for (const ns of element.querySelectorAll('noscript')) {
    const a = ns.querySelector('a[href]');
    const u = publicUrl(a ? a.getAttribute('href') : (ns.textContent.match(/href="([^"]+)"/) || [])[1]);
    if (u) return u;
  }
  // 3. any link to the form
  for (const a of element.querySelectorAll('a[href*="formstack.com/forms/"]')) {
    const u = publicUrl(a.getAttribute('href'));
    if (u) return u;
  }
  // 4. rendered form: account from the action host, slug from the known form id
  const form = element.querySelector('form');
  const idInput = element.querySelector('input[name="form"]');
  const container = element.querySelector('[id^="fsform-container-"]');
  const id = (idInput && idInput.getAttribute('value'))
    || ((form && form.id) || '').replace(/\D/g, '')
    || (container ? container.id.replace(/\D/g, '') : '');
  const known = id && KNOWN_FORMS[id];
  if (!known) return null;
  const action = form && form.getAttribute('action');
  const account = (action && (action.match(/^https?:\/\/([a-z0-9-]+)\.formstack\.com/i) || [])[1]) || known.account;
  return `https://${account}.formstack.com/forms/${known.slug}`;
}

function formLabel(element) {
  const row = element.closest('.cmp-container--css-grid--section-layout');
  const scope = row || element.parentElement;
  if (!scope) return null;
  const h = [...scope.querySelectorAll('h1, h2, h3, h4, h5, h6')]
    .find((x) => !element.contains(x) && x.textContent.trim());
  return h ? h.textContent.trim() : null;
}

export default function parse(element, { document }) {
  const url = formUrl(element);
  if (!url) {
    // nothing authorable without a form URL
    element.remove();
    return;
  }
  const a = document.createElement('a');
  a.href = url;
  a.textContent = formLabel(element) || url;
  const p = document.createElement('p');
  p.append(a);

  const cells = [[p]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-formstack', cells });
  element.replaceWith(block);
}
