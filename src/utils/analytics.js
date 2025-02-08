// Check if gtag is available
const isGtagAvailable = () => {
  return window.gtag !== undefined;
};

export const pageView = (url) => {
  if (!isGtagAvailable()) return;
  
  window.gtag('config', 'G-TEYM3EQFGE', {
    page_path: url,
  });
};

export const event_gtag = ({ action, category, label, value }) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
