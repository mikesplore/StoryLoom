import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, CheckCircle, XCircle, Loader2, GraduationCap, Volume2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { storyApi, authApi, libraryApi, userApi } from './services/api';
import type { Theme, StoryWithQuiz, ViewType, AgeGroup, AgeGroupInfo, Flashcard, User, SavedStory, UserStats } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingPlaceholder from './components/LoadingPlaceholder';
import StoryView from './components/StoryView';
import QuizView from './components/QuizView';
import FlashcardsView from './components/FlashcardsView';
import ProfileView from './components/ProfileView';
import LibraryView from './components/LibraryView';
import AuthView from './components/AuthView';

export default function StoryLoom() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<StoryWithQuiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Password recovery state
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Library state
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [isSavingStory, setIsSavingStory] = useState(false);
  const [currentLoadedStoryId, setCurrentLoadedStoryId] = useState<number | null>(null);
  
  // User stats state
  const [userStats, setUserStats] = useState<UserStats>({
    storiesGenerated: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalStoriesSaved: 0
  });
  
  // Story generation form state
  const [selectedTheme, setSelectedTheme] = useState<Theme>('Mystery');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('kids');
  const [customPrompt, setCustomPrompt] = useState('');
  // Multi-step wizard state for the homepage story preferences
  const [wizardStep, setWizardStep] = useState<number>(1); // 1..3
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);
  const [ageGroups, setAgeGroups] = useState<Record<string, AgeGroupInfo>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // Cover image state
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Text-to-Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Global translation state
  const [availableLanguages, setAvailableLanguages] = useState<Record<string, string>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [translatedStory, setTranslatedStory] = useState<string>('');
  const [translatedQuiz, setTranslatedQuiz] = useState<Array<{question: string, options: string[]}>>([]);
  const [translatedFlashcards, setTranslatedFlashcards] = useState<Flashcard[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  // Fetch available options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [themes, ageGroupsData, languages] = await Promise.all([
          storyApi.getThemes(),
          storyApi.getAgeGroups(),
          storyApi.getLanguages()
        ]);
        setAvailableThemes(themes);
        setAgeGroups(ageGroupsData);
        setAvailableLanguages(languages);
      } catch (err) {
        console.error('Failed to fetch options:', err);
      }
    };
    fetchOptions();
    
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { user } = await authApi.getCurrentUser();
        setCurrentUser(user);
        
        // Fetch user stats if authenticated
        try {
          const stats = await userApi.getStats();
          setUserStats(stats);
        } catch (statsErr) {
          console.error('Failed to fetch user stats:', statsErr);
        }
      } catch (err) {
        // User not logged in
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
    
    // Load available voices for text-to-speech
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      // Set default voice (prefer English if available)
      if (voices.length > 0 && !selectedVoice) {
        const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        setSelectedVoice(englishVoice);
      }
    };
    
    // Voices might not be loaded immediately
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Text-to-Speech functions
  const handleSpeak = () => {
    if (!currentStory) return;
    
    if (isSpeaking && !isPaused) {
      // Pause
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      // Resume
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      // Start speaking
      const textToSpeak = selectedLanguage !== 'en' && translatedStory 
        ? translatedStory 
        : currentStory.content;
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Get appropriate voice for the selected language
      if (selectedLanguage !== 'en' && availableVoices.length > 0) {
        const langCode = selectedLanguage;
        const matchingVoice = availableVoices.find(v => v.lang.startsWith(langCode));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    setError(null);
    setSelectedLanguage('en'); // Reset to English for new story
    setCoverImage(null); // Reset cover image
    handleStopSpeaking(); // Stop any ongoing speech
    
    try {
      const story = await storyApi.generateStory({
        theme: selectedTheme,
        ageGroup: selectedAgeGroup,
        prompt: customPrompt.trim() || undefined,
      });
      // Update stats after generating a story
      try {
        const stats = await userApi.updateActivity();
        setUserStats((prev) => ({ ...prev, ...stats }));
      } catch (err) {
        console.warn('Failed to update user stats after generating story:', err);
      }
      // Generate cover image in parallel with quiz
      setIsGeneratingImage(true);
      console.log('🎨 Starting cover image generation...');
      const [quiz, coverImageResult] = await Promise.all([
        storyApi.generateQuiz({
          title: story.title,
          content: story.content,
          ageGroup: selectedAgeGroup,
        }),
        storyApi.generateCoverImage({
          title: story.title,
          genre: story.genre,
          summary: (story as any).imageDescription || story.content.substring(0, 200), // Use AI-generated description or fallback
        }).catch(err => {
          console.warn('Cover image generation failed:', err);
          return { imageData: null, fallback: true };
        })
      ]);
      
      console.log('🖼️ Cover image result:', coverImageResult);
      console.log('📊 Full response:', JSON.stringify(coverImageResult, null, 2));
      console.log('📊 Image data exists?', !!coverImageResult.imageData);
      if (coverImageResult.imageData) {
        console.log('🎯 Image data length:', coverImageResult.imageData.length);
        console.log('🔍 Image data preview:', coverImageResult.imageData.substring(0, 50));
      }
      if ('error' in coverImageResult && coverImageResult.error) {
        console.log('⚠️ Image generation error:', coverImageResult.error);
      }
      
      setIsGeneratingQuiz(true);
      setIsGeneratingImage(false);
      
      if (coverImageResult.imageData) {
        console.log('✅ Setting cover image in state');
        setCoverImage(coverImageResult.imageData);
      } else {
        console.log('❌ No image data received');
      }
      
      setCurrentStory({
        ...story,
        questions: quiz.questions,
      });
      
      setActiveView('story');
      setCurrentQuestion(0);
      setScore(0);
      setCustomPrompt('');
      setFlashcards([]);
    } catch (err: any) {
      console.error('Error generating story:', err);
      setError(err.response?.data?.error || 'Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
      setIsGeneratingQuiz(false);
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!currentStory) return;
    
    setIsGeneratingFlashcards(true);
    try {
      const flashcardData = await storyApi.generateFlashcards({
        content: currentStory.content,
        ageGroup: selectedAgeGroup,
      });
      setFlashcards(flashcardData.flashcards);
      setCurrentFlashcardIndex(0);
      setShowFlashcardAnswer(false);
      setActiveView('flashcards');
    } catch (err: any) {
      console.error('Error generating flashcards:', err);
      setError('Failed to generate flashcards. Please try again.');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGlobalTranslation = async (language: string) => {
    if (!currentStory) return;
    
    if (language === 'en') {
      // Reset to English
      setSelectedLanguage('en');
      setTranslatedStory('');
      setTranslatedQuiz([]);
      setTranslatedFlashcards([]);
      return;
    }
    
    setIsTranslating(true);
    setSelectedLanguage(language);
    
    try {
      // Translate story content
      const storyResult = await storyApi.translate({
        text: currentStory.content,
        targetLanguage: language,
      });
      setTranslatedStory(storyResult.translatedText);
      
      // Translate quiz questions and options
      const quizTranslations = await Promise.all(
        currentStory.questions.map(async (q) => {
          const questionResult = await storyApi.translate({
            text: q.question,
            targetLanguage: language,
          });
          
          const optionsResults = await Promise.all(
            q.options.map(opt => 
              storyApi.translate({
                text: opt,
                targetLanguage: language,
              })
            )
          );
          
          return {
            question: questionResult.translatedText,
            options: optionsResults.map(r => r.translatedText),
          };
        })
      );
      setTranslatedQuiz(quizTranslations);
      
      // Translate flashcards if they exist
      if (flashcards.length > 0) {
        const flashcardTranslations = await Promise.all(
          flashcards.map(async (card) => {
            const [wordResult, defResult, exampleResult] = await Promise.all([
              storyApi.translate({ text: card.word, targetLanguage: language }),
              storyApi.translate({ text: card.definition, targetLanguage: language }),
              storyApi.translate({ text: card.example, targetLanguage: language }),
            ]);
            
            return {
              word: wordResult.translatedText,
              definition: defResult.translatedText,
              example: exampleResult.translatedText,
            };
          })
        );
        setTranslatedFlashcards(flashcardTranslations);
      }
      
    } catch (err: any) {
      console.error('Error translating:', err);
      setError('Failed to translate. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleStartQuiz = () => {
    setActiveView('quiz');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentStory) return;
    
    const isCorrect = selectedAnswer === currentStory.questions[currentQuestion].correct;
    if (isCorrect) setScore(score + 1);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (!currentStory) return;
    
    if (currentQuestion < currentStory.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setActiveView('results');
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setActiveView('story');
  };

  const handleNewStory = () => {
    setCurrentStory(null);
    setActiveView('home');
    setCustomPrompt('');
    setFlashcards([]);
    setSelectedLanguage('en');
    setTranslatedStory('');
    setTranslatedQuiz([]);
    setTranslatedFlashcards([]);
    setCoverImage(null);
    setCurrentLoadedStoryId(null);
  };

  const flipFlashcard = () => {
    setShowFlashcardAnswer(!showFlashcardAnswer);
  };

  const nextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setShowFlashcardAnswer(false);
    }
  };

  const prevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      setShowFlashcardAnswer(false);
    }
  };

  // Authentication handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      const { user } = await authApi.login({
        username: loginUsername,
        password: loginPassword,
      });
      setCurrentUser(user);
      setLoginUsername('');
      setLoginPassword('');
      setActiveView('home');
      toast.success(`Welcome back, ${user.username}!`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    
    try {
      const { user } = await authApi.register({
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
      });
      setCurrentUser(user);
      setRegisterUsername('');
      setRegisterEmail('');
      setRegisterPassword('');
      setActiveView('home');
      toast.success(`Account created! Welcome, ${user.username}!`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecovering(true);
    
    // Simulate password recovery (you'll need to implement backend endpoint)
    setTimeout(() => {
      toast.success('Password recovery email sent! Check your inbox.');
      setRecoveryEmail('');
      setShowPasswordRecovery(false);
      setIsRecovering(false);
    }, 1500);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setCurrentUser(null);
      setActiveView('home');
      setCurrentStory(null);
      setSavedStories([]);
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout failed:', err);
      toast.error('Failed to logout');
    }
  };

  // Library handlers
  const handleLoadLibrary = async () => {
    if (!currentUser) {
      toast.error('Please login to view your library');
      setActiveView('login');
      return;
    }
    
    setIsLoadingLibrary(true);
    try {
      const { stories } = await libraryApi.getStories();
      setSavedStories(stories);
      setActiveView('library');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load library.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const handleSaveStory = async () => {
    if (!currentUser) {
      toast.error('Please login to save stories');
      setActiveView('login');
      return;
    }
    if (!currentStory) return;
    if (currentLoadedStoryId) {
      toast('This story is already saved in your library.', { icon: '📚' });
      return;
    }
    setIsSavingStory(true);
    try {
      const { story } = await libraryApi.saveStory({
        ...currentStory,
        ageGroup: selectedAgeGroup,
        coverImage: coverImage || undefined,
      });
      setCurrentLoadedStoryId(story.id);
      setSavedStories((prev) => [...prev, story]);
      // Update stats after saving a story
      try {
        const stats = await userApi.getStats();
        setUserStats(stats);
      } catch (err) {
        console.warn('Failed to update user stats after saving story:', err);
      }
      toast.success('Story saved to your library!', {
        icon: '📚',
        duration: 3000,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save story.');
    } finally {
      setIsSavingStory(false);
    }
  };

  const handleLoadSavedStory = async (storyId: number) => {
    try {
      const { story } = await libraryApi.getStory(storyId);
      setCurrentStory({
        title: story.title,
        genre: story.genre,
        content: story.content,
        readTime: story.readTime,
        questions: story.questions,
      });
      setSelectedAgeGroup(story.ageGroup as AgeGroup);
      setCoverImage(story.coverImage || null);
      setFlashcards(story.flashcards);
      setCurrentLoadedStoryId(storyId);
      setActiveView('story');
      toast.success('Story loaded!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to load story.');
    }
  };

  const handleDeleteStoryFromView = async () => {
    if (!currentLoadedStoryId) return;
    
    const confirmed = window.confirm('Remove this story from your library?');
    if (!confirmed) return;
    
    try {
      await libraryApi.deleteStory(currentLoadedStoryId);
      setSavedStories(savedStories.filter(s => s.id !== currentLoadedStoryId));
      setCurrentLoadedStoryId(null);
      toast.success('Story removed from library', { icon: '🗑️' });
      handleNewStory();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to remove story.');
    }
  };

  const handleDeleteStory = async (storyId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this story?');
    if (!confirmed) return;
    
    try {
      await libraryApi.deleteStory(storyId);
      setSavedStories(savedStories.filter(s => s.id !== storyId));
      toast.success('Story deleted', {
        icon: '🗑️',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete story.');
    }
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading StoryLoom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(20, 184, 166, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#14b8a6',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Header */}
      <Header
        currentUser={currentUser}
        currentStory={currentStory}
        selectedLanguage={selectedLanguage}
        availableLanguages={availableLanguages}
        isTranslating={isTranslating}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        setActiveView={setActiveView}
        handleNewStory={handleNewStory}
        handleLoadLibrary={handleLoadLibrary}
        handleLogout={handleLogout}
        handleGlobalTranslation={handleGlobalTranslation}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Home View */}
        {activeView === 'home' && (
          <div className="space-y-8 md:space-y-12">
            {/* Hero Section - Mobile-Optimized */}
            <div className="text-center px-4 md:px-0">
              <div className="relative mb-6 md:mb-8">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-teal-500/30 animate-pulse">
                  <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-slate-900" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce delay-300"></div>
                <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce delay-700"></div>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight">
                Create Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-blue-400 animate-pulse">
                  Perfect Story
                </span>
              </h1>
              <p className="text-base md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                AI-powered storytelling tailored for your age. Complete with interactive quizzes, flashcards, and multilingual support.
              </p>

              {/* Quick Stats */}
              {currentUser && (
                <div className="flex justify-center gap-4 md:gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-teal-400">{userStats.storiesGenerated}</div>
                    <div className="text-xs md:text-sm text-slate-400">Stories Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-orange-400">{userStats.currentStreak}</div>
                    <div className="text-xs md:text-sm text-slate-400">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-purple-400">{userStats.totalStoriesSaved}</div>
                    <div className="text-xs md:text-sm text-slate-400">Saved Stories</div>
                  </div>
                </div>
              )}
            </div>

            {/* Story Creation Form - Enhanced Mobile UX */}
            <div className="max-w-3xl mx-auto">
              {isGenerating ? (
                <LoadingPlaceholder isGeneratingQuiz={isGeneratingQuiz} />
              ) : (
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-teal-500/20 rounded-3xl p-4 md:p-8 shadow-2xl">
                  <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Start Your Adventure</h2>
                    <p className="text-sm md:text-base text-slate-400">Choose your preferences and let AI create magic</p>
                  </div>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm md:text-base">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Wizard (one step per screen) */}
                  <div className="space-y-6 md:space-y-8">
                    {/* Progress / Step indicator */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="text-sm text-slate-400">Step</div>
                      <div className="font-bold text-white">{wizardStep}</div>
                      <div className="text-sm text-slate-400">of 3</div>
                    </div>

                    <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden mb-4">
                      <div
                        className="h-2 bg-gradient-to-r from-teal-400 to-cyan-400"
                        style={{ width: `${(wizardStep / 3) * 100}%` }}
                      />
                    </div>

                    {/* Step panes */}
                    {wizardStep === 1 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-900 text-sm md:text-base font-bold">1</div>
                          <h3 className="text-lg md:text-xl font-semibold text-white">What's your age group?</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          {Object.entries(ageGroups).map(([key, info]) => (
                            <button
                              key={key}
                              onClick={() => setSelectedAgeGroup(key as AgeGroup)}
                              className={`p-4 md:p-6 rounded-2xl text-left transition-all duration-300 transform hover:scale-102 active:scale-98 ${
                                selectedAgeGroup === key
                                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 shadow-lg shadow-teal-500/30'
                                  : 'bg-slate-700/40 text-slate-300 hover:bg-slate-700/60 border border-slate-600/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl ${
                                  selectedAgeGroup === key ? 'bg-white/20' : 'bg-slate-600/50'
                                }`}>
                                  {info.emoji}
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-base md:text-lg mb-1">{info.label}</div>
                                  <div className={`text-sm md:text-base ${selectedAgeGroup === key ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {info.description}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {wizardStep === 2 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm md:text-base font-bold">2</div>
                          <h3 className="text-lg md:text-xl font-semibold text-white">Pick your story theme</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                          {availableThemes.map((theme) => (
                            <button
                              key={theme}
                              onClick={() => setSelectedTheme(theme)}
                              className={`px-3 py-3 md:px-4 md:py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm md:text-base ${
                                selectedTheme === theme
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50'
                              }`}
                            >
                              {theme}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {wizardStep === 3 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-slate-900 text-sm md:text-base font-bold">3</div>
                          <h3 className="text-lg md:text-xl font-semibold text-white">
                            Describe your story idea 
                            <span className="text-slate-400 font-normal text-sm md:text-base">(optional)</span>
                          </h3>
                        </div>
                        <div className="relative">
                          <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Tell us what your story should be about... (e.g., 'A magical cat who can talk and goes on space adventures')"
                            className="w-full px-4 py-4 md:px-6 md:py-6 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 resize-none text-sm md:text-base leading-relaxed"
                            rows={4}
                            maxLength={500}
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                            {customPrompt.length}/500
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation: Back / Next / Create */}
                    <div className="pt-4 md:pt-6 flex items-center gap-3">
                      <button
                        onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
                        disabled={wizardStep === 1}
                        className="flex-1 bg-slate-700/40 text-white px-4 py-3 rounded-2xl font-semibold text-sm md:text-base hover:bg-slate-700/60 disabled:opacity-50 disabled:cursor-not-allowed transition">
                        Back
                      </button>

                      {wizardStep < 3 ? (
                        <button
                          onClick={() => setWizardStep(Math.min(3, wizardStep + 1))}
                          className="flex-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white px-4 py-3 rounded-2xl font-bold text-sm md:text-base shadow transition transform hover:scale-102">
                          Next
                        </button>
                      ) : (
                        <button 
                          onClick={handleGenerateStory}
                          disabled={isGenerating || !selectedAgeGroup}
                          className="flex-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white px-4 py-3 rounded-2xl font-bold text-sm md:text-base shadow transition transform hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed">
                          {isGenerating ? (isGeneratingQuiz ? 'Adding Quiz & Flashcards...' : 'Crafting Your Story...') : 'Create My Story'}
                        </button>
                      )}
                    </div>

                    {!selectedAgeGroup && (
                      <p className="text-center text-amber-400 text-sm mt-2 flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 text-xs">!</span>
                        Please select an age group to continue
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Features Section - Mobile-Optimized Cards */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Why Choose StoryLoom?</h2>
                <p className="text-slate-400 text-sm md:text-base">Discover the magic of AI-powered storytelling</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-teal-500/20">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-slate-900" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">AI-Powered Stories</h3>
                  <p className="text-sm md:text-base text-slate-400 leading-relaxed">Unique narratives with stunning cover art, tailored to your age and interests</p>
                </div>

                <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-orange-500/20 rounded-2xl p-6 hover:border-orange-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-orange-500/20">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Volume2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">Text-to-Speech</h3>
                  <p className="text-sm md:text-base text-slate-400 leading-relaxed">Listen to stories in multiple voices and languages with customizable speed</p>
                </div>

                <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">Interactive Quizzes</h3>
                  <p className="text-sm md:text-base text-slate-400 leading-relaxed">Test comprehension with engaging quizzes and track your progress</p>
                </div>

                <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">Smart Flashcards</h3>
                  <p className="text-sm md:text-base text-slate-400 leading-relaxed">Learn new vocabulary with interactive flashcards and examples</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Story View */}
        {activeView === 'story' && currentStory && (
          <StoryView
            currentStory={currentStory}
            coverImage={coverImage}
            isGeneratingImage={isGeneratingImage}
            selectedLanguage={selectedLanguage}
            translatedStory={translatedStory}
            isSpeaking={isSpeaking}
            isPaused={isPaused}
            showVoiceSettings={showVoiceSettings}
            availableVoices={availableVoices}
            selectedVoice={selectedVoice}
            speechRate={speechRate}
            isGeneratingFlashcards={isGeneratingFlashcards}
            currentUser={currentUser}
            currentLoadedStoryId={currentLoadedStoryId}
            isSavingStory={isSavingStory}
            handleSpeak={handleSpeak}
            handleStopSpeaking={handleStopSpeaking}
            setShowVoiceSettings={setShowVoiceSettings}
            setSelectedVoice={setSelectedVoice}
            setSpeechRate={setSpeechRate}
            handleStartQuiz={handleStartQuiz}
            handleGenerateFlashcards={handleGenerateFlashcards}
            handleDeleteStoryFromView={handleDeleteStoryFromView}
            handleSaveStory={handleSaveStory}
            handleNewStory={handleNewStory}
          />
        )}

        {/* Flashcards View */}
        {activeView === 'flashcards' && flashcards.length > 0 && (
          <FlashcardsView
            flashcards={flashcards}
            currentFlashcardIndex={currentFlashcardIndex}
            showFlashcardAnswer={showFlashcardAnswer}
            selectedLanguage={selectedLanguage}
            translatedFlashcards={translatedFlashcards}
            flipFlashcard={flipFlashcard}
            nextFlashcard={nextFlashcard}
            prevFlashcard={prevFlashcard}
            onBackToStory={() => setActiveView('story')}
          />
        )}

        {/* Quiz View */}
        {(activeView === 'quiz' || activeView === 'results') && currentStory && (
          <QuizView
            currentStory={currentStory}
            currentQuestion={currentQuestion}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            score={score}
            selectedLanguage={selectedLanguage}
            translatedQuiz={translatedQuiz}
            isResultsView={activeView === 'results'}
            handleAnswerSelect={handleAnswerSelect}
            handleSubmitAnswer={handleSubmitAnswer}
            handleNextQuestion={handleNextQuestion}
            handleRetry={handleRetry}
            handleNewStory={handleNewStory}
          />
        )}

        {/* Profile View */}
        {activeView === 'profile' && currentUser && (
          <ProfileView
            currentUser={currentUser}
            userStats={userStats}
            setActiveView={setActiveView}
            handleLoadLibrary={handleLoadLibrary}
          />
        )}

        {/* Auth Views (Login & Register) */}
        {(activeView === 'login' || activeView === 'register') && (
          <AuthView
            activeView={activeView}
            authError={authError}
            loginUsername={loginUsername}
            loginPassword={loginPassword}
            registerUsername={registerUsername}
            registerEmail={registerEmail}
            registerPassword={registerPassword}
            isAuthenticating={isAuthenticating}
            showPasswordRecovery={showPasswordRecovery}
            recoveryEmail={recoveryEmail}
            isRecovering={isRecovering}
            setLoginUsername={setLoginUsername}
            setLoginPassword={setLoginPassword}
            setRegisterUsername={setRegisterUsername}
            setRegisterEmail={setRegisterEmail}
            setRegisterPassword={setRegisterPassword}
            setShowPasswordRecovery={setShowPasswordRecovery}
            setRecoveryEmail={setRecoveryEmail}
            setActiveView={setActiveView}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
            handlePasswordRecovery={handlePasswordRecovery}
            handleNewStory={handleNewStory}
          />
        )}

        {/* Library View */}
        {activeView === 'library' && (
          <LibraryView
            isLoadingLibrary={isLoadingLibrary}
            savedStories={savedStories}
            handleNewStory={handleNewStory}
            handleLoadSavedStory={handleLoadSavedStory}
            handleDeleteStory={handleDeleteStory}
          />
        )}
  </main>

  {/* Spacer for fixed footer */}
  <div style={{ height: '80px' }} />

      {/* Footer */}
      <Footer />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.4s ease-out;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        /* Custom scrollbar for mobile */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(20, 184, 166, 0.5);
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(20, 184, 166, 0.7);
        }
      `}</style>
    </div>
  );
}
