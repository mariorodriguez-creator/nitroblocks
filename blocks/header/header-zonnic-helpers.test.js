import { describe, it, expect } from 'vitest';
import {
  ZONNIC_NAV_ITEMS,
  zonnicNavIconUrl,
  zonnicNavIconUseHref,
  buildZonnicNavList,
  parseZonnicNavItemsFromNavFragment,
  resolveZonnicNavIconId,
  ZONNIC_HEALTHCARE_HREF,
  ZONNIC_HEALTH_WARNING_ALT,
  ZONNIC_HW_DESKTOP_DAM_PATH,
  ZONNIC_HW_MOBILE_DAM_PATH,
  zonnicBlockAssetUrl,
  zonnicDamAssetUrl,
  createZonnicHealthWarningPicture,
  createZonnicLogoPicture,
  ZONNIC_LOGO_MOBILE_FILE,
} from './header-zonnic-helpers.js';

describe('zonnicNavIconUrl', () => {
  it('builds icon path under /icons like decorateIcon', () => {
    expect(zonnicNavIconUrl('', 'pouches')).toBe('/icons/zonnic-nav-pouches.svg');
    expect(zonnicNavIconUrl('/foo', 'help')).toBe('/foo/icons/zonnic-nav-help.svg');
  });
});

describe('zonnicNavIconUseHref', () => {
  it('points <use> at the root id inside each svg file', () => {
    expect(zonnicNavIconUseHref('', 'pouches')).toBe('/icons/zonnic-nav-pouches.svg#zonnic-nav-icon-root');
  });
});

describe('ZONNIC_NAV_ITEMS', () => {
  it('has seven primary links', () => {
    expect(ZONNIC_NAV_ITEMS.length).toBe(7);
  });
});

describe('resolveZonnicNavIconId', () => {
  it('uses data-icon when present and valid', () => {
    expect(resolveZonnicNavIconId('https://example.com/x', 'blog')).toBe('blog');
  });

  it('maps store-locator slug to stores', () => {
    expect(resolveZonnicNavIconId('https://www.zonnic.ca/ca/en/store-locator', undefined)).toBe('stores');
  });
});

describe('parseZonnicNavItemsFromNavFragment', () => {
  it('falls back to defaults when fragment is null', () => {
    const items = parseZonnicNavItemsFromNavFragment(null);
    expect(items.length).toBe(ZONNIC_NAV_ITEMS.length);
  });

  it('reads middle-section ul like default header', () => {
    const html = `<main>
      <div><div class="default-content-wrapper"><p><a href="/">b</a></p></div></div>
      <div><div class="default-content-wrapper"><ul>
        <li><a href="https://example.com/one">One</a></li>
        <li><a href="https://example.com/two" data-icon="blog">Two</a></li>
      </ul></div></div>
      <div></div>
    </main>`;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const main = doc.querySelector('main');
    const items = parseZonnicNavItemsFromNavFragment(main);
    expect(items).toHaveLength(2);
    expect(items[0].label).toBe('One');
    expect(items[1].iconId).toBe('blog');
  });
});

describe('buildZonnicNavList', () => {
  it('includes primary items plus mobile healthcare row', () => {
    const doc = new DOMParser().parseFromString('<html><body></body></html>', 'text/html');
    const ul = buildZonnicNavList(doc, '');
    const links = ul.querySelectorAll('a.header-zonnic-nav-link');
    expect(links.length).toBe(8);
    const last = links[links.length - 1];
    expect(last.getAttribute('href')).toBe(ZONNIC_HEALTHCARE_HREF);
    const mobileLi = ul.querySelector('.header-zonnic-nav-mobile-only');
    expect(mobileLi?.classList.contains('bat-navigation-group-list-item--zonnic-mobile')).toBe(true);
    const firstIcon = links[0].querySelector('i.bat-icon.pouches');
    expect(firstIcon).toBeTruthy();
    const useEl = firstIcon?.querySelector('use');
    expect(useEl?.getAttribute('href')).toBe(zonnicNavIconUseHref('', 'pouches'));
    const healthMask = last.querySelector('.header-zonnic-nav-icon-health');
    expect(healthMask?.getAttribute('style')).toMatch(/\/icons\/zonnic-nav-health\.svg/);
  });
});

describe('createZonnicHealthWarningPicture', () => {
  it('matches crawl: .bat-image > picture > source (768+) + img with DAM WebP paths', () => {
    const doc = new DOMParser().parseFromString('<html><body></body></html>', 'text/html');
    const el = createZonnicHealthWarningPicture(doc, '');
    expect(el.classList.contains('bat-image')).toBe(true);
    const picture = el.querySelector('picture');
    expect(picture).toBeTruthy();
    const source = picture?.querySelector('source');
    expect(source?.getAttribute('media')).toBe('(min-width: 768px)');
    expect(source?.getAttribute('srcset')).toBe(zonnicDamAssetUrl('', ZONNIC_HW_DESKTOP_DAM_PATH));
    const img = picture?.querySelector('img');
    expect(img?.getAttribute('alt')).toBe(ZONNIC_HEALTH_WARNING_ALT);
    expect(img?.getAttribute('src')).toBe(zonnicDamAssetUrl('', ZONNIC_HW_MOBILE_DAM_PATH));
  });

  it('prefixes DAM paths with codeBasePath', () => {
    const doc = new DOMParser().parseFromString('<html><body></body></html>', 'text/html');
    const el = createZonnicHealthWarningPicture(doc, '/repo');
    const source = el.querySelector('source');
    const img = el.querySelector('img');
    expect(source?.getAttribute('srcset')).toBe(zonnicDamAssetUrl('/repo', ZONNIC_HW_DESKTOP_DAM_PATH));
    expect(img?.getAttribute('src')).toBe(zonnicDamAssetUrl('/repo', ZONNIC_HW_MOBILE_DAM_PATH));
  });
});

describe('createZonnicLogoPicture', () => {
  it('switches logo asset at 768px using local paths', () => {
    const doc = new DOMParser().parseFromString('<html><body></body></html>', 'text/html');
    const pic = createZonnicLogoPicture(doc, '');
    expect(pic.querySelector('source')?.getAttribute('media')).toBe('(min-width: 768px)');
    expect(pic.querySelector('img')?.getAttribute('alt')).toBe('Zonnic home');
    expect(pic.querySelector('img')?.getAttribute('src')).toBe(zonnicBlockAssetUrl('', ZONNIC_LOGO_MOBILE_FILE));
  });
});
