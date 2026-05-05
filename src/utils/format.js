export function formatPrice(value, currency, language) {
  const formatted = new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : language, {
    maximumFractionDigits: 0
  }).format(value);

  return `${formatted} ${currency}`;
}

export function formatDate(dateString, language) {
  return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : language, {
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString));
}
