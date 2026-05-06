export function formatPrice(value, currency, language) {
  if (value === null || value === undefined || value === '') {
    return (
      {
        zh: '价格面议',
        ru: 'Цена договорная',
        kk: 'Бағасы келісімді',
        en: 'Price negotiable'
      }[language] || 'Price negotiable'
    );
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return (
      {
        zh: '价格面议',
        ru: 'Цена договорная',
        kk: 'Бағасы келісімді',
        en: 'Price negotiable'
      }[language] || 'Price negotiable'
    );
  }

  const formatted = new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : language, {
    maximumFractionDigits: 0
  }).format(numericValue);

  return `${formatted} ${currency}`;
}

export function formatDate(dateString, language) {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : language, {
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString));
}
