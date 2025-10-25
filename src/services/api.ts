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
  TranslateResponse
} from '../types';

const API_BASE_URL = '/api';

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
};
