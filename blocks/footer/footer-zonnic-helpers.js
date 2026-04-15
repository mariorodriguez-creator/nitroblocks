/**
 * Zonnic footer: data from `/footer` plain fragment (EDS pattern like `/nav` for the header).
 * Block assets in /blocks/footer/zonnic-assets/: footer logo only (same pattern as header).
 * `parseZonnicFooterFromFragment` reads decorated `.section` blocks;
 * `buildZonnicFooterFromData` outputs `.bat-footer-zonnic` DOM;
 * `bindZonnicFooter` wires accordion + social placement.
 *
 * Fragment shape (see `footer.plain.html`):
 * [0] top, [1] social, [2] logo, [3..n-3] columns (h2+ul), [n-2] disclaimer, [n-1] bottom.
 *
 * @typedef {Object} ZonnicFooterColumnItem
 * @property {string} label
 * @property {string} [href]
 * @property {boolean} [static]
 *
 * @typedef {Object} ZonnicFooterParsed
 * @property {string} topCopyright
 * @property {string} breadcrumbHtml
 * @property {ReadonlyArray<{ label: string, href: string }>} socialLinks
 * @property {{ href: string, inner: string } | null} logo
 * @property {ReadonlyArray<{ title: string, items: ZonnicFooterColumnItem[] }>} columns
 * @property {ReadonlyArray<string>} disclaimerParagraphsHtml
 * @property {string} bottomCopyrightHtml
 */

import { ZONNIC_HOME_HREF } from '../header/header-zonnic-helpers.js';

/** Block-local assets (same pattern as `blocks/header/zonnic-assets`). */
export const ZONNIC_FOOTER_ASSET_DIR = '/blocks/footer/zonnic-assets';

/**
 * @param {string} basePath - `window.hlx.codeBasePath` or ''
 * @param {string} filename - file in zonnic-assets/
 */
export function zonnicFooterBlockAssetUrl(basePath, filename) {
  const b = (basePath ?? '').replace(/\/$/, '');
  return `${b}${ZONNIC_FOOTER_ASSET_DIR}/${filename}`;
}

/** White footer wordmark SVG in {@link ZONNIC_FOOTER_ASSET_DIR}. */
export const ZONNIC_FOOTER_LOGO_FILE = 'zonnic-footer-logo-white.svg';

const ZONNIC_FOOTER_ICON_ROOT_ID = 'zonnic-icon-root';

/**
 * Prefix footer `zonnic-assets` URLs with `basePath` (`codeBasePath`), same as header block logos.
 * @param {HTMLAnchorElement} anchor
 * @param {string} basePath
 */
function rewriteZonnicFooterBlockAssetUrlsInLogo(anchor, basePath) {
  const prefix = `${ZONNIC_FOOTER_ASSET_DIR}/`;
  anchor.querySelectorAll('img[src], source[srcset]').forEach((el) => {
    const attr = el.tagName === 'SOURCE' ? 'srcset' : 'src';
    const v = el.getAttribute(attr);
    if (!v || v.includes(',')) return;
    if (v.startsWith(prefix)) {
      const file = v.slice(prefix.length);
      el.setAttribute(attr, zonnicFooterBlockAssetUrl(basePath, file));
    }
  });
}

/**
 * @param {HTMLElement|null} fragment - `main` from loadFragment (decorated sections)
 * @returns {HTMLElement[]}
 */
function zonnicFooterSections(fragment) {
  if (!fragment) return [];
  return [...fragment.querySelectorAll(':scope > .section')];
}

/**
 * @param {HTMLElement} section
 * @returns {HTMLElement|null}
 */
function sectionWrapper(section) {
  return section?.querySelector(':scope > .default-content-wrapper') || section;
}

/**
 * @param {HTMLElement|null} fragment
 * @returns {ZonnicFooterParsed}
 */
