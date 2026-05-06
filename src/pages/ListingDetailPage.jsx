import { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { HiHeart, HiOutlineHeart, HiOutlinePhone, HiOutlineShare } from 'react-icons/hi2';
import { Link, useParams } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ListingImage from '../components/ListingImage';
import { defaultLanguage, translations } from '../i18n/translations';
import { supabase } from '../supabase';
import { formatDate, formatPrice } from '../utils/format';

function normalizePhoneForWhatsApp(value) {
  return value.replace(/[^\d]/g, '');
}

function normalizeGalleryImages(item) {
  if (!item) {
    return [];
  }

  const rawImages = Array.isArray(item.images)
    ? item.images
    : typeof item.images === 'string' && item.images
      ? [item.images]
      : [];

  const images = rawImages.filter(Boolean);
  if (images.length > 0) {
    return images;
  }

  return item.image ? [item.image] : [];
}

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

function mapPostToListing(item) {
  return {
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
    userId: item.userId || item.user_id || '',
    isUserCreated: Boolean(item.isUserCreated || item.userId || item.user_id),
    featured: Boolean(item.featured)
  };
}

export default function ListingDetailPage({
  favorites,
  language,
  listings,
  onLanguageChange,
  onToggleFavorite
}) {
  const { id } = useParams();
  const localItem = listings.find((entry) => String(entry.id) === String(id));
  const [remoteItem, setRemoteItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMissing, setIsMissing] = useState(false);
  const item = localItem || remoteItem;
  const galleryImages = normalizeGalleryImages(item);
  const [selectedImage, setSelectedImage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    document.title = 'HabarHub - 哈百通';
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      if (localItem) {
        setRemoteItem(null);
        setIsMissing(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setIsMissing(false);

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (cancelled) {
        return;
      }

      if (error || !data) {
        if (error) {
          console.warn('Failed to fetch listing detail:', error);
        }
        setRemoteItem(null);
        setIsMissing(true);
        setIsLoading(false);
        return;
      }

      setRemoteItem(mapPostToListing(data));
      setIsMissing(false);
      setIsLoading(false);
    }

    loadListing();

    return () => {
      cancelled = true;
    };
  }, [id, localItem]);

  useEffect(() => {
    setSelectedImage(galleryImages[0] || '');
  }, [id, item?.image, item?.images]);

  useEffect(() => {
    if (!copyStatus) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCopyStatus('');
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
        <div className="w-full rounded-[28px] bg-white p-8 text-center shadow-soft">
          <p className="text-base font-semibold text-slate-900">
            {translations[language].detailLoading}
          </p>
        </div>
      </div>
    );
  }

  if (!item || isMissing) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
        <div className="w-full rounded-[28px] bg-white p-8 text-center shadow-soft">
          <p className="text-base font-semibold text-slate-900">
            {translations[language].listingUnavailable}
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-2xl bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#15803D]"
          >
            {translations[language].backHome || translations[defaultLanguage].backHome}
          </Link>
        </div>
      </div>
    );
  }

  const t = translations[language];
  const location = item.location?.trim() || t.locationMissing;
  const createdAt = item.createdAt || item.postedAt;
  const isFavorite = favorites.some((favoriteId) => String(favoriteId) === String(item.id));
  const hasRealImage = galleryImages.length > 0 || Boolean(item.image);
  const selectedImageIndex = Math.max(
    0,
    galleryImages.findIndex((image) => image === selectedImage)
  );

  async function shareListing() {
    const url = window.location.href;
    const title = typeof item.title === 'string' ? item.title : item.title?.[language];
    const text =
      typeof item.description === 'string'
        ? item.description
        : item.description?.[language];

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        return;
      } catch {
        console.warn('Native share failed or was dismissed');
        return;
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopyStatus('success');
        return;
      }
    } catch {
      // Fall through to the legacy copy path below.
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopyStatus(copied ? 'success' : 'error');
    } catch {
      setCopyStatus('error');
    }
  }

  function shareWhatsApp() {
    const whatsappNumber = normalizePhoneForWhatsApp(item.whatsapp || item.phone);
    if (!whatsappNumber) {
      return;
    }

    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  }

  function openPreview(image) {
    setSelectedImage(image);
    setIsPreviewOpen(true);
  }

  function closePreview() {
    setIsPreviewOpen(false);
  }

  function showPrevImage() {
    if (galleryImages.length <= 1) {
      return;
    }

    const nextIndex =
      selectedImageIndex <= 0 ? galleryImages.length - 1 : selectedImageIndex - 1;
    setSelectedImage(galleryImages[nextIndex]);
  }

  function showNextImage() {
    if (galleryImages.length <= 1) {
      return;
    }

    const nextIndex =
      selectedImageIndex >= galleryImages.length - 1 ? 0 : selectedImageIndex + 1;
    setSelectedImage(galleryImages[nextIndex]);
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-100 pb-10">
      <div className="relative">
        <div className="bg-slate-100 px-2 pt-2">
          {hasRealImage ? (
            <button
              type="button"
              onClick={() => openPreview(selectedImage || galleryImages[0])}
              className="block aspect-[4/3] w-full overflow-hidden rounded-[28px]"
            >
              <ListingImage
                src={selectedImage || galleryImages[0]}
                category={item.category}
                alt={typeof item.title === 'string' ? item.title : item.title?.[language]}
                className="h-full w-full object-cover"
              />
            </button>
          ) : (
            <div className="aspect-[4/3] overflow-hidden rounded-[28px]">
              <ListingImage
                src=""
                category={item.category}
                alt={typeof item.title === 'string' ? item.title : item.title?.[language]}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {hasRealImage && galleryImages.length > 1 ? (
            <div className="mx-auto mt-2 max-w-full overflow-hidden">
              <div className="box-border flex gap-2 overflow-x-auto pb-1 pr-6">
                {galleryImages.map((image, index) => {
                  const active = image === selectedImage;
                  const isLast = index === galleryImages.length - 1;

                  return (
                    <button
                      key={`${item.id}-thumb-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`h-14 w-14 flex-none overflow-hidden rounded-2xl border-2 transition ${
                        active ? 'border-[#16A34A]' : 'border-transparent'
                      } ${isLast ? 'mr-6' : ''}`}
                    >
                      <ListingImage
                        src={image}
                        category={item.category}
                        alt={`${
                          typeof item.title === 'string' ? item.title : item.title?.[language]
                        } ${index + 1}`}
                        className="h-14 w-14 object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            to="/"
            className="rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur"
          >
            ← {t.backHome}
          </Link>
          <LanguageSwitcher current={language} onChange={onLanguageChange} />
        </div>
      </div>

      <main className="space-y-4 px-4 pt-5">
        <div className="rounded-[28px] bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#16A34A]">{location}</p>
              <h1 className="mt-2 text-2xl font-black leading-tight text-slate-900">
                {typeof item.title === 'string' ? item.title : item.title?.[language]}
              </h1>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-2xl bg-amber-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                  {t.priceLabel}
                </p>
                <p className="mt-1 text-lg font-black text-amber-900">
                  {formatPrice(item.price, item.currency, language)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleFavorite(item.id)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-rose-500"
                aria-label={t.favorite}
                title={t.favorite}
              >
                {isFavorite ? (
                  <HiHeart className="text-[20px]" aria-hidden="true" />
                ) : (
                  <HiOutlineHeart className="text-[20px]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            {typeof item.description === 'string'
              ? item.description
              : item.description?.[language]}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {(item.tags || []).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-white px-5 py-4 shadow-soft">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-400">{t.posted}</dt>
              <dd className="font-semibold text-slate-900">{formatDate(createdAt, language)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-400">{t.contact}</dt>
              <dd className="font-semibold text-slate-900">{item.phone}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-1 grid grid-cols-3 gap-2 rounded-[24px] bg-white p-2 shadow-soft">
          <button
            type="button"
            onClick={shareListing}
            className="relative flex items-center justify-center gap-1.5 rounded-2xl border border-[#16A34A] bg-white px-2 py-3 text-sm font-semibold text-[#16A34A] hover:bg-[#16A34A]/5"
          >
            <HiOutlineShare className="text-[16px]" aria-hidden="true" />
            {t.shareAction}
            {copyStatus ? (
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-soft">
                {copyStatus === 'success' ? t.linkCopied : t.linkCopyFailed}
              </span>
            ) : null}
          </button>
          <a
            href={`tel:${item.phone}`}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-[#16A34A] bg-white px-2 py-3 text-sm font-semibold text-[#16A34A]"
          >
            <HiOutlinePhone className="text-[16px]" aria-hidden="true" />
            {t.call}
          </a>
          <button
            type="button"
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#16A34A] px-2 py-3 text-sm font-semibold text-white hover:bg-[#15803D]"
          >
            <FaWhatsapp className="text-[16px]" aria-hidden="true" />
            {t.whatsapp}
          </button>
        </div>
      </main>

      {isPreviewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4"
          onClick={closePreview}
        >
          <div className="relative w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={closePreview}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-slate-900"
              aria-label="Close preview"
            >
              ×
            </button>

            {galleryImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={showPrevImage}
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-slate-900"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-bold text-slate-900"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            ) : null}

            <div className="overflow-hidden rounded-[28px] bg-slate-900">
              <ListingImage
                src={selectedImage || galleryImages[0]}
                category={item.category}
                alt={typeof item.title === 'string' ? item.title : item.title?.[language]}
                className="max-h-[80vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
