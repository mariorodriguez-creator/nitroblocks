/**
 * Pure / DOM helpers for the Zonnic header variant (testable, no innerHTML for structure).
 * Block assets in /blocks/header/zonnic-assets/: logos only. Health warning WebP: /content/dam/...
 * after `npm run sync:zonnic:dam`. No live fetches.
 */

export const ZONNIC_ASSET_DIR = '/blocks/header/zonnic-assets';

/**
 * @param {string} basePath - `window.hlx.codeBasePath` or ''
 * @param {string} filename - file in zonnic-assets/
 */
export function zonnicBlockAssetUrl(basePath, filename) {
  const b = (basePath ?? '').replace(/\/$/, '');
  return `${b}${ZONNIC_ASSET_DIR}/${filename}`;
}

/**
 * URL for a file at the same path as the crawl (`sync:zonnic:dam` mirrors `content/dam/...`).
 * @param {string} basePath - `window.hlx.codeBasePath` or ''
 * @param {string} absolutePath - begins with `/content/dam/`
 */
export function zonnicDamAssetUrl(basePath, absolutePath) {
  const b = (basePath ?? '').replace(/\/$/, '');
  const p = absolutePath.startsWith('/') ? absolutePath : `/${absolutePath}`;
  return `${b}${p}`;
}

export const ZONNIC_HOME_HREF = 'https://www.zonnic.ca/ca/en';

export const ZONNIC_HEALTHCARE_HREF = 'https://www.zonnic.ca/ca/en/healthcare-professionals';

export const ZONNIC_HEALTH_WARNING_ALT = 'Nicotine Replacement Therapy Health Warning';

const ZONNIC_HW_DAM_DIR = '/content/dam/zonnic-content/ca/2025/health-warning/hw/en';

/** Same paths as crawled `bat-image-default` (ca/en/pouches/index.html). */
export const ZONNIC_HW_DESKTOP_DAM_PATH = `${ZONNIC_HW_DAM_DIR}/ZONNIC-HW_Desktop_En.webp`;
export const ZONNIC_HW_MOBILE_DAM_PATH = `${ZONNIC_HW_DAM_DIR}/ZONNIC-HW_Mobile_En.webp`;

export const ZONNIC_LOGO_DESKTOP_FILE = 'zonnic-logo-desktop.svg';
export const ZONNIC_LOGO_MOBILE_FILE = 'zonnic-logo-mobile.svg';

/** @type {ReadonlyArray<{ iconId: string, label: string, href: string }>} */
export const ZONNIC_NAV_ITEMS = Object.freeze([
  { iconId: 'pouches', label: 'NICOTINE POUCHES', href: 'https://www.zonnic.ca/ca/en/pouches' },
  { iconId: 'what-is-zonnic', label: 'WHAT IS ZONNIC', href: 'https://www.zonnic.ca/ca/en/what-is-zonnic' },
  { iconId: 'why-zonnic', label: 'WHY ZONNIC', href: 'https://www.zonnic.ca/ca/en/why-zonnic' },
  { iconId: 'quit', label: 'QUIT ZONE', href: 'https://www.zonnic.ca/ca/en/quit-zone' },
  { iconId: 'blog', label: 'BLOG', href: 'https://www.zonnic.ca/ca/en/blog' },
  { iconId: 'help', label: 'HELP', href: 'https://www.zonnic.ca/ca/en/contact-us' },
  { iconId: 'stores', label: 'STORE LOCATOR', href: 'https://www.zonnic.ca/ca/en/store-locator' },
]);

/** Icon ids with a matching `icons/zonnic-nav-{id}.svg` (same convention as `icons/search.svg`). */
export const ZONNIC_NAV_ICON_IDS = Object.freeze(new Set([
  'health', 'pouches', 'what-is-zonnic', 'why-zonnic', 'blog', 'help', 'quit', 'quit-zone', 'stores',
]));

/** Root `id` on each `icons/zonnic-nav-*.svg` for `<use href="…#id">`. */
export const ZONNIC_NAV_ICON_ROOT_ID = 'zonnic-nav-icon-root';

const ZONNIC_NAV_ICON_VIEWBOX = Object.freeze({
  pouches: '0 0 25 25',
  'what-is-zonnic': '0 0 25 25',
  'why-zonnic': '0 0 25 25',
  blog: '0 0 25 25',
  help: '0 0 25 25',
  quit: '0 0 24 24',
  'quit-zone': '0 0 24 24',
  stores: '0 0 25 25',
});

const DEFAULT_ZONNIC_NAV_ICON = 'help';

/** Map URL path slug (last segment) to sprite id when names differ. */
const ZONNIC_SLUG_ICON_ALIASES = {
  'contact-us': 'help',
  'store-locator': 'stores',
  'quit-zone': 'quit',
};

