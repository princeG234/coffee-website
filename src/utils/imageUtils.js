// Generates a data-URI SVG placeholder with the product emoji.
// Used as a graceful fallback when an Unsplash image fails to load.
export const getEmojiImage = (emoji = "☕") => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#FDFBF7"/><text x="50%" y="50%" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

