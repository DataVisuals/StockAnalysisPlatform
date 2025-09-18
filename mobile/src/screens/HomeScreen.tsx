import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator, FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStockData } from '../services/api';
import { StockData } from '../types';
import { formatPrice } from '../utils/currency';

interface RecentStock {
  ticker: string;
  name: string;
  lastViewed: number;
}

export default function HomeScreen({ navigation }: any) {
  const [recentStocks, setRecentStocks] = useState<RecentStock[]>([]);
  const [stockData, setStockData] = useState<{ [key: string]: StockData }>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecentStocks();
  }, []);

  const loadRecentStocks = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentStocks');
      if (stored) {
        const recent = JSON.parse(stored);
        setRecentStocks(recent);
        loadStockData(recent);
      }
    } catch (error) {
      console.error('Error loading recent stocks:', error);
    }
  };

  const loadStockData = async (stocks: RecentStock[]) => {
    setLoading(true);
    try {
      const data: { [key: string]: StockData } = {};
      for (const stock of stocks.slice(0, 5)) { // Load only first 5 for performance
        try {
          const stockInfo = await getStockData(stock.ticker);
          data[stock.ticker] = stockInfo;
        } catch (error) {
          console.error(`Error loading ${stock.ticker}:`, error);
        }
      }
      setStockData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentStocks();
    setRefreshing(false);
  };

  const removeStock = async (ticker: string) => {
    try {
      const updated = recentStocks.filter(stock => stock.ticker !== ticker);
      setRecentStocks(updated);
      await AsyncStorage.setItem('recentStocks', JSON.stringify(updated));
      
      const newStockData = { ...stockData };
      delete newStockData[ticker];
      setStockData(newStockData);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove stock');
    }
  };


  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const renderStockCard = ({ item }: { item: RecentStock }) => {
    const data = stockData[item.ticker];
    if (!data) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View>
                <Title style={styles.ticker}>{item.ticker}</Title>
                <Paragraph style={styles.name}>{item.name}</Paragraph>
              </View>
              <TouchableOpacity
                onPress={() => removeStock(item.ticker)}
                style={styles.removeButton}
              >
                <Text style={styles.removeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <ActivityIndicator size="small" color="#3B82F6" />
          </Card.Content>
        </Card>
      );
    }

    const isPositive = data.change >= 0;
    const changeColor = isPositive ? '#10B981' : '#EF4444';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('StockDetail', { ticker: item.ticker, name: item.name })}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.stockInfo}>
                <Title style={styles.ticker}>{data.ticker}</Title>
                <Paragraph style={styles.name}>{data.name}</Paragraph>
                <Text style={[
                  styles.marketState,
                  { color: data.marketState === 'open' ? '#10B981' : '#EF4444' }
                ]}>
                  {data.marketState}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeStock(item.ticker)}
                style={styles.removeButton}
              >
                <Text style={styles.removeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.priceInfo}>
              <Text style={styles.currentPrice} numberOfLines={1}>
                {formatPrice(data.currentPrice, data.currency)}
              </Text>
              <Text style={[styles.change, { color: changeColor }]}>
                {formatChange(data.change, data.changePercent)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stock Analysis</Text>
        <Text style={styles.subtitle}>Your recent stocks</Text>
      </View>

      {loading && recentStocks.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading stocks...</Text>
        </View>
      ) : recentStocks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No recent stocks</Text>
          <Text style={styles.emptySubtext}>Search for stocks to get started</Text>
        </View>
      ) : (
        <FlatList
          data={recentStocks}
          renderItem={renderStockCard}
          keyExtractor={(item) => item.ticker}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Search')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 16,
    fontSize: 16,
  },
  emptyText: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1F2937',
    marginBottom: 12,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stockInfo: {
    flex: 1,
  },
  ticker: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  name: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  marketState: {
    color: '#6B7280',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  removeButton: {
    padding: 4,
  },
  removeIcon: {
    fontSize: 20,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    flexShrink: 0,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
});


