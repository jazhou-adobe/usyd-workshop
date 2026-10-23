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

  // tools/importer/import-section-page.js
  var import_section_page_exports = {};
  __export(import_section_page_exports, {
    default: () => import_section_page_default
  });

  // tools/importer/parsers/hero-orange-split.js
  var ORIGIN = "https://www.sydney.edu.au";
  function absUrl(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("mailto:") || u.startsWith("tel:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN}${u}`;
    return u;
  }
  function parse(element, { document }) {
    const hero = element.querySelector(".m-hero--desktop") || element;
    const dataDiv = [...element.children].find((c) => c.tagName === "DIV" && !c.className && !c.querySelector(".m-hero"));
    let image = null;
    const srcImg = hero.querySelector('.m-content-w-bleed-image__image img:not([src^="data:"]), img:not([src^="data:"])');
    if (srcImg) {
      image = document.createElement("img");
      image.src = absUrl(srcImg.getAttribute("src"));
      image.alt = srcImg.getAttribute("alt") || "";
    } else if (dataDiv) {
      const pathP = [...dataDiv.querySelectorAll(":scope > p")].find((p) => /\/content\/dam\/.+\.(jpe?g|png|webp|gif)$/i.test(p.textContent.trim()));
      if (pathP) {
        image = document.createElement("img");
        image.src = absUrl(pathP.textContent.trim());
        image.alt = "";
      }
    }
    const srcTitle = hero.querySelector(".m-hero--desktop__title, h1") || dataDiv && dataDiv.querySelector("h1, h2");
    let title = null;
    if (srcTitle && srcTitle.textContent.trim()) {
      title = document.createElement("h1");
      title.textContent = srcTitle.textContent.trim();
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
    const seen = /* @__PURE__ */ new Set();
    const addCta = (href, text) => {
      if (!href || !text || seen.has(href + text)) return;
      seen.add(href + text);
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = absUrl(href);
      link.textContent = text;
      p.append(link);
      ctas.push(p);
    };
    hero.querySelectorAll(".m-hero--desktop__cta a[href]").forEach((a) => {
      addCta(a.getAttribute("href"), (a.querySelector(".cmp-button__text") || a).textContent.trim());
    });
    if (!ctas.length && dataDiv) {
      dataDiv.querySelectorAll("ul > li").forEach((li) => {
        const spans = li.querySelectorAll("span");
        if (spans.length >= 2) addCta(spans[0].textContent.trim(), spans[1].textContent.trim());
      });
    }
    const cells = [];
    if (image) cells.push([image]);
    const content = [];
    if (title) content.push(title);
    content.push(...descriptions, ...ctas);
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-orange-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-image-overlay.js
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
    const hero = element.querySelector(".m-hero--desktop") || element;
    const dataDiv = [...element.children].find((c) => c.tagName === "DIV" && !c.className && !c.querySelector(".m-hero"));
    let image = null;
    const srcImg = hero.querySelector('.m-hero--desktop__image-wrapper img:not([src^="data:"]), img:not([src^="data:"])');
    if (srcImg) {
      image = document.createElement("img");
      image.src = absUrl2(srcImg.getAttribute("src"));
      image.alt = srcImg.getAttribute("alt") || "";
    } else if (dataDiv) {
      const pathP = [...dataDiv.querySelectorAll(":scope > p")].find((p) => /\/content\/dam\/.+\.(jpe?g|png|webp|gif)$/i.test(p.textContent.trim()));
      if (pathP) {
        image = document.createElement("img");
        image.src = absUrl2(pathP.textContent.trim());
        image.alt = "";
      }
    }
    const srcTitle = hero.querySelector(".m-hero--desktop__title") || hero.querySelector("h1") || dataDiv && dataDiv.querySelector("h1, h2");
    let title = null;
    if (srcTitle && srcTitle.textContent.trim()) {
      title = document.createElement("h1");
      title.textContent = srcTitle.textContent.trim();
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
    const seen = /* @__PURE__ */ new Set();
    const addCta = (href, text) => {
      if (!href || !text || seen.has(href + text)) return;
      seen.add(href + text);
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = absUrl2(href);
      link.textContent = text;
      p.append(link);
      ctas.push(p);
    };
    hero.querySelectorAll(".m-hero--desktop__cta a[href]").forEach((a) => {
      addCta(a.getAttribute("href"), (a.querySelector(".cmp-button__text") || a).textContent.trim());
    });
    if (!ctas.length && dataDiv) {
      dataDiv.querySelectorAll("ul > li").forEach((li) => {
        const spans = li.querySelectorAll("span");
        if (spans.length >= 2) addCta(spans[0].textContent.trim(), spans[1].textContent.trim());
      });
    }
    const cells = [];
    if (image) cells.push([image]);
    const content = [];
    if (title) content.push(title);
    content.push(...descriptions, ...ctas);
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-image-overlay", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-underline.js
  var ORIGIN3 = "https://www.sydney.edu.au";
  function absUrl3(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN3}${u}`;
    return u;
  }
  function cleanContent(root) {
    root.querySelectorAll(".cmp-text__external-link-icon, script, style, button").forEach((n) => n.remove());
    root.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl3(a.getAttribute("href"))));
    root.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("data-src") || img.getAttribute("src");
      if (src) img.setAttribute("src", absUrl3(src));
    });
    [...root.querySelectorAll("ul, ol")].forEach((list) => {
      if (!list.isConnected) return;
      let next = list.nextElementSibling;
      while (next && next.tagName === list.tagName) {
        list.append(...next.children);
        const after = next.nextElementSibling;
        next.remove();
        next = after;
      }
    });
  }
  function parse3(element, { document }) {
    const tabs = [...element.querySelectorAll(".cmp-tabs__tablist .cmp-tabs__tab")];
    const panels = [...element.querySelectorAll(".cmp-tabs__tabpanel")];
    const cells = [];
    tabs.forEach((tab, idx) => {
      const label = tab.textContent.replace(/\s+/g, " ").trim();
      if (!label) return;
      let panel = null;
      const tabId = tab.getAttribute("id");
      if (tabId) {
        const panelId = tabId.replace(/-tab$/, "-tabpanel");
        panel = panels.find((p) => p.getAttribute("id") === panelId) || null;
      }
      if (!panel) panel = panels[idx] || null;
      const content = [];
      if (panel) {
        const textRoots = [...panel.querySelectorAll(".cmp-text")];
        const roots = textRoots.length ? textRoots : [panel];
        roots.forEach((root) => {
          cleanContent(root);
          [...root.children].forEach((child) => {
            if (child.textContent.trim() || child.querySelector("img")) content.push(child);
          });
        });
      }
      cells.push([label, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-underline", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-plus.js
  var ORIGIN4 = "https://www.sydney.edu.au";
  function absUrl4(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN4}${u}`;
    return u;
  }
  function cleanContent2(root, document) {
    root.querySelectorAll(".cmp-text__external-link-icon, script, style, button").forEach((n) => n.remove());
    root.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl4(a.getAttribute("href"))));
    root.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("data-src") || img.getAttribute("src");
      if (src) img.setAttribute("src", absUrl4(src));
    });
    [...root.querySelectorAll("ul, ol")].forEach((list) => {
      if (!list.isConnected) return;
      let next = list.nextElementSibling;
      while (next && next.tagName === list.tagName) {
        list.append(...next.children);
        const after = next.nextElementSibling;
        next.remove();
        next = after;
      }
    });
    root.querySelectorAll("b").forEach((b) => {
      const strong = document.createElement("strong");
      strong.append(...b.childNodes);
      b.replaceWith(strong);
    });
  }
  function parse4(element, { document }) {
    const accordion = element.querySelector(".cmp-accordion") || element;
    const items = [...accordion.querySelectorAll(".cmp-accordion__item")].filter((item) => item.parentElement.closest(".cmp-accordion") === accordion);
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title") || item.querySelector(".cmp-accordion__button") || item.querySelector(".cmp-accordion__header");
      const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (!title) return;
      const panel = item.querySelector(".cmp-accordion__panel");
      const content = [];
      if (panel) {
        const textRoots = [...panel.querySelectorAll(".cmp-text")];
        const roots = textRoots.length ? textRoots : [panel.querySelector(".cmp-accordion__panel-inner") || panel];
        roots.forEach((root) => {
          cleanContent2(root, document);
          [...root.children].forEach((child) => {
            if (child.textContent.trim() || child.querySelector("img")) content.push(child);
          });
        });
      }
      cells.push([title, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-plus", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-profile.js
  var ORIGIN5 = "https://www.sydney.edu.au";
  function absUrl5(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN5}${u}`;
    return u;
  }
  function norm(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function hiddenValue(hidden, label) {
    if (!hidden) return "";
    const el = [...hidden.querySelectorAll("h2, h3, p")].find((n) => norm(n.textContent).toLowerCase().startsWith(`${label.toLowerCase()} :`));
    if (!el) return "";
    return norm(norm(el.textContent).slice(label.length).replace(/^\s*:\s*/, ""));
  }
  function parse5(element, { document }) {
    const hidden = element.querySelector(".m-hidden");
    const profiles = [...element.querySelectorAll(".m-profile")];
    const cells = [];
    const buildRow = (profile) => {
      const linkEl = profile ? profile.closest("a[href]") : null;
      let href = linkEl ? linkEl.getAttribute("href") : "";
      if (!href) {
        const hiddenLink = hidden && hidden.querySelector("a[href]");
        href = hiddenLink ? hiddenLink.getAttribute("href") : "";
      }
      const nameEl = profile && profile.querySelector(".m-profile--name");
      const posEl = profile && profile.querySelector(".m-profile--designation");
      const name = norm(nameEl && nameEl.textContent) || hiddenValue(hidden, "Manual Name");
      const position = norm(posEl && posEl.textContent) || hiddenValue(hidden, "Manual Description");
      let src = "";
      const imgEl = profile && profile.querySelector('.m-profile--image img:not([src^="data:"])');
      if (imgEl) src = imgEl.getAttribute("src");
      if (!src) {
        const hImg = hidden && hidden.querySelector("img[src]");
        src = hImg && hImg.getAttribute("src") || hiddenValue(hidden, "Profile image");
      }
      let imageCell = "";
      if (src) {
        const img = document.createElement("img");
        img.src = absUrl5(src);
        img.alt = name || "";
        imageCell = img;
      }
      const body = [];
      if (name) {
        const p = document.createElement("p");
        if (href) {
          const a = document.createElement("a");
          a.href = absUrl5(href);
          a.textContent = name;
          p.append(a);
        } else {
          p.textContent = name;
        }
        body.push(p);
      }
      if (position) {
        const p = document.createElement("p");
        p.textContent = position;
        body.push(p);
      }
      if (imageCell || body.length) cells.push([imageCell, body]);
    };
    if (profiles.length) profiles.forEach(buildRow);
    else buildRow(null);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-profile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-portrait.js
  var ORIGIN6 = "https://www.sydney.edu.au";
  function absUrl6(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN6}${u}`;
    return u;
  }
  function stripQuotes(text) {
    return text.replace(/\s+/g, " ").trim().replace(/^["“”‘'\s]+/, "").replace(/["“”’'\s]+$/, "");
  }
  function imgSrc(img) {
    if (!img) return "";
    const src = img.getAttribute("data-src") || img.getAttribute("src") || "";
    if (src.startsWith("data:")) return "";
    return absUrl6(src);
  }
  function parse6(element, { document }) {
    const raw = element.querySelector(".m-hidden");
    const visible = element.querySelector(".m-testimonial") || element;
    const srcImg = visible.querySelector(".m-testimonial__profile-image img, img") || raw && raw.querySelector("img");
    let src = imgSrc(srcImg);
    if (!src && raw) src = imgSrc(raw.querySelector("img"));
    let name = "";
    let position = "";
    const visName = visible.querySelector(".m-testimonial__profile-name, cite");
    const visPos = visible.querySelector(".m-testimonial__profile-designation");
    if (raw && raw.querySelector("h1, h2, h3, h4, h5, h6")) {
      const h = raw.querySelector("h1, h2, h3, h4, h5, h6");
      name = h.textContent.replace(/\s+/g, " ").trim();
      const after = [...raw.children].slice([...raw.children].indexOf(h) + 1).find((n) => n.tagName === "P");
      if (after) position = after.textContent.replace(/\s+/g, " ").trim();
    }
    if (!name && visName) name = visName.textContent.replace(/\s+/g, " ").trim();
    if (!position && visPos) position = visPos.textContent.replace(/\s+/g, " ").trim();
    const quoteTexts = [];
    if (raw) {
      const h = raw.querySelector("h1, h2, h3, h4, h5, h6");
      [...raw.children].forEach((n) => {
        if (n.tagName !== "P") return;
        if (h && h.compareDocumentPosition(n) & 4) return;
        const t = stripQuotes(n.textContent);
        if (t) quoteTexts.push(t);
      });
    }
    if (!quoteTexts.length) {
      visible.querySelectorAll(".m-testimonial__quote").forEach((q) => {
        const t = stripQuotes(q.textContent);
        if (t) quoteTexts.push(t);
      });
    }
    const cells = [];
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = srcImg && srcImg.getAttribute("alt") || name || "";
      cells.push([img]);
    }
    if (quoteTexts.length) {
      cells.push([quoteTexts.map((t) => {
        const p = document.createElement("p");
        p.textContent = t;
        return p;
      })]);
    }
    const attribution = [];
    if (name) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = name;
      p.append(strong);
      attribution.push(p);
    }
    if (position) {
      const p = document.createElement("p");
      p.textContent = position;
      attribution.push(p);
    }
    if (attribution.length) cells.push([attribution]);
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-portrait", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-gallery.js
  var ORIGIN7 = "https://www.sydney.edu.au";
  function absUrl7(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^(https?:|data:|mailto:|tel:|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN7}${u}`;
    return u;
  }
  function clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function stripQuotes2(text) {
    return clean(text).replace(/^["“”‘'\s]+/, "").replace(/["“”’'\s]+$/, "");
  }
  function realSrc(img) {
    if (!img) return "";
    const candidates = [
      img.getAttribute("data-src"),
      img.getAttribute("data-lazy-src"),
      img.getAttribute("src")
    ];
    const srcset = img.getAttribute("data-srcset") || img.getAttribute("srcset");
    if (srcset) candidates.push(srcset.split(",")[0].trim().split(/\s+/)[0]);
    const src = candidates.find((s) => s && !s.trim().startsWith("data:"));
    return src ? absUrl7(src) : "";
  }
  function para(document, text, bold = false) {
    const p = document.createElement("p");
    if (bold) {
      const strong = document.createElement("strong");
      strong.textContent = text;
      p.append(strong);
    } else {
      p.textContent = text;
    }
    return p;
  }
  function orderedSlides(element) {
    const all = [...element.querySelectorAll(".cmp-carousel__item")].filter((s) => !s.classList.contains("swiper-slide-duplicate"));
    const seen = /* @__PURE__ */ new Set();
    const unique = all.filter((s) => {
      const id = s.getAttribute("id");
      if (!id) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    const indicators = [...element.querySelectorAll(".cmp-carousel__indicator[id]")];
    if (indicators.length === unique.length) {
      const byId = new Map(unique.map((s) => [s.getAttribute("id"), s]));
      const ordered = indicators.map((btn) => byId.get(btn.getAttribute("id").replace(/-tab$/, "-tabpanel"))).filter(Boolean);
      if (ordered.length === unique.length) return ordered;
    }
    return unique;
  }
  function quoteRow(slide, document) {
    const raw = slide.querySelector(".m-hidden");
    const visible = slide.querySelector(".m-testimonial") || slide;
    let name = "";
    let position = "";
    const quotes = [];
    const h = raw && raw.querySelector("h1, h2, h3, h4, h5, h6");
    if (raw) {
      [...raw.children].forEach((n) => {
        if (n.tagName !== "P") return;
        if (h && h.compareDocumentPosition(n) & 4) {
          if (!position) position = clean(n.textContent);
          return;
        }
        const t = stripQuotes2(n.textContent);
        if (t) quotes.push(t);
      });
      if (h) name = clean(h.textContent);
    }
    if (!quotes.length) {
      visible.querySelectorAll(".m-testimonial__quote").forEach((q) => {
        const t = stripQuotes2(q.textContent);
        if (t) quotes.push(t);
      });
    }
    if (!name) name = clean((visible.querySelector(".m-testimonial__profile-name, cite") || {}).textContent);
    if (!position) position = clean((visible.querySelector(".m-testimonial__profile-designation") || {}).textContent);
    const content = quotes.map((t) => para(document, t));
    if (name) content.push(para(document, name, true));
    if (position) content.push(para(document, position));
    return content.length ? ["", content] : null;
  }
  function photoRow(slide, document) {
    const srcImg = slide.querySelector(".cmp-image img, img");
    const src = realSrc(srcImg);
    let caption = clean((slide.querySelector(".cmp-image__title") || {}).textContent);
    if (!caption) {
      const rawP = slide.querySelector(".m-hidden p");
      if (rawP) caption = clean(rawP.textContent);
    }
    if (!src && !caption) return null;
    let imgCell = "";
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = clean(srcImg.getAttribute("alt")) || caption || "";
      imgCell = img;
    }
    return [imgCell, caption ? [para(document, caption)] : ""];
  }
  function parse7(element, { document }) {
    const cells = [];
    orderedSlides(element).forEach((slide) => {
      const isQuote = slide.querySelector(".m-wrapper-testimonial, .m-testimonial");
      const row = isQuote ? quoteRow(slide, document) : photoRow(slide, document);
      if (row) cells.push(row);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-cta.js
  var ORIGIN8 = "https://www.sydney.edu.au";
  function absUrl8(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN8}${u}`;
    return u;
  }
  function norm2(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse8(element, { document }) {
    const hidden = element.querySelector(".m-hidden");
    const boxes = [...element.querySelectorAll("a.cmp-call-to-action, .cmp-call-to-action:not(a)")].filter((el, i, arr) => !arr.some((o) => o !== el && o.contains(el)));
    const isOchre = element.classList.contains("cmp-call-to-action--ochre") || !!element.querySelector(".cmp-call-to-action__bg--ochre");
    const cells = [];
    const buildRow = (box) => {
      const titleEl = box && box.querySelector(".cmp-call-to-action__title");
      const descEl = box && box.querySelector(".cmp-call-to-action__description");
      let title = norm2(titleEl && titleEl.textContent);
      if (!title && hidden) title = norm2((hidden.querySelector("h1, h2, h3, h4") || {}).textContent);
      const description = norm2(descEl && descEl.textContent);
      let href = "";
      const linkEl = box && (box.matches("a[href]") ? box : box.querySelector("a[href]"));
      if (linkEl) href = linkEl.getAttribute("href");
      if (!href && hidden) {
        const hl = hidden.querySelector("a[href]");
        href = hl ? hl.getAttribute("href") : "";
      }
      const content = [];
      if (title) {
        const p = document.createElement("p");
        if (href) {
          const a = document.createElement("a");
          a.href = absUrl8(href);
          a.textContent = title;
          p.append(a);
        } else {
          p.textContent = title;
        }
        content.push(p);
      }
      if (description) {
        const p = document.createElement("p");
        p.textContent = description;
        content.push(p);
      }
      if (content.length) cells.push([content]);
    };
    if (boxes.length) boxes.forEach(buildRow);
    else buildRow(null);
    const name = isOchre ? "cards-cta (ochre)" : "cards-cta";
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-tile.js
  var ORIGIN9 = "https://www.sydney.edu.au";
  function absUrl9(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN9}${u}`;
    return u;
  }
  function norm3(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function hiddenValue2(hidden, label) {
    if (!hidden) return "";
    const re = new RegExp(`^${label}\\s*:\\s*`, "i");
    const el = [...hidden.querySelectorAll("p, h1, h2, h3, h4")].find((n) => re.test(norm3(n.textContent)));
    return el ? norm3(norm3(el.textContent).replace(re, "")) : "";
  }
  function parse9(element, { document }) {
    const hidden = element.querySelector(".m-hidden");
    const tiles = [...element.querySelectorAll(".m-icon-tile")];
    const cells = [];
    const iconPath = hiddenValue2(hidden, "Icon");
    let iconName2 = iconPath ? iconPath.split("/").pop().replace(/\.svg$/i, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-") : "";
    if (!iconName2) {
      const iconImg = element.querySelector('.m-icon-tile > img[src^="data:image/svg"], img.m-icon-tile__icon');
      const inlineSvg = element.querySelector("svg.m-icon-tile__icon, .m-icon-tile > svg");
      let svg = inlineSvg ? inlineSvg.outerHTML : "";
      if (!svg && iconImg) {
        const src = iconImg.getAttribute("src") || "";
        const b64 = src.split("base64,")[1];
        try {
          svg = b64 ? atob(b64) : decodeURIComponent(src.split(",").slice(1).join(","));
        } catch (e) {
          svg = "";
        }
      }
      if (svg) {
        const known = [
          { name: "globe-information", sig: "M34.5 40.5V34.5" }
        ];
        const hit = known.find((k) => svg.includes(k.sig));
        if (hit) iconName2 = hit.name;
      }
    }
    const buildRow = (tile) => {
      const titleEl = tile && tile.querySelector(".m-icon-tile__title, h1, h2, h3, h4");
      const title = norm3(titleEl && titleEl.textContent) || hiddenValue2(hidden, "Title");
      let href = "";
      const linkEl = tile && tile.closest("a[href]");
      if (linkEl) href = linkEl.getAttribute("href");
      if (!href) href = hiddenValue2(hidden, "Link URL");
      let iconCell = "";
      if (iconName2) {
        const p = document.createElement("p");
        p.textContent = `:${iconName2}:`;
        iconCell = p;
      } else {
        const img = tile && tile.querySelector('img.m-icon-tile__icon:not([src^="data:"]), img:not([src^="data:"])');
        if (img) {
          const i = document.createElement("img");
          i.src = absUrl9(img.getAttribute("src"));
          i.alt = img.getAttribute("alt") || "";
          iconCell = i;
        }
      }
      const body = [];
      if (title) {
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        if (href) {
          const a = document.createElement("a");
          a.href = absUrl9(href);
          a.textContent = title;
          strong.append(a);
        } else {
          strong.textContent = title;
        }
        p.append(strong);
        body.push(p);
      }
      const desc = hiddenValue2(hidden, "Description");
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        body.push(p);
      }
      if (iconCell || body.length) cells.push([iconCell, body]);
    };
    if (tiles.length) tiles.forEach(buildRow);
    else buildRow(null);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-icon-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-key-value.js
  var ORIGIN10 = "https://www.sydney.edu.au";
  function absUrl10(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^(https?:|mailto:|tel:|data:|#)/i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN10}${u}`;
    return u;
  }
  function norm4(text) {
    return (text || "").replace(/[\s ]+/g, " ").trim();
  }
  function valueContent(cell, document) {
    const frag = document.createElement("div");
    [...cell.childNodes].forEach((n) => frag.append(n.cloneNode(true)));
    frag.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl10(a.getAttribute("href"))));
    frag.querySelectorAll("img[src]").forEach((img) => img.setAttribute("src", absUrl10(img.getAttribute("src"))));
    const walker = document.createTreeWalker(
      frag,
      4
      /* NodeFilter.SHOW_TEXT */
    );
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((t) => {
      t.textContent = t.textContent.replace(/ /g, " ");
    });
    if (texts.length) {
      texts[0].textContent = texts[0].textContent.replace(/^\s+/, "");
      const last = texts[texts.length - 1];
      last.textContent = last.textContent.replace(/\s+$/, "");
    }
    return [...frag.childNodes].filter((n) => n.nodeType !== 3 || n.textContent.trim());
  }
  function parse10(element, { document }) {
    const table = element.matches("table") ? element : element.querySelector("table");
    const rows = table ? [...table.querySelectorAll(":scope > tbody > tr, :scope > thead > tr, :scope > tr")] : [];
    const cells = [];
    rows.forEach((tr) => {
      const tds = [...tr.querySelectorAll(":scope > td, :scope > th")];
      if (!tds.length || !norm4(tr.textContent)) return;
      const label = norm4(tds[0].textContent);
      const valueCells = tds.slice(1);
      let value = "";
      if (valueCells.length) {
        const content = [];
        valueCells.forEach((td, i) => {
          if (i > 0) content.push(document.createTextNode(" "));
          content.push(...valueContent(td, document));
        });
        value = content;
      }
      cells.push([label, value]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "table-key-value", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-news.js
  var ORIGIN11 = "https://www.sydney.edu.au";
  function absUrl11(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN11}${u}`;
    return u;
  }
  function norm5(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse11(element, { document }) {
    const wrapper = element.closest(".m-wrapper-news-article-list") || element.parentElement;
    const hiddenList = wrapper ? [...wrapper.children].find((c) => c.classList && c.classList.contains("m-hidden")) || wrapper.querySelector(".m-hidden") : null;
    const visible = /* @__PURE__ */ new Map();
    element.querySelectorAll(".m-news-article-list__articles, .m-card").forEach((card) => {
      const titleEl = card.querySelector(".m-card__title, h2, h3");
      const title = norm5(titleEl && titleEl.textContent);
      if (!title || visible.has(title)) return;
      const img = card.querySelector('img:not([src^="data:"])');
      const link = card.querySelector("a[href]");
      const desc = card.querySelector(".m-card__description");
      visible.set(title, {
        title,
        image: img ? absUrl11(img.getAttribute("src")) : null,
        alt: img ? img.getAttribute("alt") || "" : "",
        href: link ? absUrl11(link.getAttribute("href")) : null,
        description: norm5(desc && desc.textContent)
      });
    });
    const articles = [];
    const seen = /* @__PURE__ */ new Set();
    if (hiddenList) {
      hiddenList.querySelectorAll(":scope > ul > li, li").forEach((li) => {
        const titleEl = li.querySelector("h1, h2, h3, h4");
        const title = norm5(titleEl && titleEl.textContent);
        if (!title || seen.has(title)) return;
        seen.add(title);
        const v = visible.get(title) || {};
        const linkEl = li.querySelector("a[href]");
        const descEl = li.querySelector(":scope > div");
        const imgPath = [...li.querySelectorAll(":scope > span")].map((s) => s.textContent.trim()).find((t) => /^(https?:\/\/[^\s]+|\/content\/dam\/[^\s]+)\.(jpe?g|png|webp|gif|svg)$/i.test(t));
        articles.push({
          title,
          href: linkEl ? absUrl11(linkEl.getAttribute("href")) : v.href,
          description: norm5(descEl && descEl.textContent) || v.description,
          image: v.image || (imgPath ? absUrl11(imgPath) : null),
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

  // tools/importer/parsers/cards-news-list.js
  var ORIGIN12 = "https://www.sydney.edu.au";
  function absUrl12(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN12}${u}`;
    return u;
  }
  function norm6(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse12(element, { document }) {
    const wrapper = element.closest(".m-wrapper-news-article-list");
    const hiddenList = wrapper ? [...wrapper.children].find((c) => c.classList && c.classList.contains("m-hidden")) || wrapper.querySelector(".m-hidden") : null;
    const visible = /* @__PURE__ */ new Map();
    element.querySelectorAll(".m-news-article-list--vertical").forEach((item) => {
      const titleEl = item.querySelector(".m-news-article-list--vertical__title, h3, h2");
      const title = norm6(titleEl && titleEl.textContent);
      if (!title || visible.has(title)) return;
      const img = item.querySelector('img:not([src^="data:"])');
      const link = item.querySelector("a[href]");
      const desc = item.querySelector(".m-news-article-list--vertical__description, p");
      visible.set(title, {
        title,
        image: img ? absUrl12(img.getAttribute("src")) : null,
        alt: img ? img.getAttribute("alt") || "" : "",
        href: link ? absUrl12(link.getAttribute("href")) : null,
        description: norm6(desc && desc.textContent)
      });
    });
    const articles = [];
    const seen = /* @__PURE__ */ new Set();
    if (hiddenList) {
      let items = [...hiddenList.querySelectorAll(":scope > ul > li")];
      if (!items.length) items = [...hiddenList.querySelectorAll("li")];
      items.forEach((li) => {
        const titleEl = li.querySelector("h1, h2, h3, h4");
        const title = norm6(titleEl && titleEl.textContent);
        if (!title || seen.has(title)) return;
        seen.add(title);
        const v = visible.get(title) || {};
        const linkEl = li.querySelector("a[href]");
        const descEl = li.querySelector(":scope > div");
        const imgPath = [...li.querySelectorAll(":scope > span")].map((s) => s.textContent.trim()).find((t) => /^(https?:\/\/\S+|\/content\/dam\/\S+)\.(jpe?g|png|webp|gif|svg)$/i.test(t)) || (li.textContent.match(/(https?:\/\/\S+|\/content\/dam\/\S+?)\.(jpe?g|png|webp|gif|svg)(?=\s|$)/i) || [])[0];
        articles.push({
          title,
          href: linkEl ? absUrl12(linkEl.getAttribute("href")) : v.href,
          description: norm6(descEl && descEl.textContent) || v.description,
          image: imgPath ? absUrl12(imgPath) : v.image,
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
    const heading = element.querySelector(":scope > .m-news-article-list__title, :scope > h2");
    if (heading && norm6(heading.textContent)) {
      const h2 = document.createElement("h2");
      h2.textContent = norm6(heading.textContent);
      element.before(h2);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news-list", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-bleed-image.js
  var ORIGIN13 = "https://www.sydney.edu.au";
  function absUrl13(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("mailto:") || u.startsWith("tel:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN13}${u}`;
    return u;
  }
  function parse13(element, { document }) {
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
          clone.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl13(a.getAttribute("href"))));
          textCell.push(clone);
        });
      } else if (desc.textContent.trim()) {
        const p = document.createElement("p");
        [...desc.childNodes].forEach((n) => {
          if (n.nodeType === 3 || n.nodeType === 1) p.append(n.cloneNode(true));
        });
        p.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl13(a.getAttribute("href"))));
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
      link.href = absUrl13(href);
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
      img.src = absUrl13(srcImg.getAttribute("src"));
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

  // tools/importer/parsers/cards-speaker.js
  var ORIGIN14 = "https://www.sydney.edu.au";
  function absUrl14(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("mailto:") || u.startsWith("tel:") || u.startsWith("#")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN14}${u}`;
    return u;
  }
  function isSeparator(el) {
    return el.classList.contains("cmp-wrapper-separator") || el.classList.contains("separator") || !el.textContent.trim() && !el.querySelector("img, picture, table");
  }
  function innerOf(el) {
    return el.querySelector(":scope > .m-bespoke-layout__inner") || el;
  }
  function isSpeaker(el) {
    if (!el || !el.classList || !el.classList.contains("m-bespoke-layout--30-60-layout")) return false;
    const inner = innerOf(el);
    const first = inner.firstElementChild;
    if (first && first.classList.contains("cmp-wrapper-image")) return true;
    return !!inner.querySelector(".cmp-text h3, h3") && !el.querySelector(".cmp-wrapper-tabs, .m-wrapper-js-profile-contact, table");
  }
  function splitParagraph(p, document) {
    const out = [];
    let cur = document.createElement("p");
    const nodes = [...p.childNodes];
    for (let i = 0; i < nodes.length; i += 1) {
      const n = nodes[i];
      const isBr = n.nodeType === 1 && n.tagName === "BR";
      if (isBr) {
        let j = i + 1;
        while (j < nodes.length && nodes[j].nodeType === 3 && !nodes[j].textContent.trim()) j += 1;
        if (j < nodes.length && nodes[j].nodeType === 1 && nodes[j].tagName === "BR") {
          if (cur.textContent.trim()) out.push(cur);
          cur = document.createElement("p");
          i = j;
          continue;
        }
      }
      cur.append(n.cloneNode(true));
    }
    if (cur.textContent.trim()) out.push(cur);
    out.forEach((np) => {
      while (np.lastChild && np.lastChild.nodeType === 1 && np.lastChild.tagName === "BR") np.lastChild.remove();
    });
    return out;
  }
  function speakerRow(container, document) {
    const inner = innerOf(container);
    let imageCell = "";
    const srcImg = [...inner.querySelectorAll('.cmp-wrapper-image img:not([src^="data:"]), .cmp-image img:not([src^="data:"])')].find((i) => !i.closest(".m-hidden"));
    if (srcImg) {
      const img = document.createElement("img");
      img.src = absUrl14(srcImg.getAttribute("src"));
      img.alt = srcImg.getAttribute("alt") || "";
      imageCell = img;
    }
    const textCell = [];
    let nameDone = false;
    [...inner.querySelectorAll(".cmp-text")].filter((t) => !t.querySelector(".cmp-text")).forEach((text) => {
      if (text.closest(".m-hidden")) return;
      [...text.children].forEach((child) => {
        if (!child.textContent.trim()) return;
        if (/^H[1-6]$/.test(child.tagName)) {
          const h = document.createElement(nameDone ? "h4" : "h3");
          h.textContent = child.textContent.replace(/\s+/g, " ").trim();
          textCell.push(h);
          nameDone = true;
          return;
        }
        const clone = child.cloneNode(true);
        clone.querySelectorAll('.m-hidden, .cmp-text__external-link-icon, img[src^="data:"]').forEach((n) => n.remove());
        clone.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl14(a.getAttribute("href"))));
        clone.querySelectorAll("a:not([href])").forEach((a) => a.replaceWith(...a.childNodes));
        clone.querySelectorAll("[class], [id]").forEach((n) => {
          n.removeAttribute("class");
          n.removeAttribute("id");
        });
        if (clone.tagName === "P") textCell.push(...splitParagraph(clone, document));
        else textCell.push(clone);
      });
    });
    if (!nameDone && textCell.length && textCell[0].tagName === "P") {
      const first = textCell[0];
      const b = first.querySelector("b, strong");
      if (b && b.textContent.trim() === first.textContent.trim()) {
        const h = document.createElement("h3");
        h.textContent = first.textContent.trim();
        textCell[0] = h;
      }
    }
    return [imageCell, textCell.length ? textCell : ""];
  }
  function parse14(element, { document }) {
    if (!element.parentElement) return;
    const containers = [element];
    const toRemove = [];
    let next = element.nextElementSibling;
    const pending = [];
    while (next) {
      if (isSpeaker(next)) {
        containers.push(next);
        toRemove.push(...pending, next);
        pending.length = 0;
      } else if (isSeparator(next)) {
        pending.push(next);
      } else {
        break;
      }
      next = next.nextElementSibling;
    }
    const cells = containers.map((c) => speakerRow(c, document));
    toRemove.forEach((n) => n.remove());
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-speaker", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-title-left.js
  var ORIGIN15 = "https://www.sydney.edu.au";
  var ICON_FINGERPRINTS = [
    ["Microscope-2--Streamline", "microscope"],
    ["Laboratory-Cell-Searching", "laboratory-cell"],
    ["Lab-Tubes--Streamline", "testtubes-multiple-lab"],
    ["M17.6919 9.01135L26.7666 14.2512", "molecule-structure"],
    ["Laboratory-Chemistry-Tube-Check", "testtube-tick-check"]
  ];
  function absUrl15(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("mailto:") || u.startsWith("tel:") || u.startsWith("#")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN15}${u}`;
    return u;
  }
  function isHidden(el) {
    return el.classList && el.classList.contains("m-hidden");
  }
  function visibleText(node) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1 || isHidden(node)) return "";
    if (node.tagName === "TABLE") return node.textContent;
    return [...node.childNodes].map(visibleText).join("");
  }
  function hasContent(node) {
    if (visibleText(node).trim()) return true;
    if (node.tagName === "TABLE" || node.querySelector("table")) return true;
    return !!node.querySelector('img:not([src^="data:"])');
  }
  function decodeDataSvg(src) {
    try {
      const comma = src.indexOf(",");
      const data = src.slice(comma + 1);
      if (/;base64/i.test(src.slice(0, comma))) {
        if (typeof atob === "function") return atob(data);
        return Buffer.from(data, "base64").toString("utf8");
      }
      return decodeURIComponent(data);
    } catch (e) {
      return "";
    }
  }
  function iconName(scope) {
    const hidden = [...scope.querySelectorAll(".m-hidden p, .m-hidden")].map((p) => p.textContent.match(/Icon:\s*(\S+\.svg)/i)).find(Boolean);
    if (hidden) return hidden[1].split("/").pop().replace(/\.svg$/i, "");
    const img = scope.querySelector('.m-icon-tile img[src^="data:image/svg"], .m-icon-tile__icon');
    if (!img) return null;
    const svg = img.tagName === "IMG" ? decodeDataSvg(img.getAttribute("src") || "") : img.outerHTML;
    const hit = ICON_FINGERPRINTS.find(([fp]) => svg.includes(fp));
    if (hit) return hit[1];
    const id = (svg.match(/\bid="([^"]+)"/) || [])[1];
    if (id) return id.replace(/--Streamline.*$/i, "").replace(/\.svg$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return null;
  }
  function cleanClone(el, document) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.m-hidden, .cmp-text__external-link-icon, img[src^="data:"], script, style').forEach((n) => n.remove());
    clone.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl15(a.getAttribute("href"))));
    clone.querySelectorAll("img[src]").forEach((i) => i.setAttribute("src", absUrl15(i.getAttribute("src"))));
    clone.removeAttribute("class");
    clone.querySelectorAll("[class]").forEach((n) => n.removeAttribute("class"));
    clone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    clone.querySelectorAll("a").forEach((a) => {
      if (!a.textContent.trim() && !a.querySelector("img")) a.remove();
    });
    return clone;
  }
  function linkPara(document, href, text, asButton = false) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = absUrl15(href);
    a.textContent = text;
    if (asButton) {
      const strong = document.createElement("strong");
      strong.append(a);
      p.append(strong);
    } else {
      p.append(a);
    }
    return p;
  }
  function collect(node, out, tables, document) {
    if (node.nodeType === 3) {
      const t = node.textContent.trim();
      if (t) {
        const p = document.createElement("p");
        p.textContent = t;
        out.push(p);
      }
      return;
    }
    if (node.nodeType !== 1 || isHidden(node)) return;
    const { tagName: tag, classList } = node;
    if (tag === "TABLE") {
      tables.push(node);
      return;
    }
    if (/^(SCRIPT|STYLE|NOSCRIPT|BUTTON|SVG|HR)$/i.test(tag)) return;
    if (classList.contains("cmp-wrapper-separator") || classList.contains("cmp-separator")) return;
    if (!hasContent(node) && !classList.contains("cmp-wrapper-button")) return;
    if (classList.contains("cmp-title") && !node.querySelector("table")) {
      const h = node.querySelector("h1, h2, h3, h4, h5, h6");
      if (h) {
        const nh = document.createElement(h.tagName.toLowerCase());
        nh.textContent = h.textContent.trim();
        out.push(nh);
        return;
      }
    }
    if ((classList.contains("cmp-wrapper-image") || classList.contains("cmp-image")) && !node.querySelector("table")) {
      const src = node.querySelector('img:not([src^="data:"])');
      if (src) {
        const img = document.createElement("img");
        img.src = absUrl15(src.getAttribute("src"));
        img.alt = src.getAttribute("alt") || "";
        out.push(img);
      }
      return;
    }
    if (classList.contains("cmp-wrapper-button")) {
      const seen = /* @__PURE__ */ new Set();
      [...node.querySelectorAll("a[href]")].filter((a) => !a.closest(".m-hidden")).forEach((a) => {
        const text = (a.querySelector(".cmp-button__text") || a).textContent.trim();
        const href = a.getAttribute("href");
        if (!text || seen.has(href + text)) return;
        seen.add(href + text);
        out.push(linkPara(document, href, text, true));
      });
      if (!seen.size) {
        [...node.querySelectorAll(".m-hidden a[href]")].forEach((a) => {
          const text = a.textContent.replace(/\s+/g, " ").trim();
          const href = a.getAttribute("href");
          if (!text || seen.has(href + text)) return;
          seen.add(href + text);
          out.push(linkPara(document, href, text, true));
        });
      }
      return;
    }
    if (classList.contains("m-wrapper-fact-tile")) {
      out.push(...factTile(node, document));
      return;
    }
    if (/^(P|UL|OL|BLOCKQUOTE|H[1-6])$/.test(tag)) {
      if (tag === "P" && node.querySelector("table")) {
        [...node.childNodes].forEach((c) => collect(c, out, tables, document));
        return;
      }
      out.push(cleanClone(node, document));
      return;
    }
    if (tag === "IMG") {
      const img = document.createElement("img");
      img.src = absUrl15(node.getAttribute("src"));
      img.alt = node.getAttribute("alt") || "";
      out.push(img);
      return;
    }
    if (tag === "A" && node.getAttribute("href")) {
      if (!node.textContent.trim()) return;
      out.push(linkPara(document, node.getAttribute("href"), node.textContent.trim()));
      return;
    }
    [...node.childNodes].forEach((c) => collect(c, out, tables, document));
  }
  function factTile(node, document) {
    const tile = node.querySelector(".m-fact-tile");
    if (!tile) return [];
    const href = tile.tagName === "A" ? tile.getAttribute("href") : (tile.querySelector("a[href]") || { getAttribute: () => null }).getAttribute("href");
    const fig = tile.querySelector(".m-fact-tile__figure");
    const figureText = fig ? fig.textContent.trim() : "";
    const content = tile.querySelector(".m-fact-tile__content") || tile;
    const captionText = [...content.childNodes].filter((n) => n !== fig).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
    const res = [];
    const wrapLink = (child) => {
      if (!href) return child;
      const a = document.createElement("a");
      a.href = absUrl15(href);
      a.append(child);
      return a;
    };
    if (figureText) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = figureText;
      p.append(wrapLink(strong));
      res.push(p);
    }
    if (captionText) {
      const p = document.createElement("p");
      p.append(wrapLink(document.createTextNode(captionText)));
      res.push(p);
    }
    return res;
  }
  function parse15(element, { document }) {
    let leftNode;
    let rightNodes;
    const sectionLeft = element.querySelector('[id^="section-left-container-"]');
    const sectionRight = element.querySelector('[id^="section-right-container-"]');
    if (sectionLeft || sectionRight) {
      leftNode = sectionLeft && hasContent(sectionLeft) ? sectionLeft : null;
      rightNodes = sectionRight ? [sectionRight] : [];
    } else {
      const inner = element.querySelector(":scope > .m-bespoke-layout__inner") || element;
      const kids = [...inner.children].filter((c) => !isHidden(c) && hasContent(c));
      [leftNode, ...rightNodes] = kids;
    }
    const tables = [];
    const leftCell = [];
    if (leftNode) {
      const icon = iconName(leftNode);
      if (icon) {
        const p = document.createElement("p");
        p.textContent = `:${icon}:`;
        leftCell.push(p);
      }
      const heading = [...leftNode.querySelectorAll(".cmp-title__text, .m-icon-tile__title, h1, h2, h3, h4, h5, h6")].find((h) => !h.closest(".m-hidden, table") && h.textContent.trim());
      if (heading) {
        const h2 = document.createElement("h2");
        h2.textContent = heading.textContent.trim();
        leftCell.push(h2);
      }
      const fact = leftNode.classList.contains("m-wrapper-fact-tile") ? leftNode : leftNode.querySelector(".m-wrapper-fact-tile");
      if (fact) leftCell.push(...factTile(fact, document));
      const extra = [];
      [...(leftNode.querySelector(":scope > .m-bespoke-layout__inner") || leftNode).children].forEach((c) => {
        if (c.classList.contains("cmp-title") || c.classList.contains("m-wrapper-icon-tile") || c.classList.contains("m-wrapper-fact-tile") || c === heading) return;
        if (leftNode.classList.contains("cmp-title") || leftNode.classList.contains("m-wrapper-icon-tile")) return;
        if (heading && c.contains(heading)) {
          const rest = c.cloneNode(true);
          const dup = [...rest.querySelectorAll(heading.tagName)].find((h) => h.textContent.trim() === heading.textContent.trim());
          if (dup) dup.remove();
          if (visibleText(rest)) collect(rest, extra, tables, document);
          return;
        }
        collect(c, extra, tables, document);
      });
      leftCell.push(...extra);
    }
    const rightCell = [];
    rightNodes.forEach((n) => collect(n, rightCell, tables, document));
    const cells = [[leftCell.length ? leftCell : "", rightCell.length ? rightCell : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-title-left", cells });
    element.replaceWith(block);
    if (tables.length) block.after(...tables);
  }

  // tools/importer/parsers/columns-contact.js
  var ORIGIN16 = "https://www.sydney.edu.au";
  function absUrl16(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("mailto:") || u.startsWith("tel:")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN16}${u}`;
    return u;
  }
  function parse16(element, { document }) {
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
        link.href = absUrl16(rawHref);
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
          clone.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl16(a.getAttribute("href"))));
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

  // tools/importer/transformers/sydney-generic-sections.js
  var TEMPLATE_NAME = "section-page";
  var MARKER = "data-excat-generic-section";
  var FIRST = "data-excat-generic-first";
  var BLOCK_SELECTORS = [
    ".cmp-wrapper-tabs",
    ".cmp-wrapper-accordion",
    ".m-wrapper-js-profile-contact",
    ".m-wrapper-testimonial",
    ".cmp-wrapper-carousel",
    ".cmp-wrapper-call-to-action",
    ".m-wrapper-icon-tile",
    ".m-wrapper-news-article-list",
    ".cmp-wrapper-teaser"
  ];
  var DEFAULT_CONTENT_SELECTORS = "h1, h2, h3, h4, h5, h6, .cmp-text, p";
  function hasClass(el, cls) {
    return !!(el && el.classList && el.classList.contains(cls));
  }
  function findMainColumn(root) {
    const hero = root.querySelector(".m-wrapper-hero");
    if (hero && hero.parentElement && hero.parentElement !== root) {
      return hero.parentElement;
    }
    let best = null;
    let bestCount = 0;
    root.querySelectorAll(".cmp-container__inner").forEach((inner) => {
      const count = [...inner.children].filter((c) => hasClass(c, "m-component-wrapper")).length;
      if (count > bestCount) {
        best = inner;
        bestCount = count;
      }
    });
    return bestCount > 1 ? best : null;
  }
  function isSeparator2(el) {
    return hasClass(el, "cmp-wrapper-separator") || hasClass(el, "separator");
  }
  function isEmpty(el) {
    if ((el.textContent || "").trim()) return false;
    return !el.querySelector("img, picture, video, iframe, table");
  }
  function isWholeContainerBlock(container) {
    if (!hasClass(container, "m-bespoke-layout--30-60-layout")) return false;
    const inner = [...container.children].find((c) => hasClass(c, "m-bespoke-layout__inner"));
    const first = inner && inner.firstElementChild;
    if (first && hasClass(first, "cmp-wrapper-image")) return true;
    return !container.querySelector(".cmp-wrapper-tabs, .m-wrapper-js-profile-contact");
  }
  function isSplit(container) {
    if (!hasClass(container, "m-bespoke-layout--30-60-layout") && !hasClass(container, "m-bespoke-layout--60-30-layout")) return false;
    if (isWholeContainerBlock(container)) return false;
    const blockSel = BLOCK_SELECTORS.join(", ");
    const blocks = [...container.querySelectorAll(blockSel)];
    if (!blocks.length) return false;
    const defaults = [...container.querySelectorAll(DEFAULT_CONTENT_SELECTORS)].filter((el) => !el.closest(blockSel) && (el.textContent || "").trim());
    return defaults.length > 0;
  }
  function hasBg(container, cls) {
    let el = container;
    while (el) {
      if (hasClass(el, cls)) return true;
      const kids = [...el.children].filter((c) => !isEmpty(c));
      el = kids.length === 1 ? kids[0] : null;
    }
    return false;
  }
  var LAYOUT_CLASS = /m-bespoke-layout--(bg-|30-60|60-30|\d-cols)/;
  function sectionUnits(container) {
    if (!hasClass(container, "m-bespoke-layout") || LAYOUT_CLASS.test(container.className)) return [container];
    const inner = [...container.children].find((c) => hasClass(c, "m-bespoke-layout__inner"));
    if (!inner) return [container];
    const bands = [...inner.children].filter((c) => !isSeparator2(c) && !isEmpty(c));
    const hasBgBand = bands.some((b) => /m-bespoke-layout--bg-(grey-90|sand)/.test(b.className));
    return bands.length > 1 && hasBgBand ? bands : [container];
  }
  function getStyle(container) {
    const styles = [];
    if (hasBg(container, "m-bespoke-layout--bg-grey-90")) styles.push("light-grey");
    else if (hasBg(container, "m-bespoke-layout--bg-sand")) styles.push("sand");
    if (isSplit(container)) styles.push(hasClass(container, "m-bespoke-layout--30-60-layout") ? "split-heading" : "split-aside");
    return styles.join(",");
  }
  function textPageSections(element, document) {
    element.querySelectorAll(".cmp-wrapper-navigation").forEach((n) => n.remove());
    const rows = [...element.querySelectorAll(".cmp-container--css-grid--section-layout")];
    if (!rows.length) return;
    const hr = document.createElement("hr");
    if (rows.some((r) => r.querySelector(".m-formstack-wrapper"))) hr.setAttribute(MARKER, "split-heading");
    rows[0].parentNode.insertBefore(hr, rows[0]);
  }
  function transform2(hookName, element, payload) {
    const template = payload && payload.template;
    if (!template || ![TEMPLATE_NAME, "text-page"].includes(template.name)) return;
    const document = element.ownerDocument;
    if (hookName === "beforeTransform" && template.name === "text-page") {
      textPageSections(element, document);
      return;
    }
    if (hookName === "beforeTransform") {
      const column = findMainColumn(element);
      if (!column) return;
      [...column.children].forEach((child) => {
        if (isSeparator2(child) || child.tagName !== "HR" && isEmpty(child)) child.remove();
      });
      const containers = [...column.children].filter((c) => c.tagName !== "HR").flatMap(sectionUnits);
      containers.forEach((container, i) => {
        const style = getStyle(container);
        const parent = container.parentNode;
        if (i === 0) {
          if (style) {
            const hr2 = document.createElement("hr");
            hr2.setAttribute(MARKER, style);
            hr2.setAttribute(FIRST, "true");
            parent.insertBefore(hr2, container);
          }
          return;
        }
        const hr = document.createElement("hr");
        if (style) hr.setAttribute(MARKER, style);
        parent.insertBefore(hr, container);
      });
    }
    if (hookName === "afterTransform") {
      const markers = [...element.querySelectorAll(`hr[${MARKER}]`)];
      markers.reverse().forEach((marker) => {
        const style = marker.getAttribute(MARKER);
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style }
        });
        let last = marker;
        while (last.nextElementSibling && last.nextElementSibling.tagName !== "HR") {
          last = last.nextElementSibling;
        }
        last.parentNode.insertBefore(metadata, last.nextSibling);
        if (marker.getAttribute(FIRST) === "true") {
          marker.remove();
        } else {
          marker.removeAttribute(MARKER);
        }
      });
    }
  }

  // tools/importer/transformers/sydney-sections.js
  var MARKER2 = "data-excat-section-id";
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
  function transform3(hookName, element, payload) {
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
            hr2.setAttribute(MARKER2, section.id);
            hr2.setAttribute("data-excat-first", "true");
            el.parentNode.insertBefore(hr2, el);
          }
          continue;
        }
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(MARKER2, section.id);
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER2}="${section.id}"]`);
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
            marker.removeAttribute(MARKER2);
          }
        }
      }
      element.querySelectorAll(`hr[${MARKER2}]`).forEach((hr) => {
        if (hr.getAttribute("data-excat-first") === "true") hr.remove();
        else hr.removeAttribute(MARKER2);
      });
    }
  }

  // tools/importer/import-section-page.js
  var PAGE_TEMPLATE = {
    "name": "section-page",
    "urls": [
      "https://www.sydney.edu.au/drug-discovery/about-us.html",
      "https://www.sydney.edu.au/drug-discovery/news-and-events.html",
      "https://www.sydney.edu.au/drug-discovery/news-and-events/news.html",
      "https://www.sydney.edu.au/drug-discovery/news-and-events/drug-discovery-symposium.html",
      "https://www.sydney.edu.au/drug-discovery/our-research.html",
      "https://www.sydney.edu.au/drug-discovery/our-research/cancer.html",
      "https://www.sydney.edu.au/drug-discovery/our-research/cardiovascular-disease.html",
      "https://www.sydney.edu.au/drug-discovery/our-research/infectious-diseases.html",
      "https://www.sydney.edu.au/drug-discovery/our-research/neurological-and-cns-disorders.html",
      "https://www.sydney.edu.au/drug-discovery/our-research/sydney-anti-bacterial-accelerator.html",
      "https://www.sydney.edu.au/drug-discovery/our-research/tdp-43-research-cluster.html",
      "https://www.sydney.edu.au/drug-discovery/our-research/what-is-drug-discovery-.html",
      "https://www.sydney.edu.au/drug-discovery/partnerships.html",
      "https://www.sydney.edu.au/drug-discovery/get-involved/researcher-development.html"
    ],
    "representativeUrl": "https://www.sydney.edu.au/drug-discovery/about-us.html",
    "description": "Modern Drug Discovery section pages: hero followed by stacked components (text, teaser, tabs, accordion, carousel, tiles, testimonial, news list) and the Stay in touch band",
    "blocks": [
      {
        "name": "hero-orange-split",
        "instances": [
          ".m-wrapper-hero.m-hero--style-3"
        ]
      },
      {
        "name": "hero-image-overlay",
        "instances": [
          ".m-wrapper-hero.m-hero--style-1"
        ]
      },
      {
        "name": "tabs-underline",
        "instances": [
          ".cmp-wrapper-tabs"
        ]
      },
      {
        "name": "accordion-plus",
        "instances": [
          ".cmp-wrapper-accordion"
        ]
      },
      {
        "name": "cards-profile",
        "instances": [
          ".m-wrapper-js-profile-contact"
        ]
      },
      {
        "name": "quote-portrait",
        "instances": [
          ".m-wrapper-testimonial.m-testimonial--compact"
        ]
      },
      {
        "name": "carousel-gallery",
        "instances": [
          ".cmp-wrapper-carousel"
        ]
      },
      {
        "name": "cards-cta",
        "instances": [
          ".cmp-wrapper-call-to-action"
        ]
      },
      {
        "name": "cards-icon-tile",
        "instances": [
          ".m-bespoke-layout--bg-grey-90 .m-wrapper-icon-tile"
        ]
      },
      {
        "name": "table-key-value",
        "instances": [
          ".cmp-text table"
        ]
      },
      {
        "name": "carousel-news",
        "instances": [
          ".m-news-article-list"
        ]
      },
      {
        "name": "cards-news-list",
        "instances": [
          ".m-news-article-list__vertical-container"
        ]
      },
      {
        "name": "columns-bleed-image",
        "instances": [
          ".cmp-wrapper-teaser .m-content-w-bleed-image",
          ".cmp-wrapper-teaser.cmp-teaser--std"
        ]
      },
      {
        "name": "cards-speaker",
        "instances": [
          ".m-bespoke-layout--30-60-layout:has(> .m-bespoke-layout__inner > .cmp-wrapper-image:first-child)"
        ]
      },
      {
        "name": "columns-title-left",
        "instances": [
          ".m-bespoke-layout--30-60-layout:not(:has(.cmp-wrapper-tabs, .m-wrapper-js-profile-contact)):not(:has(> .m-bespoke-layout__inner > .cmp-wrapper-image:first-child))"
        ]
      },
      {
        "name": "columns-contact",
        "instances": [
          ".m-bespoke-layout--bg-grey-90:has(.cmp-wrapper-list) > .m-bespoke-layout__inner"
        ]
      }
    ],
    "urlPattern": "/drug-discovery/*",
    "sections": [],
    "sectionStrategy": "generic: one section per top-level component container in the main column; bg-grey-90 -> light-grey, bg-sand -> sand; 30-60/60-30 containers with default content beside a block -> split"
  };
  var parsers = {
    "hero-orange-split": parse,
    "hero-image-overlay": parse2,
    "tabs-underline": parse3,
    "accordion-plus": parse4,
    "cards-profile": parse5,
    "quote-portrait": parse6,
    "carousel-gallery": parse7,
    "cards-cta": parse8,
    "cards-icon-tile": parse9,
    "table-key-value": parse10,
    "carousel-news": parse11,
    "cards-news-list": parse12,
    "columns-bleed-image": parse13,
    "cards-speaker": parse14,
    "columns-title-left": parse15,
    "columns-contact": parse16
  };
  var transformers = [transform, transform2, transform3];
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
  var import_section_page_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.isConnected) return;
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
  return __toCommonJS(import_section_page_exports);
})();
