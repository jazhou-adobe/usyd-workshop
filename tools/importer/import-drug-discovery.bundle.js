/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-drug-discovery.js
  var import_drug_discovery_exports = {};
  __export(import_drug_discovery_exports, {
    default: () => import_drug_discovery_default
  });

  // tools/importer/parsers/hero-orange-band.js
  var ORIGIN = "https://www.sydney.edu.au";
  function absUrl(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN}${u}`;
    return u;
  }
  function parse(element, { document }) {
    const hero = element.querySelector(".m-hero--desktop, .m-hero") || element;
    const dataDiv = [...element.children].find((c) => c.tagName === "DIV" && !c.className);
    let image = null;
    const srcImg = hero.querySelector(".m-hero--desktop__image-wrapper img, img");
    if (srcImg) {
      image = document.createElement("img");
      image.src = absUrl(srcImg.getAttribute("src"));
      image.alt = srcImg.getAttribute("alt") || "";
    } else if (dataDiv) {
      const pathP = [...dataDiv.querySelectorAll(":scope > p")].find((p) => /\/content\/dam\/.+\.(jpe?g|png|webp|gif|svg)$/i.test(p.textContent.trim()));
      if (pathP) {
        image = document.createElement("img");
        image.src = absUrl(pathP.textContent.trim());
        image.alt = "";
      }
    }
    let title = null;
    const srcTitle = hero.querySelector(".m-hero--desktop__title, h1");
    const titleText = srcTitle ? srcTitle.textContent.trim() : dataDiv && dataDiv.querySelector("h1, h2") ? dataDiv.querySelector("h1, h2").textContent.trim() : "";
    if (titleText) {
      title = document.createElement("h1");
      title.textContent = titleText;
    }
    const descriptions = [];
    const descWrap = hero.querySelector(".m-hero--desktop__description") || dataDiv && dataDiv.querySelector(":scope > div");
    if (descWrap) {
      const ps = [...descWrap.querySelectorAll("p")].filter((p) => p.textContent.trim());
      if (ps.length) {
        ps.forEach((p) => {
          const np = document.createElement("p");
          np.innerHTML = p.innerHTML.trim();
          descriptions.push(np);
        });
      } else if (descWrap.textContent.trim()) {
        const np = document.createElement("p");
        np.textContent = descWrap.textContent.trim();
        descriptions.push(np);
      }
    }
    const ctas = [];
    const ctaLinks = [...hero.querySelectorAll(".m-hero--desktop__cta a[href], .m-hero--desktop__cta-wrapper a[href]")];
    const seen = /* @__PURE__ */ new Set();
    ctaLinks.forEach((a) => {
      const href = absUrl(a.getAttribute("href"));
      const text = (a.querySelector(".cmp-button__text") || a).textContent.trim();
      if (!href || !text || seen.has(href + text)) return;
      seen.add(href + text);
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      p.append(link);
      ctas.push(p);
    });
    if (!ctas.length && dataDiv) {
      dataDiv.querySelectorAll("ul > li").forEach((li) => {
        const spans = li.querySelectorAll("span");
        if (spans.length >= 2 && spans[0].textContent.trim() && spans[1].textContent.trim()) {
          const p = document.createElement("p");
          const link = document.createElement("a");
          link.href = absUrl(spans[0].textContent.trim());
          link.textContent = spans[1].textContent.trim();
          p.append(link);
          ctas.push(p);
        }
      });
    }
    const cells = [];
    if (image) cells.push([image]);
    const content = [];
    if (title) content.push(title);
    content.push(...descriptions, ...ctas);
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-orange-band", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-bleed-image.js
  var ORIGIN2 = "https://www.sydney.edu.au";
  function absUrl2(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("mailto:") || u.startsWith("tel:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN2}${u}`;
    return u;
  }
  function parse2(element, { document }) {
    const wrapper = element.closest(".cmp-wrapper-teaser") || element;
    const wrapperClasses = wrapper.className || "";
    const textCell = [];
    const content = element.querySelector(".cmp-teaser-content") || element.querySelector(".m-content-w-bleed-image__content") || element;
    const pretitle = content.querySelector(".cmp-teaser-content__pretitle");
    if (pretitle && pretitle.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = pretitle.textContent.trim();
      textCell.push(p);
    }
    const srcTitle = content.querySelector(".cmp-teaser-content__title") || content.querySelector("h1, h2, h3");
    if (srcTitle && srcTitle.textContent.trim()) {
      const h2 = document.createElement("h2");
      h2.textContent = srcTitle.textContent.trim();
      textCell.push(h2);
    }
    const desc = content.querySelector(".cmp-teaser-content__description");
    if (desc) {
      const blocks = [...desc.children].filter((c) => /^(P|UL|OL|H[1-6]|BLOCKQUOTE)$/.test(c.tagName));
      if (blocks.length) {
        blocks.forEach((child) => {
          if (!child.textContent.trim()) return;
          const clone = child.cloneNode(true);
          clone.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl2(a.getAttribute("href"))));
          textCell.push(clone);
        });
      } else if (desc.textContent.trim()) {
        const p = document.createElement("p");
        [...desc.childNodes].forEach((n) => {
          if (n.nodeType === 3 || n.nodeType === 1) p.append(n.cloneNode(true));
        });
        p.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl2(a.getAttribute("href"))));
        if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, "");
        if (p.lastChild && p.lastChild.nodeType === 3) p.lastChild.textContent = p.lastChild.textContent.replace(/\s+$/, "");
        textCell.push(p);
      }
    }
    const seen = /* @__PURE__ */ new Set();
    const addLink = (href, text) => {
      if (!href || !text || seen.has(href + text)) return;
      seen.add(href + text);
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = absUrl2(href);
      link.textContent = text;
      p.append(link);
      textCell.push(p);
    };
    content.querySelectorAll("ul.m-list a[href]").forEach((a) => {
      addLink(a.getAttribute("href"), (a.querySelector(".m-list__title") || a).textContent.trim());
    });
    content.querySelectorAll(".cmp-teaser-content__cta-holder a[href]").forEach((a) => {
      addLink(a.getAttribute("href"), (a.querySelector(".cmp-button__text") || a).textContent.trim());
    });
    const imageCell = [];
    const srcImg = element.querySelector('.m-content-w-bleed-image__image img:not([src^="data:"]), .m-content-w-image-std__image img:not([src^="data:"])') || [...element.querySelectorAll('img:not([src^="data:"])')].find((img) => !img.closest(".cmp-teaser-content"));
    if (srcImg) {
      const img = document.createElement("img");
      img.src = absUrl2(srcImg.getAttribute("src"));
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell.push(img);
    }
    const imageLeft = /\bm-content-w-image--image-left\b/.test(wrapperClasses);
    const imgCol = imageCell.length ? imageCell : "";
    const cells = [imageLeft ? [imgCol, textCell] : [textCell, imgCol]];
    const name = /\bm-content-w-image--sandstone\b/.test(wrapperClasses) ? "columns-bleed-image (sandstone)" : "columns-bleed-image";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-portrait.js
  var ORIGIN3 = "https://www.sydney.edu.au";
  function absUrl3(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN3}${u}`;
    return u;
  }
  function parse3(element, { document }) {
    const cells = [];
    const cards = [...element.querySelectorAll(".m-wrapper-card")];
    cards.forEach((card) => {
      const visible = card.querySelector(".m-card") || card;
      const dataDiv = [...card.children].find((c) => c.tagName === "DIV" && !c.classList.contains("m-card"));
      let imageCell = "";
      const srcImg = visible.querySelector(".m-card__image-wrapper img, img");
      if (srcImg && srcImg.getAttribute("src")) {
        const img = document.createElement("img");
        img.src = absUrl3(srcImg.getAttribute("src"));
        img.alt = srcImg.getAttribute("alt") || "";
        imageCell = img;
      }
      const linkEl = visible.querySelector("a[href]") || dataDiv && dataDiv.querySelector("a[href]");
      const href = linkEl ? absUrl3(linkEl.getAttribute("href")) : null;
      const srcTitle = visible.querySelector(".m-card__title") || dataDiv && dataDiv.querySelector("h1, h2, h3, h4");
      const titleText = srcTitle ? srcTitle.textContent.trim() : "";
      const body = [];
      if (titleText) {
        const h3 = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.href = href;
          a.textContent = titleText;
          h3.append(a);
        } else {
          h3.textContent = titleText;
        }
        body.push(h3);
      }
      const desc = visible.querySelector(".m-card__description") || dataDiv && [...dataDiv.querySelectorAll("div")].find((d) => d.querySelector("p"));
      if (desc) {
        const ps = [...desc.querySelectorAll("p")].filter((p) => p.textContent.trim());
        if (ps.length) {
          ps.forEach((p) => {
            const np = document.createElement("p");
            np.innerHTML = p.innerHTML.trim();
            body.push(np);
          });
        } else if (desc.textContent.trim()) {
          const np = document.createElement("p");
          np.textContent = desc.textContent.trim();
          body.push(np);
        }
      }
      if (imageCell || body.length) cells.push([imageCell, body.length ? body : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-portrait", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-news.js
  var ORIGIN4 = "https://www.sydney.edu.au";
  function absUrl4(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN4}${u}`;
    return u;
  }
  function norm(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse4(element, { document }) {
    const wrapper = element.closest(".m-wrapper-news-article-list") || element.parentElement;
    const hiddenList = wrapper ? [...wrapper.children].find((c) => c.classList && c.classList.contains("m-hidden")) || wrapper.querySelector(".m-hidden") : null;
    const visible = /* @__PURE__ */ new Map();
    element.querySelectorAll(".m-news-article-list__articles, .m-card").forEach((card) => {
      const titleEl = card.querySelector(".m-card__title, h2, h3");
      const title = norm(titleEl && titleEl.textContent);
      if (!title || visible.has(title)) return;
      const img = card.querySelector('img:not([src^="data:"])');
      const link = card.querySelector("a[href]");
      const desc = card.querySelector(".m-card__description");
      visible.set(title, {
        title,
        image: img ? absUrl4(img.getAttribute("src")) : null,
        alt: img ? img.getAttribute("alt") || "" : "",
        href: link ? absUrl4(link.getAttribute("href")) : null,
        description: norm(desc && desc.textContent)
      });
    });
    const articles = [];
    const seen = /* @__PURE__ */ new Set();
    if (hiddenList) {
      hiddenList.querySelectorAll(":scope > ul > li, li").forEach((li) => {
        const titleEl = li.querySelector("h1, h2, h3, h4");
        const title = norm(titleEl && titleEl.textContent);
        if (!title || seen.has(title)) return;
        seen.add(title);
        const v = visible.get(title) || {};
        const linkEl = li.querySelector("a[href]");
        const descEl = li.querySelector(":scope > div");
        const imgPath = [...li.querySelectorAll(":scope > span")].map((s) => s.textContent.trim()).find((t) => /^(https?:\/\/[^\s]+|\/content\/dam\/[^\s]+)\.(jpe?g|png|webp|gif|svg)$/i.test(t));
        articles.push({
          title,
          href: linkEl ? absUrl4(linkEl.getAttribute("href")) : v.href,
          description: norm(descEl && descEl.textContent) || v.description,
          image: v.image || (imgPath ? absUrl4(imgPath) : null),
          alt: v.alt || ""
        });
      });
    }
    visible.forEach((v, title) => {
      if (seen.has(title)) return;
      seen.add(title);
      articles.push(v);
    });
    const cells = [];
    articles.forEach((art) => {
      let imageCell = "";
      if (art.image) {
        const img = document.createElement("img");
        img.src = art.image;
        img.alt = art.alt || "";
        imageCell = img;
      }
      const body = [];
      const h3 = document.createElement("h3");
      if (art.href) {
        const a = document.createElement("a");
        a.href = art.href;
        a.textContent = art.title;
        h3.append(a);
      } else {
        h3.textContent = art.title;
      }
      body.push(h3);
      if (art.description) {
        const p = document.createElement("p");
        p.textContent = art.description;
        body.push(p);
      }
      cells.push([imageCell, body]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-contact.js
  var ORIGIN5 = "https://www.sydney.edu.au";
  function absUrl5(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("mailto:") || u.startsWith("tel:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN5}${u}`;
    return u;
  }
  function parse5(element, { document }) {
    const headingCell = [];
    const srcHeading = element.querySelector(".cmp-title .cmp-title__text, .cmp-title h2");
    if (srcHeading) {
      const h2 = document.createElement("h2");
      h2.textContent = srcHeading.textContent.trim();
      headingCell.push(h2);
    }
    const linksCell = [];
    const list = element.querySelector(".cmp-wrapper-list");
    if (list) {
      const iconMap = {};
      const dataDiv = [...list.children].find((c) => c.tagName === "DIV");
      if (dataDiv) {
        dataDiv.querySelectorAll("li").forEach((li) => {
          const a = li.querySelector("a[href]");
          const match = li.textContent.match(/\S+\.(svg|png|jpe?g|webp|gif)\b/i);
          const path = match && match[0];
          if (a && path) iconMap[a.getAttribute("href")] = path.split("/").pop().replace(/\.[a-z]+$/i, "");
        });
      }
      const items = [...list.querySelectorAll("ul.m-list a[href]")];
      const source = items.length ? items : dataDiv ? [...dataDiv.querySelectorAll("li > a[href]")] : [];
      source.forEach((a) => {
        const rawHref = a.getAttribute("href");
        const text2 = (a.querySelector(".m-list__title, span") || a).textContent.trim();
        if (!text2) return;
        const p = document.createElement("p");
        if (iconMap[rawHref]) p.append(`:${iconMap[rawHref]}: `);
        const link = document.createElement("a");
        link.href = absUrl5(rawHref);
        link.textContent = text2;
        p.append(link);
        linksCell.push(p);
      });
    }
    const contactCell = [];
    const text = element.querySelector(".cmp-wrapper-js-text .cmp-text, .cmp-text .cmp-text");
    if (text) {
      [...text.children].forEach((child) => {
        if (!child.textContent.trim()) return;
        if (/^H[1-6]$/.test(child.tagName)) {
          const h = document.createElement("h3");
          h.textContent = child.textContent.trim();
          contactCell.push(h);
        } else {
          const clone = child.cloneNode(true);
          clone.querySelectorAll("br").forEach((br) => {
            if (!br.nextSibling || !br.nextSibling.textContent.trim()) br.remove();
          });
          clone.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl5(a.getAttribute("href"))));
          contactCell.push(clone);
        }
      });
    }
    const cells = [[
      headingCell.length ? headingCell : "",
      linksCell.length ? linksCell : "",
      contactCell.length ? contactCell : ""
    ]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/sydney-cleanup.js
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
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      removeAll(element, ["#lanyard_root", "#ketch-banner", "#ketch-consent-banner"]);
      element.querySelectorAll(".m-local-desktop-nav").forEach((nav) => {
        const wrapper = nav.parentElement;
        if (wrapper && wrapper !== element && wrapper.children.length === 1) {
          wrapper.remove();
        } else {
          nav.remove();
        }
      });
      removeAll(element, [
        ".m-local-desktop-nav__skip-to-content-link",
        "header.m-local-desktop-nav__header"
      ]);
      element.querySelectorAll("#skip-to-content").forEach((el) => {
        if (!el.textContent.trim() && !el.querySelector("img, iframe, form")) el.remove();
      });
      removeAll(element, [".cmp-wrapper-breadcrumb"]);
      removeAll(element, [
        ".exf-common-page",
        ".exf-footer",
        "footer.m-global-footer-wrapper",
        ".m-country-acknowledgement",
        ".m-global-footer"
      ]);
      removeAll(element, [
        "iframe#destination_publishing_iframe_sydneyuni_0",
        'iframe[src*="demdex.net"]',
        'iframe[src*="doubleclick.net"]',
        "iframe",
        'img[src*="doubleclick.net"]',
        'img[src*="demdex.net"]',
        'img[width="1"][height="1"]'
      ]);
      element.querySelectorAll(".m-hidden").forEach((el) => {
        if (!el.closest(".m-wrapper-news-article-list")) el.remove();
      });
      element.querySelectorAll(".cmp-carousel__actions, .cmp-carousel__indicators, .swiper-notification").forEach((el) => {
        if (!el.closest(".cmp-wrapper-carousel")) el.remove();
      });
    }
    if (hookName === "afterTransform") {
      removeAll(element, [".m-hidden"]);
      removeAll(element, [
        "#lanyard_root",
        ".m-local-desktop-nav",
        ".cmp-wrapper-breadcrumb",
        "footer.m-global-footer-wrapper",
        ".m-country-acknowledgement",
        "iframe",
        "script",
        "style",
        "noscript",
        "link",
        "svg",
        "button"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const n = attr.name;
          if (n.startsWith("data-analytics") || n.startsWith("data-track") || n.startsWith("data-gtm") || n.startsWith("on")) {
            el.removeAttribute(n);
          }
        });
      });
    }
  }

  // tools/importer/transformers/sydney-sections.js
  var MARKER = "data-excat-section-id";
  function safeQueryAll(root, selector) {
    try {
      return [...root.querySelectorAll(selector)];
    } catch (e) {
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
  function transform2(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && template.sections || [];
    if (sections.length < 2) return;
    const document = element.ownerDocument;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el) continue;
        if (i === 0) {
          if (section.style) {
            const hr2 = document.createElement("hr");
            hr2.setAttribute(MARKER, section.id);
            hr2.setAttribute("data-excat-first", "true");
            el.parentNode.insertBefore(hr2, el);
          }
          continue;
        }
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        let anchor = null;
        const sectionEl = findSectionElement(element, section);
        if (sectionEl && sectionEl.parentNode) {
          anchor = sectionEl;
          anchor.parentNode.insertBefore(metadata, anchor.nextSibling);
        } else if (marker) {
          let cursor = marker;
          let last = marker;
          while (cursor.nextElementSibling && cursor.nextElementSibling.tagName !== "HR") {
            cursor = cursor.nextElementSibling;
            last = cursor;
          }
          last.parentNode.insertBefore(metadata, last.nextSibling);
        } else {
          element.appendChild(metadata);
        }
        if (marker) {
          if (marker.getAttribute("data-excat-first") === "true") {
            marker.remove();
          } else {
            marker.removeAttribute(MARKER);
          }
        }
      }
      element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => {
        if (hr.getAttribute("data-excat-first") === "true") hr.remove();
        else hr.removeAttribute(MARKER);
      });
    }
  }

  // tools/importer/import-drug-discovery.js
  var PAGE_TEMPLATE = {
    "name": "drug-discovery",
    "urls": [
      "https://www.sydney.edu.au/drug-discovery/"
    ],
    "representativeUrl": "https://www.sydney.edu.au/drug-discovery/",
    "description": "Centre for Drug Discovery Innovation landing page: orange-band hero, intro copy, featured research teaser, explore cards, related news carousel and stay-in-touch contact band",
    "urlPattern": "/*",
    "blocks": [
      {
        "name": "hero-orange-band",
        "instances": [
          ".m-wrapper-hero.m-hero--style-2",
          ".m-wrapper-hero"
        ]
      },
      {
        "name": "columns-bleed-image",
        "instances": [
          ".cmp-wrapper-teaser .m-content-w-bleed-image"
        ]
      },
      {
        "name": "cards-portrait",
        "instances": [
          ".m-bespoke-layout--bg-white .m-bespoke-layout--3-cols"
        ]
      },
      {
        "name": "carousel-news",
        "instances": [
          ".m-news-article-list"
        ]
      },
      {
        "name": "columns-contact",
        "instances": [
          ".m-bespoke-layout--bg-grey-90 > .m-bespoke-layout__inner"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "Hero",
        "selector": [
          ".m-wrapper-hero.m-hero--style-2",
          ".m-wrapper-hero"
        ],
        "style": null,
        "blocks": [
          "hero-orange-band"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "Introduction",
        "selector": [
          ".m-bespoke-layout--60-30-layout"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".m-bespoke-layout--60-30-layout .m-bespoke-layout__inner"
        ]
      },
      {
        "id": "section-3",
        "name": "Our research",
        "selector": [
          ".cmp-wrapper-teaser.cmp-teaser--featured",
          ".cmp-wrapper-teaser"
        ],
        "style": null,
        "blocks": [
          "columns-bleed-image"
        ],
        "defaultContent": []
      },
      {
        "id": "section-4",
        "name": "Explore",
        "selector": [
          ".m-bespoke-layout--bg-white:has(.m-bespoke-layout--3-cols)"
        ],
        "style": null,
        "blocks": [
          "cards-portrait"
        ],
        "defaultContent": [
          ".m-bespoke-layout--bg-white .cmp-title--h2-serif"
        ]
      },
      {
        "id": "section-5",
        "name": "Related news",
        "selector": [
          ".m-bespoke-layout--bg-white:has(.m-news-article-list)"
        ],
        "style": null,
        "blocks": [
          "carousel-news"
        ],
        "defaultContent": [
          ".m-news-article-list__title"
        ]
      },
      {
        "id": "section-6",
        "name": "Stay in touch",
        "selector": [
          ".m-bespoke-layout--bg-grey-90"
        ],
        "style": "light-grey",
        "blocks": [
          "columns-contact"
        ],
        "defaultContent": []
      }
    ]
  };
  var parsers = {
    "hero-orange-band": parse,
    "columns-bleed-image": parse2,
    "cards-portrait": parse3,
    "carousel-news": parse4,
    "columns-contact": parse5
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          if (pageBlocks.some((b) => b.element === element)) return;
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_drug_discovery_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "/index").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_drug_discovery_exports);
})();
