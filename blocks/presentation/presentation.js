import { readBlockConfig } from '../../scripts/aem.js';

const AUTOPLAY_INTERVAL = 5000;
const SWIPE_THRESHOLD = 50;

function getInitialSlideIndex(count) {
  const { hash } = window.location;
  if (hash.startsWith('#slide-')) {
    const n = parseInt(hash.slice(7), 10);
    return Math.max(0, Math.min(n - 1, count - 1));
  }
  return 0;
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function buildFooter(config, hasTimer) {
  const footer = document.createElement('div');
  footer.className = 'presentation-footer';

  const left = document.createElement('div');
  left.className = 'presentation-footer-left';

  let timerDisplay = null;
  if (hasTimer) {
    timerDisplay = document.createElement('span');
    timerDisplay.className = 'presentation-timer';
    timerDisplay.textContent = '00:00';
    left.append(timerDisplay);
  }

  const center = document.createElement('div');
  center.className = 'presentation-footer-center';
  center.textContent = config.subtitle || config.title || '';

  const right = document.createElement('div');
  right.className = 'presentation-footer-right';
  const counter = document.createElement('span');
  counter.className = 'slide-counter';
  right.append(counter);

  footer.append(left, center, right);
  return { footer, counter, timerDisplay };
}

function buildHeader(config) {
  const header = document.createElement('div');
  header.className = 'presentation-header';

  const left = document.createElement('div');
  left.className = 'presentation-header-left';
  if (config.logo) {
    const logo = document.createElement('img');
    logo.src = config.logo;
    logo.alt = 'Logo';
    logo.loading = 'lazy';
    left.append(logo);
  }

  const right = document.createElement('div');
  right.className = 'presentation-header-right';
  if (config.title) {
    const title = document.createElement('span');
    title.className = 'presentation-header-title';
    title.textContent = config.title;
    right.append(title);
  }

  header.append(left, right);
  return header;
}

function buildNavButton(className, ariaLabel, iconSrc) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.setAttribute('aria-label', ariaLabel);
  const img = document.createElement('img');
  img.src = iconSrc;
  img.alt = '';
  img.width = 24;
  img.height = 24;
  btn.append(img);
  return btn;
}

function buildDots(slides, initialIndex) {
  const container = document.createElement('div');
  container.className = 'presentation-dots';
  container.setAttribute('role', 'tablist');
  container.setAttribute('aria-label', 'Slide indicators');

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `presentation-dot${i === initialIndex ? ' active' : ''}`;
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.setAttribute('aria-selected', String(i === initialIndex));
    container.append(dot);
  });

  return container;
}

function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    if (u.hostname.includes('youtube.com')) {
      const embedMatch = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
      return u.searchParams.get('v');
    }
  } catch { /* empty */ }
  return null;
}

function findYouTubeParagraph(container) {
  const anchor = [...container.querySelectorAll('p > a')].find(
    (a) => extractYouTubeId(a.href) && a.parentElement.children.length === 1,
  );
  return anchor ? anchor.parentElement : null;
}

