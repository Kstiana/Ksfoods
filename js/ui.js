import config from './config.js';
import { getRating } from './ratings.js';

const formatPrice = price => `${config.currency}${price.toLocaleString('en-NG')}`;

const getFallbackEmoji = category => {
  const map = {
    'Main Courses': '🍛',
    'Appetizers':   '🥗',
    'Snacks':       '🍿',
    'Swallows':     '🫕',
    'Soups':        '🍲',
    'Proteins':     '🍖',
    'Sides':        '🥘',
    'Desserts':     '🍨',
    'Drinks':       '🥤',
    'Wines':        '🍷',
  };
  return map[category?.[0]] ?? '🍽️';
};

const buildStars = (itemId, rating) => {
  const stars = [5, 4, 3, 2, 1];
  return `
    <div class="rating" role="radiogroup" aria-label="Rate ${itemId}">
      ${stars.map(s => `
        <input type="radio" id="star-${itemId}-${s}" name="rating-${itemId}" value="${s}" ${rating >= s ? 'checked' : ''} />
        <label for="star-${itemId}-${s}" aria-label="${s} star${s > 1 ? 's' : ''}">★</label>
      `).join('')}
    </div>
  `;
};

const buildCard = (item, isFavourite = false) => {
  const el = document.createElement('div');
  el.className = 'menu-item';
  el.dataset.id = item.id;
  el.setAttribute('role', 'article');
  el.setAttribute('aria-label', item.name);
  el.tabIndex = 0;

  el.innerHTML = `
    <div class="menu-item-image-wrap">
      <img
        class="menu-item-image"
        src="${item.image}"
        alt="${item.name}"
        loading="lazy"
        width="300"
        height="225"
      />
      <div class="menu-item-image-fallback" aria-hidden="true">
        ${getFallbackEmoji(item.category)}
      </div>
      ${item.featured ? '<span class="featured-ribbon" aria-label="Chef\'s pick">Chef\'s Pick</span>' : ''}
      <span class="menu-item-category-badge" aria-hidden="true">${item.category[0]}</span>
      <span class="menu-item-price-badge" aria-label="Price: ${formatPrice(item.price)}">${formatPrice(item.price)}</span>
      <button
        class="menu-item-fav-btn ${isFavourite ? 'active' : ''}"
        aria-label="${isFavourite ? 'Remove from favourites' : 'Add to favourites'}"
        aria-pressed="${isFavourite}"
        data-fav-id="${item.id}"
      >
        <svg class="fav-icon" width="16" height="16" viewBox="0 0 24 24" fill="${isFavourite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>
    <div class="menu-item-body">
      <h3 class="menu-item-name">${item.name}</h3>
      <p class="menu-item-description">${item.description}</p>
      <div class="menu-item-footer">
        ${buildStars(item.id, getRating(item.id))}
        <button
          class="menu-item-add-btn"
          aria-label="Add ${item.name} to order"
          data-add-id="${item.id}"
        >+</button>
      </div>
    </div>
  `;

  const img = el.querySelector('.menu-item-image');
  const fallback = el.querySelector('.menu-item-image-fallback');
  img.addEventListener('load', () => { fallback.style.display = 'none'; });
  img.addEventListener('error', () => {
    img.style.display = 'none';
    fallback.style.display = 'flex';
  });

  return el;
};

export const renderShimmer = () => {
  const container = document.getElementById('shimmer');
  if (!container) return;
  container.innerHTML = Array.from({ length: config.shimmerCount }, () => `
    <div class="shimmer-item" aria-hidden="true">
      <div class="shimmer-image"></div>
      <div class="shimmer-body">
        <div class="shimmer-line title"></div>
        <div class="shimmer-line medium"></div>
        <div class="shimmer-line full"></div>
        <div class="shimmer-line short"></div>
      </div>
    </div>
  `).join('');
};

export const hideShimmer = () => {
  const container = document.getElementById('shimmer');
  if (container) container.innerHTML = '';
};

export const renderCards = (items, favourites = new Set()) => {
  const container = document.getElementById('menu-container');
  const emptyState = document.getElementById('empty-state');
  const shimmer = document.getElementById('shimmer');
  if (!container) return;

  if (shimmer) shimmer.innerHTML = '';

  const existing = container.querySelectorAll('.menu-item');
  existing.forEach(card => {
    card.classList.add('category-filter-exit');
  });

  setTimeout(() => {
    container.querySelectorAll('.menu-item').forEach(card => card.remove());

    if (!items.length) {
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    items.forEach(item => {
      const card = buildCard(item, favourites.has(item.id));
      card.classList.add('category-filter-enter');
      container.appendChild(card);
    });

    observeCards();
  }, existing.length ? 180 : 0);
};

export const renderFeatured = (items, favourites = new Set()) => {
  const section = document.getElementById('featured-section');
  if (!section || !items.length) return;

  section.innerHTML = `
    <h2 class="featured-heading">
      <span>✨ Chef's Picks</span>
    </h2>
    <div class="featured-grid" id="featured-grid"></div>
  `;

  const grid = section.querySelector('#featured-grid');
  items.forEach(item => {
    grid.appendChild(buildCard(item, favourites.has(item.id)));
  });

  observeCards(section);
};

export const updateFavBtn = (id, isFavourite) => {
  document.querySelectorAll(`[data-fav-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('active', isFavourite);
    btn.setAttribute('aria-pressed', isFavourite);
    btn.setAttribute('aria-label', isFavourite ? 'Remove from favourites' : 'Add to favourites');
    const icon = btn.querySelector('.fav-icon');
    if (icon) {
      icon.setAttribute('fill', isFavourite ? 'currentColor' : 'none');
      icon.classList.add('fav-pop');
      icon.addEventListener('animationend', () => icon.classList.remove('fav-pop'), { once: true });
    }
  });
};

const observeCards = (root = document) => {
  const cards = root.querySelectorAll('.menu-item:not(.visible)');
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  cards.forEach(card => observer.observe(card));
};
