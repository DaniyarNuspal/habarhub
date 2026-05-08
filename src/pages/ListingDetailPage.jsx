import { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { HiHeart, HiOutlineHeart, HiOutlinePhone, HiOutlineShare } from 'react-icons/hi2';
import { Link, useParams } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ListingImage from '../components/ListingImage';
import ListingCard from '../components/ListingCard';
import { defaultLanguage, translations } from '../i18n/translations';
import { supabase } from '../supabase';
import { formatDate, formatPrice } from '../utils/format';

const REPORT_COOLDOWN_KEY = 'habarhub:report-cooldowns';
const REPORT_COOLDOWN_MS = 10 * 60 * 1000;

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
  const [actionToast, setActionToast] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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

      if (error || !data || data.hidden) {
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

  useEffect(() => {
    if (!actionToast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActionToast('');
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [actionToast]);

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
  const reportReasons = [
    t.reportReasonPorn,
    t.reportReasonGambling,
    t.reportReasonSpam,
    t.reportReasonFake,
    t.reportReasonIllegal,
    t.reportReasonOther
  ];
  const selectedImageIndex = Math.max(
    0,
    galleryImages.findIndex((image) => image === selectedImage)
  );
  const relatedListings = listings
    .filter(
      (entry) =>
        String(entry.id) !== String(item.id) &&
        entry.category === item.category &&
        !entry.hidden
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.postedAt || 0).getTime() -
        new Date(a.createdAt || a.postedAt || 0).getTime()
    )
    .slice(0, 6);
  const relatedLabels = {
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

  async function handleSubmitReport() {
    if (!reportReason || isSubmittingReport) {
      return;
    }

    try {
      const rawCooldowns = window.localStorage.getItem(REPORT_COOLDOWN_KEY);
      const cooldowns = rawCooldowns ? JSON.parse(rawCooldowns) : {};
      const lastReportedAt = cooldowns[String(item.id)];

      if (lastReportedAt && Date.now() - Number(lastReportedAt) < REPORT_COOLDOWN_MS) {
        setActionToast(t.reportCooldown);
        setIsReportOpen(false);
        return;
      }

      setIsSubmittingReport(true);

      const { error } = await supabase.from('reports').insert([
        {
          post_id: Number.isFinite(Number(item.id)) ? Number(item.id) : null,
          reason: reportReason,
          detail: reportDetail.trim() || null
        }
      ]);

      if (error) {
        console.error('Report submission failed:', error);
        setActionToast(error.message || t.reportFailed);
        setIsSubmittingReport(false);
        return;
      }

      const nextCooldowns = {
        ...(rawCooldowns ? JSON.parse(rawCooldowns) : {}),
        [String(item.id)]: Date.now()
      };
      window.localStorage.setItem(REPORT_COOLDOWN_KEY, JSON.stringify(nextCooldowns));
      setActionToast(t.reportSuccess);
      setIsReportOpen(false);
      setReportReason('');
      setReportDetail('');
      setIsSubmittingReport(false);
    } catch (error) {
      console.error('Report submission failed:', error);
      setActionToast(error?.message || t.reportFailed);
      setIsSubmittingReport(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-100 pb-16">
      {actionToast ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-40 mx-auto flex max-w-md justify-center px-4">
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft">
            {actionToast}
          </div>
        </div>
      ) : null}

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

      <main className="space-y-4 px-4 pb-28 pt-5">
        <div className="rounded-[28px] bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#16A34A]">{location}</p>
              <h1 className="mt-2 text-2xl font-black leading-tight text-slate-900">
                {typeof item.title === 'string' ? item.title : item.title?.[language]}
              </h1>
              <div className="mt-3 inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-900">
                {formatPrice(item.price, item.currency, language)}
              </div>
            </div>
            <div className="flex items-start gap-2">
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

        <div className="rounded-[24px] bg-white p-2 shadow-soft">
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-300 bg-white px-3 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            <span aria-hidden="true">🚩</span>
            {t.report}
          </button>
        </div>

        {relatedListings.length > 0 ? (
          <section className="space-y-4">
            <div className="rounded-[28px] bg-white p-5 shadow-soft">
              <h2 className="text-lg font-bold text-slate-900">{t.relatedTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{t.relatedSubtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {relatedListings.map((entry) => (
                <ListingCard
                  key={entry.id}
                  item={entry}
                  language={language}
                  labels={relatedLabels}
                  onShare={() => {}}
                  isFavorite={favorites.some(
                    (favoriteId) => String(favoriteId) === String(entry.id)
                  )}
                  onToggleFavorite={onToggleFavorite}
                  variant="related"
                />
              ))}
            </div>
          </section>
        ) : null}
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

      {isReportOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-4 pb-4 pt-10"
          onClick={() => setIsReportOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900">{t.reportTitle}</h2>
            <div className="mt-4 space-y-2">
              {reportReasons.map((reason) => {
                const active = reportReason === reason;

                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setReportReason(reason)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{reason}</span>
                    {active ? <span className="text-rose-500">●</span> : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-3">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {t.reportDetailLabel}
              </label>
              <textarea
                value={reportDetail}
                onChange={(event) => setReportDetail(event.target.value)}
                rows={3}
                placeholder={t.reportDetailPlaceholder}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#16A34A]"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsReportOpen(false);
                  setReportDetail('');
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={!reportReason || isSubmittingReport}
                onClick={handleSubmitReport}
                className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-rose-300"
              >
                {t.reportSubmit}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
