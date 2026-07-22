import menuItems from './data.js';
import { renderShimmer, renderFeatured } from './ui.js';
import { initFilter } from './filter.js';
import { initCart } from './cart.js';
import { initModal } from './modal.js';
import { initFavourites, getFavourites } from './favourites.js';
import { initTheme } from './theme.js';
import { initStatus } from './status.js';
import { initAnimations } from './animations.js';
import { initRatings } from './ratings.js';

const init = () => {
  initTheme();
  initStatus();
  initAnimations();

  renderShimmer();

  const featured = menuItems.filter(item => item.featured);
  renderFeatured(featured, getFavourites());

  initFilter();
  initCart();
  initModal();
  initFavourites();
  initRatings();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
