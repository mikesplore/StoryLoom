# StoryLoom: How It Works

## Overview
StoryLoom is an AI-powered storytelling app that generates age-appropriate stories, quizzes, flashcards, and beautiful cover images. It features user authentication, a personal story library, translation, and text-to-speech.

---

## 1. Story Generation
- **User selects**: Age group, story theme, and (optionally) provides a custom prompt.
- **Backend (Flask/Python)**: Sends a prompt to Google Gemini (via API) to generate a story tailored to the user's selections.
- **Quiz & Flashcards**: Gemini also generates a 5-question quiz and vocabulary flashcards for each story.

---

## 2. Image Generation
- **Model Used**: [Stable Diffusion v1.5](https://huggingface.co/CompVis/stable-diffusion-v1-5) (via Hugging Face API)
- **How it works**:
  1. The backend creates a short, descriptive prompt for the story cover (e.g., "A brave dog saves the day, colorful, storybook style").
  2. This prompt is sent to the Hugging Face Inference API, which runs Stable Diffusion to generate a unique image.
  3. The resulting image is returned as a base64-encoded string and displayed as the story's cover.
- **Fallbacks**: If the primary model fails, the backend can try alternative models (e.g., SDXL, FLUX.1-schnell).

---

## 3. Translation
- **Library**: [deep-translator](https://github.com/nidhaloff/deep-translator)
- **How it works**: The backend uses the free Google Translate API to translate the story, quiz, and flashcards into 19+ languages on demand.

---

## 4. Text-to-Speech
- **Frontend**: Uses the browser's built-in Web Speech API for text-to-speech.
- **Features**: Users can select voice, adjust speed, and listen to the story in any supported language.

---

## 5. Authentication & Library
- **Backend**: Flask-Login, Flask-SQLAlchemy, and SQLite for secure user accounts and story storage.
- **Frontend**: Users can register, login, save stories to their library, and re-read or delete them anytime.

---

## 6. Technologies Used
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, react-hot-toast
- **Backend**: Python 3, Flask, Flask-Login, Flask-SQLAlchemy, Flask-Bcrypt
- **AI APIs**: Google Gemini (text), Hugging Face Stable Diffusion (images)
- **Other**: deep-translator, Web Speech API

---

## 7. Credits
- **Story & Quiz AI**: Google Gemini
- **Image Generation**: Hugging Face Stable Diffusion v1.5
- **Translation**: deep-translator (Google Translate)
- **Text-to-Speech**: Web Speech API

---

For more details, see the README or QUICKSTART files.
