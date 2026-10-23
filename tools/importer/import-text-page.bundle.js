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

  // tools/importer/import-text-page.js
  var import_text_page_exports = {};
  __export(import_text_page_exports, {
    default: () => import_text_page_default
  });

  // tools/importer/parsers/toc-on-this-page.js
  var BLOCK_NAME = "toc-on-this-page";
  var processed = /* @__PURE__ */ new WeakSet();
  function tocBlockExists(document) {
    const header = WebImporter.Blocks.computeBlockName ? WebImporter.Blocks.computeBlockName(BLOCK_NAME).toLowerCase() : "toc on this page";
    return [...document.querySelectorAll("table")].some((t) => {
      const first = t.querySelector("tr > th, tr > td");
      return first && first.textContent.trim().toLowerCase() === header;
    });
  }
  function pageHasContentH2(element, document) {
    if ([...element.querySelectorAll('a[href^="#"]')].some((a) => a.textContent.trim())) return true;
    return [...document.querySelectorAll("h2")].some((h) => h.textContent.trim() && !h.closest(".cmp-wrapper-table-of-contents, footer, header, nav, .exf-footer, .m-global-footer, .m-global-footer-wrapper, .m-local-desktop-nav"));
  }
  function parse(element, { document }) {
    const firstToc = document.querySelector(".cmp-wrapper-table-of-contents");
    const isDuplicate = processed.has(document) || tocBlockExists(document) || firstToc && firstToc !== element && !element.contains(firstToc);
    if (isDuplicate || !pageHasContentH2(element, document)) {
      element.remove();
      return;
    }
    const heading = [...element.querySelectorAll("h1, h2, h3, h4, h5, h6")].find((h) => h.textContent.trim());
    const title = heading ? heading.textContent.trim() : "On this page";
    const cells = [[title]];
    const block = WebImporter.Blocks.createBlock(document, { name: BLOCK_NAME, cells });
    element.replaceWith(block);
    processed.add(document);
  }

  // tools/importer/parsers/embed-formstack.js
  var ORIGIN = "https://www.sydney.edu.au";
  var KNOWN_FORMS = {
    3543756: { account: "facultyofscienceuniversityofsydney", slug: "drug_discovery_initiative_membership" }
  };
  function absUrl(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN}${u}`;
    return u;
  }
  function publicUrl(raw) {
    if (!raw) return null;
    const m = absUrl(raw).match(/^https?:\/\/([a-z0-9-]+)\.formstack\.com\/forms\/(?:js\.php\/)?([A-Za-z0-9_-]+)/i);
    if (!m || /^(index|js)$/i.test(m[2])) return null;
    return `https://${m[1]}.formstack.com/forms/${m[2]}`;
  }
  function formUrl(element) {
    for (const s of element.querySelectorAll("script[src]")) {
      const u = publicUrl(s.getAttribute("src"));
      if (u) return u;
    }
    for (const ns of element.querySelectorAll("noscript")) {
      const a = ns.querySelector("a[href]");
      const u = publicUrl(a ? a.getAttribute("href") : (ns.textContent.match(/href="([^"]+)"/) || [])[1]);
      if (u) return u;
    }
    for (const a of element.querySelectorAll('a[href*="formstack.com/forms/"]')) {
      const u = publicUrl(a.getAttribute("href"));
      if (u) return u;
    }
    const form = element.querySelector("form");
    const idInput = element.querySelector('input[name="form"]');
    const container = element.querySelector('[id^="fsform-container-"]');
    const id = idInput && idInput.getAttribute("value") || (form && form.id || "").replace(/\D/g, "") || (container ? container.id.replace(/\D/g, "") : "");
    const known = id && KNOWN_FORMS[id];
    if (!known) return null;
    const action = form && form.getAttribute("action");
    const account = action && (action.match(/^https?:\/\/([a-z0-9-]+)\.formstack\.com/i) || [])[1] || known.account;
    return `https://${account}.formstack.com/forms/${known.slug}`;
  }
  function formLabel(element) {
    const row = element.closest(".cmp-container--css-grid--section-layout");
    const scope = row || element.parentElement;
    if (!scope) return null;
    const h = [...scope.querySelectorAll("h1, h2, h3, h4, h5, h6")].find((x) => !element.contains(x) && x.textContent.trim());
    return h ? h.textContent.trim() : null;
  }
  function parse2(element, { document }) {
    const url = formUrl(element);
    if (!url) {
      element.remove();
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.textContent = formLabel(element) || url;
    const p = document.createElement("p");
    p.append(a);
    const cells = [[p]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-formstack", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-title-left.js
  var ORIGIN2 = "https://www.sydney.edu.au";
  var ICON_FINGERPRINTS = [
    ["Microscope-2--Streamline", "microscope"],
    ["Laboratory-Cell-Searching", "laboratory-cell"],
    ["Lab-Tubes--Streamline", "testtubes-multiple-lab"],
    ["M17.6919 9.01135L26.7666 14.2512", "molecule-structure"],
    ["Laboratory-Chemistry-Tube-Check", "testtube-tick-check"]
  ];
  function absUrl2(url) {
    if (!url) return url;
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || u.startsWith("data:") || u.startsWith("mailto:") || u.startsWith("tel:") || u.startsWith("#")) return u;
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN2}${u}`;
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
    clone.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absUrl2(a.getAttribute("href"))));
    clone.querySelectorAll("img[src]").forEach((i) => i.setAttribute("src", absUrl2(i.getAttribute("src"))));
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
    a.href = absUrl2(href);
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
        img.src = absUrl2(src.getAttribute("src"));
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
      img.src = absUrl2(node.getAttribute("src"));
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
      a.href = absUrl2(href);
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
  function parse3(element, { document }) {
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
  function isSeparator(el) {
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
  function getStyle(container) {
    const styles = [];
    if (hasClass(container, "m-bespoke-layout--bg-grey-90")) styles.push("light-grey");
    else if (hasClass(container, "m-bespoke-layout--bg-sand")) styles.push("sand");
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
        if (isSeparator(child) || child.tagName !== "HR" && isEmpty(child)) child.remove();
      });
      const containers = [...column.children].filter((c) => c.tagName !== "HR");
      containers.forEach((container, i) => {
        const style = getStyle(container);
        if (i === 0) {
          if (style) {
            const hr2 = document.createElement("hr");
            hr2.setAttribute(MARKER, style);
            hr2.setAttribute(FIRST, "true");
            column.insertBefore(hr2, container);
          }
          return;
        }
        const hr = document.createElement("hr");
        if (style) hr.setAttribute(MARKER, style);
        column.insertBefore(hr, container);
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

  // tools/importer/import-text-page.js
  var PAGE_TEMPLATE = {
    "name": "text-page",
    "urls": [
      "https://www.sydney.edu.au/drug-discovery/get-involved.html",
      "https://www.sydney.edu.au/drug-discovery/get-involved/become-a-member.html",
      "https://www.sydney.edu.au/drug-discovery/get-involved/become-a-member/thank-you.html",
      "https://www.sydney.edu.au/drug-discovery/about-us/our-facilities.html"
    ],
    "representativeUrl": "https://www.sydney.edu.au/drug-discovery/get-involved.html",
    "description": "Older-layout Drug Discovery pages: breadcrumb, table of contents, rich text, side navigation, embedded Formstack form",
    "blocks": [
      {
        "name": "toc-on-this-page",
        "instances": [
          ".cmp-wrapper-table-of-contents"
        ]
      },
      {
        "name": "embed-formstack",
        "instances": [
          ".m-formstack-wrapper"
        ]
      },
      {
        "name": "columns-title-left",
        "instances": [
          ".cmp-container--css-grid--section-layout:not(:has(.m-formstack-wrapper))"
        ]
      }
    ],
    "urlPattern": "/drug-discovery/*",
    "sections": [],
    "sectionStrategy": 'generic: section 1 = title, intro, contents list and lead-in; a section break before the first .cmp-container--css-grid--section-layout row group; a row group holding the Formstack form is style "split"'
  };
  var parsers = {
    "toc-on-this-page": parse,
    "embed-formstack": parse2,
    "columns-title-left": parse3
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
  var import_text_page_default = {
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
  return __toCommonJS(import_text_page_exports);
})();
