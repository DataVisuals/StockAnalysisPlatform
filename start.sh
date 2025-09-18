#!/bin/bash

# Stock Analysis Platform Startup Script
# This script starts all services for the unified platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}  Stock Analysis Platform${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    if port_in_use $port; then
        print_warning "Port $port is in use. Attempting to free it..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to start backend
start_backend() {
    print_status "Starting FastAPI backend..."
    
    if [ ! -d "backend/venv" ]; then
        print_status "Creating Python virtual environment..."
        cd backend
        python3 -m venv venv
        cd ..
    fi
    
    cd backend
    source venv/bin/activate
    
    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt not found in backend directory"
        exit 1
    fi
    
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt >/dev/null 2>&1
    
    print_status "Starting FastAPI server on http://localhost:8000"
    nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    
    cd ..
    print_success "Backend started with PID: $BACKEND_PID"
}

# Function to start web frontend
start_web() {
    print_status "Starting React web frontend..."
    
    cd web
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in web directory"
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing web dependencies..."
        npm install >/dev/null 2>&1
    fi
    
    print_status "Starting React development server on http://localhost:3000"
    nohup npm start > ../logs/web.log 2>&1 &
    WEB_PID=$!
    echo $WEB_PID > ../logs/web.pid
    
    cd ..
    print_success "Web frontend started with PID: $WEB_PID"
}

# Function to start mobile app
start_mobile() {
    print_status "Starting React Native mobile app..."
    
    cd mobile
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in mobile directory"
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing mobile dependencies..."
        npm install >/dev/null 2>&1
    fi
    
    print_status "Starting Expo development server on http://localhost:19000"
    nohup npm start > ../logs/mobile.log 2>&1 &
    MOBILE_PID=$!
    echo $MOBILE_PID > ../logs/mobile.pid
    
    cd ..
    print_success "Mobile app started with PID: $MOBILE_PID"
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down services..."
    
    if [ -f "logs/backend.pid" ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm -f logs/backend.pid
    fi
    
    if [ -f "logs/web.pid" ]; then
        WEB_PID=$(cat logs/web.pid)
        kill $WEB_PID 2>/dev/null || true
        rm -f logs/web.pid
    fi
    
    if [ -f "logs/mobile.pid" ]; then
        MOBILE_PID=$(cat logs/mobile.pid)
        kill $MOBILE_PID 2>/dev/null || true
        rm -f logs/mobile.pid
    fi
    
    print_success "All services stopped"
    exit 0
}

# Main execution
main() {
    print_header
    
    # Check prerequisites
    if ! command_exists python3; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    if ! command_exists node; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is required but not installed"
        exit 1
    fi
    
    # Create logs directory
    mkdir -p logs
    
    # Kill existing processes on required ports
    kill_port 8000
    kill_port 3000
    kill_port 19000
    
    # Set up signal handlers
    trap cleanup SIGINT SIGTERM
    
    # Start services
    start_backend
    start_web
    start_mobile
    
    # Wait for services to be ready
    wait_for_service "http://localhost:8000/api/health" "Backend API"
    wait_for_service "http://localhost:3000" "Web Frontend"
    
    # Display access information
    echo ""
    print_success "All services are running!"
    echo ""
    echo -e "${CYAN}🌐 Web Application:${NC} http://localhost:3000"
    echo -e "${CYAN}📱 Mobile Application:${NC} http://localhost:19000"
    echo -e "${CYAN}🔧 Backend API:${NC} http://localhost:8000"
    echo -e "${CYAN}📚 API Documentation:${NC} http://localhost:8000/docs"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    echo ""
    
    # Keep script running
    while true; do
        sleep 1
    done
}

# Run main function
main "$@"
