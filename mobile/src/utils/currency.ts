// Currency symbol mapping for international support
export const CURRENCY_SYMBOLS: { [key: string]: string } = {
  'USD': '$',
  'GBP': '£',
  'GBp': '£', // British pence - convert to pounds
  'EUR': '€',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'CHF': 'CHF',
  'CNY': '¥',
  'INR': '₹',
  'BRL': 'R$',
  'MXN': 'MX$',
  'KRW': '₩',
  'SGD': 'S$',
  'HKD': 'HK$',
  'NZD': 'NZ$',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'HUF': 'Ft',
  'RUB': '₽',
  'ZAR': 'R',
  'TRY': '₺',
  'ILS': '₪',
  'AED': 'د.إ',
  'SAR': '﷼',
  'QAR': '﷼',
  'KWD': 'د.ك',
  'BHD': 'د.ب',
  'OMR': '﷼',
  'JOD': 'د.ا',
  'LBP': 'ل.ل',
  'EGP': '£',
  'MAD': 'د.م.',
  'TND': 'د.ت',
  'DZD': 'د.ج',
  'LYD': 'ل.د',
  'SDG': 'ج.س.',
  'ETB': 'Br',
  'KES': 'KSh',
  'UGX': 'USh',
  'TZS': 'TSh',
  'ZMW': 'ZK',
  'BWP': 'P',
  'SZL': 'L',
  'LSL': 'L',
  'NAD': 'N$',
  'MUR': '₨',
  'SCR': '₨',
  'MVR': 'ރ',
  'LKR': '₨',
  'NPR': '₨',
  'PKR': '₨',
  'AFN': '؋',
  'BDT': '৳',
  'BTN': 'Nu.',
  'MMK': 'K',
  'KHR': '៛',
  'LAK': '₭',
  'VND': '₫',
  'IDR': 'Rp',
  'MYR': 'RM',
  'PHP': '₱',
  'THB': '฿',
  'BND': 'B$',
  'FJD': 'FJ$',
  'PGK': 'K',
  'SBD': 'SI$',
  'TOP': 'T$',
  'VUV': 'Vt',
  'WST': 'WS$',
  'XPF': '₣',
};

export const formatPrice = (price: number, currency: string): string => {
  let displayPrice = price;
  let displayCurrency = currency;
  
  // Convert pence to pounds for GBp
  if (currency === 'GBp') {
    displayPrice = price / 100;
    displayCurrency = 'GBP';
  }
  
  const symbol = CURRENCY_SYMBOLS[displayCurrency] || displayCurrency;
  return `${symbol}${displayPrice.toFixed(2)}`;
};

export const formatLargeNumber = (value: number, currency: string = 'USD'): string => {
  let displayValue = value;
  let displayCurrency = currency;
  
  // Convert pence to pounds for GBp
  if (currency === 'GBp') {
    displayValue = value / 100;
    displayCurrency = 'GBP';
  }
  
  const symbol = CURRENCY_SYMBOLS[displayCurrency] || displayCurrency;
  
  if (displayValue >= 1000000000) {
    return `${symbol}${(displayValue / 1000000000).toFixed(1)}B`;
  } else if (displayValue >= 1000000) {
    return `${symbol}${(displayValue / 1000000).toFixed(1)}M`;
  } else if (displayValue >= 1000) {
    return `${symbol}${(displayValue / 1000).toFixed(1)}K`;
  }
  return `${symbol}${displayValue.toFixed(2)}`;
};
