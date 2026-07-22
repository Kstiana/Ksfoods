import config from './config.js';

const getStatus = () => {
  const now = new Date();
  const day = now.getDay();
  const hours = config.hours.find(h => h.day === day);
  if (!hours) return { open: false, label: 'Closed Today' };

  const [oH, oM] = hours.open.split(':').map(Number);
  const [cH, cM] = hours.close.split(':').map(Number);
  const openMins  = oH * 60 + oM;
  const closeMins = cH * 60 + cM;
  const nowMins   = now.getHours() * 60 + now.getMinutes();

  const open = nowMins >= openMins && nowMins < closeMins;
  const label = open
    ? `Open · Closes ${hours.close}`
    : `Closed · Opens ${hours.open}`;

  return { open, label };
};

export const initStatus = () => {
  const el = document.getElementById('restaurant-status');
  if (!el) return;

  const update = () => {
    const { open, label } = getStatus();
    el.textContent = label;
    el.className = `brand-status ${open ? 'status-open' : 'status-closed'}`;
  };

  update();
  setInterval(update, 60000);
};
