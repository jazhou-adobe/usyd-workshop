/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for sydney.edu.au (Centre for Drug Discovery Innovation).
 * Removes non-authorable global chrome. All selectors come from the captured DOM
 * (migration-work/cleaned.html).
 */

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    let nodes = [];
    try {
      nodes = [...root.querySelectorAll(sel)];
    } catch (e) {
      nodes = [];
    }
    nodes.forEach((n) => n.remove());
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Cookie / consent banner (Ketch) inside #lanyard_root
    removeAll(element, ['#lanyard_root', '#ketch-banner', '#ketch-consent-banner']);

    // Global header: the wrapper div around .m-local-desktop-nav
    // (equivalent of "#landing-page-16bd428537 > div:nth-child(5)")
    element.querySelectorAll('.m-local-desktop-nav').forEach((nav) => {
      const wrapper = nav.parentElement;
      if (wrapper && wrapper !== element && wrapper.children.length === 1) {
        wrapper.remove();
      } else {
        nav.remove();
      }
    });
    removeAll(element, [
      '.m-local-desktop-nav__skip-to-content-link',
      'header.m-local-desktop-nav__header',
    ]);

    // Empty skip-to-content anchor container. On older-layout pages the skip target
    // is the first content row itself, so only remove it when it holds no content.
    element.querySelectorAll('#skip-to-content').forEach((el) => {
      if (!el.textContent.trim() && !el.querySelector('img, iframe, form')) el.remove();
    });

    // Breadcrumb
    removeAll(element, ['.cmp-wrapper-breadcrumb']);

    // Footer (incl. Acknowledgement of Country band) and its experience-fragment wrapper
    removeAll(element, [
      '.exf-common-page',
      '.exf-footer',
      'footer.m-global-footer-wrapper',
      '.m-country-acknowledgement',
      '.m-global-footer',
    ]);

    // Tracking iframes / pixels (Adobe ID sync, DoubleClick)
    removeAll(element, [
      'iframe#destination_publishing_iframe_sydneyuni_0',
      'iframe[src*="demdex.net"]',
      'iframe[src*="doubleclick.net"]',
      'iframe',
      'img[src*="doubleclick.net"]',
      'img[src*="demdex.net"]',
      'img[width="1"][height="1"]',
    ]);

    // .m-hidden duplicate markup OUTSIDE the news list.
    // The .m-hidden list inside .m-wrapper-news-article-list holds all 13
    // articles and is read by the carousel-news parser, so keep it for now.
    element.querySelectorAll('.m-hidden').forEach((el) => {
      if (!el.closest('.m-wrapper-news-article-list')) el.remove();
    });

    // Carousel UI controls (non-authorable). Gallery carousels keep their indicators
    // until afterTransform: the carousel-gallery parser reads the authored slide order from them.
    element.querySelectorAll('.cmp-carousel__actions, .cmp-carousel__indicators, .swiper-notification')
      .forEach((el) => { if (!el.closest('.cmp-wrapper-carousel')) el.remove(); });
  }

  if (hookName === 'afterTransform') {
    // Any remaining hidden duplicate markup (news list source has been consumed by the parser)
    removeAll(element, ['.m-hidden']);

    // Final safety net for chrome and non-content elements
    removeAll(element, [
      '#lanyard_root',
      '.m-local-desktop-nav',
      '.cmp-wrapper-breadcrumb',
      'footer.m-global-footer-wrapper',
      '.m-country-acknowledgement',
      'iframe',
      'script',
      'style',
      'noscript',
      'link',
      'svg',
      'button',
    ]);

    // Strip tracking / framework attributes
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name;
        if (
          n.startsWith('data-analytics')
          || n.startsWith('data-track')
          || n.startsWith('data-gtm')
          || n.startsWith('on')
        ) {
          el.removeAttribute(n);
        }
      });
    });
  }
}
