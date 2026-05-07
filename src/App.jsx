import { useCallback, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { saveStoredListings } from './data/listings';
import CreateListingPage from './pages/CreateListingPage';
import HomePage from './pages/HomePage';
import ListingDetailPage from './pages/ListingDetailPage';
import MyListingsPage from './pages/MyListingsPage';
import SuperAdminPage from './pages/SuperAdminPage';
import { defaultLanguage, languages } from './i18n/translations';
import { saveStoredFavorites, toggleFavorite } from './utils/favorites';
import { getUserId } from './utils/user';
import { supabase } from './supabase'

const FAVORITES_STORAGE_KEY = 'favorites';

function toLocalizedText(value) {
  if (value && typeof value === 'object') {
    return {
      zh: value.zh || value.en || '',
      ru: value.ru || value.zh || '',
      kk: value.kk || value.zh || '',
      en: value.en || value.zh || ''
    };
  }

  const text = typeof value === 'string' ? value : '';
  return {
    zh: text,
    ru: text,
    kk: text,
    en: text
  };
}

export default function App() {
  const [listings, setListings] = useState([]);
  const [currentUserId] = useState(() => getUserId());
  const [language, setLanguage] = useState(() => {
    const storedLanguage = window.localStorage.getItem('appLanguage');
    return languages.includes(storedLanguage) ? storedLanguage : defaultLanguage;
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.map((value) => (value == null ? '' : String(value))).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  });
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    window.localStorage.setItem('appLanguage', language);
  }, [language]);

  useEffect(() => {
    const result = saveStoredListings(listings);
    if (!result.ok) {
      setStorageError('本地存储空间不足，请减少图片数量或刷新后重试');
    }
  }, [listings]);

  const mapPostToListing = useCallback(
    (item) => ({
      ...item,
      title: toLocalizedText(item.title),
      description: toLocalizedText(item.description),
      createdAt: item.created_at || item.createdAt || item.updated_at || new Date().toISOString(),
      updatedAt: item.updated_at || item.updatedAt || item.created_at || new Date().toISOString(),
      category: item.category || 'housing',
      location: item.location || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      images: Array.isArray(item.images)
        ? item.images
        : item.image
          ? [item.image]
          : [],
      image: item.image || item.images?.[0] || '',
      phone: item.phone || '',
      whatsapp: item.whatsapp || '',
      currency: item.currency || '₸',
      userId: item.userId || item.user_id || currentUserId,
      hidden: Boolean(item.hidden),
      isUserCreated: Boolean(item.isUserCreated || item.userId || item.user_id),
      featured: Boolean(item.featured)
    }),
    [currentUserId]
  );

  const refreshListings = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取数据失败:', error);
      return false;
    }

    setListings(
      (data || [])
        .filter((item) => !item?.hidden)
        .map((item) => mapPostToListing(item))
    );

    return true;
  }, [currentUserId, mapPostToListing]);

  useEffect(() => {
    refreshListings();
  }, [refreshListings]);

  useEffect(() => {
    if (!storageError) {
      return;
    }

    const timer = window.setTimeout(() => {
      setStorageError('');
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [storageError]);

  async function handleCreateListing(values) {
    const nextImages = Array.isArray(values.images) ? values.images.filter(Boolean) : [];
    const nextCoverImage = nextImages[0] || values.image || null;

    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title: values.title,
          description: values.description,
          category: values.category,
          location: values.location,
          tags: values.tags,
          images: nextImages,
          image: nextCoverImage,
          price: values.price,
          phone: values.phone,
          whatsapp: values.whatsapp,
          user_id: currentUserId
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('发布失败:', error);
      return false;
    }

    if (data) {
      setListings((currentListings) => [mapPostToListing(data), ...currentListings]);
    }

    return refreshListings();
  }

  async function handleUpdateListing(id, values) {
    const existingListing = listings.find(
      (item) => String(item.id) === String(id) && String(item.userId) === String(currentUserId)
    );

    if (!existingListing) {
      return false;
    }

    const nextImages = Array.isArray(values.images) ? values.images.filter(Boolean) : [];
    const nextCoverImage = nextImages[0] || values.image || null;

    const { data, error } = await supabase
      .from('posts')
      .update({
        title: values.title,
        description: values.description,
        category: values.category,
        location: values.location,
        tags: values.tags,
        images: nextImages,
        image: nextCoverImage,
        price: values.price,
        phone: values.phone,
        whatsapp: values.whatsapp,
        user_id: currentUserId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', currentUserId)
      .select()
      .single();

    if (error) {
      console.error('更新失败:', error);
      return false;
    }

    if (data) {
      setListings((currentListings) =>
        currentListings.map((item) =>
          String(item.id) === String(id) ? mapPostToListing(data) : item
        )
      );
    }

    await refreshListings();
    return true;
  }

  async function handleDeleteListing(id) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除失败:', error);
      return;
    }

    const nextFavorites = favorites.filter((favoriteId) => String(favoriteId) !== String(id));
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
    setFavorites(nextFavorites);
    saveStoredFavorites(nextFavorites);

    setListings((currentListings) =>
      currentListings.filter((item) => String(item.id) !== String(id))
    );

    await refreshListings();
  }

  function handleToggleFavorite(id) {
    setFavorites((currentFavorites) => {
      const nextFavorites = toggleFavorite(currentFavorites, id);
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
      saveStoredFavorites(nextFavorites);
      return nextFavorites;
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {storageError ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-40 mx-auto flex max-w-md justify-center px-4">
          <div className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-soft">
            {storageError}
          </div>
        </div>
      ) : null}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              favorites={favorites}
              language={language}
              listings={listings}
              onLanguageChange={setLanguage}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route
          path="/listing/:id"
          element={
            <ListingDetailPage
              favorites={favorites}
              language={language}
              listings={listings}
              onLanguageChange={setLanguage}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route
          path="/create"
          element={
            <CreateListingPage
              currentUserId={currentUserId}
              language={language}
              listings={listings}
              onCreateListing={handleCreateListing}
              onLanguageChange={setLanguage}
              onUpdateListing={handleUpdateListing}
            />
          }
        />
        <Route
          path="/edit/:id"
          element={
            <CreateListingPage
              currentUserId={currentUserId}
              language={language}
              listings={listings}
              onCreateListing={handleCreateListing}
              onLanguageChange={setLanguage}
              onUpdateListing={handleUpdateListing}
            />
          }
        />
        <Route
          path="/my-listings"
          element={
            <MyListingsPage
              currentUserId={currentUserId}
              favorites={favorites}
              language={language}
              listings={listings}
              onDeleteListing={handleDeleteListing}
              onLanguageChange={setLanguage}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route
          path="/super-admin"
          element={
            <SuperAdminPage
              language={language}
              onRefreshListings={refreshListings}
            />
          }
        />
      </Routes>
    </div>
  );
}
