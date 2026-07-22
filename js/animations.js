export const initAnimations = () => {
  const backToTop = document.getElementById('back-to-top');
  const header = document.getElementById('site-header');

  const onScroll = () => {
    const y = window.scrollY;
    if (backToTop) backToTop.hidden = y < 400;
    if (header) header.classList.toggle('scrolled', y > 10);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};
