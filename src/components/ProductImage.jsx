import { getEmojiImage } from "../utils/imageUtils";

// Reusable product image that gracefully falls back to an emoji placeholder
// when the remote image fails to load.
const ProductImage = ({ src, alt, emoji = "☕", className = "", ...rest }) => {
  const handleError = (e) => {
    if (e.target.src !== getEmojiImage(emoji)) {
      e.target.src = getEmojiImage(emoji);
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={handleError}
      className={className}
      {...rest}
    />
  );
};

export default ProductImage;
