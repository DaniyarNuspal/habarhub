import { HiHeart, HiOutlineHeart } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import ListingImage from './ListingImage';
import { formatDate, formatPrice } from '../utils/format';

export default function ListingCard({
  item,
  language,
  labels,
  onShare,
  isFavorite,
  onToggleFavorite,
  variant = 'default'
}) {
  const location = item.location?.trim() || '';
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const createdAt = item.createdAt || item.postedAt;
  const title = typeof item.title === 'string' ? item.title : item.title?.[language];
  const description =
    typeof item.description === 'string' ? item.description : item.description?.[language];
  const hasImage = Boolean(item.images?.[0] || item.image);
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <article className="overflow-hidden rounded-[24px] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.07)] transition-transform duration-200 hover:-translate-y-0.5">
        {hasImage ? (
          <div className="relative aspect-square overflow-hidden bg-slate-100">
            <ListingImage
              src={item.images?.[0] || item.image}
              category={item.category}
              alt={title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <span className="max-w-[72%] truncate rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold text-[#16A34A] backdrop-blur">
                {labels[item.category]}
              </span>
              <button
                type="button"
                onClick={() => onToggleFavorite(item.id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/92 text-rose-500 shadow-sm backdrop-blur"
                aria-label={labels.favorite}
                title={labels.favorite}
              >
                {isFavorite ? (
                  <HiHeart className="text-[16px]" aria-hidden="true" />
                ) : (
                  <HiOutlineHeart className="text-[16px]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2 px-3 pb-0 pt-3">
            <span className="max-w-[72%] truncate rounded-full bg-[#16A34A]/10 px-2.5 py-1 text-[10px] font-semibold text-[#16A34A]">
              {labels[item.category]}
            </span>
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-rose-500"
              aria-label={labels.favorite}
              title={labels.favorite}
            >
              {isFavorite ? (
                <HiHeart className="text-[16px]" aria-hidden="true" />
              ) : (
                <HiOutlineHeart className="text-[16px]" aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        <div className={`space-y-3 px-3 pb-3 ${hasImage ? 'pt-3' : 'pt-2'}`}>
          <div className="space-y-2">
            <h3 className="max-h-11 overflow-hidden text-sm font-bold leading-[1.35] text-slate-900">
              {title}
            </h3>
            <div className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-900 ring-1 ring-amber-100">
              {formatPrice(item.price, item.currency || 'KZT', language)}
            </div>
          </div>

          <p className="max-h-10 overflow-hidden text-xs leading-5 text-slate-500">
            {description}
          </p>

          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
            {location ? (
              <span className="min-w-0 max-w-[62%] truncate rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-500">
                {location}
              </span>
            ) : (
              <span />
            )}
            <span className="shrink-0">{createdAt ? formatDate(createdAt, language) : ''}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/listing/${item.id}`}
              className="flex h-10 min-w-0 flex-1 items-center justify-center rounded-2xl bg-[#16A34A] px-3 text-center text-xs font-semibold text-white shadow-[0_8px_20px_rgba(22,163,74,0.18)] hover:bg-[#15803D]"
            >
              {labels.details}
            </Link>
            <button
              type="button"
              onClick={() => onShare(item)}
              className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-[#16A34A]/10 px-3 text-xs font-semibold text-[#16A34A] transition-colors hover:bg-[#16A34A]/15 active:bg-[#16A34A]/20"
              aria-label={labels.share}
              title={labels.share}
            >
              <FaWhatsapp className="text-[15px] text-[#16A34A]" aria-hidden="true" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-[30px] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-0.5">
      {hasImage ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <ListingImage
            src={item.images?.[0] || item.image}
            category={item.category}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <span className="rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-[#16A34A] backdrop-blur">
              {labels[item.category]}
            </span>
            <div className="flex items-center gap-2">
              {item.featured ? (
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900">
                  HOT
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => onToggleFavorite(item.id)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-rose-500 shadow-sm backdrop-blur"
                aria-label={labels.favorite}
                title={labels.favorite}
              >
                {isFavorite ? (
                  <HiHeart className="text-[18px]" aria-hidden="true" />
                ) : (
                  <HiOutlineHeart className="text-[18px]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={hasImage ? 'space-y-4 p-5' : 'space-y-3 p-5'}>
        {!hasImage ? (
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#16A34A]/10 px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
                {labels[item.category]}
              </span>
              {item.featured ? (
                <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-slate-900">
                  HOT
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-rose-500"
              aria-label={labels.favorite}
              title={labels.favorite}
            >
              {isFavorite ? (
                <HiHeart className="text-[18px]" aria-hidden="true" />
              ) : (
                <HiOutlineHeart className="text-[18px]" aria-hidden="true" />
              )}
            </button>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="space-y-3">
            <h3 className={`${hasImage ? 'max-h-14' : 'max-h-16'} overflow-hidden text-lg font-bold leading-7 text-slate-900`}>
              {title}
            </h3>
            <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-900 ring-1 ring-amber-100">
              {formatPrice(item.price, item.currency || 'KZT', language)}
            </div>
          </div>

          <p className={`${hasImage ? 'max-h-[72px]' : 'max-h-[88px]'} overflow-hidden text-sm leading-6 text-slate-500`}>
            {description}
          </p>
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex min-w-0 max-w-[70%] truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {location}
          </span>
          <span className="shrink-0 text-[11px] font-medium text-slate-400">
            {createdAt ? formatDate(createdAt, language) : ''}
          </span>
        </div>

        <div className="flex items-center gap-[10px]">
          <Link
            to={`/listing/${item.id}`}
            className="flex h-12 basis-[68%] items-center justify-center rounded-2xl bg-[#16A34A] px-4 pr-5 text-center text-sm font-semibold text-white shadow-[0_10px_24px_rgba(22,163,74,0.22)] hover:bg-[#15803D]"
          >
            {labels.details}
          </Link>
          <button
            type="button"
            onClick={() => onShare(item)}
            className="flex h-12 shrink-0 items-center justify-center gap-[6px] rounded-2xl bg-[#16A34A]/10 px-4 text-sm font-semibold text-[#16A34A] transition-colors hover:bg-[#16A34A]/15 active:bg-[#16A34A]/20"
            aria-label={labels.share}
            title={labels.share}
          >
            <FaWhatsapp className="text-[18px] text-[#16A34A]" aria-hidden="true" />
            <span>{labels.share}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
