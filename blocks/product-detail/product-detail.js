const BLOCK_PATH = '/blocks/product-detail';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadCSS(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

async function loadSlick() {
  loadCSS(`${BLOCK_PATH}/vendor/slick.min.css`);
  loadCSS(`${BLOCK_PATH}/vendor/slick-theme.min.css`);

  if (!window.jQuery) {
    await loadScript(`${BLOCK_PATH}/vendor/jquery-3.6.0.min.js`);
  }
  if (!window.jQuery.fn.slick) {
    await loadScript(`${BLOCK_PATH}/vendor/slick.min.js`);
  }
}

async function fetchPlaceholders() {
  try {
    const resp = await fetch('/placeholders.json');
    if (!resp.ok) return {};
    const json = await resp.json();
    const placeholders = {};
    json.data.forEach((row) => {
      placeholders[row.Key] = row.Text;
    });
    return placeholders;
  } catch {
    return {};
  }
}

function buildGallery(imageCol) {
  const gallery = document.createElement('div');
  gallery.className = 'product-detail-gallery';

  const pictures = [...imageCol.querySelectorAll('picture')];

  // Slick slider container
  const slider = document.createElement('div');
  slider.className = 'product-detail-gallery-images';

  pictures.forEach((pic) => {
    const slide = document.createElement('div');
    slide.className = 'product-detail-gallery-slide';
    const clone = pic.cloneNode(true);
    slide.append(clone);
    slider.append(slide);
  });

  // Thumbnail strip
  const thumbs = document.createElement('div');
  thumbs.className = 'product-detail-gallery-thumbnails';

  pictures.forEach((pic, idx) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.setAttribute('aria-label', `View image ${idx + 1}`);
    if (idx === 0) thumb.classList.add('active');
    const thumbImg = pic.querySelector('img')?.cloneNode(true);
    if (thumbImg) {
      thumbImg.setAttribute('loading', 'lazy');
      thumbImg.removeAttribute('width');
      thumbImg.removeAttribute('height');
      thumb.append(thumbImg);
    }
    thumbs.append(thumb);
  });

  gallery.append(slider, thumbs);

  if (pictures.length <= 1) {
    thumbs.hidden = true;
  }

  return gallery;
}

function initSlickGallery(block) {
  const $ = window.jQuery;
  const $slider = $(block).find('.product-detail-gallery-images');
  const $thumbs = $(block).find('.product-detail-gallery-thumbnails');

  $slider.slick({
    fade: true,
    speed: 300,
    cssEase: 'ease',
    dots: false,
    arrows: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    lazyLoad: 'ondemand',
    draggable: true,
    swipe: true,
    touchThreshold: 5,
    waitForAnimate: true,
    prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
    nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
    responsive: [
      {
        breakpoint: 577,
        settings: {
          dots: true,
        },
      },
    ],
  });

  // Sync thumbnails with slider
  $slider.on('beforeChange', (_e, _slick, _current, next) => {
    $thumbs.find('button').removeClass('active');
    $thumbs.find('button').eq(next).addClass('active');
  });

  $thumbs.find('button').on('click', function handleThumbClick() {
    const idx = $(this).index();
    $slider.slick('slickGoTo', idx);
  });
}

function buildDescription(ul, placeholders) {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-detail-description';
  wrapper.setAttribute('aria-expanded', 'false');

  wrapper.append(ul);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'product-detail-description-toggle';
  toggle.textContent = placeholders.readMore || 'Read more';

  toggle.addEventListener('click', () => {
    const expanded = wrapper.getAttribute('aria-expanded') === 'true';
    wrapper.setAttribute('aria-expanded', String(!expanded));
    toggle.textContent = !expanded
      ? (placeholders.readLess || 'Read less')
      : (placeholders.readMore || 'Read more');
  });

  wrapper.append(toggle);
  return wrapper;
}

function buildBuyPanel(nodes) {
  const panel = document.createElement('div');
  panel.className = 'product-detail-buy-panel';

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
    if (node.nodeName === 'PICTURE') return;
    panel.append(node);
  });

  const ol = panel.querySelector('ol');
  if (ol) ol.classList.add('product-detail-buy-panel-steps');

  let ctaWrapper = null;
  const buttons = panel.querySelectorAll('.button-wrapper');
  if (buttons.length) {
    ctaWrapper = document.createElement('div');
    ctaWrapper.className = 'product-detail-ctas';
    buttons.forEach((bw) => ctaWrapper.append(bw));
  }

  return { panel, ctaWrapper };
}

export default async function decorate(block) {
  const [placeholders] = await Promise.all([
    fetchPlaceholders(),
    loadSlick(),
  ]);

  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cols = row.querySelectorAll(':scope > div');
  const imageCol = cols[0];
  const infoCol = cols[1];
  if (!imageCol || !infoCol) return;

  const gallery = buildGallery(imageCol);

  const info = document.createElement('div');
  info.className = 'product-detail-info';

  const children = [...infoCol.childNodes];

  const hrIndex = children.findIndex(
    (n) => n.nodeName === 'HR' || (n.querySelector && n.querySelector('hr')),
  );

  const beforeHR = hrIndex >= 0 ? children.slice(0, hrIndex) : children;
  const afterHR = hrIndex >= 0 ? children.slice(hrIndex + 1) : [];

  beforeHR.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
    if (node.nodeName === 'UL') {
      info.append(buildDescription(node, placeholders));
    } else {
      info.append(node);
    }
  });

  if (afterHR.length) {
    const { panel, ctaWrapper } = buildBuyPanel(afterHR);
    info.append(panel);
    if (ctaWrapper) info.append(ctaWrapper);
  }

  block.innerHTML = '';
  block.append(gallery, info);

  initSlickGallery(block);
}
