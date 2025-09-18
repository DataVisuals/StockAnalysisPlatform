# Stock Analysis Mobile App 📱

A comprehensive React Native mobile application for stock market analysis, featuring AI-powered predictions, forecasting, and real-time market data.

## 🚀 Features

### Core Functionality
- **Real-time Stock Data**: Live prices, charts, and market information
- **Advanced Search**: Search stocks by ticker symbol or company name
- **Recent Stocks**: Track and manage your recently viewed stocks
- **Multi-currency Support**: Automatic currency detection and formatting

### Analysis Tools
- **Multiple Forecasting Methods**:
  - Linear Regression
  - Polynomial Regression
  - ARIMA Time Series
  - Prophet Forecasting
  - Moving Averages
  - Enhanced Linear Regression with technical indicators

### AI-Powered Predictions
- **Machine Learning Predictions**: Direction prediction (up/down/neutral)
- **Technical Indicators**: RSI, MACD, Bollinger Bands, Volume analysis
- **Backtesting**: Historical performance analysis with confusion matrix
- **Confidence Scoring**: Adaptive confidence levels based on market conditions

### News & Sentiment Analysis
- **Real-time News**: Latest market news and company updates
- **Sentiment Analysis**: AI-powered news sentiment scoring
- **Historical News**: Simulated historical news events for chart context
- **News Annotations**: Interactive news markers on price charts

## 🛠 Technology Stack

### Frontend (Mobile)
- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **React Native Paper** for UI components
- **React Native Chart Kit** for data visualization
- **AsyncStorage** for local data persistence

### Backend
- **FastAPI** (Python) - REST API server
- **yfinance** - Stock data provider
- **scikit-learn** - Machine learning models
- **pandas & numpy** - Data processing
- **transformers** - AI/ML model for sentiment analysis
- **DuckDB** - Local caching

## 📱 Screenshots

The app features a modern dark theme with intuitive navigation:

- **Home Screen**: Recently viewed stocks with live prices
- **Search Screen**: Advanced stock search with history
- **Stock Detail Screen**: Comprehensive analysis with 4 tabs:
  - Overview: Price charts and key metrics
  - Forecast: Multiple forecasting methods
  - News: Latest news with sentiment analysis
  - AI: Machine learning predictions and backtesting

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StockAnalysisApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   cd ../Stocks-React/backend
   source venv/bin/activate
   python main.py
   ```

4. **Start the mobile app**
   ```bash
   # For web development
   npm run web
   
   # For iOS simulator
   npm run ios
   
   # For Android
   npm run android
   ```

### Configuration

The app connects to a backend API running on `http://localhost:8001`. Make sure the backend server is running before using the app.

## 📊 API Endpoints

The mobile app communicates with the following backend endpoints:

- `POST /api/stock-data` - Get stock data and information
- `POST /api/news` - Fetch news articles
- `POST /api/forecast` - Generate price forecasts
- `POST /api/search` - Search for stocks
- `POST /api/llm/predict` - Get AI predictions
- `POST /api/llm/backtest` - Run backtesting analysis

## 🎯 Key Features Explained

### AI Prediction System
- **5-Analysis Module System**: Trend (35%), Momentum (25%), Volatility & Volume (20%), News Sentiment (15%), Market Context (5%)
- **Adaptive Learning**: Model adjusts parameters based on recent performance
- **Dynamic Thresholds**: Automatically adjusts based on stock volatility
- **Signal Consistency**: Requires multiple analysis modules to agree for high-confidence predictions

### Technical Indicators
- **Moving Averages**: SMA (5, 10, 20, 50), EMA (12, 26)
- **Momentum**: RSI (7, 14), Price momentum with acceleration factors
- **Volume Analysis**: Volume-Price Trend (VPT), Volume trend ratios
- **Volatility**: ATR, Bollinger Bands with momentum confirmation

### Forecasting Methods
- **Linear Regression**: Simple trend-based forecasting
- **Polynomial Regression**: Non-linear trend analysis
- **ARIMA**: Time series analysis with seasonal components
- **Prophet**: Facebook's forecasting tool
- **Enhanced Methods**: Include technical indicators and external factors

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens
├── services/           # API and data services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and themes
```

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Comprehensive error handling

## 📈 Performance

- **Optimized Rendering**: Efficient chart rendering with React Native Chart Kit
- **Local Caching**: AsyncStorage for recent stocks and search history
- **Background Processing**: AI predictions run on backend
- **Responsive Design**: Optimized for various screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **yfinance** for stock data
- **scikit-learn** for machine learning
- **React Native** community for excellent documentation
- **Expo** for the development platform

## 📞 Support

For support, email support@example.com or create an issue in the repository.

---

**Built with ❤️ using React Native and AI**