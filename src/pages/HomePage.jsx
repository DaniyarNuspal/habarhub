import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import CategoryTabs from '../components/CategoryTabs';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ListingCard from '../components/ListingCard';
import LogoMark from '../components/LogoMark';
import SearchBar from '../components/SearchBar';
import { translations } from '../i18n/translations';
import { formatPrice } from '../utils/format';

export default function HomePage({ favorites, language, listings, onLanguageChange, onToggleFavorite }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const t = translations[language];

  useEffect(() => {
    document.title = 'HabarHub - 哈百通';
  }, []);

  useEffect(() => {
    if (!location.state?.toast) {
      return;
    }

    setToastMessage(location.state.toast);
    navigate(location.pathname, { replace: true, state: {} });

    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.state, navigate]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredListings = listings.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const categoryTerms = [
      item.category,
      translations.zh[item.category],
      translations.ru[item.category],
      translations.kk[item.category],
      translations.en[item.category]
    ];
    const localizedTitle = Object.values(item.title || {});
    const localizedDescription = Object.values(item.description || {});
    const content = [
      ...localizedTitle,
      ...localizedDescription,
      item.location,
      ...(item.tags || []),
      ...categoryTerms
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesQuery = !normalizedQuery || content.includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  const featuredListings = filteredListings.filter((item) => item.featured);

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

  async function handleShare(item) {
    const url = `${window.location.origin}/#/listing/${item.id}`;
    const title = item.title[language];
    const price = formatPrice(item.price, item.currency, language);
    const locationLabel = item.location?.trim();
    const text = [ `${title}，${price}`, locationLabel, `${t.shareText} ${url}`]
      .filter(Boolean)
      .join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-100">
      {toastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-30 mx-auto flex max-w-md justify-center px-4">
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft">
            {toastMessage}
          </div>
        </div>
      ) : null}

      <main className="flex-1 px-4 pb-8">
        <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-5 pb-5 pt-5 shadow-soft">
          <div className="absolute -right-16 -top-10 h-44 w-44 rounded-full bg-[#16A34A]/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-amber-200/25 blur-2xl" />

          <div className="relative space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <LogoMark />
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#16A34A]">
                  {t.slogan}
                </p>
                <h1 className="mt-3 text-[30px] font-black leading-[1.05] tracking-tight text-slate-900">
                  {t.greeting}
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
                  {t.heroSlogan}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="inline-flex items-center rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-soft ring-1 ring-slate-100">
                    <span className="mr-1.5 text-[#16A34A]">{t.heroPointFreeAccent}</span>
                    <span>{t.heroPointFreeText}</span>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-soft ring-1 ring-slate-100">
                    <span className="mr-1.5 text-[#16A34A]">{t.heroPointFastAccent}</span>
                    <span>{t.heroPointFastText}</span>
                  </div>
                </div>
              </div>
              <LanguageSwitcher current={language} onChange={onLanguageChange} />
            </div>

            <div>
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder={t.searchPlaceholder}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.filtersTitle}</h2>
              <p className="mt-1 text-xs font-medium text-slate-400">{t.subtitle}</p>
            </div>
          </div>
          <CategoryTabs current={category} labels={labels} onChange={setCategory} />
        </section>

        {featuredListings.length > 0 ? (
          <section className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{t.featured}</h2>
            </div>
            <div className="space-y-4">
              {featuredListings.map((item) => (
                <ListingCard
                  key={item.id}
                  isFavorite={favorites.some((favoriteId) => String(favoriteId) === String(item.id))}
                  item={item}
                  language={language}
                  labels={labels}
                  onShare={handleShare}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-9 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t.feedTitle}</h2>
              <p className="mt-1 text-xs font-medium text-slate-400">{t.feedSubtitle}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-soft">
              {filteredListings.length} {t.resultCount}
            </span>
          </div>

          <div className="space-y-4">
            {filteredListings.length > 0 ? (
              filteredListings.map((item) => (
                <ListingCard
                  key={item.id}
                  isFavorite={favorites.some((favoriteId) => String(favoriteId) === String(item.id))}
                  item={item}
                  language={language}
                  labels={labels}
                  onShare={handleShare}
                  onToggleFavorite={onToggleFavorite}
                />
              ))
            ) : (
              <div className="rounded-[28px] bg-white p-8 text-center shadow-soft">
                <p className="text-sm text-slate-500">
                  {normalizedQuery ? t.noSearchResults : t.notFound}
                </p>
                {normalizedQuery ? (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="mt-4 rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#15803D]"
                  >
                    {t.clearSearch}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav labels={labels} />
    </div>
  );
}
