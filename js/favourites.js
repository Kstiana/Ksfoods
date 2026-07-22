import { updateFavBtn } from './ui.js';
import { refreshFavourites } from './filter.js';
import { showToast } from './toast.js';

const STORAGE_KEY = 'kk_favourites';

const load = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []);
  } catch {
    return new Set();
  }
};

const save = set => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
};

let favourites = load();

export const getFavourites = () => favourites;

export const toggleFavourite = (id, itemName) => {
  if (favourites.has(id)) {
    favourites.delete(id);
    updateFavBtn(id, false);
    showToast(`${itemName} removed from favourites`);
  } else {
    favourites.add(id);
    updateFavBtn(id, true);
    showToast(`${itemName} added to favourites ❤️`, 'success');
  }
  save(favourites);
  refreshFavourites();
};

export const initFavourites = () => {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-fav-id]');
    if (!btn) return;
    e.stopPropagation();
    const id = Number(btn.dataset.favId);
    const card = btn.closest('.menu-item');
    const name = card?.querySelector('.menu-item-name')?.textContent ?? 'Item';
    toggleFavourite(id, name);
  });
};
