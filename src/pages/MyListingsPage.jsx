import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ListingImage from '../components/ListingImage';
import LogoMark from '../components/LogoMark';
import { translations } from '../i18n/translations';
import { getUserId } from '../utils/user';
import { formatDate, formatPrice } from '../utils/format';

function isUserListing(item, currentUserId) {
  return item.userId === currentUserId;
}

export default function MyListingsPage({
  currentUserId,
  favorites,
  language,
  listings,
  onDeleteListing,
  onLanguageChange,
  onToggleFavorite
}) {
  const [activeTab, setActiveTab] = useState('listings');
  const [toastMessage, setToastMessage] = useState('');
  const locationState = useLocation();
  const navigate = useNavigate();
  const t = translations[language];

  useEffect(() => {
    document.title = 'HabarHub - 哈百通';
  }, []);

  useEffect(() => {
    if (!locationState.state?.toast) {
      return;
    }

    setToastMessage(locationState.state.toast);
    navigate(locationState.pathname, { replace: true, state: {} });
  }, [locationState.pathname, locationState.state, navigate]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const myListings = useMemo(
    () =>
      listings
        .filter((item) => isUserListing(item, currentUserId))
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.postedAt).getTime() -
            new Date(a.createdAt || a.postedAt).getTime()
        ),
    [currentUserId, listings]
  );

  const favoriteListings = useMemo(
    () =>
      favorites
        .map((id) => listings.find((item) => String(item.id) === String(id)))
        .filter(Boolean),
    [favorites, listings]
  );

  const labels = {
    home: t.home,
    my: t.my,
    publish: t.publish
  };

  function handleDelete(id) {
    const listing = listings.find((item) => item.id === id);
    if (!listing || listing.userId !== getUserId()) {
      window.alert('无权限');
      return;
    }

    if (!window.confirm(t.deleteConfirm)) {
      return;
    }

    onDeleteListing(id);
    setToastMessage(t.deleteSuccess);
  }

  const tabs = [
    { id: 'listings', label: t.myListingsTitle },
    { id: 'favorites', label: t.favoritesTitle }
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-100">
      {toastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-30 mx-auto flex max-w-md justify-center px-4">
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft">
            {toastMessage}
          </div>
        </div>
      ) : null}

      <main className="flex-1 px-4 pb-8 pt-5">
        <section className="rounded-[32px] bg-hero px-5 pb-6 pt-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <LogoMark />
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                {t.myListingsTitle}
              </h1>
              <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
                {t.myListingsSubtitle}
              </p>
            </div>
            <LanguageSwitcher current={language} onChange={onLanguageChange} />
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-[24px] bg-white p-2 shadow-soft">
            {tabs.map((tab) => {
              const active = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-transparent text-slate-500'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'listings' ? (
            myListings.length > 0 ? (
              myListings.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[28px] bg-white shadow-soft"
                >
                  <div className="flex gap-4 p-4">
                    <ListingImage
                      src={item.images?.[0] || item.image}
                      category={item.category}
                      alt={item.title[language]}
                      className="h-24 w-24 rounded-[20px] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-bold text-slate-900">
                            {item.title[language]}
                          </h2>
                          <p className="mt-1 text-xs font-medium text-[#16A34A]">
                            {item.location?.trim() || t.locationMissing}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 px-3 py-2 text-right">
                          <p className="text-sm font-extrabold text-amber-900">
                            {formatPrice(item.price, item.currency, language)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 max-h-12 overflow-hidden text-sm leading-6 text-slate-500">
                        {item.description[language]}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(item.createdAt || item.postedAt, language)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t border-slate-100 px-4 py-4">
                    <Link
                      to={`/listing/${item.id}`}
                      className="rounded-2xl bg-[#16A34A] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#15803D]"
                    >
                      {t.details}
                    </Link>
                    <Link
                      to={`/edit/${item.id}`}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700"
                    >
                      {t.edit}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"
                    >
                      {t.delete}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[28px] bg-white p-8 text-center shadow-soft">
                <p className="text-sm text-slate-500">{t.noMyListings}</p>
                <Link
                  to="/create"
                  className="mt-4 inline-flex rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#15803D]"
                >
                  {t.goPublish}
                </Link>
              </div>
            )
          ) : favoriteListings.length > 0 ? (
            favoriteListings.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[28px] bg-white shadow-soft"
              >
                <div className="flex gap-4 p-4">
                  <ListingImage
                    src={item.images?.[0] || item.image}
                    category={item.category}
                    alt={item.title[language]}
                    className="h-24 w-24 rounded-[20px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-slate-900">
                          {item.title[language]}
                        </h2>
                        <p className="mt-1 text-xs font-medium text-[#16A34A]">
                          {item.location?.trim() || t.locationMissing}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-amber-50 px-3 py-2 text-right">
                        <p className="text-sm font-extrabold text-amber-900">
                          {formatPrice(item.price, item.currency, language)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 max-h-12 overflow-hidden text-sm leading-6 text-slate-500">
                      {item.description[language]}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(item.createdAt || item.postedAt, language)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 px-4 py-4">
                  <Link
                    to={`/listing/${item.id}`}
                    className="rounded-2xl bg-[#16A34A] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#15803D]"
                  >
                    {t.details}
                  </Link>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.id)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {t.unfavorite}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[28px] bg-white p-8 text-center shadow-soft">
              <p className="text-sm text-slate-500">{t.noFavorites}</p>
              <Link
                to="/"
                className="mt-4 inline-flex rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#15803D]"
              >
                {t.goHomeBrowse}
              </Link>
            </div>
          )}
        </section>
      </main>

      <BottomNav labels={labels} />
    </div>
  );
}
