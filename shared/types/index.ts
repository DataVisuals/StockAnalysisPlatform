// Shared TypeScript types for Stock Analysis Platform
// Used across web, mobile, and backend

export interface StockData {
  ticker: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
  exchange: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  high_52w: number;
  low_52w: number;
  volume: number;
  data_timestamp?: string;
  data: {
    dates: string[];
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
  };
}

export interface SearchResult {
  ticker: string;
  name: string;
  exchange?: string;
  type?: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  citation?: string;
  original_text?: string;
  article_type?: string;
  relevance_score?: number;
}

export interface ForecastData {
  ticker: string;
  method: string;
  forecast_data: {
    dates: string[];
    predictions: number[];
    confidence_intervals?: {
      upper: number[];
      lower: number[];
    };
  };
  summary: {
    next_price: number;
    change_percent: number;
    confidence: number;
    accuracy?: number;
  };
  metrics?: {
    mse?: number;
    rmse?: number;
    mae?: number;
    r2?: number;
  };
}

export interface LLMPredictionData {
  ticker: string;
  prediction: 'up' | 'down' | 'neutral';
  confidence: number;
  reasoning: string;
  factors: string[];
  timeframe: string;
  risk_level: 'low' | 'medium' | 'high';
}

export interface LLMBacktestData {
  ticker: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  predictions: Array<{
    date: string;
    actual: 'up' | 'down' | 'neutral';
    predicted: 'up' | 'down' | 'neutral';
    confidence: number;
  }>;
  performance_metrics: {
    total_predictions: number;
    correct_predictions: number;
    false_positives: number;
    false_negatives: number;
  };
}

export interface LLMResponse {
  success: boolean;
  data?: LLMPredictionData | LLMBacktestData;
  message?: string;
  error?: string;
}

// API Request/Response types
export interface StockDataRequest {
  ticker: string;
  period: string;
}

export interface ForecastRequest {
  ticker: string;
  period: string;
  forecast_days: number;
  method: string;
}

export interface NewsRequest {
  ticker: string;
  num_articles: number;
  period: string;
}

export interface SearchRequest {
  query: string;
}

// Market information
export interface MarketInfo {
  exchange: string;
  currency: string;
  market_hours: string;
  timezone: string;
  is_open: boolean;
  next_open?: string;
  next_close?: string;
}

// Forecasting methods
export type ForecastMethod = 
  | 'linear'
  | 'enhanced_linear'
  | 'polynomial'
  | 'moving_average'
  | 'arima'
  | 'enhanced_arima'
  | 'prophet'
  | 'svr'
  | 'ensemble';

export interface ForecastMethodInfo {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  complexity: 'Low' | 'Medium' | 'High';
  best_for: string;
  accuracy_range: string;
}

// Error types
export interface APIError {
  error: string;
  message: string;
  status_code: number;
  details?: any;
}

// Configuration types
export interface AppConfig {
  api_base_url: string;
  timeout: number;
  cache_duration: number;
  max_retries: number;
  enable_llm: boolean;
  enable_news: boolean;
  enable_forecasting: boolean;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
  }>;
}

// User preferences
export interface UserPreferences {
  default_period: string;
  default_forecast_method: ForecastMethod;
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  notifications: boolean;
  auto_refresh: boolean;
  refresh_interval: number;
}

// Recent stocks
export interface RecentStock {
  ticker: string;
  name: string;
  last_viewed: string;
  exchange: string;
}

// Portfolio types (for future expansion)
export interface Portfolio {
  id: string;
  name: string;
  stocks: PortfolioStock[];
  total_value: number;
  total_change: number;
  total_change_percent: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioStock {
  ticker: string;
  name: string;
  shares: number;
  average_price: number;
  current_price: number;
  total_value: number;
  change: number;
  change_percent: number;
  added_at: string;
}

// Export all types as a namespace for easier imports
export * from './index';
