import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ListingCard from '../components/ListingCard';
import MasonryGrid from '../components/MasonryGrid';
import LogoMark from '../components/LogoMark';
import { translations } from '../i18n/translations';
import { getUserId } from '../utils/user';

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
    publish: t.publish,
    all: t.all,
    housing: t.housing,
    jobs: t.jobs,
    services: t.services,
    market: t.market,
    'route-car': language === 'zh' ? '拼车' : t['route-car'],
    business: t.business,
    share: t.share,
    favorite: t.favorite,
    details: t.details,
    priceLabel: t.priceLabel
  };

  function handleDelete(id) {
    const listing = listings.find((item) => String(item.id) === String(id));
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
    <div className="mx-auto flex min-h-screen w-full max-w-[1560px] flex-col bg-slate-100">
      {toastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-30 mx-auto flex max-w-md justify-center px-4">
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft">
            {toastMessage}
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-[1560px] flex-1 px-4 pb-32 pt-5 sm:px-5 lg:px-6">
        <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-5 pb-4 pt-4 shadow-soft">
          <div className="absolute -right-16 -top-10 h-44 w-44 rounded-full bg-[#16A34A]/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-amber-200/25 blur-2xl" />

          <div className="relative space-y-3">
            <div className="absolute right-0 top-0 z-30">
              <LanguageSwitcher current={language} onChange={onLanguageChange} />
            </div>

            <div className="min-w-0">
              <LogoMark />
              <p className="mt-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#16A34A]">
                HabarHub Space
              </p>
              <h1 className="mt-2.5 pr-2 text-[28px] font-black leading-[1.05] tracking-tight text-slate-900">
                {t.myListingsTitle}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                {t.myListingsSubtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="inline-grid grid-cols-2 gap-2 rounded-[24px] bg-white p-2 shadow-soft">
            {tabs.map((tab) => {
              const active = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active ? 'bg-[#16A34A] text-white' : 'bg-transparent text-slate-500'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'listings' ? (
            myListings.length > 0 ? (
              <MasonryGrid
                items={myListings}
                renderItem={(item) => (
                  <ListingCard
                    key={item.id}
                    isFavorite={favorites.some(
                      (favoriteId) => String(favoriteId) === String(item.id)
                    )}
                    item={item}
                    language={language}
                    labels={labels}
                    onShare={() => {}}
                    onToggleFavorite={onToggleFavorite}
                    variant="compact"
                    actionSlot={
                      <div
                        className="mt-1 flex items-center gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Link
                          to={`/edit/${item.id}`}
                          className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                        >
                          {t.edit}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
                        >
                          {t.delete}
                        </button>
                      </div>
                    }
                  />
                )}
              />
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
            <MasonryGrid
              items={favoriteListings}
              renderItem={(item) => (
                <ListingCard
                  key={item.id}
                  isFavorite={favorites.some(
                    (favoriteId) => String(favoriteId) === String(item.id)
                  )}
                  item={item}
                  language={language}
                  labels={labels}
                  onShare={() => {}}
                  onToggleFavorite={onToggleFavorite}
                  variant="compact"
                />
              )}
            />
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
