#!/bin/bash

# Stock Analysis App Setup Script
# This script sets up both the frontend and backend for the Stock Analysis App

echo "🚀 Setting up Stock Analysis App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js (v16 or higher) first."
        exit 1
    fi
    print_success "Node.js is installed: $(node --version)"
}

# Check if Python is installed
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.8 or higher first."
        exit 1
    fi
    print_success "Python 3 is installed: $(python3 --version)"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    # Install Expo CLI if not already installed
    if ! command -v expo &> /dev/null; then
        print_status "Installing Expo CLI..."
        npm install -g @expo/cli
    fi
    
    print_success "Frontend setup complete!"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    # Check if backend directory exists
    if [ ! -d "../Stocks-React/backend" ]; then
        print_error "Backend directory not found. Please ensure the backend is in ../Stocks-React/backend"
        exit 1
    fi
    
    cd ../Stocks-React/backend
    
    # Create virtual environment
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    pip install -r requirements.txt
    
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    print_success "Backend setup complete!"
}

# Main setup function
main() {
    echo "📈 Stock Analysis App Setup"
    echo "=========================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_node
    check_python
    echo ""
    
    # Setup frontend
    print_status "Setting up frontend..."
    setup_frontend
    echo ""
    
    # Setup backend
    print_status "Setting up backend..."
    setup_backend
    echo ""
    
    # Final instructions
    print_success "🎉 Setup complete!"
    echo ""
    echo "To start the application:"
    echo ""
    echo "1. Start the backend:"
    echo "   cd ../Stocks-React/backend"
    echo "   source venv/bin/activate"
    echo "   python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
    echo ""
    echo "2. Start the frontend (in a new terminal):"
    echo "   cd StockAnalysisApp"
    echo "   npm start"
    echo ""
    echo "3. Open the app:"
    echo "   - Scan QR code with Expo Go app on your phone"
    echo "   - Press 'i' for iOS Simulator"
    echo "   - Press 'a' for Android Emulator"
    echo "   - Press 'w' for web browser"
    echo ""
    echo "📱 Happy trading! 📈"
}

# Run main function
main
