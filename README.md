# StoryLoom 📚✨

An AI-powered storytelling application that generates unique stories and creates interactive quizzes to test reading comprehension. Built with React, TypeScript, Python Flask, and Google's Gemini API.

## Features

- 🎨 **Theme Selection**: Choose from 10 different story genres (Mystery, Comedy, Adventure, Sci-Fi, Fantasy, Horror, Romance, Thriller, Historical, Drama)
- ✍️ **Custom Prompts**: Provide your own story ideas and watch AI bring them to life
- 📖 **AI-Generated Stories**: Unique, engaging narratives created by Google's Gemini AI
- 🎯 **Interactive Quizzes**: Test comprehension with automatically generated questions
- 📊 **Progress Tracking**: Track your quiz scores and see how well you understood the story
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)
- Axios (API calls)

### Backend
- Python 3.8+
- Flask
- Google Generative AI (Gemini)
- Flask-CORS

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- Google Gemini API key

## Setup Instructions

### 1. Clone the Repository

```bash
cd /home/mike/Development/Build_with_AI/StoryLoom
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**To get a Gemini API key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create an API key
4. Copy and paste it into your `.env` file

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Set Up Python Backend

Create a virtual environment and install dependencies:

```bash
# Create virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Go back to root directory
cd ..
```

### 5. Run the Application

You have two options:

**Option A: Run both frontend and backend together (recommended)**

```bash
npm start
```

This will start:
- Frontend dev server on http://localhost:5173
- Backend API server on http://localhost:5000

**Option B: Run frontend and backend separately**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run backend
```

### 6. Open the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Usage

1. **Select a Theme**: Choose a story genre from the available options
2. **Add Custom Prompt** (Optional): Describe what you want in your story
3. **Generate Story**: Click the "Generate Story" button and wait for AI to create your story
4. **Read**: Enjoy your unique AI-generated story
5. **Take Quiz**: Test your comprehension with interactive questions
6. **View Results**: See your score and retry if you'd like

## Project Structure

```
StoryLoom/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── venv/              # Python virtual environment
├── src/
│   ├── services/
│   │   └── api.ts         # API service layer
│   ├── types/
│   │   └── index.ts       # TypeScript type definitions
│   ├── App.tsx            # Main React component
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── package.json           # Node dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
├── tailwind.config.js     # Tailwind CSS config
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment variables template
└── README.md              # This file
```

## API Endpoints

### Backend API (http://localhost:5000)

- `GET /api/health` - Health check
- `GET /api/themes` - Get available story themes
- `POST /api/generate-story` - Generate a new story
  ```json
  {
    "theme": "Mystery",
    "prompt": "Optional custom prompt"
  }
  ```
- `POST /api/generate-quiz` - Generate quiz for a story
  ```json
  {
    "title": "Story Title",
    "content": "Story content..."
  }
  ```

## Troubleshooting

### Backend not starting
- Make sure Python virtual environment is activated
- Check that all dependencies are installed: `pip install -r backend/requirements.txt`
- Verify `.env` file exists and contains valid `GEMINI_API_KEY`

### Frontend errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Make sure you're using Node.js v16 or higher

### API connection errors
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify proxy settings in `vite.config.ts`

### Gemini API errors
- Check your API key is valid
- Verify you haven't exceeded API quotas
- Check [Google AI Studio](https://makersuite.google.com/) for API status

## Development

### Building for Production

Frontend:
```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting

## Future Enhancements

- 📚 Story library to save favorite stories
- 👥 User accounts and progress tracking
- 🌍 Multi-language support
- 🎵 Audio narration
- 📱 Mobile app version
- 🎨 Custom themes and UI personalization

## License

MIT

## Credits

- UI Design inspired by modern storytelling platforms
- Icons by [Lucide](https://lucide.dev/)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/)

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

Made with ❤️ by the StoryLoom Team
