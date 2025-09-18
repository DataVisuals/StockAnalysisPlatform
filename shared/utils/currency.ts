// Shared currency utilities for Stock Analysis Platform

export const CURRENCY_SYMBOLS: { [key: string]: string } = {
  'USD': '$',
  'GBP': '£',
  'EUR': '€',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'CHF': 'CHF',
  'CNY': '¥',
  'HKD': 'HK$',
  'SGD': 'S$',
  'INR': '₹',
  'KRW': '₩',
  'BRL': 'R$',
  'MXN': 'MX$',
  'RUB': '₽',
  'ZAR': 'R',
  'NOK': 'kr',
  'SEK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'HUF': 'Ft',
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
  'MZN': 'MT',
  'AOA': 'Kz',
  'XOF': 'CFA',
  'XAF': 'FCFA',
  'XPF': '₣',
  'GBp': 'p', // Pence
};

export const CURRENCY_NAMES: { [key: string]: string } = {
  'USD': 'US Dollar',
  'GBP': 'British Pound',
  'EUR': 'Euro',
  'JPY': 'Japanese Yen',
  'CAD': 'Canadian Dollar',
  'AUD': 'Australian Dollar',
  'CHF': 'Swiss Franc',
  'CNY': 'Chinese Yuan',
  'HKD': 'Hong Kong Dollar',
  'SGD': 'Singapore Dollar',
  'INR': 'Indian Rupee',
  'KRW': 'South Korean Won',
  'BRL': 'Brazilian Real',
  'MXN': 'Mexican Peso',
  'RUB': 'Russian Ruble',
  'ZAR': 'South African Rand',
  'NOK': 'Norwegian Krone',
  'SEK': 'Swedish Krona',
  'DKK': 'Danish Krone',
  'PLN': 'Polish Złoty',
  'CZK': 'Czech Koruna',
  'HUF': 'Hungarian Forint',
  'TRY': 'Turkish Lira',
  'ILS': 'Israeli Shekel',
  'AED': 'UAE Dirham',
  'SAR': 'Saudi Riyal',
  'QAR': 'Qatari Riyal',
  'KWD': 'Kuwaiti Dinar',
  'BHD': 'Bahraini Dinar',
  'OMR': 'Omani Rial',
  'JOD': 'Jordanian Dinar',
  'LBP': 'Lebanese Pound',
  'EGP': 'Egyptian Pound',
  'MAD': 'Moroccan Dirham',
  'TND': 'Tunisian Dinar',
  'DZD': 'Algerian Dinar',
  'LYD': 'Libyan Dinar',
  'SDG': 'Sudanese Pound',
  'ETB': 'Ethiopian Birr',
  'KES': 'Kenyan Shilling',
  'UGX': 'Ugandan Shilling',
  'TZS': 'Tanzanian Shilling',
  'ZMW': 'Zambian Kwacha',
  'BWP': 'Botswana Pula',
  'SZL': 'Swazi Lilangeni',
  'LSL': 'Lesotho Loti',
  'NAD': 'Namibian Dollar',
  'MZN': 'Mozambican Metical',
  'AOA': 'Angolan Kwanza',
  'XOF': 'West African CFA Franc',
  'XAF': 'Central African CFA Franc',
  'XPF': 'CFP Franc',
  'GBp': 'British Pence',
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

export function getCurrencyName(currency: string): string {
  return CURRENCY_NAMES[currency] || currency;
}

export function formatCurrency(
  amount: number, 
  currency: string, 
  options: {
    showSymbol?: boolean;
    showName?: boolean;
    decimals?: number;
    locale?: string;
  } = {}
): string {
  const {
    showSymbol = true,
    showName = false,
    decimals = 2,
    locale = 'en-US'
  } = options;

  // Handle special cases
  if (currency === 'GBp') {
    // Convert pence to pounds for display
    const pounds = amount / 100;
    const symbol = showSymbol ? '£' : '';
    return `${symbol}${pounds.toFixed(decimals)}`;
  }

  // Format the number
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency === 'GBp' ? 'GBP' : currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  if (showName && !showSymbol) {
    const name = getCurrencyName(currency);
    return `${formatted} (${name})`;
  }

  return formatted;
}

export function parseCurrency(currencyString: string): { amount: number; currency: string } | null {
  // Remove common currency symbols and parse
  const cleaned = currencyString.replace(/[$,£€¥₽₹₩₪]/g, '').trim();
  const amount = parseFloat(cleaned);
  
  if (isNaN(amount)) {
    return null;
  }

  // Try to detect currency from symbols
  if (currencyString.includes('$') && !currencyString.includes('C$') && !currencyString.includes('A$')) {
    return { amount, currency: 'USD' };
  } else if (currencyString.includes('£')) {
    return { amount, currency: 'GBP' };
  } else if (currencyString.includes('€')) {
    return { amount, currency: 'EUR' };
  } else if (currencyString.includes('¥')) {
    return { amount, currency: 'JPY' };
  }

  return { amount, currency: 'USD' }; // Default fallback
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to USD first if needed
  let usdAmount = amount;
  if (fromCurrency !== 'USD') {
    // This would typically use a real exchange rate API
    // For now, we'll use the provided exchange rate
    usdAmount = amount * exchangeRate;
  }

  // Convert from USD to target currency
  if (toCurrency !== 'USD') {
    return usdAmount / exchangeRate;
  }

  return usdAmount;
}

export function getExchangeDisplayName(exchange: string): string {
  const exchangeMap: { [key: string]: string } = {
    'US': 'NASDAQ',
    'UK': 'LSE',
    'JP': 'TSE',
    'EU': 'EPA',
    'CA': 'TSX',
    'HK': 'HKEX',
    'AU': 'ASX',
    'IN': 'NSE',
    'SG': 'SGX',
    'DE': 'XETRA',
    'FR': 'EPA',
    'IT': 'Borsa Italiana',
    'ES': 'BME',
    'NL': 'Euronext',
    'BE': 'Euronext',
    'PT': 'Euronext',
    'IE': 'Euronext',
    'AT': 'Wiener Börse',
    'CH': 'SIX',
    'SE': 'Nasdaq Stockholm',
    'NO': 'Oslo Børs',
    'DK': 'Nasdaq Copenhagen',
    'FI': 'Nasdaq Helsinki',
    'PL': 'Warsaw Stock Exchange',
    'CZ': 'Prague Stock Exchange',
    'HU': 'Budapest Stock Exchange',
    'RO': 'Bucharest Stock Exchange',
    'BG': 'Bulgarian Stock Exchange',
    'HR': 'Zagreb Stock Exchange',
    'SI': 'Ljubljana Stock Exchange',
    'SK': 'Bratislava Stock Exchange',
    'LT': 'Nasdaq Vilnius',
    'LV': 'Nasdaq Riga',
    'EE': 'Nasdaq Tallinn',
    'RU': 'Moscow Exchange',
    'UA': 'Ukrainian Exchange',
    'TR': 'Borsa Istanbul',
    'IL': 'Tel Aviv Stock Exchange',
    'ZA': 'Johannesburg Stock Exchange',
    'EG': 'Egyptian Exchange',
    'MA': 'Casablanca Stock Exchange',
    'TN': 'Tunis Stock Exchange',
    'DZ': 'Algiers Stock Exchange',
    'LY': 'Libya Stock Market',
    'SD': 'Khartoum Stock Exchange',
    'ET': 'Ethiopian Securities Exchange',
    'KE': 'Nairobi Securities Exchange',
    'UG': 'Uganda Securities Exchange',
    'TZ': 'Dar es Salaam Stock Exchange',
    'ZM': 'Lusaka Securities Exchange',
    'BW': 'Botswana Stock Exchange',
    'SZ': 'Eswatini Stock Exchange',
    'LS': 'Maseru Securities Market',
    'NA': 'Namibian Stock Exchange',
    'MZ': 'Mozambique Stock Exchange',
    'AO': 'Angola Stock Exchange',
    'BR': 'B3',
    'MX': 'Mexican Stock Exchange',
    'AR': 'Buenos Aires Stock Exchange',
    'CL': 'Santiago Stock Exchange',
    'CO': 'Colombia Stock Exchange',
    'PE': 'Lima Stock Exchange',
    'VE': 'Caracas Stock Exchange',
    'UY': 'Montevideo Stock Exchange',
    'PY': 'Asunción Stock Exchange',
    'BO': 'La Paz Stock Exchange',
    'EC': 'Quito Stock Exchange',
    'GY': 'Guyana Stock Exchange',
    'SR': 'Suriname Stock Exchange',
    'TT': 'Trinidad and Tobago Stock Exchange',
    'JM': 'Jamaica Stock Exchange',
    'BB': 'Barbados Stock Exchange',
    'BS': 'Bahamas International Securities Exchange',
    'BZ': 'Belize Stock Exchange',
    'CR': 'Costa Rica Stock Exchange',
    'GT': 'Guatemala Stock Exchange',
    'HN': 'Honduras Stock Exchange',
    'NI': 'Nicaragua Stock Exchange',
    'PA': 'Panama Stock Exchange',
    'SV': 'El Salvador Stock Exchange',
    'DO': 'Dominican Republic Stock Exchange',
    'HT': 'Haiti Stock Exchange',
    'CU': 'Havana Stock Exchange',
    'PR': 'Puerto Rico Stock Exchange',
    'CN': 'Shanghai Stock Exchange',
    'TW': 'Taiwan Stock Exchange',
    'KR': 'Korea Exchange',
    'TH': 'Stock Exchange of Thailand',
    'MY': 'Bursa Malaysia',
    'ID': 'Indonesia Stock Exchange',
    'PH': 'Philippine Stock Exchange',
    'VN': 'Ho Chi Minh Stock Exchange',
    'KH': 'Cambodia Securities Exchange',
    'LA': 'Lao Securities Exchange',
    'MM': 'Yangon Stock Exchange',
    'BD': 'Dhaka Stock Exchange',
    'LK': 'Colombo Stock Exchange',
    'MV': 'Maldives Stock Exchange',
    'NP': 'Nepal Stock Exchange',
    'BT': 'Bhutan Stock Exchange',
    'PK': 'Pakistan Stock Exchange',
    'AF': 'Afghanistan Stock Exchange',
    'IR': 'Tehran Stock Exchange',
    'IQ': 'Iraq Stock Exchange',
    'SY': 'Damascus Securities Exchange',
    'LB': 'Beirut Stock Exchange',
    'JO': 'Amman Stock Exchange',
    'PS': 'Palestine Exchange',
    'CY': 'Cyprus Stock Exchange',
    'MT': 'Malta Stock Exchange',
    'IS': 'Iceland Stock Exchange',
    'LU': 'Luxembourg Stock Exchange',
    'MC': 'Monaco Stock Exchange',
    'SM': 'San Marino Stock Exchange',
    'VA': 'Vatican Stock Exchange',
    'AD': 'Andorra Stock Exchange',
    'LI': 'Liechtenstein Stock Exchange',
    'NZ': 'New Zealand Stock Exchange',
    'FJ': 'South Pacific Stock Exchange',
    'PG': 'Port Moresby Stock Exchange',
    'NC': 'New Caledonia Stock Exchange',
    'VU': 'Vanuatu Stock Exchange',
    'SB': 'Solomon Islands Stock Exchange',
    'TO': 'Tonga Stock Exchange',
    'WS': 'Samoa Stock Exchange',
    'KI': 'Kiribati Stock Exchange',
    'TV': 'Tuvalu Stock Exchange',
    'NR': 'Nauru Stock Exchange',
    'MH': 'Marshall Islands Stock Exchange',
    'FM': 'Federated States of Micronesia Stock Exchange',
    'PW': 'Palau Stock Exchange',
    'MP': 'Northern Mariana Islands Stock Exchange',
    'GU': 'Guam Stock Exchange',
    'AS': 'American Samoa Stock Exchange',
    'VI': 'US Virgin Islands Stock Exchange',
    'PR': 'Puerto Rico Stock Exchange',
  };

  return exchangeMap[exchange] || exchange;
}

export function getMarketHours(exchange: string): { open: string; close: string; timezone: string } {
  const marketHours: { [key: string]: { open: string; close: string; timezone: string } } = {
    'NASDAQ': { open: '9:30 AM', close: '4:00 PM', timezone: 'US/Eastern' },
    'NYSE': { open: '9:30 AM', close: '4:00 PM', timezone: 'US/Eastern' },
    'LSE': { open: '8:00 AM', close: '4:30 PM', timezone: 'Europe/London' },
    'EPA': { open: '9:00 AM', close: '5:30 PM', timezone: 'Europe/Paris' },
    'XETRA': { open: '9:00 AM', close: '5:30 PM', timezone: 'Europe/Berlin' },
    'TSE': { open: '9:00 AM', close: '3:00 PM', timezone: 'Asia/Tokyo' },
    'HKEX': { open: '9:30 AM', close: '4:00 PM', timezone: 'Asia/Hong_Kong' },
    'TSX': { open: '9:30 AM', close: '4:00 PM', timezone: 'America/Toronto' },
    'ASX': { open: '10:00 AM', close: '4:00 PM', timezone: 'Australia/Sydney' },
    'NSE': { open: '9:15 AM', close: '3:30 PM', timezone: 'Asia/Kolkata' },
    'SGX': { open: '9:00 AM', close: '5:00 PM', timezone: 'Asia/Singapore' },
  };

  return marketHours[exchange] || { open: '9:00 AM', close: '5:00 PM', timezone: 'UTC' };
}