/**
 * Sprite id for a nav link: optional `data-icon` / `data-zonnic-icon` on `a` or `li`,
 * then href match to `ZONNIC_NAV_ITEMS`, then URL slug / aliases, else `help`.
 * @param {string} absoluteHref
 * @param {string} [dataIcon]
 * @returns {string}
 */
export function resolveZonnicNavIconId(absoluteHref, dataIcon) {
  if (dataIcon && ZONNIC_NAV_ICON_IDS.has(dataIcon)) return dataIcon;
  const preset = ZONNIC_NAV_ITEMS.find((i) => i.href === absoluteHref);
  if (preset) return preset.iconId;
  try {
    const { pathname } = new URL(absoluteHref);
    const slug = decodeURIComponent(pathname.split('/').filter(Boolean).pop() || '')
      .toLowerCase()
      .replace(/_/g, '-');
    const alias = ZONNIC_SLUG_ICON_ALIASES[slug];
    if (alias && ZONNIC_NAV_ICON_IDS.has(alias)) return alias;
    if (ZONNIC_NAV_ICON_IDS.has(slug)) return slug;
  } catch {
    /* invalid URL */
  }
  return DEFAULT_ZONNIC_NAV_ICON;
}

/**
 * Same nav fragment as default header: `loadFragment` → decorated `<main>` with three sections;
 * the middle section lists `.default-content-wrapper > ul > li > a` top-level links (dropdowns use
 * the direct child `a` only).
 * @param {HTMLElement | null} fragment - `main` from `loadFragment`, or null if fetch failed
 * @returns {ReadonlyArray<{ iconId: string, label: string, href: string }>}
 */
export function parseZonnicNavItemsFromNavFragment(fragment) {
  if (!fragment) {
    return [...ZONNIC_NAV_ITEMS];
  }

  const sectionsRoot = fragment.querySelector('.nav-sections') || fragment.children[1] || null;
  const ul = sectionsRoot?.querySelector('.default-content-wrapper > ul')
    || fragment.querySelector('.default-content-wrapper > ul');

  if (!ul) {
    return [...ZONNIC_NAV_ITEMS];
  }

  /** @type {Array<{ iconId: string, label: string, href: string }>} */
  const items = [];
  ul.querySelectorAll(':scope > li').forEach((li) => {
    const a = li.querySelector(':scope > a');
    if (!a) return;
    const hrefRaw = a.getAttribute('href');
    if (!hrefRaw || hrefRaw === '#') return;
    const label = a.textContent?.trim() || '';
    if (!label) return;

    let absoluteHref;
    try {
      absoluteHref = new URL(hrefRaw, window.location.href).href;
    } catch {
      absoluteHref = hrefRaw;
    }

    const dataIcon = a.dataset.icon || a.dataset.zonnicIcon || li.dataset.zonnicIcon;
    const iconId = resolveZonnicNavIconId(absoluteHref, dataIcon);

    items.push({
      iconId,
      label,
      href: absoluteHref,
    });
  });

  return items.length ? items : [...ZONNIC_NAV_ITEMS];
}

/**
 * @param {string} basePath - `window.hlx.codeBasePath` or ''
 * @param {string} iconId
 * @returns {string}
 */
export function zonnicNavIconUrl(basePath, iconId) {
  const b = (basePath ?? '').replace(/\/$/, '');
  return `${b}/icons/zonnic-nav-${iconId}.svg`;
}

/**
 * Target for `<use>` (vector reference), not `<img src>`.
 * @param {string} basePath
 * @param {string} iconId
 * @returns {string}
 */
export function zonnicNavIconUseHref(basePath, iconId) {
  return `${zonnicNavIconUrl(basePath, iconId)}#${ZONNIC_NAV_ICON_ROOT_ID}`;
}

/**
 * Healthcare icon: CSS mask + `background-color` so link hover can match `--color-zonnic-nav-hover`
 * (`<use>` references cannot be recolored per path from parent CSS).
 * @param {Document} doc
 * @param {string} basePath
 * @returns {HTMLSpanElement}
 */
function createZonnicHealthNavIconMask(doc, basePath) {
  const span = doc.createElement('span');
  span.className = 'header-zonnic-nav-icon-health';
  span.setAttribute('aria-hidden', 'true');
  const u = zonnicNavIconUrl(basePath, 'health');
  span.style.setProperty('--header-zonnic-nav-health-icon', `url("${u}")`);
  return span;
}

/**
 * Inline `<svg><use href="…svg#…"/></svg>` so icons stay SVG in the DOM (not raster `<img>`).
 * @param {Document} doc
 * @param {string} basePath
 * @param {string} iconId
 * @returns {SVGElement}
 */
