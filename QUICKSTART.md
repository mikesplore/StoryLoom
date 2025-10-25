# 🚀 Quick Start Guide

## First Time Setup (5 minutes)

### Step 1: Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

### Step 2: Add API Key to .env
1. Open the `.env` file in the root directory
2. Paste your API key after `GEMINI_API_KEY=`
3. Save the file

Example:
```
GEMINI_API_KEY=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY
```

### Step 3: Run Setup (Automated)
```bash
./setup.sh
```

This script will:
- ✅ Install Node.js dependencies
- ✅ Create Python virtual environment
- ✅ Install Python dependencies

### Step 4: Start the App
```bash
npm start
```

Visit: http://localhost:5173

## Manual Setup (if automated script doesn't work)

### Frontend
```bash
npm install
npm run dev
```

### Backend (in a new terminal)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Common Issues

### "Module not found" errors
```bash
# Reinstall dependencies
npm install
cd backend
pip install -r requirements.txt
```

### Backend won't start
```bash
# Make sure virtual environment is activated
cd backend
source venv/bin/activate
python app.py
```

### "API key not found" error
- Check that `.env` file exists in the root directory
- Verify your API key is correct
- Make sure there are no spaces around the `=` sign

## Commands Cheat Sheet

| Command | Description |
|---------|-------------|
| `npm start` | Start both frontend and backend |
| `npm run dev` | Start frontend only (port 5173) |
| `npm run backend` | Start backend only (port 5000) |
| `npm run build` | Build for production |

## Features to Try

1. **Generate a Mystery Story** - Select "Mystery" theme and click generate
2. **Use Custom Prompt** - Try: "A detective solving a mystery in space"
3. **Take the Quiz** - Test your reading comprehension
4. **Try Different Themes** - Explore Comedy, Sci-Fi, Fantasy, and more!

Enjoy your storytelling journey! 📚✨
