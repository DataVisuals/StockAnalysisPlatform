export interface StockData {
  ticker: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export interface NewsItem {
  title: string;
  description: string;
  publishedAt: string;
  source: string;
  url: string;
  sentiment?: number;
  relevance_score?: number;
  article_type?: string;
}

export interface ForecastData {
  method: string;
  predictions: Array<{
    date: string;
    price: number;
  }>;
  accuracy?: number;
  confidence?: number;
}

export interface LLMPredictionData {
  ticker: string;
  prediction: 'up' | 'down' | 'neutral';
  confidence: number;
  currentPrice: number;
  currency: string;
  technical_indicators: {
    rsi?: number;
    macd?: number;
    sma_20?: number;
    ema_12?: number;
    bollinger_upper?: number;
    bollinger_lower?: number;
    volume_trend?: number;
    momentum?: number;
  };
  analysis_summary: {
    trend_analysis: string;
    momentum_analysis: string;
    volume_analysis: string;
    news_analysis: string;
    market_context: string;
  };
}

export interface LLMBacktestData {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  total_predictions: number;
  correct_predictions: number;
  confusion_matrix: number[][];
  class_labels: string[];
  precision_by_class: {
    up: number;
    down: number;
    neutral: number;
  };
  recall_by_class: {
    up: number;
    down: number;
    neutral: number;
  };
  optimization_tips: string[];
  ticker: string;
  period: string;
  backtest_date_range: {
    start: string;
    end: string;
  };
  prediction_distribution: {
    up: number;
    down: number;
    neutral: number;
  };
  average_confidence: number;
}

export interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
  type: string;
}

export type TabType = 'overview' | 'forecast' | 'news' | 'llm';