function createZonnicNavIconUseSvg(doc, basePath, iconId) {
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const viewBox = ZONNIC_NAV_ICON_VIEWBOX[iconId] ?? '0 0 25 25';
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('width', '25');
  svg.setAttribute('height', '25');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const use = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
  const ref = zonnicNavIconUseHref(basePath, iconId);
  use.setAttribute('href', ref);
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', ref);
  svg.append(use);
  return svg;
}

/**
 * @param {Document} doc
 * @param {string} basePath
 * @param {string} iconId
 * @returns {HTMLUnknownElement} i.bat-icon
 */
export function createBatNavIcon(doc, basePath, iconId) {
  const i = doc.createElement('i');
  i.className = `bat-icon ${iconId}`;
  if (iconId === 'health') {
    i.append(createZonnicHealthNavIconMask(doc, basePath));
    return i;
  }
  i.append(createZonnicNavIconUseSvg(doc, basePath, iconId));
  return i;
}

/**
 * @param {Document} doc
 * @param {string} basePath
 * @param {ReadonlyArray<{ iconId: string, label: string, href: string }>} [navItems] - from `/nav`
 *   fragment; defaults to `ZONNIC_NAV_ITEMS`
 * @returns {HTMLUListElement}
 */
export function buildZonnicNavList(doc, basePath, navItems) {
  const ul = doc.createElement('ul');
  ul.className = 'header-zonnic-nav-list bat-navigation-group-list';

  const items = navItems?.length ? navItems : ZONNIC_NAV_ITEMS;

  items.forEach((item) => {
    const li = doc.createElement('li');
    li.className = 'header-zonnic-nav-item bat-navigation-group-list-item';
    const a = doc.createElement('a');
    a.className = 'header-zonnic-nav-link bat-navigation-group-list-item-link bat-cta-style';
    a.href = item.href;
    a.append(createBatNavIcon(doc, basePath, item.iconId));
    const span = doc.createElement('span');
    span.className = 'header-zonnic-nav-label';
    span.textContent = item.label;
    a.append(span);
    li.append(a);
    ul.append(li);
  });

  const liHealth = doc.createElement('li');
  liHealth.className = 'header-zonnic-nav-item header-zonnic-nav-mobile-only bat-navigation-group-list-item bat-navigation-group-list-item--zonnic-mobile';
  const aHealth = doc.createElement('a');
  aHealth.className = 'header-zonnic-nav-link bat-navigation-group-list-item-link bat-cta-style';
  aHealth.href = ZONNIC_HEALTHCARE_HREF;
  aHealth.append(createBatNavIcon(doc, basePath, 'health'));
  const spanHealth = doc.createElement('span');
  spanHealth.className = 'header-zonnic-nav-label';
  spanHealth.textContent = 'Healthcare Practitioners';
  aHealth.append(spanHealth);
  liHealth.append(aHealth);
  ul.append(liHealth);

  return ul;
}

/**
 * Matches crawled markup: `div.bat-image` → `picture` → `source` (768+) + `img` (mobile default).
 * @param {Document} doc
 * @param {string} basePath - `window.hlx.codeBasePath` or ''
 * @returns {HTMLDivElement}
 */
export function createZonnicHealthWarningPicture(doc, basePath) {
  const wrap = doc.createElement('div');
  wrap.className = 'zonnic-health-warning bat-image';
  const picture = doc.createElement('picture');
  const source = doc.createElement('source');
  source.media = '(min-width: 768px)';
  source.setAttribute('srcset', zonnicDamAssetUrl(basePath, ZONNIC_HW_DESKTOP_DAM_PATH));
  const img = doc.createElement('img');
  img.src = zonnicDamAssetUrl(basePath, ZONNIC_HW_MOBILE_DAM_PATH);
  img.alt = ZONNIC_HEALTH_WARNING_ALT;
  img.loading = 'eager';
  img.decoding = 'async';
  picture.append(source, img);
  wrap.append(picture);
  return wrap;
}

/**
 * @param {Document} doc
 * @param {string} basePath
 * @returns {HTMLPictureElement}
 */
export function createZonnicLogoPicture(doc, basePath) {
  const picture = doc.createElement('picture');
  const source = doc.createElement('source');
  source.media = '(min-width: 768px)';
  source.srcset = zonnicBlockAssetUrl(basePath, ZONNIC_LOGO_DESKTOP_FILE);
  const img = doc.createElement('img');
  img.src = zonnicBlockAssetUrl(basePath, ZONNIC_LOGO_MOBILE_FILE);
  img.alt = 'Zonnic home';
  img.loading = 'eager';
  picture.append(source, img);
  return picture;
}
