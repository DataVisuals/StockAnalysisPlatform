import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator, SegmentedButtons, Chip } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import * as api from '../services/api';
import { StockData, NewsItem, ForecastData, LLMPredictionData, LLMBacktestData, TabType } from '../types';
import { formatPrice, formatLargeNumber } from '../utils/currency';

const { width } = Dimensions.get('window');

export default function StockDetailScreen({ route, navigation }: any) {
  const { ticker, name } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [llmPrediction, setLlmPrediction] = useState<LLMPredictionData | null>(null);
  const [llmBacktest, setLlmBacktest] = useState<LLMBacktestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [forecastMethod, setForecastMethod] = useState('linear');
  const [period, setPeriod] = useState('1y');
  const [chartDataPoints, setChartDataPoints] = useState(15);
  const [dateRange, setDateRange] = useState('1M'); // 1W, 1M, 3M, 6M, 1Y
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);

  useEffect(() => {
    loadStockData();
  }, [ticker, period]);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const [stock, newsData] = await Promise.all([
        api.getStockData(ticker, period),
        api.getNews(ticker, period),
      ]);
      setStockData(stock);
      setNews(newsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const loadForecast = async () => {
    try {
      const forecastData = await api.getForecast(ticker, forecastMethod, period);
      setForecast(forecastData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load forecast');
    }
  };

  const loadLLMPrediction = async () => {
    try {
      const prediction = await api.llmPredict(ticker);
      setLlmPrediction(prediction);
    } catch (error) {
      Alert.alert('Error', 'Failed to get AI prediction');
    }
  };

  const loadLLMBacktest = async () => {
    try {
      setBacktestLoading(true);
      
      // Test if function exists
      if (typeof api.llmBacktest !== 'function') {
        console.error('Error: llmBacktest is not a function!');
        return;
      }
      
      const backtest = await api.llmBacktest(ticker);
      setLlmBacktest(backtest);
      
    } catch (error) {
      console.error('Backtest error:', error);
    } finally {
      setBacktestLoading(false);
    }
  };


  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  // Calculate Simple Moving Average
  const calculateSMA = (data: number[], period: number) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  };

  // Calculate Exponential Moving Average
  const calculateEMA = (data: number[], period: number) => {
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA value is the first data point
    ema.push(data[0]);
    
    for (let i = 1; i < data.length; i++) {
      ema.push((data[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
    }
    
    return ema;
  };

  const getChartData = () => {
    if (!stockData) return null;

    // Use dynamic data points based on slider
    const data = stockData.data.slice(-chartDataPoints);
    const labels = data.map((d, index) => {
      const date = new Date(d.date);
      // Show labels based on data points - more data points = fewer labels shown
      const labelInterval = Math.max(1, Math.floor(chartDataPoints / 5));
      if (index % labelInterval === 0) {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
      return '';
    });
      const prices = data.map(d => {
        if ('close' in d) {
          return d.close;
        } else if ('price' in d) {
          return (d as any).price;
        }
        return 0;
      });

    const datasets = [
      {
        data: prices,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
    ];

    // Add SMA if enabled
    if (showSMA && prices.length >= 10) {
      const sma = calculateSMA(prices, 10);
      // Pad with the first SMA value to avoid flat line at start
      const smaData = new Array(prices.length - sma.length).fill(sma[0]).concat(sma);
      datasets.push({
        data: smaData,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        strokeWidth: 2,
      });
    }

    // Add EMA if enabled
    if (showEMA && prices.length >= 10) {
      const ema = calculateEMA(prices, 10);
      datasets.push({
        data: ema,
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        strokeWidth: 2,
      });
    }

    return {
      labels,
      datasets,
    };
  };

  const getForecastChartData = () => {
    if (!forecast || !stockData) return null;

    // Reduce data points for better mobile display
    const historicalData = stockData.data.slice(-10);
    const forecastData = forecast.predictions.slice(0, 5);

    const allData = [...historicalData, ...forecastData];
    const labels = allData.map((d, index) => {
      // Only show every 2nd label to prevent overlapping
      if (index % 2 === 0) {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
      return '';
    });
    const prices = allData.map(d => {
      if ('close' in d) {
        return d.close;
      } else if ('price' in d) {
        return (d as any).price;
      }
      return 0;
    });

    return {
      labels,
      datasets: [
        {
          data: prices,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const chartConfig = {
    backgroundColor: '#1F2937',
    backgroundGradientFrom: '#1F2937',
    backgroundGradientTo: '#1F2937',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(249, 250, 251, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
    // Mobile-optimized chart settings
    formatYLabel: (value: string) => {
      const num = parseFloat(value);
      return formatLargeNumber(num, stockData?.currency || 'USD');
    },
    formatXLabel: (value: string) => {
      // Format dates more compactly for mobile
      const date = new Date(value);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    },
    // Improve x-axis label spacing and rotation
    xAxisLabel: '',
    yAxisLabel: '',
    // Better label positioning
    horizontalLabelRotation: 0,
    verticalLabelRotation: 0,
    // Improve label spacing and readability
    propsForLabels: {
      fontSize: 12,
      fontWeight: '500',
    },
    // Better spacing for mobile
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 20,
  };

  const renderOverview = () => {
    if (!stockData) return null;

    const isPositive = stockData.change >= 0;
    const changeColor = isPositive ? '#10B981' : '#EF4444';

    return (
      <ScrollView style={styles.tabContent}>
        <Card style={styles.card}>
          <Card.Content style={styles.priceCardContent}>
            <View style={styles.priceContainer}>
              <View style={styles.priceInfo}>
                <Text style={styles.currentPrice} numberOfLines={1}>
                  {formatPrice(stockData.currentPrice, stockData.currency)}
                </Text>
                <Text style={[styles.change, { color: changeColor }]}>
                  {formatChange(stockData.change, stockData.changePercent)}
                </Text>
              </View>
              <View style={styles.stockInfoCompact}>
                <Text style={styles.tickerCompact}>{stockData.ticker}</Text>
                <Text style={styles.companyNameCompact} numberOfLines={1}>
                  {stockData.name}
                </Text>
                <Text style={[
                  styles.marketStateCompact,
                  { color: stockData.marketState === 'open' ? '#10B981' : '#EF4444' }
                ]}>
                  {stockData.marketState}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Price Chart</Title>
            
            {/* Date Range Selector */}
            <View style={styles.sliderContainer}>
              <View style={styles.dateRangeButtons}>
                {['1W', '1M', '3M', '6M', '1Y', '5Y', '10Y', 'MAX'].map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.dateRangeButton,
                      dateRange === range && styles.dateRangeButtonActive
                    ]}
                    onPress={() => {
                      setDateRange(range);
                      // Update data points based on range
                      const rangeMap = { 
                        '1W': 7, '1M': 15, '3M': 30, '6M': 45, '1Y': 60, 
                        '5Y': 100, '10Y': 150, 'MAX': 200 
                      };
                      setChartDataPoints(rangeMap[range as keyof typeof rangeMap] || 15);
                    }}
                  >
                    <Text style={[
                      styles.dateRangeButtonText,
                      dateRange === range && styles.dateRangeButtonTextActive
                    ]}>
                      {range}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Rolling Averages Toggle */}
              <View style={styles.averagesContainer}>
                <TouchableOpacity
                  style={[styles.averageButton, showSMA && styles.averageButtonActive]}
                  onPress={() => setShowSMA(!showSMA)}
                >
                  <Text style={[styles.averageButtonText, showSMA && styles.averageButtonTextActive]}>
                    SMA 10
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.averageButton, showEMA && styles.averageButtonActive]}
                  onPress={() => setShowEMA(!showEMA)}
                >
                  <Text style={[styles.averageButtonText, showEMA && styles.averageButtonTextActive]}>
                    EMA 10
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {getChartData() && (
              <View style={styles.chartContainer}>
                <LineChart
                  data={getChartData()!}
                  width={width - 32}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  segments={4}
                  fromZero={false}
                  withScrollableDot={false}
                  withShadow={false}
                  withDots={false}
                  hidePointsAtIndex={[]}
                  // Reduce number of x-axis labels for better readability
                />
                
                {/* Chart Legend */}
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.legendText}>Price</Text>
                  </View>
                  {showSMA && (
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: '#22C55E' }]} />
                      <Text style={styles.legendText}>SMA 10</Text>
                    </View>
                  )}
                  {showEMA && (
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
                      <Text style={styles.legendText}>EMA 10</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Key Metrics</Title>
            <View style={styles.metricsContainer}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>52W High</Text>
                <Text style={styles.metricValue}>
                  {formatPrice(Math.max(...stockData.data.map(d => d.high)), stockData.currency)}
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>52W Low</Text>
                <Text style={styles.metricValue}>
                  {formatPrice(Math.min(...stockData.data.map(d => d.low)), stockData.currency)}
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Avg Volume</Text>
                <Text style={styles.metricValue}>
                  {Math.round(stockData.data.reduce((sum, d) => sum + d.volume, 0) / stockData.data.length).toLocaleString()}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  const renderForecast = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Forecast Settings</Title>
          <View style={styles.settingsContainer}>
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Method</Text>
              <SegmentedButtons
                value={forecastMethod}
                onValueChange={setForecastMethod}
                buttons={[
                  { value: 'linear', label: 'Linear' },
                  { value: 'polynomial', label: 'Poly' },
                  { value: 'arima', label: 'ARIMA' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Period</Text>
              <SegmentedButtons
                value={period}
                onValueChange={setPeriod}
                buttons={[
                  { value: '1m', label: '1M' },
                  { value: '3m', label: '3M' },
                  { value: '1y', label: '1Y' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
            <TouchableOpacity style={styles.generateButton} onPress={loadForecast}>
              <Text style={styles.generateButtonText}>Generate Forecast</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {forecast && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>
              {forecast.method.charAt(0).toUpperCase() + forecast.method.slice(1)} Forecast
            </Title>
            {getForecastChartData() && (
              <View style={styles.chartContainer}>
                <LineChart
                  data={getForecastChartData()!}
                  width={width - 32}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  segments={4}
                  fromZero={false}
                  withScrollableDot={false}
                  withShadow={false}
                  withDots={false}
                  hidePointsAtIndex={[]}
                  // Reduce number of x-axis labels for better readability
                />
              </View>
            )}
            {forecast.accuracy && (
              <View style={styles.forecastInfo}>
                <Chip icon="target" style={styles.chip}>
                  Accuracy: {(forecast.accuracy * 100).toFixed(1)}%
                </Chip>
                {forecast.confidence && (
                  <Chip icon="trending-up" style={styles.chip}>
                    Confidence: {(forecast.confidence * 100).toFixed(1)}%
                  </Chip>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );

  const renderNews = () => (
    <ScrollView style={styles.tabContent}>
      {news.map((item, index) => {
        // Determine sentiment color
        const getSentimentColor = (sentiment?: number) => {
          if (!sentiment) return '#6B7280'; // Gray for neutral/no sentiment
          if (sentiment > 0.1) return '#10B981'; // Green for positive
          if (sentiment < -0.1) return '#EF4444'; // Red for negative
          return '#6B7280'; // Gray for neutral
        };

        const getSentimentLabel = (sentiment?: number) => {
          if (!sentiment) return 'Neutral';
          if (sentiment > 0.1) return 'Positive';
          if (sentiment < -0.1) return 'Negative';
          return 'Neutral';
        };

        return (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.newsHeader}>
                <Title style={styles.newsTitle}>{item.title}</Title>
                {item.sentiment !== undefined && (
                  <View style={[styles.sentimentChip, { backgroundColor: getSentimentColor(item.sentiment) }]}>
                    <Text style={styles.sentimentText}>{getSentimentLabel(item.sentiment)}</Text>
                  </View>
                )}
              </View>
              <Paragraph style={styles.newsDescription}>{item.description}</Paragraph>
              <View style={styles.newsFooter}>
                <Text style={styles.newsSource}>{item.source}</Text>
                <Text style={styles.newsDate}>
                  {new Date(item.publishedAt).toLocaleDateString()}
                </Text>
              </View>
            </Card.Content>
          </Card>
        );
      })}
    </ScrollView>
  );

  const renderLLM = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>AI Prediction</Title>
          <TouchableOpacity style={styles.generateButton} onPress={loadLLMPrediction}>
            <Text style={styles.generateButtonText}>Get AI Prediction</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {llmPrediction && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Prediction Results</Title>
            <View style={styles.predictionContainer}>
              <View style={styles.predictionMain}>
                <Text style={styles.predictionDirection}>
                  {llmPrediction.prediction.toUpperCase()}
                </Text>
                <Text style={styles.predictionConfidence}>
                  {(llmPrediction.confidence * 100).toFixed(1)}% Confidence
                </Text>
              </View>
              <View style={styles.indicatorsContainer}>
                <Text style={styles.indicatorsTitle}>Technical Indicators</Text>
                {Object.entries(llmPrediction.technical_indicators).map(([key, value]) => (
                  <View key={key} style={styles.indicator}>
                    <Text style={styles.indicatorLabel}>{key.replace('_', ' ').toUpperCase()}</Text>
                    <Text style={styles.indicatorValue}>{value?.toFixed(2) || 'N/A'}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Backtest Analysis</Title>
          <TouchableOpacity 
            style={[styles.generateButton, backtestLoading && styles.disabledButton]} 
            onPress={loadLLMBacktest}
            disabled={backtestLoading}
            activeOpacity={0.7}
          >
            {backtestLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Running Backtest...</Text>
              </View>
            ) : (
              <Text style={styles.generateButtonText}>Run Backtest</Text>
            )}
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {llmBacktest && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Backtest Results</Title>
            
            {/* Performance Metrics */}
            <View style={styles.metricsContainer}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Accuracy</Text>
                <Text style={[styles.metricValue, llmBacktest.accuracy > 0.5 ? styles.goodMetric : styles.badMetric]}>
                  {(llmBacktest.accuracy * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Precision</Text>
                <Text style={styles.metricValue}>{(llmBacktest.precision * 100).toFixed(1)}%</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Recall</Text>
                <Text style={styles.metricValue}>{(llmBacktest.recall * 100).toFixed(1)}%</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>F1 Score</Text>
                <Text style={styles.metricValue}>{(llmBacktest.f1_score * 100).toFixed(1)}%</Text>
              </View>
            </View>

            {/* Prediction Stats */}
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Prediction Statistics</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Total Predictions:</Text>
                <Text style={styles.statValue}>{llmBacktest.total_predictions}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Correct Predictions:</Text>
                <Text style={styles.statValue}>{llmBacktest.correct_predictions}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Average Confidence:</Text>
                <Text style={styles.statValue}>{(llmBacktest.average_confidence * 100).toFixed(1)}%</Text>
              </View>
            </View>

            {/* Prediction Distribution */}
            <View style={styles.distributionContainer}>
              <Text style={styles.sectionTitle}>Prediction Distribution</Text>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>Up:</Text>
                <Text style={styles.distributionValue}>{llmBacktest.prediction_distribution.up}</Text>
              </View>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>Neutral:</Text>
                <Text style={styles.distributionValue}>{llmBacktest.prediction_distribution.neutral}</Text>
              </View>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>Down:</Text>
                <Text style={styles.distributionValue}>{llmBacktest.prediction_distribution.down}</Text>
              </View>
            </View>

            {/* Optimization Tips */}
            {llmBacktest.optimization_tips && llmBacktest.optimization_tips.length > 0 && (
              <View style={styles.tipsContainer}>
                <Text style={styles.sectionTitle}>Optimization Tips</Text>
                {llmBacktest.optimization_tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading stock data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.ticker}>{ticker}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forecast' && styles.activeTab]}
          onPress={() => setActiveTab('forecast')}
        >
          <Text style={[styles.tabText, activeTab === 'forecast' && styles.activeTabText]}>
            Forecast
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'news' && styles.activeTab]}
          onPress={() => setActiveTab('news')}
        >
          <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>
            News
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'llm' && styles.activeTab]}
          onPress={() => setActiveTab('llm')}
        >
          <Text style={[styles.tabText, activeTab === 'llm' && styles.activeTabText]}>
            AI
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'forecast' && renderForecast()}
      {activeTab === 'news' && renderNews()}
      {activeTab === 'llm' && renderLLM()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 16,
    paddingBottom: 10,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  ticker: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
  },
  name: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#1F2937',
    marginBottom: 6,
    borderRadius: 12,
  },
  priceCardContent: {
    padding: 8,
  },
  cardTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  priceInfo: {
    flex: 2,
    minWidth: 120,
  },
  stockInfoCompact: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 80,
  },
  tickerCompact: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyNameCompact: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 2,
    maxWidth: 120,
  },
  marketStateCompact: {
    color: '#6B7280',
    fontSize: 10,
    textTransform: 'capitalize',
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
    flexShrink: 0,
  },
  change: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  marketState: {
    color: '#6B7280',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  chart: {
    borderRadius: 16,
  },
  sliderContainer: {
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  sliderLabel: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateRangeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  dateRangeButton: {
    flex: 1,
    minWidth: '12%',
    backgroundColor: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  dateRangeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  dateRangeButtonText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
  },
  dateRangeButtonTextActive: {
    color: '#F9FAFB',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  averagesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  averageButton: {
    backgroundColor: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  averageButtonActive: {
    backgroundColor: '#3B82F6',
  },
  averageButtonText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  averageButtonTextActive: {
    color: '#F9FAFB',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 6,
  },
  metric: {
    alignItems: 'center',
    minWidth: 80,
    paddingVertical: 4,
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  settingsContainer: {
    gap: 16,
  },
  settingGroup: {
    gap: 8,
  },
  settingLabel: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
  segmentedButtons: {
    backgroundColor: '#374151',
  },
  generateButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
  forecastInfo: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  chip: {
    backgroundColor: '#374151',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  newsDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    color: '#6B7280',
    fontSize: 12,
  },
  newsDate: {
    color: '#6B7280',
    fontSize: 12,
  },
  sentimentChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 0,
  },
  sentimentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  predictionContainer: {
    gap: 16,
  },
  predictionMain: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  predictionDirection: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  predictionConfidence: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  indicatorsContainer: {
    gap: 8,
  },
  indicatorsTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  indicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  indicatorLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  indicatorValue: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
  },
  // Backtest loading styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#6B7280',
    opacity: 0.7,
  },
  // Backtest results styles
  goodMetric: {
    color: '#10B981',
  },
  badMetric: {
    color: '#EF4444',
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  statsContainer: {
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  statValue: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
  },
  distributionContainer: {
    marginTop: 16,
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  distributionLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  distributionValue: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 16,
  },
  tipItem: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tipText: {
    color: '#F9FAFB',
    fontSize: 14,
    lineHeight: 20,
  },
});


