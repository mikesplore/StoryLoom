import axios from 'axios';
import type { 
  GenerateStoryRequest, 
  Story, 
  GenerateQuizRequest, 
  Quiz, 
  Theme, 
  AgeGroupInfo, 
  GenerateFlashcardsRequest, 
  FlashcardSet,
  TranslateRequest,
  TranslateResponse,
  GenerateCoverImageRequest,
  CoverImageResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  SavedStory,
  StoryWithQuiz
} from '../types';

const API_BASE_URL = '/api';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

export const storyApi = {
  // Health check
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },

  // Get available themes
  getThemes: async (): Promise<Theme[]> => {
    const response = await axios.get(`${API_BASE_URL}/themes`);
    return response.data.themes;
  },

  // Get available age groups
  getAgeGroups: async (): Promise<Record<string, AgeGroupInfo>> => {
    const response = await axios.get(`${API_BASE_URL}/age-groups`);
    return response.data.ageGroups;
  },

  // Get available languages
  getLanguages: async (): Promise<Record<string, string>> => {
    const response = await axios.get(`${API_BASE_URL}/languages`);
    return response.data.languages;
  },

  // Generate a story
  generateStory: async (request: GenerateStoryRequest): Promise<Story> => {
    const response = await axios.post(`${API_BASE_URL}/generate-story`, request);
    return response.data;
  },

  // Generate a quiz for a story
  generateQuiz: async (request: GenerateQuizRequest): Promise<Quiz> => {
    const response = await axios.post(`${API_BASE_URL}/generate-quiz`, request);
    return response.data;
  },

  // Generate flashcards for vocabulary learning
  generateFlashcards: async (request: GenerateFlashcardsRequest): Promise<FlashcardSet> => {
    const response = await axios.post(`${API_BASE_URL}/generate-flashcards`, request);
    return response.data;
  },

  // Translate text to another language
  translate: async (request: TranslateRequest): Promise<TranslateResponse> => {
    const response = await axios.post(`${API_BASE_URL}/translate`, request);
    return response.data;
  },

  // Generate cover image for a story
  generateCoverImage: async (request: GenerateCoverImageRequest): Promise<CoverImageResponse> => {
    const response = await axios.post(`${API_BASE_URL}/generate-cover-image`, request);
    return response.data;
  },
};

// Authentication API
export const authApi = {
  // Register a new user
  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, request);
    return response.data;
  },

  // Login user
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, request);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<{ message: string }> => {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await axios.get(`${API_BASE_URL}/auth/user`);
    return response.data;
  },
};

// Story Library API
export const libraryApi = {
  // Get all user's saved stories
  getStories: async (): Promise<{ stories: SavedStory[] }> => {
    const response = await axios.get(`${API_BASE_URL}/library/stories`);
    return response.data;
  },

  // Save a story
  saveStory: async (story: StoryWithQuiz & { ageGroup: string; coverImage?: string }): Promise<{ message: string; story: SavedStory }> => {
    const response = await axios.post(`${API_BASE_URL}/library/stories`, story);
    return response.data;
  },

  // Get a specific story
  getStory: async (storyId: number): Promise<{ story: SavedStory }> => {
    const response = await axios.get(`${API_BASE_URL}/library/stories/${storyId}`);
    return response.data;
  },

  // Delete a story
  deleteStory: async (storyId: number): Promise<{ message: string }> => {
    const response = await axios.delete(`${API_BASE_URL}/library/stories/${storyId}`);
    return response.data;
  },
};
