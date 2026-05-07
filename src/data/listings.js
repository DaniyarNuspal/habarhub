export const categories = [
  { id: 'all', icon: '◎' },
  { id: 'housing', icon: '⌂' },
  { id: 'jobs', icon: '◫' },
  { id: 'services', icon: '✦' },
  { id: 'market', icon: '◇' },
  { id: 'route-car', icon: '◌' },
  { id: 'business', icon: '▣' }
];

import { getUserId } from '../utils/user';

export const LISTING_STORAGE_KEY = 'habarhub:listings';
const LEGACY_LISTING_STORAGE_KEY = 'habarhub.listings';

const categoryImages = {
  housing:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  jobs:
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  services:
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  market:
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
  'route-car':
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
  business:
    'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80'
};

const categoryTags = {
  housing: ['新发布', '租房'],
  jobs: ['新发布', '招聘'],
  services: ['新发布', '服务'],
  market: ['新发布', '二手'],
  'route-car': ['新发布', '线路车'],
  business: ['新发布', '商业']
};

export const seedListings = [
  {
    id: 'flat-almaty-001',
    category: 'housing',
    price: 180000,
    currency: '₸',
    featured: true,
    author: 'Liu Anna',
    phone: '+7 701 888 1200',
    postedAt: '2026-05-03T10:00:00.000Z',
    location: 'Almaty · Abay / Baitursynuly',
    tags: ['2 rooms', 'Near metro', 'Wi-Fi'],
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    title: {
      zh: '阿拉木图市中心两居室出租，拎包入住',
      ru: 'Сдается двухкомнатная квартира в центре Алматы',
      kk: 'Алматы орталығында 2 бөлмелі пәтер жалға беріледі',
      en: 'Furnished 2-bedroom apartment in central Almaty'
    },
    description: {
      zh: '靠近地铁和超市，适合情侣或小家庭，押一付一。',
      ru: 'Рядом метро и супермаркет, подходит для пары или небольшой семьи.',
      kk: 'Метро мен супермаркет жақын, жұпқа немесе шағын отбасыға ыңғайлы.',
      en: 'Close to metro and supermarkets, ideal for couples or small families.'
    }
  },
  {
    id: 'job-astana-002',
    category: 'jobs',
    price: 450000,
    currency: '₸/mo',
    featured: false,
    author: 'Oralman Trade',
    phone: '+7 777 009 6677',
    postedAt: '2026-05-02T08:30:00.000Z',
    location: 'Astana · Left Bank',
    tags: ['Chinese speaker', 'Office', 'Full-time'],
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    title: {
      zh: '招聘中文客服专员，阿斯塔纳办公室',
      ru: 'Требуется специалист поддержки клиентов со знанием китайского',
      kk: 'Қытай тілін білетін клиенттік қолдау маманы қажет',
      en: 'Hiring Chinese-speaking customer support specialist'
    },
    description: {
      zh: '负责微信与 WhatsApp 客户咨询，有签证协助，单双休可谈。',
      ru: 'Работа с заявками из WeChat и WhatsApp, помощь с визой обсуждается.',
      kk: 'WeChat және WhatsApp өтінімдерімен жұмыс, виза бойынша көмек қарастырылады.',
      en: 'Handle WeChat and WhatsApp inquiries, visa support negotiable.'
    }
  },
  {
    id: 'service-ata-003',
    category: 'services',
    price: 15000,
    currency: '₸',
    featured: false,
    author: 'Mira Studio',
    phone: '+7 705 112 7788',
    postedAt: '2026-05-01T14:10:00.000Z',
    location: 'Almaty · Dostyk Plaza',
    tags: ['Translation', 'Documents', 'Fast'],
    image:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    title: {
      zh: '中俄哈英文件翻译与公证代办',
      ru: 'Перевод и нотариальное сопровождение на китайском, русском, казахском и английском',
      kk: 'Қытай, орыс, қазақ және ағылшын тілдеріне аударма және нотариалдық қолдау',
      en: 'Chinese / Russian / Kazakh / English document translation'
    },
    description: {
      zh: '适合签证、租房合同、公司材料，当天可出初稿。',
      ru: 'Для виз, договоров аренды и корпоративных документов, черновик за день.',
      kk: 'Виза, жалдау шарты және компания құжаттарына арналған, бастапқы нұсқа бір күнде.',
      en: 'Ideal for visas, rental contracts, and business documents with same-day draft.'
    }
  },
  {
    id: 'market-ata-004',
    category: 'market',
    price: 220000,
    currency: '₸',
    featured: true,
    author: 'Chen Max',
    phone: '+7 747 400 7654',
    postedAt: '2026-04-30T16:45:00.000Z',
    location: 'Almaty · Sairan',
    tags: ['iPhone', '256GB', 'Like new'],
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    title: {
      zh: '二手 iPhone 15 Pro 256G，成色很好',
      ru: 'iPhone 15 Pro 256 ГБ, состояние почти новое',
      kk: 'iPhone 15 Pro 256 ГБ, жағдайы өте жақсы',
      en: 'Used iPhone 15 Pro 256GB in excellent condition'
    },
    description: {
      zh: '自用机，无维修，带盒和原装线，支持当面验机。',
      ru: 'Личный телефон, без ремонта, с коробкой и оригинальным кабелем.',
      kk: 'Жеке қолданылған, жөнделмеген, қорабы және түпнұсқа кабелі бар.',
      en: 'Personal device, never repaired, includes box and original cable.'
    }
  }
];

