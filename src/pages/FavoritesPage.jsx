import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ListingCard from '../components/ListingCard';
import LogoMark from '../components/LogoMark';
import { defaultLanguage, translations } from '../i18n/translations';
import { formatPrice } from '../utils/format';

export default function FavoritesPage({
  favorites,
  language = defaultLanguage,
  listings,
  onLanguageChange = () => {},
  onToggleFavorite
}) {
  const t = translations[language];

  useEffect(() => {
    document.title = 'HabarHub - 哈百通';
  }, []);

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
    'route-car': t['route-car'],
    share: t.share,
    favorite: t.favorite,
    details: t.details,
    priceLabel: t.priceLabel
  };

  async function handleShare(item) {
    const url = `${window.location.origin}/listing/${item.id}`;
    const title = item.title[language];
    const price = formatPrice(item.price, item.currency, language);
    const locationLabel = item.location?.trim();
    const text = [`${title}，${price}`, locationLabel, `${t.shareText} ${url}`]
      .filter(Boolean)
      .join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-100">
      <main className="flex-1 px-4 pb-8 pt-5">
        <section className="rounded-[32px] bg-hero px-5 pb-6 pt-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <LogoMark />
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                {t.favoritesTitle}
              </h1>
            </div>
            <LanguageSwitcher current={language} onChange={onLanguageChange} />
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {favoriteListings.length > 0 ? (
            favoriteListings.map((item) => (
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
              <p className="text-sm text-slate-500">{t.noFavorites}</p>
              <Link
                to="/"
                className="mt-4 inline-flex rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#15803D]"
              >
                {t.home}
              </Link>
            </div>
          )}
        </section>
      </main>

      <BottomNav labels={labels} />
    </div>
  );
}
