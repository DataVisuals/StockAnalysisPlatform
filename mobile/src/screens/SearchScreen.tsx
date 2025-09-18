import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchStocks } from '../services/api';
import { SearchResult } from '../types';

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('searchHistory');
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveSearchHistory = async (newHistory: string[]) => {
    try {
      await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const searchStocksHandler = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchStocks(searchQuery);
      setResults(searchResults);

      // Update search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      await saveSearchHistory(newHistory);
    } catch (error) {
      Alert.alert('Error', 'Failed to search stocks');
    } finally {
      setLoading(false);
    }
  };

  const selectStock = async (stock: SearchResult) => {
    try {
      // Add to recent stocks
      const recentStocks = await AsyncStorage.getItem('recentStocks');
      let recent: any[] = [];
      if (recentStocks) {
        recent = JSON.parse(recentStocks);
      }

      const existingIndex = recent.findIndex(s => s.ticker === stock.ticker);
      if (existingIndex >= 0) {
        recent.splice(existingIndex, 1);
      }

      recent.unshift({
        ticker: stock.ticker,
        name: stock.name,
        lastViewed: Date.now(),
      });

      await AsyncStorage.setItem('recentStocks', JSON.stringify(recent.slice(0, 20)));

      // Navigate to stock detail
      navigation.navigate('StockDetail', { 
        ticker: stock.ticker, 
        name: stock.name 
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to add stock');
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('searchHistory');
      setSearchHistory([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to clear history');
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity onPress={() => selectStock(item)}>
      <Card style={styles.resultCard}>
        <Card.Content>
          <View style={styles.resultHeader}>
            <View style={styles.stockInfo}>
              <Title style={styles.ticker}>{item.ticker}</Title>
              <Paragraph style={styles.name}>{item.name}</Paragraph>
              <Text style={styles.exchange}>{item.exchange} • {item.type}</Text>
            </View>
            <Text style={styles.chevron}>></Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderHistoryItem = (item: string) => (
    <TouchableOpacity
      key={item}
      onPress={() => {
        setQuery(item);
        searchStocksHandler(item);
      }}
      style={styles.historyItem}
    >
      <Text style={styles.timeIcon}>⏰</Text>
      <Text style={styles.historyText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks by symbol or company name..."
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => searchStocksHandler(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setResults([]);
              }}
              style={styles.clearButton}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.ticker}
          contentContainerStyle={styles.resultsContainer}
        />
      ) : query.length === 0 && searchHistory.length > 0 ? (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
          {searchHistory.map(renderHistoryItem)}
        </View>
      ) : query.length > 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>Try searching with a different term</Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Search for stocks</Text>
          <Text style={styles.emptySubtext}>Enter a ticker symbol or company name</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
    fontSize: 20,
    color: '#6B7280',
  },
  chevron: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  timeIcon: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  clearIcon: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    color: '#F9FAFB',
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
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
  resultsContainer: {
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#1F2937',
    marginBottom: 8,
    borderRadius: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  exchange: {
    color: '#6B7280',
    fontSize: 12,
  },
  historyContainer: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '600',
  },
  clearText: {
    color: '#3B82F6',
    fontSize: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    marginBottom: 8,
  },
  historyText: {
    color: '#F9FAFB',
    fontSize: 16,
    marginLeft: 12,
  },
});


