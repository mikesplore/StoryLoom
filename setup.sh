#!/bin/bash

echo "🎨 StoryLoom Setup Script"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your Gemini API key!"
    echo "   Get your key from: https://makersuite.google.com/app/apikey"
    echo ""
    read -p "Press Enter once you've added your API key to .env..."
else
    echo "✅ .env file found"
fi

echo ""
echo "📦 Installing frontend dependencies..."
npm install

echo ""
echo "🐍 Setting up Python backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application, run:"
echo "   npm start"
echo ""
echo "   This will start both frontend (port 5173) and backend (port 5000)"
echo ""
echo "📖 Or run them separately:"
echo "   Frontend: npm run dev"
echo "   Backend:  npm run backend"
echo ""
