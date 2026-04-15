import {
  describe, it, expect, vi, afterEach,
} from 'vitest';
import bindZonnicFooter, {
  buildZonnicFooterFromData,
  parseZonnicFooterFromFragment,
} from './footer-zonnic-helpers.js';

function section(innerHtml) {
  const s = document.createElement('div');
  s.className = 'section';
  const w = document.createElement('div');
  w.className = 'default-content-wrapper';
  w.innerHTML = innerHtml;
  s.append(w);
  return s;
}

function footerFixtureMain() {
  const main = document.createElement('main');
  main.append(
    section('<p>© Test</p><p>You are in: Home</p>'),
    section('<ul><li><a href="https://www.instagram.com/zonniccanada/">Instagram</a></li></ul>'),
    section('<p><a href="https://www.zonnic.ca/ca/en"><img src="/logo.svg" alt="Logo"></a></p>'),
    section('<h2>HELP</h2><ul><li><a href="/c">Contact</a></li><li>Static line</li></ul>'),
    section('<h2>LEGAL</h2><ul><li><a href="/t">Terms</a></li></ul>'),
    section('<p>Disclaimer one.</p>'),
    section('<p>© Bottom</p>'),
  );
  return main;
}

describe('parseZonnicFooterFromFragment', () => {
  it('returns empty data when fewer than five sections', () => {
    const main = document.createElement('main');
    main.append(section('<p>a</p>'));
    const data = parseZonnicFooterFromFragment(main);
    expect(data.columns.length).toBe(0);
    expect(data.topCopyright).toBe('');
  });

  it('reads positional sections after decorateSections shape', () => {
    const data = parseZonnicFooterFromFragment(footerFixtureMain());
    expect(data.topCopyright).toBe('© Test');
    expect(data.breadcrumbHtml).toBe('You are in: Home');
    expect(data.socialLinks[0]?.href).toContain('instagram.com');
    expect(data.logo?.href).toBe('https://www.zonnic.ca/ca/en');
    expect(data.logo?.inner).toContain('logo.svg');
    expect(data.columns.length).toBe(2);
    expect(data.columns[0].title).toBe('HELP');
    expect(data.columns[0].items[0].href).toBe('/c');
    expect(data.columns[0].items[1].static).toBe(true);
    expect(data.disclaimerParagraphsHtml).toEqual(['Disclaimer one.']);
    expect(data.bottomCopyrightHtml).toBe('© Bottom');
  });
});

describe('buildZonnicFooterFromData', () => {
  it('produces .bat-footer-zonnic with nav from parsed columns', () => {
    const data = parseZonnicFooterFromFragment(footerFixtureMain());
    const root = buildZonnicFooterFromData(document, '', data);
    expect(root.classList.contains('bat-footer-zonnic')).toBe(true);
    expect(root.querySelector('.bat-footer-zonnic-nav-menu .menu-title')?.textContent).toContain('HELP');
    expect(root.querySelector('.bat-footer-zonnic-disclaimer p')?.textContent).toContain('Disclaimer');
  });
});

const FOOTER_SNIPPET = `
<div class="bat-footer-zonnic">
  <div class="bat-footer-zonnic-main">
    <div class="bat-footer-social-nav"><ul><li><a href="#">social</a></li></ul></div>
    <div class="bat-footer-zonnic--row">
      <div class="bat-footer-zonnic-nav">
        <div class="bat-footer-zonnic-nav-menu">
          <div class="bat-footer-zonnic-nav-menu-title menu-title">A
            <button type="button" class="bat-icon icon-plus" aria-expanded="false"></button>
          </div>
          <div class="bat-footer-zonnic-submenu submenu"><ul><li>x</li></ul></div>
        </div>
        <div class="bat-footer-zonnic-nav-menu">
          <div class="bat-footer-zonnic-nav-menu-title menu-title">B
            <button type="button" class="bat-icon icon-plus" aria-expanded="false"></button>
          </div>
          <div class="bat-footer-zonnic-submenu submenu"><ul><li>y</li></ul></div>
        </div>
      </div>
    </div>
  </div>
</div>`;

function stubMatchMedia(matches992) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query) => ({
      matches: query.includes('min-width: 992px') ? matches992 : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

describe('bindZonnicFooter', () => {
  const origMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: origMatchMedia,
    });
  });

  it('moves social into the last nav column when viewport >= 992px (crawl)', () => {
    stubMatchMedia(true);
    const doc = new DOMParser().parseFromString(
      `<html><body>${FOOTER_SNIPPET}</body></html>`,
      'text/html',
    );
    const root = doc.body.querySelector('.bat-footer-zonnic');
    bindZonnicFooter(root);
    const menus = root.querySelectorAll('.bat-footer-zonnic-nav-menu');
    const lastMenu = menus[menus.length - 1];
    const social = root.querySelector('.bat-footer-social-nav');
    expect(lastMenu.contains(social)).toBe(true);
  });

  it('keeps social under .bat-footer-zonnic-main when viewport < 992px (crawl)', () => {
    stubMatchMedia(false);
    const doc = new DOMParser().parseFromString(
      `<html><body>${FOOTER_SNIPPET}</body></html>`,
      'text/html',
    );
    const root = doc.body.querySelector('.bat-footer-zonnic');
    const main = root.querySelector('.bat-footer-zonnic-main');
    bindZonnicFooter(root);
    const social = root.querySelector('.bat-footer-social-nav');
    expect(main.contains(social)).toBe(true);
    expect(social.parentElement).toBe(main);
  });

  it('toggles submenu open class and button state on title button click', () => {
    stubMatchMedia(true);
    const doc = new DOMParser().parseFromString(
      `<html><body>${FOOTER_SNIPPET}</body></html>`,
      'text/html',
    );
    const root = doc.body.querySelector('.bat-footer-zonnic');
    bindZonnicFooter(root);
    const firstMenu = root.querySelector('.bat-footer-zonnic-nav-menu');
    const btn = firstMenu.querySelector('button.bat-icon');
    expect(firstMenu.classList.contains('is-submenu-open')).toBe(false);
    btn.click();
    expect(firstMenu.classList.contains('is-submenu-open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(btn.classList.contains('icon-plus')).toBe(false);
    btn.click();
    expect(firstMenu.classList.contains('is-submenu-open')).toBe(false);
    expect(btn.classList.contains('icon-plus')).toBe(true);
  });
});
