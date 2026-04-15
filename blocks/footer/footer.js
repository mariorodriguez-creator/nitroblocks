import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import bindZonnicFooter, {
  buildZonnicFooterFromData,
  parseZonnicFooterFromFragment,
} from './footer-zonnic-helpers.js';

/**
 * Default footer: inject decorated fragment sections (EDS `footer` doc).
 * @param {Element} block
 */
async function appendFooterFromFragment(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  const inner = document.createElement('div');
  if (fragment) {
    while (fragment.firstElementChild) {
      inner.append(fragment.firstElementChild);
    }
  }
  block.append(inner);
}

/**
 * Zonnic: read plain `/footer` fragment (positional sections, like `/nav`), build BAT shell.
 * @param {Element} block
 */
async function decorateZonnicFooter(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  const data = parseZonnicFooterFromFragment(fragment);
  const basePath = window.hlx?.codeBasePath ?? '';
  const root = buildZonnicFooterFromData(document, basePath, data);
  block.append(root);
  bindZonnicFooter(root);
  block.closest('footer')?.classList.add('footer--zonnic-variant');
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const isZonnic = block.classList.contains('zonnic') || getMetadata('footer-variant') === 'zonnic';

  block.textContent = '';

  if (isZonnic) {
    block.classList.add('zonnic');
    await decorateZonnicFooter(block);
    return;
  }

  await appendFooterFromFragment(block);
}