export function parseZonnicFooterFromFragment(fragment) {
  const sections = zonnicFooterSections(fragment);
  const empty = {
    topCopyright: '',
    breadcrumbHtml: '',
    socialLinks: [],
    logo: null,
    columns: [],
    disclaimerParagraphsHtml: [],
    bottomCopyrightHtml: '',
  };

  if (sections.length < 5) {
    return empty;
  }

  const n = sections.length;
  const topW = sectionWrapper(sections[0]);
  const psTop = topW ? [...topW.querySelectorAll(':scope > p')] : [];
  const topCopyright = psTop[0]?.innerHTML.trim() ?? '';
  const breadcrumbHtml = psTop[1]?.innerHTML.trim() ?? '';

  const socialW = sectionWrapper(sections[1]);
  /** @type {{ label: string, href: string }[]} */
  const socialLinks = [];
  socialW?.querySelectorAll('ul a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    const label = a.textContent?.trim() ?? '';
    if (href && label) socialLinks.push({ label, href });
  });

  const logoW = sectionWrapper(sections[2]);
  const logoA = logoW?.querySelector('a[href]');
  let logo = null;
  if (logoA) {
    logo = {
      href: logoA.getAttribute('href') || ZONNIC_HOME_HREF,
      inner: logoA.innerHTML.trim(),
    };
  }

  const columnSections = sections.slice(3, n - 2);
  /** @type {{ title: string, items: ZonnicFooterColumnItem[] }[]} */
  const columns = [];
  columnSections.forEach((sec) => {
    const w = sectionWrapper(sec);
    const h2 = w?.querySelector('h2');
    const title = h2?.textContent?.trim() ?? '';
    const ul = w?.querySelector('ul');
    if (!ul) return;
    /** @type {ZonnicFooterColumnItem[]} */
    const items = [];
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const a = li.querySelector(':scope > a[href]');
      if (a) {
        items.push({
          label: a.textContent?.trim() ?? '',
          href: a.getAttribute('href') || undefined,
        });
      } else {
        const label = li.textContent?.trim() ?? '';
        if (label) items.push({ label, static: true });
      }
    });
    columns.push({ title, items });
  });

  const discW = sectionWrapper(sections[n - 2]);
  const disclaimerParagraphsHtml = discW
    ? [...discW.querySelectorAll(':scope > p')].map((p) => p.innerHTML.trim()).filter(Boolean)
    : [];

  const bottomW = sectionWrapper(sections[n - 1]);
  const bottomP = bottomW?.querySelector('p');
  const bottomCopyrightHtml = bottomP?.innerHTML.trim() ?? '';

  return {
    topCopyright,
    breadcrumbHtml,
    socialLinks,
    logo,
    columns,
    disclaimerParagraphsHtml,
    bottomCopyrightHtml,
  };
}

/**
 * @param {Document} doc
 * @param {string} href
 * @param {string} viewBox
 */
function createSvgUse(doc, href, viewBox) {
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('width', '28');
  svg.setAttribute('height', '28');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', href);
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
  svg.append(use);
  return svg;
}

/**
 * @param {Document} doc
 * @param {string} basePath
 */
function createFooterLogoPictureFallback(doc, basePath) {
  const picture = doc.createElement('picture');
  const source = doc.createElement('source');
  source.media = '(min-width: 768px)';
  const src = zonnicFooterBlockAssetUrl(basePath, ZONNIC_FOOTER_LOGO_FILE);
  source.setAttribute('srcset', src);
  const img = doc.createElement('img');
  img.src = src;
  img.alt = 'Zonnic Footer Logo';
  img.loading = 'lazy';
  picture.append(source, img);
  return picture;
}

/**
 * @param {Document} doc
 * @param {string} basePath
 * @param {ReadonlyArray<{ label: string, href: string }>} links
 */
function createSocialNav(doc, basePath, links) {
  const wrap = doc.createElement('div');
  wrap.className = 'bat-footer-social-nav';
  const ul = doc.createElement('ul');
  links.forEach(({ label, href }) => {
    const li = doc.createElement('li');
    const a = doc.createElement('a');
    a.href = href;
    if (href.startsWith('http') && !href.includes('zonnic.ca')) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    const isIg = /instagram\.com/i.test(href);
    if (isIg) {
      a.className = 'bat-footer-social-link';
      const sr = doc.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = label || 'Instagram';
      const i = doc.createElement('i');
      i.className = 'bat-icon instagram';
      const b = (basePath ?? '').replace(/\/$/, '');
      const ref = `${b}/icons/zonnic-social-instagram.svg#${ZONNIC_FOOTER_ICON_ROOT_ID}`;
      i.append(createSvgUse(doc, ref, '0 0 40 40'));
      a.append(sr, i);
    } else {
      a.textContent = label;
    }
    li.append(a);
    ul.append(li);
  });
  wrap.append(ul);
  return wrap;
}

