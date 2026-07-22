import config from './config.js';
import menuItems from './data.js';
import { showToast } from './toast.js';

const STORAGE_KEY = 'kk_cart';

let cart = loadCart();

const formatPrice = price => `${config.currency}${price.toLocaleString('en-NG')}`;

const getItem = id => menuItems.find(item => item.id === id);

const getTotal = () =>
  Object.values(cart).reduce((sum, { item, qty }) => sum + item.price * qty, 0);

const getCount = () =>
  Object.values(cart).reduce((sum, { qty }) => sum + qty, 0);

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    const restored = {};
    Object.entries(saved).forEach(([id, { qty }]) => {
      const item = menuItems.find(i => i.id === Number(id));
      if (item) restored[id] = { item, qty };
    });
    return restored;
  } catch {
    return {};
  }
}

const saveCart = () => {
  try {
    const slim = {};
    Object.entries(cart).forEach(([id, { qty }]) => { slim[id] = { qty }; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {}
};

const syncBadge = () => {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = getCount();
  badge.textContent = count;
  badge.dataset.count = count;
  badge.setAttribute('aria-label', `${count} item${count !== 1 ? 's' : ''} in cart`);
  badge.classList.remove('bump');
  void badge.offsetWidth;
  if (count > 0) badge.classList.add('bump');
};

const syncSubtotal = () => {
  const el = document.getElementById('cart-subtotal');
  if (el) el.textContent = formatPrice(getTotal());
};

const syncFooter = () => {
  const footer = document.getElementById('cart-footer');
  const empty = document.getElementById('cart-empty');
  const hasItems = Object.keys(cart).length > 0;
  if (footer) footer.hidden = !hasItems;
  if (empty) empty.style.display = hasItems ? 'none' : '';
};

const renderCartItem = (item, qty) => {
  const el = document.createElement('div');
  el.className = 'cart-item';
  el.dataset.cartId = item.id;
  el.innerHTML = `
    <img class="cart-item-img" src="${item.image}" alt="${item.name}" loading="lazy" width="60" height="60" />
    <div class="cart-item-info">
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-price">${formatPrice(item.price * qty)}</div>
    </div>
    <div class="cart-item-controls">
      <button class="qty-btn" data-cart-dec="${item.id}" aria-label="Decrease quantity of ${item.name}">−</button>
      <span class="qty-value" aria-live="polite">${qty}</span>
      <button class="qty-btn" data-cart-inc="${item.id}" aria-label="Increase quantity of ${item.name}">+</button>
    </div>
    <button class="cart-item-remove" data-cart-remove="${item.id}" aria-label="Remove ${item.name} from order">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
      </svg>
    </button>
  `;
  return el;
};

const renderCart = () => {
  const container = document.getElementById('cart-items');
  if (!container) return;
  container.querySelectorAll('.cart-item').forEach(el => el.remove());
  Object.values(cart).forEach(({ item, qty }) => {
    container.appendChild(renderCartItem(item, qty));
  });
  syncSubtotal();
  syncFooter();
  syncBadge();
};

const flyToCart = sourceEl => {
  if (!sourceEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cartBtn = document.getElementById('cart-toggle-btn');
  if (!cartBtn) return;
  const from = sourceEl.getBoundingClientRect();
  const to = cartBtn.getBoundingClientRect();
  const dot = document.createElement('div');
  dot.className = 'fly-dot';
  dot.style.left = `${from.left + from.width / 2}px`;
  dot.style.top = `${from.top + from.height / 2}px`;
  dot.style.setProperty('--fly-x', `${to.left - from.left}px`);
  dot.style.setProperty('--fly-y', `${to.top - from.top}px`);
  document.body.appendChild(dot);
  dot.addEventListener('animationend', () => dot.remove(), { once: true });
};

export const addToCart = (id, qty = 1, sourceEl = null) => {
  const item = getItem(id);
  if (!item) return;

  if (cart[id]) {
    cart[id].qty += qty;
    const qtyEl = document.querySelector(`[data-cart-id="${id}"] .qty-value`);
    if (qtyEl) qtyEl.textContent = cart[id].qty;
    const priceEl = document.querySelector(`[data-cart-id="${id}"] .cart-item-price`);
    if (priceEl) priceEl.textContent = formatPrice(item.price * cart[id].qty);
  } else {
    cart[id] = { item, qty };
    const container = document.getElementById('cart-items');
    if (container) {
      const empty = container.querySelector('.cart-empty');
      if (empty) empty.style.display = 'none';
      container.appendChild(renderCartItem(item, qty));
    }
  }

  saveCart();
  syncBadge();
  syncSubtotal();
  syncFooter();
  flyToCart(sourceEl);
  showToast(`${item.name} added to order`, 'success');
};

export const removeFromCart = id => {
  if (!cart[id]) return;
  delete cart[id];
  const el = document.querySelector(`[data-cart-id="${id}"]`);
  if (el) el.remove();
  saveCart();
  syncBadge();
  syncSubtotal();
  syncFooter();
};

export const updateQty = (id, delta) => {
  if (!cart[id]) return;
  const item = getItem(id);
  cart[id].qty = Math.max(1, cart[id].qty + delta);
  const qtyEl = document.querySelector(`[data-cart-id="${id}"] .qty-value`);
  if (qtyEl) qtyEl.textContent = cart[id].qty;
  const priceEl = document.querySelector(`[data-cart-id="${id}"] .cart-item-price`);
  if (priceEl) priceEl.textContent = formatPrice(item.price * cart[id].qty);
  saveCart();
  syncBadge();
  syncSubtotal();
};

export const clearCart = () => {
  cart = {};
  saveCart();
  renderCart();
};

const buildWhatsAppMessage = () => {
  const lines = Object.values(cart).map(({ item, qty }) =>
    `• ${item.name} x${qty} — ${formatPrice(item.price * qty)}`
  );
  const total = formatPrice(getTotal());
  return [
    `Hello! I'd like to place an order from ${config.name}:`,
    '',
    ...lines,
    '',
    `*Total: ${total}*`,
    '',
    'Please confirm my order. Thank you!',
  ].join('\n');
};

export const orderViaWhatsApp = () => {
  if (!Object.keys(cart).length) {
    showToast('Your cart is empty', 'error');
    return;
  }
  const msg = encodeURIComponent(buildWhatsAppMessage());
  window.open(`https://wa.me/${config.whatsapp}?text=${msg}`, '_blank');
};

export const initCart = () => {
  const toggleBtn = document.getElementById('cart-toggle-btn');
  const closeBtn  = document.getElementById('cart-close-btn');
  const overlay   = document.getElementById('cart-overlay');
  const drawer    = document.getElementById('cart-drawer');
  const whatsappBtn = document.getElementById('whatsapp-order-btn');
  const clearBtn  = document.getElementById('cart-clear-btn');
  const heroWhatsApp = document.getElementById('whatsapp-hero-btn');

  const openCart = () => {
    drawer?.classList.add('open');
    overlay?.classList.add('open');
    drawer?.setAttribute('aria-hidden', 'false');
    toggleBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    drawer?.setAttribute('aria-hidden', 'true');
    toggleBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggleBtn?.addEventListener('click', () => {
    drawer?.classList.contains('open') ? closeCart() : openCart();
  });
  closeBtn?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);
  whatsappBtn?.addEventListener('click', orderViaWhatsApp);
  clearBtn?.addEventListener('click', clearCart);

  heroWhatsApp?.addEventListener('click', e => {
    e.preventDefault();
    Object.keys(cart).length ? orderViaWhatsApp() : openCart();
  });

  document.getElementById('cart-items')?.addEventListener('click', e => {
    const inc    = e.target.closest('[data-cart-inc]');
    const dec    = e.target.closest('[data-cart-dec]');
    const remove = e.target.closest('[data-cart-remove]');
    if (inc)    updateQty(Number(inc.dataset.cartInc), 1);
    if (dec)    updateQty(Number(dec.dataset.cartDec), -1);
    if (remove) removeFromCart(Number(remove.dataset.cartRemove));
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add-id]');
    if (!btn) return;
    e.stopPropagation();
    addToCart(Number(btn.dataset.addId), 1, btn);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer?.classList.contains('open')) closeCart();
  });

  renderCart();
};
