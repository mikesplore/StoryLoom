import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Play, CheckCircle, XCircle, RotateCcw, Menu, X, Loader2, GraduationCap, Languages, FlipHorizontal, Volume2, VolumeX, Pause } from 'lucide-react';
import { storyApi } from './services/api';
import type { Theme, StoryWithQuiz, ViewType, AgeGroup, AgeGroupInfo, Flashcard } from './types';

export default function StoryLoom() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<StoryWithQuiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  
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
          summary: story.content.substring(0, 200), // First 200 chars as summary
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
      if (coverImageResult.error) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
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
              <button className="text-slate-300 hover:text-white transition-colors">About</button>
              
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
              <button className="text-slate-300 hover:text-white transition-colors text-left">About</button>
              
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-teal-500/20">
                <button 
                  onClick={handleStartQuiz}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all inline-flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Take Quiz
                </button>
                <button 
                  onClick={handleGenerateFlashcards}
                  disabled={isGeneratingFlashcards}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingFlashcards ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <GraduationCap className="w-5 h-5" />
                  )}
                  Learn Words
                </button>
                <button 
                  onClick={handleNewStory}
                  className="flex-1 bg-slate-700/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-all"
                >
                  New Story
                </button>
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

            <div className="perspective-1000">
              <div 
                onClick={flipFlashcard}
                className={`relative bg-slate-800/50 backdrop-blur-sm border-2 border-teal-500/20 rounded-2xl p-8 cursor-pointer transition-all duration-500 transform hover:scale-105 ${showFlashcardAnswer ? 'rotate-y-180' : ''}`}
                style={{ minHeight: '300px', transformStyle: 'preserve-3d' }}
              >
                {!showFlashcardAnswer ? (
                  <div className="text-center">
                    <FlipHorizontal className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                    <h3 className="text-4xl font-bold text-white mb-4">
                      {selectedLanguage !== 'en' && translatedFlashcards.length > 0
                        ? translatedFlashcards[currentFlashcardIndex].word
                        : flashcards[currentFlashcardIndex].word}
                    </h3>
                    <p className="text-slate-400">Click to see meaning</p>
                  </div>
                ) : (
                  <div className="text-center transform rotate-y-180">
                    <div className="mb-6">
                      <h4 className="text-teal-300 font-semibold mb-2">Meaning:</h4>
                      <p className="text-xl text-white mb-4">
                        {selectedLanguage !== 'en' && translatedFlashcards.length > 0
                          ? translatedFlashcards[currentFlashcardIndex].definition
                          : flashcards[currentFlashcardIndex].definition}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-cyan-300 font-semibold mb-2">Example:</h4>
                      <p className="text-lg text-slate-300 italic">
                        "{selectedLanguage !== 'en' && translatedFlashcards.length > 0
                          ? translatedFlashcards[currentFlashcardIndex].example
                          : flashcards[currentFlashcardIndex].example}"
                      </p>
                    </div>
                  </div>
                )}
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
