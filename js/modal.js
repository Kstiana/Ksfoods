import menuItems from './data.js';
import config from './config.js';
import { addToCart } from './cart.js';
import { getRating } from './ratings.js';

let currentItem = null;
let currentQty = 1;
let startY = 0;

const formatPrice = price => `${config.currency}${price.toLocaleString('en-NG')}`;

const buildStarDisplay = rating => {
  return [1, 2, 3, 4, 5].map(s =>
    `<span style="color:${rating >= s ? 'var(--brand-gold)' : 'var(--border-strong)'}; font-size:20px;">★</span>`
  ).join('') + `<span class="rating-count">${rating ? `${rating.toFixed(1)} / 5` : 'No ratings yet'}</span>`;
};

const openModal = item => {
  currentItem = item;
  currentQty = 1;

  const overlay   = document.getElementById('modal-overlay');
  const image     = document.getElementById('modal-image');
  const catBadge  = document.getElementById('modal-category-badge');
  const name      = document.getElementById('modal-name');
  const desc      = document.getElementById('modal-description');
  const rating    = document.getElementById('modal-rating');
  const price     = document.getElementById('modal-price');
  const qtyVal    = document.getElementById('modal-qty-value');

  if (!overlay) return;

  image.src = item.image;
  image.alt = item.name;
  catBadge.textContent = item.category[0];
  name.textContent = item.name;
  desc.textContent = item.description;
  rating.innerHTML = buildStarDisplay(getRating(item.id));
  price.textContent = formatPrice(item.price);
  qtyVal.textContent = currentQty;

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    document.getElementById('modal-close-btn')?.focus();
  });
};

const closeModal = () => {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentItem = null;
  currentQty = 1;
};

const updateQtyDisplay = () => {
  const el = document.getElementById('modal-qty-value');
  if (el) el.textContent = currentQty;
};

export const initModal = () => {
  const overlay   = document.getElementById('modal-overlay');
  const modal     = document.getElementById('modal');
  const closeBtn  = document.getElementById('modal-close-btn');
  const incBtn    = document.getElementById('modal-qty-inc');
  const decBtn    = document.getElementById('modal-qty-dec');
  const addBtn    = document.getElementById('modal-add-to-cart');

  closeBtn?.addEventListener('click', closeModal);

  overlay?.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (!overlay?.classList.contains('open')) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') trapFocus(e, modal);
  });

  incBtn?.addEventListener('click', () => {
    currentQty++;
    updateQtyDisplay();
  });

  decBtn?.addEventListener('click', () => {
    if (currentQty > 1) { currentQty--; updateQtyDisplay(); }
  });

  addBtn?.addEventListener('click', () => {
    if (!currentItem) return;
    addToCart(currentItem.id, currentQty, addBtn);
    closeModal();
  });

  modal?.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  modal?.addEventListener('touchend', e => {
    const deltaY = e.changedTouches[0].clientY - startY;
    if (deltaY > 80) closeModal();
  }, { passive: true });

  document.addEventListener('click', e => {
    const card = e.target.closest('.menu-item');
    if (!card) return;
    if (e.target.closest('[data-add-id]')) return;
    if (e.target.closest('[data-fav-id]')) return;
    const id = Number(card.dataset.id);
    const item = menuItems.find(i => i.id === id);
    if (item) openModal(item);
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = document.activeElement?.closest('.menu-item');
    if (!card) return;
    const id = Number(card.dataset.id);
    const item = menuItems.find(i => i.id === id);
    if (item) { e.preventDefault(); openModal(item); }
  });
};

const trapFocus = (e, container) => {
  if (!container) return;
  const focusable = Array.from(container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )).filter(el => !el.disabled && el.offsetParent !== null);

  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
};
