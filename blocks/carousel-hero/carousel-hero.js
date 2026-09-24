import { createOptimizedPicture } from '../../scripts/aem.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel-hero');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-hero-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-hero-slide-indicator');
  indicators.forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (idx !== slideIndex) {
      button.removeAttribute('disabled');
      button.removeAttribute('aria-current');
    } else {
      button.setAttribute('disabled', true);
      button.setAttribute('aria-current', true);
    }
  });
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-hero-slide-indicators');
  if (slideIndicators) {
    slideIndicators.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const slideIndicator = e.currentTarget.parentElement;
        showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
      });
    });
  }

  const prev = block.querySelector('.slide-prev');
  const next = block.querySelector('.slide-next');
  if (prev) {
    prev.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
    });
  }
  if (next) {
    next.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
    });
  }

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

/**
 * Build one slide from a row. Column layout:
 *   cell 1 = background/side image, cell 2 = heading + paragraph + CTA,
 *   cell 3 (optional) = tab label used for the numbered navigation.
 * Returns the tab label text for that slide (falls back to '').
 */
function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-hero-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-hero-slide');

  const columns = [...row.children];
  // A trailing text-only cell is the tab label — pull it out before building the slide.
  let label = '';
  if (columns.length > 2) {
    const labelCol = columns.pop();
    label = labelCol.textContent.trim();
  }

  columns.forEach((column, colIdx) => {
    column.classList.add(`carousel-hero-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return { slide, label };
}

let carouselId = 0;
export default function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-hero-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-hero-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-hero-slides');
  block.prepend(slidesWrapper);

  const labels = [];
  rows.forEach((row, idx) => {
    const { slide, label } = createSlide(row, idx, carouselId);
    labels.push(label);
    slidesWrapper.append(slide);
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    // Numbered, labeled tab navigation (01. Electronic Components, …) with a
    // prev/next control at the end — mirrors the source hero.
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Carousel Slide Controls');
    nav.classList.add('carousel-hero-nav');

    const slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-hero-slide-indicators');

    labels.forEach((label, idx) => {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-hero-slide-indicator');
      indicator.dataset.targetSlide = idx;
      const num = String(idx + 1).padStart(2, '0');
      const labelText = label || `Slide ${idx + 1}`;
      indicator.innerHTML = `<button type="button" aria-label="Show slide ${idx + 1}: ${labelText}">
          <span class="carousel-hero-indicator-num">${num}.</span>
          <span class="carousel-hero-indicator-label">${labelText}</span>
        </button>`;
      slideIndicators.append(indicator);
    });
    nav.append(slideIndicators);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-hero-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="Previous Slide"></button>
      <button type="button" class="slide-next" aria-label="Next Slide"></button>
    `;
    nav.prepend(slideNavButtons);

    block.append(nav);
  }

  // optimize slide images; the first slide is the LCP image so load it eagerly
  block.querySelectorAll('.carousel-hero-slide-image picture > img').forEach((img, idx) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, idx === 0, [{ width: '1600' }]),
    );
  });

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
