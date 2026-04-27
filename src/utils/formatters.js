export const formatCurrency = (value, locale = 'pt-PT', currency = 'EUR') => {
  if (value === null || value === undefined) return '0,00 €';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

export const formatDate = (date, locale = 'pt-PT') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatPriceSimple = (value) => {
  if (typeof value !== 'number') return value;
  return `${value.toFixed(2).replace('.', ',')} €`;
};
