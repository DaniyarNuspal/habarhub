import { HiHeart, HiOutlineHeart } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import ListingImage from './ListingImage';
import { formatDate, formatPrice } from '../utils/format';

export default function ListingCard({ item, language, labels, onShare, isFavorite, onToggleFavorite }) {
  const location = item.location?.trim() || '';
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const createdAt = item.createdAt || item.postedAt;
  const title = typeof item.title === 'string' ? item.title : item.title?.[language];
  const description =
    typeof item.description === 'string' ? item.description : item.description?.[language];
  const hasImage = Boolean(item.images?.[0] || item.image);

  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-soft">
      {hasImage ? (
        <div className="relative aspect-[4/3] overflow-hidden">
          <ListingImage
            src={item.images?.[0] || item.image}
            category={item.category}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#16A34A] backdrop-blur">
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-500 backdrop-blur"
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

      <div className={hasImage ? 'space-y-4 p-4' : 'space-y-3 p-4'}>
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-rose-500"
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

        <div className="space-y-2">
          <div className="space-y-2">
            <h3 className={`${hasImage ? 'max-h-12' : 'max-h-14'} overflow-hidden text-base font-semibold leading-6 text-slate-900`}>
              {title}
            </h3>
            <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">
              {formatPrice(item.price, item.currency || 'KZT', language)}
            </div>
          </div>

          <p className={`${hasImage ? 'max-h-12' : 'max-h-[72px]'} overflow-hidden text-sm leading-6 text-slate-500`}>
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

        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
          <span className="min-w-0 truncate">{location}</span>
          <span className="shrink-0">{createdAt ? formatDate(createdAt, language) : ''}</span>
        </div>

        <div className="flex items-center gap-[10px]">
          <Link
            to={`/listing/${item.id}`}
            className="flex h-12 basis-[70%] items-center justify-center rounded-2xl bg-[#16A34A] px-4 pr-5 text-center text-sm font-semibold text-white hover:bg-[#15803D]"
          >
            {labels.details}
          </Link>
          <button
            type="button"
            onClick={() => onShare(item)}
            className="flex h-12 shrink-0 items-center justify-center gap-[6px] rounded-xl border border-[#16A34A] bg-white px-3.5 text-sm font-semibold text-[#16A34A] transition-colors hover:bg-slate-50 active:bg-slate-100"
            aria-label={labels.share}
            title={labels.share}
          >
            <FaWhatsapp className="text-[17px] text-[#16A34A]" aria-hidden="true" />
            <span>{labels.share}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
