export interface Story {
  title: string;
  genre: string;
  content: string;
  readTime: string;
  coverImage?: string; // Base64 image data
}

export interface Question {
  question: string;
  options: string[];
  correct: number;
}

export interface Quiz {
  questions: Question[];
}

export interface Flashcard {
  word: string;
  definition: string;
  example: string;
}

export interface FlashcardSet {
  flashcards: Flashcard[];
}

export interface StoryWithQuiz extends Story {
  questions: Question[];
}

export type Theme = 
  | 'Mystery' 
  | 'Comedy' 
  | 'Adventure' 
  | 'Science Fiction'
  | 'Fantasy' 
  | 'Horror' 
  | 'Romance' 
  | 'Thriller'
  | 'Historical' 
  | 'Drama';

export type AgeGroup = 'children' | 'kids' | 'teens' | 'adults';

export interface AgeGroupInfo {
  label: string;
  description: string;
  word_count: string;
}

export interface GenerateStoryRequest {
  theme: Theme;
  ageGroup: AgeGroup;
  prompt?: string;
}

export interface GenerateQuizRequest {
  title: string;
  content: string;
}

export interface GenerateFlashcardsRequest {
  content: string;
  ageGroup: AgeGroup;
}

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
}

export interface TranslateResponse {
  translatedText: string;
  targetLanguage: string;
  languageName: string;
}

export interface GenerateCoverImageRequest {
  title: string;
  genre: string;
  summary?: string;
}

export interface CoverImageResponse {
  imageData: string | null;
  prompt?: string;
  error?: string;
  fallback?: boolean;
}

export type ViewType = 'home' | 'story' | 'quiz' | 'results' | 'flashcards';
