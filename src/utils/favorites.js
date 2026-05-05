const FAVORITES_STORAGE_KEY = 'favorites';

function normalizeFavoriteId(value) {
  return value == null ? '' : String(value);
}

export function getStoredFavorites() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue)
      ? parsedValue.map(normalizeFavoriteId).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function saveStoredFavorites(favorites) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favorites.map(normalizeFavoriteId).filter(Boolean))
    );
  } catch (error) {
    console.error('Failed to persist favorites', error);
  }
}

export function toggleFavorite(favorites, listingId) {
  const normalizedListingId = normalizeFavoriteId(listingId);
  const normalizedFavorites = favorites.map(normalizeFavoriteId).filter(Boolean);

  return normalizedFavorites.includes(normalizedListingId)
    ? normalizedFavorites.filter((id) => id !== normalizedListingId)
    : [normalizedListingId, ...normalizedFavorites];
}
