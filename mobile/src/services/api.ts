import axios from 'axios';
import { StockData, NewsArticle as NewsItem, ForecastData, LLMPredictionData, LLMBacktestData, SearchResult } from '@stockanalysis/shared-types';

const API_BASE_URL = 'http://192.168.1.111:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased from 10s to 30s for slower network conditions
});

const llmApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Increased from 60s to 120s for AI operations
});

export const getStockData = async (ticker: string, period: string = '1y'): Promise<StockData> => {
  try {
    const response = await api.post('/api/stock-data', { ticker, period });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data?.detail || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('No response from server - please check if the backend is running on port 8001');
    } else {
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

export const getNews = async (ticker: string, period: string = '1y'): Promise<NewsItem[]> => {
  try {
    const response = await api.post('/api/news', { ticker, period });
    return response.data.articles || [];
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return [];
  }
};

export const getForecast = async (ticker: string, method: string, period: string = '1y'): Promise<ForecastData> => {
  try {
    const response = await api.post('/api/forecast', { ticker, method, period });
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to fetch forecast: ${error.message}`);
  }
};

export const searchStocks = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await api.post('/api/search', { query });
    return response.data;
  } catch (error: any) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

export const llmPredict = async (ticker: string): Promise<LLMPredictionData> => {
  try {
    const response = await llmApi.post('/api/llm/predict', { ticker });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Prediction failed');
    }
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Prediction request timed out. Please try again.');
    }
    throw new Error(`Failed to get prediction: ${error.message}`);
  }
};

export const llmBacktest = async (ticker: string): Promise<LLMBacktestData> => {
  try {
    const response = await llmApi.post('/api/llm/backtest', { ticker });
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Backtest failed');
    }
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Backtest request timed out. Please try again.');
    }
    throw new Error(`Failed to run backtest: ${error.message}`);
  }
};


