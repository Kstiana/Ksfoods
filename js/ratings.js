const STORAGE_KEY = 'kk_ratings';

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
};

const save = ratings => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch {}
};

let ratings = load();

export const getRating = id => ratings[id] ?? 0;

export const setRating = (id, value) => {
  ratings[id] = value;
  save(ratings);
};

export const initRatings = () => {
  document.addEventListener('change', e => {
    const input = e.target.closest('input[type="radio"][name^="rating-"]');
    if (!input) return;

    const id = Number(input.name.replace('rating-', ''));
    const value = Number(input.value);
    setRating(id, value);

    document.querySelectorAll(`[name="rating-${id}"]`).forEach(radio => {
      radio.checked = Number(radio.value) === value;
    });
  });
};
