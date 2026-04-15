import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import {
  ZONNIC_HOME_HREF,
  ZONNIC_HEALTHCARE_HREF,
  buildZonnicNavList,
  createBatNavIcon,
  createZonnicHealthWarningPicture,
  createZonnicLogoPicture,
  parseZonnicNavItemsFromNavFragment,
} from './header-zonnic-helpers.js';

/* Zonnic header POC per authored scope: logo, healthcare, full nav, mobile menu. */
/* Out: QuitZone promo, locale, account, slot/modals. Shell not sticky. */
/* Speckit/CDD: building-blocks — DOM APIs only (no innerHTML) for Zonnic chrome. */

/**
 * @param {Document} doc
 * @param {string} basePath
 * @param {HTMLDivElement} wrap
 * @param {ReadonlyArray<{ iconId: string, label: string, href: string }>} navItems
 */
function buildZonnicHeaderDom(doc, basePath, wrap, navItems) {
  wrap.className = 'header-zonnic';

  wrap.append(createZonnicHealthWarningPicture(doc, basePath));

  const batRoot = doc.createElement('div');
  batRoot.className = 'bat-header bat-header-zonnicheadless';

  const spacer = doc.createElement('div');
  spacer.className = 'header-zonnic-spacer bat-header-fixed-spacer';
  spacer.setAttribute('aria-hidden', 'true');

  const chrome = doc.createElement('div');
  chrome.className = 'header-zonnic-chrome bat-header-wrapper';

  const core = doc.createElement('div');
  core.className = 'bat-header-core';

  const top = doc.createElement('div');
  top.className = 'header-zonnic-top bat-header-top';

  const logoWrap = doc.createElement('div');
  logoWrap.className = 'header-zonnic-logo bat-header-logo';
  const logoA = doc.createElement('a');
  logoA.href = ZONNIC_HOME_HREF;
  logoA.setAttribute('aria-label', 'Zonnic home');
  logoA.append(createZonnicLogoPicture(doc, basePath));
  logoWrap.append(logoA);

  const utils = doc.createElement('div');
  utils.className = 'header-zonnic-utils bat-header-utils';

  const toggleWrap = doc.createElement('div');
  toggleWrap.className = 'header-zonnic-menu-toggle bat-header-menu-button nav-hamburger';
  const btn = doc.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'header-zonnic-menu-panel');
  btn.setAttribute('aria-label', 'Open navigation');
  const icon = doc.createElement('span');
  icon.className = 'nav-hamburger-icon';
  btn.append(icon);
  toggleWrap.append(btn);

  const stores = doc.createElement('div');
  stores.className = 'header-zonnic-stores bat-header-stores bat-header--zonnic-desktop header-zonnic-desktop-only';
  const storesLinkWrap = doc.createElement('div');
  storesLinkWrap.className = 'bat-header-stores-link';
  const healthA = doc.createElement('a');
  healthA.href = ZONNIC_HEALTHCARE_HREF;
  const healthIcon = createBatNavIcon(doc, basePath, 'health');
  const utilLabel = doc.createElement('span');
  utilLabel.textContent = 'Healthcare Practitioners';
  const ctaLabel = doc.createElement('span');
  ctaLabel.className = 'cta-label';
  ctaLabel.textContent = 'Healthcare Practitioners';
  ctaLabel.setAttribute('aria-hidden', 'true');
  healthA.append(healthIcon, utilLabel, ctaLabel);
  storesLinkWrap.append(healthA);
  stores.append(storesLinkWrap);

  utils.append(toggleWrap, stores);
  top.append(logoWrap, utils);

  const menuPanel = doc.createElement('div');
  menuPanel.className = 'header-zonnic-menu bat-header-menu';
  menuPanel.id = 'header-zonnic-menu-panel';
  const navOuter = doc.createElement('div');
  navOuter.className = 'bat-header-nav header-zonnic-nav';
  const nav = doc.createElement('nav');
  nav.className = 'bat-navigation';
  nav.setAttribute('aria-label', 'Main navigation');
  const navGroup = doc.createElement('div');
  navGroup.className = 'bat-navigation-group';
  navGroup.append(buildZonnicNavList(doc, basePath, navItems));
  nav.append(navGroup);
  navOuter.append(nav);
  menuPanel.append(navOuter);

  const overlay = doc.createElement('div');
  overlay.className = 'header-zonnic-overlay bat-header-menu__overlay';
  overlay.setAttribute('aria-hidden', 'true');

  core.append(top, menuPanel, overlay);
  chrome.append(spacer, core);
  batRoot.append(chrome);
  wrap.append(batRoot);
}