/**
 * @param {Document} doc
 * @param {{ title: string, items: ReadonlyArray<ZonnicFooterColumnItem> }} column
 */
function createNavColumn(doc, column) {
  const menu = doc.createElement('div');
  menu.className = 'bat-footer-zonnic-nav-menu ava-nav-menu';
  const title = doc.createElement('div');
  title.className = 'bat-footer-zonnic-nav-menu-title menu-title';
  title.append(column.title);
  const btn = doc.createElement('button');
  btn.type = 'button';
  btn.className = 'bat-icon icon-plus';
  btn.setAttribute('aria-label', 'Show details');
  btn.setAttribute('aria-expanded', 'false');
  title.append(btn);

  const sub = doc.createElement('div');
  sub.className = 'bat-footer-zonnic-submenu submenu';
  const ul = doc.createElement('ul');

  column.items.forEach((item) => {
    const li = doc.createElement('li');
    const content = doc.createElement('div');
    content.className = 'submenu-content';
    if (item.static) {
      const span = doc.createElement('span');
      span.className = 'no-link';
      span.textContent = item.label;
      content.append(span);
    } else if (item.href) {
      const a = doc.createElement('a');
      a.href = item.href;
      if (item.href.startsWith('http') && !item.href.includes('zonnic.ca')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.textContent = item.label;
      content.append(a);
    }
    li.append(content);
    ul.append(li);
  });

  sub.append(ul);
  menu.append(title, sub);
  return menu;
}

/**
 * @param {Document} doc
 * @param {ReadonlyArray<string>} paragraphsHtml
 */
function createDisclaimerBlock(doc, paragraphsHtml) {
  const footer = doc.createElement('div');
  footer.className = 'bat-footer-bottom bat-footer-zonnic-disclaimer';
  paragraphsHtml.forEach((html) => {
    const p = doc.createElement('p');
    p.innerHTML = html;
    footer.append(p);
  });
  return footer;
}

/**
 * @param {Document} doc
 * @param {string} basePath
 * @param {ZonnicFooterParsed} data
 * @returns {HTMLDivElement}
 */
export function buildZonnicFooterFromData(doc, basePath, data) {
  const root = doc.createElement('div');
  root.className = 'bat-footer-zonnic';

  const top = doc.createElement('div');
  top.className = 'bat-footer-zonnic-top';
  const topInner = doc.createElement('div');
  topInner.className = 'bat-footer-zonnic-container';
  const copyTop = doc.createElement('div');
  copyTop.className = 'bat-footer-zonnic-copyright';
  const copyP = doc.createElement('p');
  if (data.topCopyright) copyP.innerHTML = data.topCopyright;
  copyTop.append(copyP);
  const crumb = doc.createElement('div');
  crumb.className = 'bat-footer-zonnic-label-page-breadcrumb';
  const crumbP = doc.createElement('p');
  crumbP.className = 'footer-zonnic-breadcrumb';
  if (data.breadcrumbHtml) crumbP.innerHTML = data.breadcrumbHtml;
  crumb.append(crumbP);
  topInner.append(copyTop, crumb);
  top.append(topInner);

  const main = doc.createElement('div');
  main.className = 'bat-footer-zonnic-main';

  const social = createSocialNav(doc, basePath, data.socialLinks);
  main.append(social);

  const row1 = doc.createElement('div');
  row1.className = 'bat-footer-zonnic--row';
  const logoTop = doc.createElement('div');
  logoTop.className = 'bat-footer-zonnic-logo bat-logo--top';
  const logoA = doc.createElement('a');
  logoA.href = data.logo?.href || ZONNIC_HOME_HREF;
  logoA.setAttribute('aria-label', 'Zonnic home');
  if (data.logo?.inner) {
    const tmp = doc.createElement('div');
    tmp.innerHTML = data.logo.inner;
    while (tmp.firstChild) logoA.append(tmp.firstChild);
    rewriteZonnicFooterBlockAssetUrlsInLogo(logoA, basePath);
  } else {
    logoA.append(createFooterLogoPictureFallback(doc, basePath));
  }
  const logoIconSlot = doc.createElement('div');
  logoIconSlot.className = 'bat-footer-zonnic-logo-icon';
  logoTop.append(logoA, logoIconSlot);

  const nav = doc.createElement('div');
  nav.className = 'bat-footer-zonnic-nav';
  data.columns.forEach((col) => {
    if (col.title || col.items.length) nav.append(createNavColumn(doc, col));
  });

  row1.append(logoTop, nav);
  main.append(row1);

  const row2 = doc.createElement('div');
  row2.className = 'bat-footer-zonnic--row';
  const logoBot = doc.createElement('div');
  logoBot.className = 'bat-footer-zonnic-logo bat-logo--bottom';
  const logoA2 = doc.createElement('a');
  logoA2.href = data.logo?.href || ZONNIC_HOME_HREF;
  logoA2.setAttribute('aria-label', 'Zonnic home');
  if (data.logo?.inner) {
    const tmp = doc.createElement('div');
    tmp.innerHTML = data.logo.inner;
    while (tmp.firstChild) logoA2.append(tmp.firstChild);
    rewriteZonnicFooterBlockAssetUrlsInLogo(logoA2, basePath);
  } else {
    logoA2.append(createFooterLogoPictureFallback(doc, basePath));
  }
  const logoIconSlot2 = doc.createElement('div');
  logoIconSlot2.className = 'bat-footer-zonnic-logo-icon';
  logoBot.append(logoA2, logoIconSlot2);
  const copyBot = doc.createElement('div');
  copyBot.className = 'bat-footer-zonnic-copyright--bottom';
  const copyP2 = doc.createElement('p');
  if (data.bottomCopyrightHtml) copyP2.innerHTML = data.bottomCopyrightHtml;
  copyBot.append(copyP2);
  row2.append(logoBot, copyBot);
  main.append(row2);

  const row3 = doc.createElement('div');
  row3.className = 'bat-footer-zonnic--row';
  row3.append(createDisclaimerBlock(doc, data.disclaimerParagraphsHtml));
  main.append(row3);

  root.append(top, main);
  return root;
}

/**
 * Crawl (`brand.min.css`): mobile shows `main > .bat-footer-social-nav` and hides
 * `.bat-footer-zonnic-nav-menu > .bat-footer-social-nav`; desktop is the inverse.
 *
 * @param {HTMLElement} root - `.bat-footer-zonnic`
 */
export default function bindZonnicFooter(root) {
  const main = root.querySelector('.bat-footer-zonnic-main');
  const nav = root.querySelector('.bat-footer-zonnic-nav');
  const social = root.querySelector('.bat-footer-social-nav');
  const lastMenu = nav?.querySelector('.bat-footer-zonnic-nav-menu:last-of-type');

  function placeSocial() {
    if (!main || !social || !lastMenu) return;
    const wide = window.matchMedia('(min-width: 992px)').matches;
    if (wide) {
      if (!lastMenu.contains(social)) lastMenu.append(social);
    } else if (social.parentElement !== main) {
      main.prepend(social);
    }
  }

  if (typeof window.matchMedia === 'function') {
    placeSocial();
    window.matchMedia('(min-width: 992px)').addEventListener('change', placeSocial);
  } else {
    placeSocial();
  }

  root.querySelectorAll('.bat-footer-zonnic-nav-menu').forEach((navMenu) => {
    const btn = navMenu.querySelector(':scope > .bat-footer-zonnic-nav-menu-title > button.bat-icon');
    const sub = navMenu.querySelector(':scope > .bat-footer-zonnic-submenu');
    if (!btn || !sub) return;
    btn.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-submenu-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.classList.toggle('icon-plus', !open);
    });
  });
}
