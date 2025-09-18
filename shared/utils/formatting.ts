// Shared formatting utilities for Stock Analysis Platform

export function formatNumber(
  value: number,
  options: {
    decimals?: number;
    compact?: boolean;
    prefix?: string;
    suffix?: string;
    locale?: string;
  } = {}
): string {
  const {
    decimals = 2,
    compact = false,
    prefix = '',
    suffix = '',
    locale = 'en-US'
  } = options;

  if (compact && Math.abs(value) >= 1000) {
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const magnitude = Math.floor(Math.log10(Math.abs(value)) / 3);
    const scaled = value / Math.pow(1000, magnitude);
    const suffix_text = suffixes[Math.min(magnitude, suffixes.length - 1)];
    
    return `${prefix}${scaled.toFixed(decimals)}${suffix_text}${suffix}`;
  }

  return `${prefix}${value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

export function formatPercentage(
  value: number,
  options: {
    decimals?: number;
    showSign?: boolean;
    showSymbol?: boolean;
  } = {}
): string {
  const {
    decimals = 2,
    showSign = true,
    showSymbol = true
  } = options;

  const sign = showSign && value > 0 ? '+' : '';
  const symbol = showSymbol ? '%' : '';
  
  return `${sign}${value.toFixed(decimals)}${symbol}`;
}

export function formatPrice(
  price: number,
  currency: string = 'USD',
  options: {
    decimals?: number;
    showSymbol?: boolean;
    compact?: boolean;
  } = {}
): string {
  const {
    decimals = 2,
    showSymbol = true,
    compact = false
  } = options;

  const formatted = formatNumber(price, { decimals, compact });
  
  if (!showSymbol) {
    return formatted;
  }

  const symbols: { [key: string]: string } = {
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
    'GBp': 'p',
  };

  const symbol = symbols[currency] || currency;
  
  // Handle special cases
  if (currency === 'GBp') {
    // Convert pence to pounds for display
    const pounds = price / 100;
    return `£${formatNumber(pounds, { decimals, compact })}`;
  }

  return `${symbol}${formatted}`;
}

export function formatVolume(
  volume: number,
  options: {
    compact?: boolean;
    decimals?: number;
  } = {}
): string {
  const {
    compact = true,
    decimals = 0
  } = options;

  if (!compact) {
    return volume.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const magnitude = Math.floor(Math.log10(volume) / 3);
  const scaled = volume / Math.pow(1000, magnitude);
  const suffix = suffixes[Math.min(magnitude, suffixes.length - 1)];
  
  return `${scaled.toFixed(decimals)}${suffix}`;
}

export function formatMarketCap(
  marketCap: number,
  options: {
    compact?: boolean;
    decimals?: number;
  } = {}
): string {
  const {
    compact = true,
    decimals = 1
  } = options;

  if (!compact) {
    return marketCap.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const magnitude = Math.floor(Math.log10(marketCap) / 3);
  const scaled = marketCap / Math.pow(1000, magnitude);
  const suffix = suffixes[Math.min(magnitude, suffixes.length - 1)];
  
  return `$${scaled.toFixed(decimals)}${suffix}`;
}

export function formatDate(
  date: string | Date,
  options: {
    format?: 'short' | 'medium' | 'long' | 'full';
    locale?: string;
    timezone?: string;
  } = {}
): string {
  const {
    format = 'medium',
    locale = 'en-US',
    timezone = 'UTC'
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
  };

  switch (format) {
    case 'short':
      formatOptions.year = 'numeric';
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
      break;
    case 'medium':
      formatOptions.year = 'numeric';
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
      break;
    case 'long':
      formatOptions.weekday = 'long';
      formatOptions.year = 'numeric';
      formatOptions.month = 'long';
      formatOptions.day = 'numeric';
      break;
    case 'full':
      formatOptions.weekday = 'long';
      formatOptions.year = 'numeric';
      formatOptions.month = 'long';
      formatOptions.day = 'numeric';
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
      formatOptions.second = '2-digit';
      break;
  }

  return dateObj.toLocaleDateString(locale, formatOptions);
}

export function formatTimeAgo(
  date: string | Date,
  options: {
    locale?: string;
    timezone?: string;
  } = {}
): string {
  const {
    locale = 'en-US',
    timezone = 'UTC'
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

export function formatChange(
  change: number,
  changePercent: number,
  options: {
    showPercent?: boolean;
    showAbsolute?: boolean;
    decimals?: number;
  } = {}
): string {
  const {
    showPercent = true,
    showAbsolute = true,
    decimals = 2
  } = options;

  const parts: string[] = [];
  
  if (showAbsolute) {
    const sign = change > 0 ? '+' : '';
    parts.push(`${sign}${change.toFixed(decimals)}`);
  }
  
  if (showPercent) {
    const sign = changePercent > 0 ? '+' : '';
    parts.push(`${sign}${changePercent.toFixed(decimals)}%`);
  }
  
  return parts.join(' ');
}

export function formatTicker(ticker: string): string {
  return ticker.toUpperCase();
}

export function formatCompanyName(name: string, maxLength: number = 50): string {
  if (name.length <= maxLength) {
    return name;
  }
  
  return name.substring(0, maxLength - 3) + '...';
}

export function formatExchange(exchange: string): string {
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
  };

  return exchangeMap[exchange] || exchange;
}

export function formatSector(sector: string): string {
  if (!sector) return 'Unknown';
  
  return sector
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatIndustry(industry: string): string {
  if (!industry) return 'Unknown';
  
  return industry
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