export function getFallbackImage(category) {
  return categoryImages[category] || categoryImages.services;
}

function isDataImageSource(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

function isBlobImageSource(value) {
  return typeof value === 'string' && value.startsWith('blob:');
}

function sanitizeListingForStorage(item, imageLimit = 6) {
  const fallbackImage = getFallbackImage(item.category);
  const currentUserId = getUserId();
  const createdAt = item.createdAt || item.postedAt || new Date().toISOString();
  const updatedAt = item.updatedAt || createdAt;
  const safeImages = Array.isArray(item.images)
    ? item.images.filter(
        (image) =>
          typeof image === 'string' && !isDataImageSource(image) && !isBlobImageSource(image)
      )
    : [];
  const safeTags = Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];

  const nextImages = safeImages.length > 0 ? safeImages.slice(0, imageLimit) : [fallbackImage];
  const nextImage =
    typeof item.image === 'string' &&
    !isDataImageSource(item.image) &&
    !isBlobImageSource(item.image)
      ? item.image
      : nextImages[0];

  return {
    ...item,
    createdAt,
    postedAt: createdAt,
    updatedAt,
    userId: typeof item.userId === 'string' && item.userId ? item.userId : currentUserId,
    isUserCreated: Boolean(item.isUserCreated || item.author === 'HabarHub User'),
    tags: safeTags,
    location: typeof item.location === 'string' ? item.location.trim() : '',
    image: nextImage || fallbackImage,
    images: nextImages
  };
}

function sanitizeListingsForStorage(listings, imageLimit = 6) {
  return listings.map((item) => sanitizeListingForStorage(item, imageLimit));
}

export function getStoredListings() {
  if (typeof window === 'undefined') {
    return seedListings;
  }

  try {
    window.localStorage.removeItem(LEGACY_LISTING_STORAGE_KEY);
    const rawValue = window.localStorage.getItem(LISTING_STORAGE_KEY);
    if (!rawValue) {
      return seedListings;
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
      window.localStorage.removeItem(LISTING_STORAGE_KEY);
      return seedListings;
    }

    const sanitizedListings = sanitizeListingsForStorage(parsedValue, 3);
    window.localStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify(sanitizedListings));
    return sanitizedListings;
  } catch {
    window.localStorage.removeItem(LISTING_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_LISTING_STORAGE_KEY);
    return seedListings;
  }
}

export function saveStoredListings(listings) {
  if (typeof window === 'undefined') {
    return { ok: true };
  }

  try {
    const sanitizedListings = sanitizeListingsForStorage(listings, 6);
    window.localStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify(sanitizedListings));
    window.localStorage.removeItem(LEGACY_LISTING_STORAGE_KEY);
    return { ok: true };
  } catch (error) {
    console.error('Failed to persist listings', error);
    return { ok: false, error };
  }
}

export function createMockListing(values) {
  const timestamp = Date.now();
  const isoTimestamp = new Date(timestamp).toISOString();
  const title = values.title.trim();
  const description = values.description.trim();
  const location = values.location.trim();
  const whatsapp = values.whatsapp.trim() || values.phone.trim();
  const userTags = Array.isArray(values.tags) ? values.tags.filter(Boolean) : [];
  const tags = userTags.length
    ? ['新发布', ...userTags.filter((tag) => tag !== '新发布')]
    : categoryTags[values.category] ?? ['新发布'];
  const images = values.images?.length
    ? values.images
    : [values.image || categoryImages[values.category] || categoryImages.services];
  const primaryImage = images[0] || categoryImages[values.category] || categoryImages.services;

  return {
    id: `listing-${timestamp}`,
    category: values.category,
    price: Number(values.price),
    currency: '₸',
    featured: false,
    isUserCreated: true,
    userId: values.userId,
    author: 'HabarHub User',
    phone: values.phone.trim(),
    whatsapp,
    createdAt: isoTimestamp,
    postedAt: isoTimestamp,
    updatedAt: isoTimestamp,
    location,
    tags,
    image: primaryImage,
    images,
    title: {
      zh: title,
      ru: title,
      kk: title,
      en: title
    },
    description: {
      zh: description,
      ru: description,
      kk: description,
      en: description
    }
  };
}

export function updateMockListing(currentListing, values) {
  const updatedAt = new Date().toISOString();
  const title = values.title.trim();
  const description = values.description.trim();
  const location = values.location.trim();
  const whatsapp = values.whatsapp.trim() || values.phone.trim();
  const userTags = Array.isArray(values.tags) ? values.tags.filter(Boolean) : [];
  const tags = userTags.length
    ? ['新发布', ...userTags.filter((tag) => tag !== '新发布')]
    : categoryTags[values.category] ?? ['新发布'];
  const images = values.images?.length
    ? values.images
    : [currentListing.image || getFallbackImage(values.category)];
  const primaryImage = images[0] || getFallbackImage(values.category);

  return {
    ...currentListing,
    category: values.category,
    price: Number(values.price),
    currency: currentListing.currency || '₸',
    isUserCreated: true,
    userId: currentListing.userId,
    author: currentListing.author || 'HabarHub User',
    phone: values.phone.trim(),
    whatsapp,
    location,
    tags,
    image: primaryImage,
    images,
    updatedAt,
    title: {
      zh: title,
      ru: title,
      kk: title,
      en: title
    },
    description: {
      zh: description,
      ru: description,
      kk: description,
      en: description
    }
  };
}