function bindZonnicHeader(root) {
  const menu = root.querySelector('.header-zonnic-menu');
  const overlay = root.querySelector('.header-zonnic-overlay');
  const toggle = root.querySelector('.header-zonnic-menu-toggle.nav-hamburger button');
  const mqNav = window.matchMedia('(min-width: 992px)');

  const setMenuOpen = (open) => {
    root.classList.toggle('is-menu-open', open);
    menu.classList.toggle('is-open', open);
    menu.classList.toggle('open', open);
    overlay.classList.toggle('is-visible', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.style.overflowY = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => {
    setMenuOpen(!root.classList.contains('is-menu-open'));
  });

  overlay.addEventListener('click', () => setMenuOpen(false));

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      setMenuOpen(false);
    }
  });

  const onMq = () => {
    if (mqNav.matches) setMenuOpen(false);
  };
  mqNav.addEventListener('change', onMq);
  onMq();

  /**
   * --header-zonnic-offset: scroll-invariant height from health strip top to logo bar bottom
   * (difference of getBoundingClientRect in one frame; stable when header is off-screen on load).
   * --header-zonnic-menu-top: max(0, topBar rect bottom) for fixed `top`, `inset`, and max-height.
   */
  const setChromeOffset = () => {
    const hw = root.querySelector('.zonnic-health-warning.bat-image')
      || root.querySelector('.zonnic-health-warning');
    const topBar = root.querySelector('.header-zonnic-top.bat-header-top')
      || root.querySelector('.header-zonnic-top')
      || root.querySelector('.bat-header-top');

    let chromePx = 0;
    let menuTopPx = 0;

    if (hw && topBar) {
      const hRect = hw.getBoundingClientRect();
      const tRect = topBar.getBoundingClientRect();
      chromePx = Math.ceil(tRect.bottom - hRect.top);
      menuTopPx = Math.max(0, Math.ceil(tRect.bottom));
    } else if (topBar) {
      const tRect = topBar.getBoundingClientRect();
      chromePx = Math.ceil(tRect.height);
      menuTopPx = Math.max(0, Math.ceil(tRect.bottom));
    } else if (hw) {
      chromePx = hw.offsetHeight;
    }

    chromePx = Math.max(0, chromePx);
    root.style.setProperty('--header-zonnic-offset', `${chromePx}px`);
    root.style.setProperty('--header-zonnic-menu-top', `${menuTopPx}px`);
  };

  let scrollRaf = 0;
  const scheduleChromeOffsetOnScroll = () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      setChromeOffset();
    });
  };

  setChromeOffset();
  requestAnimationFrame(() => setChromeOffset());
  window.addEventListener('resize', setChromeOffset);
  window.addEventListener('scroll', scheduleChromeOffsetOnScroll, { passive: true });

  const hwImg = root.querySelector('.zonnic-health-warning img');
  if (hwImg && !hwImg.complete) {
    hwImg.addEventListener('load', setChromeOffset, { once: true });
  }
  const logoImg = root.querySelector('.header-zonnic-logo img');
  if (logoImg && !logoImg.complete) {
    logoImg.addEventListener('load', setChromeOffset, { once: true });
  }

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => setChromeOffset());
    ro.observe(root);
  }
}

async function decorateZonnicHeader(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const navItems = parseZonnicNavItemsFromNavFragment(fragment);

  block.textContent = '';
  const wrap = document.createElement('div');
  const basePath = window.hlx?.codeBasePath ?? '';
  buildZonnicHeaderDom(document, basePath, wrap, navItems);
  block.append(wrap);
  block.closest('header')?.classList.add('header--zonnic-variant');
  bindZonnicHeader(wrap);
}

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  if (block.classList.contains('zonnic') || getMetadata('header-variant') === 'zonnic') {
    block.classList.add('zonnic');
    await decorateZonnicHeader(block);
    return;
  }

  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  const hb = document.createElement('button');
  hb.type = 'button';
  hb.setAttribute('aria-controls', 'nav');
  hb.setAttribute('aria-label', 'Open navigation');
  const icon = document.createElement('span');
  icon.className = 'nav-hamburger-icon';
  hb.append(icon);
  hamburger.append(hb);
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