function buildYouTubeIframe(videoId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'presentation-video';
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&mute=1`;
  iframe.allow = 'autoplay; encrypted-media';
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('title', 'Video');
  wrapper.append(iframe);
  return wrapper;
}

function sendYouTubeCommand(iframe, func) {
  iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
}

function playSlideVideo(slide) {
  slide.querySelectorAll('.presentation-video iframe').forEach((iframe) => {
    sendYouTubeCommand(iframe, 'playVideo');
  });
}

function pauseSlideVideo(slide) {
  slide.querySelectorAll('.presentation-video iframe').forEach((iframe) => {
    sendYouTubeCommand(iframe, 'pauseVideo');
  });
}

function decorateVideoSlides(slides) {
  slides.forEach((slide) => {
    if (slide.classList.contains('slide-split')) return;
    const wrapper = slide.querySelector('.default-content-wrapper');
    if (!wrapper) return;
    const ytParagraph = findYouTubeParagraph(wrapper);
    if (!ytParagraph) return;
    const videoId = extractYouTubeId(ytParagraph.querySelector('a').href);
    if (!videoId) return;
    ytParagraph.replaceWith(buildYouTubeIframe(videoId));
    slide.classList.add('has-video');
  });
}

function decorateSplitSlides(slides) {
  slides.forEach((slide) => {
    if (!slide.classList.contains('slide-split')) return;

    const wrapper = slide.querySelector('.default-content-wrapper');
    if (!wrapper) return;

    // Prefer picture; then standalone img; fall back to a YouTube link
    const picture = wrapper.querySelector('picture');
    let pictureEl = null;
    if (picture) {
      pictureEl = picture.parentElement?.tagName === 'P' ? picture.parentElement : picture;
    } else {
      const img = wrapper.querySelector('img');
      if (img) {
        pictureEl = img.parentElement?.tagName === 'P' ? img.parentElement : img;
      }
    }
    const ytParagraph = !pictureEl ? findYouTubeParagraph(wrapper) : null;
    const mediaEl = pictureEl || ytParagraph;

    if (!mediaEl) return;

    const isMediaFirst = wrapper.firstElementChild === mediaEl;

    slide.classList.add(isMediaFirst ? 'image-left' : 'image-right');

    const imageDiv = document.createElement('div');
    imageDiv.className = 'split-image';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'split-content';

    if (ytParagraph) {
      const videoId = extractYouTubeId(ytParagraph.querySelector('a').href);
      imageDiv.append(buildYouTubeIframe(videoId));
      slide.classList.add('has-video');
    }

    [...wrapper.children].forEach((child) => {
      if (child === mediaEl) {
        if (pictureEl) imageDiv.append(child);
        // ytParagraph is already replaced by the iframe above — skip
      } else {
        contentDiv.append(child);
      }
    });

    if (isMediaFirst) {
      wrapper.append(imageDiv, contentDiv);
    } else {
      wrapper.append(contentDiv, imageDiv);
    }
  });
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const isDark = block.classList.contains('dark');
  const isAutoplay = block.classList.contains('autoplay');
  const isTimer = block.classList.contains('timer');

  if (isDark) document.body.classList.add('dark');

  const main = block.closest('main');

  // The auto-blocker (buildHeroBlock) moves the logo picture out of the config block
  // before readBlockConfig runs. Recover the src from the hero section and hide it.
  const heroSection = main.querySelector('.section.hero-container');
  if (heroSection) {
    if (!config.logo?.trim()) {
      const heroImg = heroSection.querySelector('img');
      if (heroImg) config.logo = heroImg.src;
    }
    heroSection.style.display = 'none';
  }

  const slides = [...main.querySelectorAll('.section.presentation-slide')];

  if (!slides.length) return;

  let currentIndex = getInitialSlideIndex(slides.length);

  // Setup slide sections
  slides.forEach((slide, i) => {
    slide.style.display = '';
    slide.setAttribute('role', 'region');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
    if (slide.dataset.background) {
      slide.style.backgroundImage = `url(${slide.dataset.background})`;
      slide.classList.add('has-background');
    }
  });

  decorateSplitSlides(slides);
  decorateVideoSlides(slides);

  // Build chrome
  const basePath = window.hlx.codeBasePath;
  const { footer, counter, timerDisplay } = buildFooter(config, isTimer);
  const header = buildHeader(config);
  const dots = buildDots(slides, currentIndex);
  const prevBtn = buildNavButton(
    'presentation-prev',
    'Previous slide',
    `${basePath}/icons/chevron-left.svg`,
  );
  const nextBtn = buildNavButton(
    'presentation-next',
    'Next slide',
    `${basePath}/icons/chevron-right.svg`,
  );
  const fsBtn = buildNavButton(
    'presentation-fullscreen',
    'Toggle fullscreen',
    `${basePath}/icons/fullscreen.svg`,
  );

  const nav = document.createElement('nav');
  nav.className = 'presentation-nav';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Slide navigation');
  nav.append(prevBtn, dots, nextBtn, fsBtn);

  const chrome = document.createElement('div');
  chrome.className = 'presentation-chrome';
  chrome.append(header, nav, footer);
  main.append(chrome);

  if (slides.length <= 1) {
    nav.style.display = 'none';
  }

  // --- Navigation logic ---

  function updateSlideStates() {
    slides.forEach((slide, i) => {
      const isActive = i === currentIndex;
      slide.classList.remove('slide-before', 'slide-after', 'active-slide');

      if (i < currentIndex) slide.classList.add('slide-before');
      else if (i > currentIndex) slide.classList.add('slide-after');
      else slide.classList.add('active-slide');

      slide.setAttribute('aria-hidden', String(!isActive));
    });
  }

  function updateChrome() {
    counter.textContent = `${currentIndex + 1} / ${slides.length}`;

    dots.querySelectorAll('.presentation-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
      dot.setAttribute('aria-selected', String(i === currentIndex));
    });

    const isTitle = slides[currentIndex].classList.contains('slide-title');
    footer.classList.toggle('hidden', isTitle);
    header.classList.toggle('hidden', isTitle);
    prevBtn.classList.toggle('hidden', currentIndex === 0);
    nextBtn.classList.toggle('hidden', currentIndex === slides.length - 1);
  }

  function goToSlide(index) {
    if (index < 0 || index >= slides.length || index === currentIndex) return;

    pauseSlideVideo(slides[currentIndex]);
    currentIndex = index;

    updateSlideStates();

    window.history.replaceState(null, '', `#slide-${currentIndex + 1}`);
    updateChrome();
    playSlideVideo(slides[currentIndex]);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  // Initial chrome state
  updateSlideStates();
  updateChrome();
  playSlideVideo(slides[currentIndex]);

  // Timer
  let stopTimer = () => {};

  if (isTimer) {
    const timerStartTime = Date.now();
    let timerElapsed = 0;
    let timerRunning = true;
    const timerInterval = setInterval(() => {
      timerDisplay.textContent = formatTime(timerElapsed + (Date.now() - timerStartTime));
    }, 500);

    stopTimer = () => {
      if (!timerRunning) return;
      timerElapsed += Date.now() - timerStartTime;
      clearInterval(timerInterval);
      timerRunning = false;
      timerDisplay.textContent = formatTime(timerElapsed);
    };
  }

  // Button clicks
  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  fsBtn.addEventListener('click', toggleFullscreen);

  // Dot clicks (event delegation)
  dots.addEventListener('click', (e) => {
    const dot = e.target.closest('.presentation-dot');
    if (!dot) return;
    const index = [...dots.children].indexOf(dot);
    if (index >= 0) goToSlide(index);
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault();
        goToSlide(currentIndex + 1);
        break;
      case ' ':
        if (tag !== 'A' && tag !== 'BUTTON') {
          e.preventDefault();
          goToSlide(currentIndex + 1);
        }
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        goToSlide(currentIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(slides.length - 1);
        break;
      case 'f':
        toggleFullscreen();
        break;
      case 't':
      case 'T':
        stopTimer();
        break;
      case 'Escape':
        if (document.fullscreenElement) document.exitFullscreen();
        break;
      default:
        break;
    }
  });

  // Click edge navigation
  main.addEventListener('click', (e) => {
    const isChrome = e.target.closest('.presentation-chrome');
    const isLink = e.target.closest('a');
    const isButton = e.target.closest('button');
    if (isChrome || isLink || isButton) return;

    const rect = main.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.15) goToSlide(currentIndex - 1);
    else if (x > rect.width * 0.85) goToSlide(currentIndex + 1);
  });

  // Touch swipe
  let touchStartX = 0;
  let touchStartY = 0;

  main.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  main.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) goToSlide(currentIndex + 1);
      else goToSlide(currentIndex - 1);
    }
  }, { passive: true });

  // Hash change (browser back/forward)
  window.addEventListener('hashchange', () => {
    const { hash } = window.location;
    if (hash.startsWith('#slide-')) {
      let n = parseInt(hash.slice(7), 10) - 1;
      n = Math.max(0, Math.min(n, slides.length - 1));
      if (n !== currentIndex) goToSlide(n);
    }
  });

  // Autoplay
  if (isAutoplay) {
    let autoplayTimer = setInterval(() => {
      const next = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;
      goToSlide(next);
    }, AUTOPLAY_INTERVAL);

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    main.addEventListener('click', stopAutoplay, { once: true });
    document.addEventListener('keydown', stopAutoplay, { once: true });
    main.addEventListener('touchstart', stopAutoplay, { once: true });
  }
}
