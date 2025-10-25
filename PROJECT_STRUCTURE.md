# 📁 StoryLoom Project Structure

## Complete File Tree

```
StoryLoom/
│
├── 📄 Configuration Files
│   ├── package.json              # Node.js dependencies & scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── tsconfig.node.json        # TypeScript config for Vite
│   ├── vite.config.ts            # Vite bundler configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── .env                      # Environment variables (YOUR API KEY HERE)
│   ├── .env.example              # Environment template
│   └── .gitignore                # Git ignore patterns
│
├── 📚 Documentation
│   ├── README.md                 # Complete project documentation
│   ├── QUICKSTART.md             # Quick start guide
│   └── PROJECT_STRUCTURE.md      # This file
│
├── 🔧 Scripts
│   └── setup.sh                  # Automated setup script
│
├── 🎨 Frontend (React + TypeScript)
│   ├── index.html                # HTML entry point
│   ├── src/
│   │   ├── main.tsx              # React app entry point
│   │   ├── App.tsx               # Main application component
│   │   ├── index.css             # Global styles (Tailwind)
│   │   │
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript type definitions
│   │   │       ├── Story
│   │   │       ├── Quiz
│   │   │       ├── Question
│   │   │       ├── Theme
│   │   │       └── ViewType
│   │   │
│   │   └── services/
│   │       └── api.ts            # API service layer
│   │           ├── healthCheck()
│   │           ├── getThemes()
│   │           ├── generateStory()
│   │           └── generateQuiz()
│   │
│   └── starter.tsx               # Your original prototype (reference)
│
└── 🐍 Backend (Python + Flask)
    └── backend/
        ├── app.py                # Flask API server
        ├── requirements.txt      # Python dependencies
        └── venv/                 # Python virtual environment (created during setup)

```

## Key Components

### Frontend Components in App.tsx

1. **Home View**
   - Hero section with animated icon
   - Theme selection (10 genres)
   - Custom prompt input
   - Generate button with loading state
   - Feature showcase cards

2. **Story View**
   - Story title and metadata
   - Formatted story content
   - "Take Quiz" button
   - "Back to Home" button

3. **Quiz View**
   - Question counter
   - Score tracker
   - Multiple choice options
   - Real-time feedback
   - Submit/Next buttons

4. **Results View**
   - Final score display
   - Visual progress bar
   - Retry quiz button
   - Generate new story button

### Backend API Endpoints

```
GET  /api/health          → Health check
GET  /api/themes          → Get available themes
POST /api/generate-story  → Generate story with Gemini
POST /api/generate-quiz   → Generate quiz questions
```

## Data Flow

```
User Input
    ↓
[Theme Selection + Optional Prompt]
    ↓
Frontend (React) → API Service
    ↓
Backend (Flask) → Gemini API
    ↓
[Story Generation]
    ↓
Backend → Gemini API
    ↓
[Quiz Generation]
    ↓
Frontend Displays Story
    ↓
User Reads Story
    ↓
User Takes Quiz
    ↓
Results & Score
```

## Tech Stack Details

### Frontend Dependencies
- **react** (^18.2.0) - UI framework
- **react-dom** (^18.2.0) - DOM rendering
- **lucide-react** (^0.292.0) - Icon library
- **axios** (^1.6.2) - HTTP client
- **typescript** (^5.3.3) - Type safety
- **vite** (^5.0.8) - Build tool
- **tailwindcss** (^3.3.6) - Styling

### Backend Dependencies
- **flask** (3.0.0) - Web framework
- **flask-cors** (4.0.0) - CORS handling
- **python-dotenv** (1.0.0) - Environment variables
- **google-generativeai** (0.3.1) - Gemini API client

## Color Scheme

```css
Primary: Teal (from-teal-400 to-cyan-500)
Background: Dark slate gradient (slate-900, slate-800, teal-900)
Text: White and light slate
Accents: Teal and cyan gradients
Success: Green
Error: Red
```

## Key Features Implemented

✅ Theme/Genre selection (10 options)
✅ Custom story prompts
✅ AI story generation via Gemini
✅ Automatic quiz generation
✅ Interactive quiz with instant feedback
✅ Score tracking and results
✅ Responsive design (mobile-friendly)
✅ Loading states and error handling
✅ Beautiful gradient UI
✅ Smooth animations

## Environment Variables

```bash
# .env file
GEMINI_API_KEY=your_api_key_here
```

## Ports

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Proxy: /api → http://localhost:5000/api

## Getting Started

1. Add your Gemini API key to `.env`
2. Run `./setup.sh` (or manual setup)
3. Run `npm start`
4. Open http://localhost:5173
5. Generate your first story!

---

**Happy Storytelling! 📚✨**
