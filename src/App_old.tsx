import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Play, CheckCircle, XCircle, RotateCcw, Menu, X, Loader2 } from 'lucide-react';
import { storyApi } from './services/api';
import type { Theme, StoryWithQuiz, ViewType } from './types';

export default function StoryLoom() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<StoryWithQuiz | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  
  // Story generation form state
  const [selectedTheme, setSelectedTheme] = useState<Theme>('Mystery');
  const [customPrompt, setCustomPrompt] = useState('');
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available themes on mount
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const themes = await storyApi.getThemes();
        setAvailableThemes(themes);
      } catch (err) {
        console.error('Failed to fetch themes:', err);
        // Use default themes if API fails
        setAvailableThemes([
          'Mystery', 'Comedy', 'Adventure', 'Science Fiction',
          'Fantasy', 'Horror', 'Romance', 'Thriller',
          'Historical', 'Drama'
        ]);
      }
    };
    fetchThemes();
  }, []);

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const story = await storyApi.generateStory({
        theme: selectedTheme,
        prompt: customPrompt.trim() || undefined,
      });
      
      // Generate quiz for the story
      setIsGeneratingQuiz(true);
      const quiz = await storyApi.generateQuiz({
        title: story.title,
        content: story.content,
      });
      
      setCurrentStory({
        ...story,
        questions: quiz.questions,
      });
      
      setActiveView('story');
      setQuizStarted(false);
      setCurrentQuestion(0);
      setScore(0);
      setCustomPrompt('');
    } catch (err: any) {
      console.error('Error generating story:', err);
      setError(err.response?.data?.error || 'Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
      setIsGeneratingQuiz(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
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
    setQuizStarted(false);
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
            <nav className="hidden md:flex gap-6">
              <button onClick={handleNewStory} className="text-teal-300 hover:text-teal-200 transition-colors">Home</button>
              <button className="text-slate-300 hover:text-white transition-colors">Library</button>
              <button className="text-slate-300 hover:text-white transition-colors">About</button>
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
              <button className="text-slate-300 hover:text-white transition-colors text-left">Library</button>
              <button className="text-slate-300 hover:text-white transition-colors text-left">About</button>
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
                Generate unique AI-powered stories and test your comprehension with interactive quizzes. Learn while you read.
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

                {/* Theme Selection */}
                <div className="mb-6">
                  <label className="block text-teal-300 font-semibold mb-3">Select a Theme</label>
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
                    Custom Prompt <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe what you want in your story... (e.g., 'A detective solving a mystery in a futuristic city')"
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
                      {isGeneratingQuiz ? 'Generating Quiz...' : 'Generating Story...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Story
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/40 transition-all">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI-Generated Stories</h3>
                <p className="text-slate-400">Unique narratives crafted by advanced AI, tailored to your interests</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/40 transition-all">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Interactive Quizzes</h3>
                <p className="text-slate-400">Test your understanding with questions about each story</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 hover:border-teal-500/40 transition-all">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Learn & Grow</h3>
                <p className="text-slate-400">Improve reading comprehension while enjoying great stories</p>
              </div>
            </div>
          </div>
        )}

        {/* Story View */}
        {activeView === 'story' && currentStory && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-6 sm:p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-sm font-medium">
                  {currentStory.genre}
                </span>
                <span className="text-slate-400 text-sm">{currentStory.readTime}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">{currentStory.title}</h2>
              
              <div className="prose prose-invert max-w-none mb-8">
                {currentStory.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-slate-300 text-lg leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-teal-500/20">
                <button 
                  onClick={handleStartQuiz}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all inline-flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Take Quiz
                </button>
                <button 
                  onClick={handleNewStory}
                  className="flex-1 bg-slate-700/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-all"
                >
                  Back to Home
                </button>
              </div>
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
                {currentStory.questions[currentQuestion].question}
              </h3>

              <div className="space-y-3 mb-6">
                {currentStory.questions[currentQuestion].options.map((option, idx) => (
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
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all"
                >
                  {currentQuestion < currentStory.questions.length - 1 ? 'Next Question' : 'View Results'}
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
                You scored {score} out of {currentStory.questions.length}
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
                  Retry Quiz
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
