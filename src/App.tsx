import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Play, CheckCircle, XCircle, RotateCcw, Menu, X, Loader2, GraduationCap, Languages, FlipHorizontal, Volume2, VolumeX, Pause, Save, Library, LogIn, LogOut, UserPlus, Trash2, Key, Copy, FileText, FileDown, Edit, Award } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { storyApi, authApi, libraryApi, userApi } from './services/api';
import type { Theme, StoryWithQuiz, ViewType, AgeGroup, AgeGroupInfo, Flashcard, User, SavedStory } from './types';

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
  
  // Story editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  // User stats state
  const [userStats, setUserStats] = useState({
    storiesGenerated: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalStoriesSaved: 0
  });
  
  // Story generation form state
  const [selectedTheme, setSelectedTheme] = useState<Theme>('Mystery');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('kids');
  const [customPrompt, setCustomPrompt] = useState('');
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
        // Fetch user stats if logged in
        if (user) {
          try {
            const stats = await userApi.getStats();
            setUserStats(stats);
          } catch (err) {
            console.error('Failed to fetch user stats:', err);
          }
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
      
      // Generate cover image in parallel with quiz
      setIsGeneratingImage(true);
      console.log('🎨 Starting cover image generation...');
      const [quiz, coverImageResult] = await Promise.all([
        storyApi.generateQuiz({
          title: story.title,
          content: story.content,
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
      
      // Update activity tracking for logged-in users
      if (currentUser) {
        try {
          const stats = await userApi.updateActivity();
          setUserStats(prev => ({
            ...prev,
            storiesGenerated: stats.storiesGenerated,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak
          }));
          if (stats.currentStreak > 1) {
            toast.success(`🔥 ${stats.currentStreak} day streak!`, { duration: 2000 });
          }
        } catch (err) {
          console.error('Failed to update activity:', err);
        }
      }
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
    
    setIsSavingStory(true);
    try {
      await libraryApi.saveStory({
        ...currentStory,
        ageGroup: selectedAgeGroup,
        coverImage: coverImage || undefined,
      });
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

  // Story editing handlers
  const handleStartEdit = () => {
    if (!currentStory) return;
    setEditedTitle(currentStory.title);
    setEditedContent(currentStory.content);
    setIsEditing(true);
    setActiveView('edit-story');
  };

  const handleSaveEdit = async () => {
    if (!currentLoadedStoryId || !editedTitle.trim() || !editedContent.trim()) {
      toast.error('Title and content cannot be empty');
      return;
    }

    setIsSavingEdit(true);
    try {
      const { story } = await libraryApi.updateStory(currentLoadedStoryId, {
        title: editedTitle,
        content: editedContent
      });
      
      // Update current story
      setCurrentStory(prev => prev ? {
        ...prev,
        title: story.title,
        content: story.content
      } : null);
      
      // Update in saved stories list
      setSavedStories(prev => prev.map(s => 
        s.id === currentLoadedStoryId ? story : s
      ));
      
      setIsEditing(false);
      setActiveView('story');
      toast.success('Story updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update story.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setActiveView('story');
  };

  // Story sharing handlers
  const handleCopyStory = () => {
    if (!currentStory) return;
    
    const text = `${currentStory.title}\n\n${currentStory.content}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Story copied to clipboard!', { icon: '📋' });
    }).catch(() => {
      toast.error('Failed to copy story');
    });
  };

  const handleExportText = () => {
    if (!currentStory) return;
    
    const element = document.createElement('a');
    const file = new Blob([`${currentStory.title}\n\n${currentStory.content}`], {
      type: 'text/plain'
    });
    element.href = URL.createObjectURL(file);
    element.download = `${currentStory.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Story exported as text file!', { icon: '📄' });
  };

  const handleExportPDF = async () => {
    if (!currentStory) return;
    
    toast.error('PDF export coming soon! Use "Export Text" for now.');
    // TODO: Implement jsPDF integration
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
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-teal-500/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-slate-900" />
              </div>
              <h1 className="text-2xl font-bold text-white">StoryLoom</h1>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-6 items-center">
              <button onClick={handleNewStory} className="text-teal-300 hover:text-teal-200 transition-colors">Home</button>
              {currentUser && (
                <button onClick={handleLoadLibrary} className="text-teal-300 hover:text-teal-200 transition-colors flex items-center gap-1">
                  <Library className="w-4 h-4" />
                  My Library
                </button>
              )}
              
              {/* Global Language Selector */}
              {currentStory && (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg border border-teal-500/20">
                  <Languages className="w-4 h-4 text-teal-400" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleGlobalTranslation(e.target.value)}
                    disabled={isTranslating}
                    className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                  >
                    {Object.entries(availableLanguages).map(([code, name]) => (
                      <option key={code} value={code} className="bg-slate-800">
                        {name}
                      </option>
                    ))}
                  </select>
                  {isTranslating && <Loader2 className="w-4 h-4 animate-spin text-teal-400" />}
                </div>
              )}
              
              {/* Auth Buttons */}
              {currentUser ? (
                <div className="flex items-center gap-3">
                  {/* Stats Badge */}
                  {userStats.currentStreak > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-500/30">
                      <Award className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 text-sm font-bold">🔥 {userStats.currentStreak}</span>
                      <span className="text-slate-400 text-xs">day streak</span>
                    </div>
                  )}
                  <span className="text-slate-300 text-sm">Hi, {currentUser.username}!</span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveView('login')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                  <button 
                    onClick={() => setActiveView('register')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3 border-t border-teal-500/20 pt-4">
              <button onClick={() => {handleNewStory(); setMenuOpen(false);}} className="text-teal-300 hover:text-teal-200 transition-colors text-left">Home</button>
              
              {currentUser && (
                <button onClick={() => {handleLoadLibrary(); setMenuOpen(false);}} className="text-teal-300 hover:text-teal-200 transition-colors text-left flex items-center gap-1">
                  <Library className="w-4 h-4" />
                  My Library
                </button>
              )}
              
              {/* Mobile Language Selector */}
              {currentStory && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-teal-500/20">
                  <Languages className="w-4 h-4 text-teal-400" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleGlobalTranslation(e.target.value)}
                    disabled={isTranslating}
                    className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                  >
                    {Object.entries(availableLanguages).map(([code, name]) => (
                      <option key={code} value={code} className="bg-slate-800">
                        {name}
                      </option>
                    ))}
                  </select>
                  {isTranslating && <Loader2 className="w-4 h-4 animate-spin text-teal-400" />}
                </div>
              )}
              
              {/* Mobile Auth Buttons */}
              <div className="pt-3 border-t border-teal-500/20">
                {currentUser ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-slate-300 text-sm px-3">Hi, {currentUser.username}!</div>
                    <button 
                      onClick={() => {handleLogout(); setMenuOpen(false);}}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {setActiveView('login'); setMenuOpen(false);}}
                      className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all text-sm"
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </button>
                    <button 
                      onClick={() => {setActiveView('register'); setMenuOpen(false);}}
                      className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Home View */}
        {activeView === 'home' && (
          <div>
            <div className="text-center mb-12">
              <div className="mb-8 animate-float">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-teal-500/50">
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-slate-900" />
                </div>
              </div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                Stories That <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">Inspire</span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Create unique AI-powered stories for your age! Take quizzes, learn new words with flashcards, and read in any language.
              </p>
            </div>

            {/* Story Generator Form */}
            <div className="max-w-2xl mx-auto mb-16">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Create Your Story</h3>
                
                {error && (
                  <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                    {error}
                  </div>
                )}

                {/* Age Group Selection */}
                <div className="mb-6">
                  <label className="block text-teal-300 font-semibold mb-3">Choose Your Age</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(ageGroups).map(([key, info]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedAgeGroup(key as AgeGroup)}
                        className={`p-4 rounded-lg text-left transition-all ${
                          selectedAgeGroup === key
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <div className="font-semibold mb-1">{info.label}</div>
                        <div className={`text-sm ${selectedAgeGroup === key ? 'text-slate-800' : 'text-slate-400'}`}>
                          {info.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="mb-6">
                  <label className="block text-teal-300 font-semibold mb-3">Pick a Story Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {availableThemes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSelectedTheme(theme)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedTheme === theme
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Prompt */}
                <div className="mb-6">
                  <label className="block text-teal-300 font-semibold mb-3">
                    Your Story Idea <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="What should your story be about? (e.g., 'A brave dog who saves the day')"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-teal-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    rows={4}
                  />
                </div>

                {/* Generate Button */}
                <button 
                  onClick={handleGenerateStory}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-teal-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isGeneratingQuiz ? 'Creating Quiz...' : 'Creating Story...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Create My Story
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/40 transition-all">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI Stories</h3>
                <p className="text-slate-400">Unique stories with beautiful covers</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/40 transition-all">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Volume2 className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Read Aloud</h3>
                <p className="text-slate-400">Listen to stories in any voice</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/40 transition-all">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Fun Quizzes</h3>
                <p className="text-slate-400">Test what you learned</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/40 transition-all">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Flashcards</h3>
                <p className="text-slate-400">Learn new words easily</p>
              </div>
            </div>
          </div>
        )}

        {/* Story View */}
        {activeView === 'story' && currentStory && (
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 sm:p-8 md:p-10">
              {/* Storybook Cover with Title Overlay */}
              {(() => {
                console.log('🖼️ Render check - coverImage:', coverImage ? `exists (${coverImage.length} chars)` : 'null');
                console.log('🖼️ Render check - isGeneratingImage:', isGeneratingImage);
                return null;
              })()}
              {coverImage ? (
                <div className="mb-8 rounded-xl overflow-hidden shadow-2xl relative group">
                  {/* Cover Image */}
                  <img 
                    src={coverImage} 
                    alt={`Cover for ${currentStory.title}`}
                    className="w-full h-auto min-h-[400px] max-h-[500px] object-cover"
                    onLoad={() => console.log('✅ Image loaded successfully')}
                    onError={(e) => console.error('❌ Image failed to load:', e)}
                  />
                  {/* Title Overlay - Storybook Style */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 drop-shadow-2xl leading-tight">
                      {currentStory.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-4 py-1.5 bg-teal-500/90 backdrop-blur-sm text-white rounded-full text-sm font-semibold shadow-lg">
                        {currentStory.genre}
                      </span>
                      <span className="text-white/90 text-sm font-medium drop-shadow-lg flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {currentStory.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              ) : isGeneratingImage ? (
                <div className="mb-8 h-[400px] bg-gradient-to-br from-slate-700/30 to-slate-800/50 rounded-xl flex items-center justify-center border border-teal-500/20">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-400 mx-auto mb-3" />
                    <p className="text-slate-300 text-lg font-medium">Creating your story cover...</p>
                    <p className="text-slate-500 text-sm mt-1">This may take a moment</p>
                  </div>
                </div>
              ) : (
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center">{currentStory.title}</h2>
              )}

              
              {/* Text-to-Speech Controls */}
              <div className="mb-6 flex flex-wrap gap-3 items-center bg-slate-700/30 p-4 rounded-xl">
                <button
                  onClick={handleSpeak}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isSpeaking && !isPaused
                      ? 'bg-orange-500 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {isSpeaking && !isPaused ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : isPaused ? (
                    <>
                      <Play className="w-4 h-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Read Aloud
                    </>
                  )}
                </button>
                
                {isSpeaking && (
                  <button
                    onClick={handleStopSpeaking}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-all"
                  >
                    <VolumeX className="w-4 h-4" />
                    Stop
                  </button>
                )}
                
                <button
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-slate-600 hover:bg-slate-700 text-white transition-all"
                >
                  <Languages className="w-4 h-4" />
                  Voice Settings
                </button>
                
                {isSpeaking && (
                  <span className="text-teal-400 text-sm font-medium animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></span>
                    Reading...
                  </span>
                )}
              </div>
              
              {/* Voice Settings Panel */}
              {showVoiceSettings && (
                <div className="mb-6 bg-slate-700/50 p-6 rounded-xl border border-teal-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Voice Settings</h3>
                  
                  <div className="space-y-4">
                    {/* Voice Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Select Voice
                      </label>
                      <select
                        value={selectedVoice?.name || ''}
                        onChange={(e) => {
                          const voice = availableVoices.find(v => v.name === e.target.value);
                          setSelectedVoice(voice || null);
                        }}
                        className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-teal-500 focus:outline-none"
                      >
                        {availableVoices
                          .filter(voice => {
                            // Show voices matching the selected language, or all if English
                            if (selectedLanguage === 'en') {
                              return voice.lang.startsWith('en');
                            }
                            return voice.lang.startsWith(selectedLanguage) || voice.lang.startsWith('en');
                          })
                          .map(voice => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                      </select>
                      <p className="text-xs text-slate-400 mt-1">
                        {availableVoices.length} voices available
                      </p>
                    </div>
                    
                    {/* Speech Rate */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Reading Speed: {speechRate.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-full accent-teal-500"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Slower</span>
                        <span>Normal</span>
                        <span>Faster</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Story Content - Better Typography and Spacing */}
              <div className="prose prose-lg prose-invert max-w-none mb-8">
                {(selectedLanguage !== 'en' && translatedStory ? translatedStory : currentStory.content).split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-slate-200 text-base sm:text-lg leading-relaxed mb-6 first-letter:text-2xl first-letter:font-bold first-letter:text-teal-400">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Action Buttons - Compact & Creative */}
              <div className="mt-8 pt-6 border-t border-teal-500/20">
                <div className="flex flex-wrap gap-3">
                  {/* Primary Actions - Side by Side */}
                  <button 
                    onClick={handleStartQuiz}
                    className="flex-1 min-w-[200px] group bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3.5 rounded-xl hover:shadow-lg hover:shadow-teal-500/40 transition-all hover:scale-[1.02] flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-slate-900">Take Quiz</div>
                      <div className="text-xs text-slate-800">Test your knowledge</div>
                    </div>
                  </button>

                  <button 
                    onClick={handleGenerateFlashcards}
                    disabled={isGeneratingFlashcards}
                    className="flex-1 min-w-[200px] group bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/40 transition-all hover:scale-[1.02] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      {isGeneratingFlashcards ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <GraduationCap className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white">
                        {isGeneratingFlashcards ? 'Creating...' : 'Flashcards'}
                      </div>
                      <div className="text-xs text-purple-100">Learn vocabulary</div>
                    </div>
                  </button>

                  {/* Secondary Actions - More compact */}
                  {currentUser && (
                    currentLoadedStoryId ? (
                      <>
                        <button 
                          onClick={handleStartEdit}
                          className="group bg-slate-800 border border-blue-500/30 hover:border-blue-500 px-4 py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                          <span className="font-semibold text-blue-400 text-sm">Edit Story</span>
                        </button>
                        <button 
                          onClick={handleDeleteStoryFromView}
                          className="group bg-slate-800 border border-red-500/30 hover:border-red-500 px-4 py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          <span className="font-semibold text-red-400 text-sm">Remove from Library</span>
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={handleSaveStory}
                        disabled={isSavingStory}
                        className="group bg-slate-800 border border-emerald-500/30 hover:border-emerald-500 px-4 py-3.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSavingStory ? (
                          <>
                            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                            <span className="font-semibold text-emerald-400 text-sm">Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 text-emerald-400" />
                            <span className="font-semibold text-emerald-400 text-sm">Save to Library</span>
                          </>
                        )}
                      </button>
                    )
                  )}

                  {/* Share Buttons */}
                  <div className="flex gap-2 border-l border-slate-700 pl-3">
                    <button 
                      onClick={handleCopyStory}
                      className="group bg-slate-800 border border-slate-700 hover:border-purple-500 p-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4 text-purple-400" />
                    </button>
                    <button 
                      onClick={handleExportText}
                      className="group bg-slate-800 border border-slate-700 hover:border-cyan-500 p-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                      title="Export as text file"
                    >
                      <FileText className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button 
                      onClick={handleExportPDF}
                      className="group bg-slate-800 border border-slate-700 hover:border-indigo-500 p-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
                      title="Export as PDF (coming soon)"
                    >
                      <FileDown className="w-4 h-4 text-indigo-400" />
                    </button>
                  </div>

                  <button 
                    onClick={handleNewStory}
                    className="group bg-slate-800 border border-slate-700 hover:border-slate-600 px-4 py-3.5 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-slate-300" />
                    <span className="font-semibold text-white text-sm">New Story</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flashcards View */}
        {activeView === 'flashcards' && flashcards.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Learn New Words</h2>
              <p className="text-slate-300">Card {currentFlashcardIndex + 1} of {flashcards.length}</p>
            </div>

            {/* Flashcard with 3D Flip */}
            <div className="relative" style={{ perspective: '1000px' }}>
              <div 
                onClick={flipFlashcard}
                className="relative cursor-pointer transition-transform duration-700 ease-in-out"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: showFlashcardAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  minHeight: '300px'
                }}
              >
                {/* Front of Card */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-2 border-teal-500/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-teal-500/50 transition-all"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                    <FlipHorizontal className="w-12 h-12 text-teal-400 mx-auto mb-6 animate-pulse" />
                    <h3 className="text-4xl font-bold text-white mb-4">
                      {selectedLanguage !== 'en' && translatedFlashcards.length > 0
                        ? translatedFlashcards[currentFlashcardIndex].word
                        : flashcards[currentFlashcardIndex].word}
                    </h3>
                    <p className="text-slate-400 text-sm">Tap to reveal meaning</p>
                  </div>
                </div>

                {/* Back of Card */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-teal-900/90 to-cyan-900/90 backdrop-blur-sm border-2 border-cyan-500/30 rounded-2xl p-8 shadow-xl"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6">
                    <div className="text-center">
                      <h4 className="text-teal-200 font-semibold mb-2 uppercase text-sm tracking-wider">Meaning</h4>
                      <p className="text-2xl text-white font-medium mb-6">
                        {selectedLanguage !== 'en' && translatedFlashcards.length > 0
                          ? translatedFlashcards[currentFlashcardIndex].definition
                          : flashcards[currentFlashcardIndex].definition}
                      </p>
                    </div>
                    <div className="text-center border-t border-cyan-400/20 pt-6 w-full">
                      <h4 className="text-cyan-200 font-semibold mb-2 uppercase text-sm tracking-wider">Example</h4>
                      <p className="text-lg text-slate-200 italic">
                        "{selectedLanguage !== 'en' && translatedFlashcards.length > 0
                          ? translatedFlashcards[currentFlashcardIndex].example
                          : flashcards[currentFlashcardIndex].example}"
                      </p>
                    </div>
                    <p className="text-slate-300 text-sm mt-4">Tap to flip back</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevFlashcard}
                disabled={currentFlashcardIndex === 0}
                className="px-6 py-3 bg-slate-700/50 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all disabled:opacity-30"
              >
                ← Previous
              </button>
              
              <button
                onClick={() => setActiveView('story')}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all"
              >
                Back to Story
              </button>

              <button
                onClick={nextFlashcard}
                disabled={currentFlashcardIndex === flashcards.length - 1}
                className="px-6 py-3 bg-slate-700/50 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Quiz View */}
        {activeView === 'quiz' && currentStory && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-teal-400 font-semibold">Question {currentQuestion + 1} of {currentStory.questions.length}</span>
                <span className="text-slate-400">Score: {score}/{currentStory.questions.length}</span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-6">
                {selectedLanguage !== 'en' && translatedQuiz.length > 0
                  ? translatedQuiz[currentQuestion].question
                  : currentStory.questions[currentQuestion].question}
              </h3>

              <div className="space-y-3 mb-6">
                {(selectedLanguage !== 'en' && translatedQuiz.length > 0
                  ? translatedQuiz[currentQuestion].options
                  : currentStory.questions[currentQuestion].options
                ).map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedAnswer === idx
                        ? showResult
                          ? idx === currentStory.questions[currentQuestion].correct
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-red-500 bg-red-500/20'
                          : 'border-teal-500 bg-teal-500/10'
                        : showResult && idx === currentStory.questions[currentQuestion].correct
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-slate-600 bg-slate-700/30 hover:border-teal-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-white">{option}</span>
                      {showResult && idx === currentStory.questions[currentQuestion].correct && (
                        <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                      )}
                      {showResult && selectedAnswer === idx && idx !== currentStory.questions[currentQuestion].correct && (
                        <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {!showResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all"
                >
                  {currentQuestion < currentStory.questions.length - 1 ? 'Next Question' : 'See Results'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results View */}
        {activeView === 'results' && currentStory && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full mx-auto flex items-center justify-center mb-6">
                {score === currentStory.questions.length ? (
                  <CheckCircle className="w-10 h-10 text-slate-900" />
                ) : (
                  <span className="text-3xl font-bold text-slate-900">{score}</span>
                )}
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
              <p className="text-xl text-slate-300 mb-6">
                You got {score} out of {currentStory.questions.length} correct
              </p>

              <div className="w-full bg-slate-700 rounded-full h-4 mb-8">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(score / currentStory.questions.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleRetry}
                  className="flex-1 bg-slate-700/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-all inline-flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
                <button 
                  onClick={handleNewStory}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all"
                >
                  New Story
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login View */}
        {activeView === 'login' && (
          <div className="max-w-md mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full mx-auto flex items-center justify-center mb-4">
                  <LogIn className="w-8 h-8 text-slate-900" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
                <p className="text-slate-400">Login to access your story library</p>
              </div>

              {authError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {authError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-teal-300 font-semibold mb-2">Username</label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-teal-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="block text-teal-300 font-semibold mb-2">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-teal-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Login
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <button 
                  onClick={() => setShowPasswordRecovery(true)}
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <Key className="w-4 h-4" />
                  Forgot password?
                </button>
                
                <p className="text-slate-400">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setActiveView('register')}
                    className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                  >
                    Sign up here
                  </button>
                </p>
              </div>

              <div className="mt-6">
                <button 
                  onClick={handleNewStory}
                  className="w-full text-slate-400 hover:text-white transition-colors text-sm"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Recovery Modal */}
        {showPasswordRecovery && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-teal-500/20 rounded-2xl p-8 max-w-md w-full relative">
              <button 
                onClick={() => {
                  setShowPasswordRecovery(false);
                  setRecoveryEmail('');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-500/20 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Key className="w-8 h-8 text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-slate-400 text-sm">Enter your email to receive a password reset link</p>
              </div>

              <form onSubmit={handlePasswordRecovery} className="space-y-4">
                <div>
                  <label className="block text-teal-300 font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-teal-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRecovering}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRecovering ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Register View */}
        {activeView === 'register' && (
          <div className="max-w-md mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full mx-auto flex items-center justify-center mb-4">
                  <UserPlus className="w-8 h-8 text-slate-900" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-slate-400">Join to save and access your stories</p>
              </div>

              {authError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {authError}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-teal-300 font-semibold mb-2">Username</label>
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                    minLength={3}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-teal-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="Choose a username (min 3 chars)"
                  />
                </div>

                <div>
                  <label className="block text-teal-300 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-700/50 border border-teal-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="Your email address"
                  />
                </div>

                <div>
                  <label className="block text-teal-300 font-semibold mb-2">Password</label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-teal-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="Create a password (min 6 chars)"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Sign Up
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-400">
                  Already have an account?{' '}
                  <button 
                    onClick={() => setActiveView('login')}
                    className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                  >
                    Login here
                  </button>
                </p>
              </div>

              <div className="mt-6">
                <button 
                  onClick={handleNewStory}
                  className="w-full text-slate-400 hover:text-white transition-colors text-sm"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Library View */}
        {activeView === 'library' && (
          <div>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">My Library</h2>
              <p className="text-slate-400">Your saved stories collection</p>
            </div>

            {isLoadingLibrary ? (
              <div className="text-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-teal-400 mx-auto mb-4" />
                <p className="text-slate-400">Loading your library...</p>
              </div>
            ) : savedStories.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-800/50 rounded-full mx-auto flex items-center justify-center mb-6">
                  <Library className="w-12 h-12 text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No stories yet</h3>
                <p className="text-slate-400 mb-6">Generate and save stories to build your library</p>
                <button 
                  onClick={handleNewStory}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Create First Story
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedStories.map((story) => (
                  <div 
                    key={story.id}
                    className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl overflow-hidden hover:border-teal-500/40 transition-all group cursor-pointer"
                    onClick={() => handleLoadSavedStory(story.id)}
                  >
                    {/* Cover Image */}
                    {story.coverImage ? (
                      <div className="relative h-64 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
                        <img 
                          src={story.coverImage} 
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                      </div>
                    ) : (
                      <div className="h-64 bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white/50" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">
                        {story.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded">
                          {story.genre}
                        </span>
                        <span>{story.readTime}</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {story.content.substring(0, 100)}...
                      </p>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-teal-500/20">
                        <span className="text-xs text-slate-500">
                          {new Date(story.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStory(story.id);
                          }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete story"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <button 
                onClick={handleNewStory}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        )}

        {/* Edit Story View */}
        {activeView === 'edit-story' && isEditing && currentStory && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-teal-500/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                  <Edit className="w-8 h-8 text-blue-400" />
                  Edit Story
                </h2>
                <button 
                  onClick={handleCancelEdit}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Edit Form */}
              <div className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Story Title
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="Enter story title"
                  />
                </div>

                {/* Content Textarea */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Story Content
                  </label>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={20}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    placeholder="Write your story here..."
                  />
                  <div className="mt-2 text-sm text-slate-400 flex justify-between">
                    <span>{editedContent.length} characters</span>
                    <span>{editedContent.split(/\s+/).filter(w => w.length > 0).length} words</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSavingEdit || !editedTitle.trim() || !editedContent.trim()}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSavingEdit ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSavingEdit}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 disabled:opacity-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => {
                  handleCancelEdit();
                  setActiveView('story');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ← Back to Story
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 backdrop-blur-md border-t border-teal-500/20 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-slate-300">
            <span>Powered by</span>
            <a 
              href="https://deepmind.google/technologies/gemini/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
            >
              Google Gemini
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://huggingface.co/CompVis/stable-diffusion-v1-5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
            >
              Hugging Face Stable Diffusion
            </a>
            <span className="hidden sm:inline">•</span>
            <span>Developed by</span>
            <a 
              href="https://github.com/mikesplore" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
            >
              Mike
            </a>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Learn, grow, and explore through AI-powered stories ✨
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
