import { getFallbackImage } from '../data/listings';

export default function ListingImage({ src, category, alt, className }) {
  const fallbackImage = getFallbackImage(category);

  return (
    <img
      src={src || fallbackImage}
      alt={alt}
      className={className}
      onError={(event) => {
        if (event.currentTarget.src !== fallbackImage) {
          event.currentTarget.src = fallbackImage;
        }
      }}
    />
  );
}
