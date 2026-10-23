/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for sydney.edu.au.
 * beforeTransform: inserts <hr> section breaks (while parser targets still exist),
 *   marking breaks of styled sections with a temporary data-excat-section-id.
 * afterTransform: inserts Section Metadata blocks for styled sections and
 *   removes temporary markers.
 */

const MARKER = 'data-excat-section-id';

function safeQueryAll(root, selector) {
  try {
    return [...root.querySelectorAll(selector)];
  } catch (e) {
    // Fallback for engines without :has() support: "A:has(B)"
    const m = selector.match(/^(.*):has\((.*)\)$/);
    if (!m) return [];
    try {
      return [...root.querySelectorAll(m[1])].filter((el) => el.querySelector(m[2]));
    } catch (e2) {
      return [];
    }
  }
}

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    const found = safeQueryAll(root, sel);
    if (found.length) return found[0];
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = (template && template.sections) || [];
  if (sections.length < 2) return;
  const document = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el) continue;
      if (i === 0) {
        if (section.style) {
          // temporary marker so the first section's style can be applied later
          const hr = document.createElement('hr');
          hr.setAttribute(MARKER, section.id);
          hr.setAttribute('data-excat-first', 'true');
          el.parentNode.insertBefore(hr, el);
        }
        continue;
      }
      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      // End of this section = right before the next section break, else end of the content
      let anchor = null;
      const sectionEl = findSectionElement(element, section);
      if (sectionEl && sectionEl.parentNode) {
        anchor = sectionEl;
        anchor.parentNode.insertBefore(metadata, anchor.nextSibling);
      } else if (marker) {
        // section element replaced by a parser: walk forward from the marker to the next <hr>
        let cursor = marker;
        let last = marker;
        while (cursor.nextElementSibling && cursor.nextElementSibling.tagName !== 'HR') {
          cursor = cursor.nextElementSibling;
          last = cursor;
        }
        last.parentNode.insertBefore(metadata, last.nextSibling);
      } else {
        element.appendChild(metadata);
      }

      if (marker) {
        if (marker.getAttribute('data-excat-first') === 'true') {
          marker.remove();
        } else {
          marker.removeAttribute(MARKER);
        }
      }
    }

    // clean any leftover markers
    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => {
      if (hr.getAttribute('data-excat-first') === 'true') hr.remove();
      else hr.removeAttribute(MARKER);
    });
  }
}
