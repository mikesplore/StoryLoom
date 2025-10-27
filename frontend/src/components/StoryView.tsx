import { BookOpen, Loader2, Volume2, VolumeX, Pause, Play, Languages, GraduationCap, Save, Trash2, Sparkles } from 'lucide-react';
import type { StoryWithQuiz, User } from '../types';

interface StoryViewProps {
  currentStory: StoryWithQuiz;
  coverImage: string | null;
  isGeneratingImage: boolean;
  selectedLanguage: string;
  translatedStory: string;
  isSpeaking: boolean;
  isPaused: boolean;
  showVoiceSettings: boolean;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  speechRate: number;
  isGeneratingFlashcards: boolean;
  currentUser: User | null;
  currentLoadedStoryId: number | null;
  isSavingStory: boolean;
  handleSpeak: () => void;
  handleStopSpeaking: () => void;
  setShowVoiceSettings: (show: boolean) => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  setSpeechRate: (rate: number) => void;
  handleStartQuiz: () => void;
  handleGenerateFlashcards: () => void;
  handleDeleteStoryFromView: () => void;
  handleSaveStory: () => void;
  handleNewStory: () => void;
}

export default function StoryView({
  currentStory,
  coverImage,
  isGeneratingImage,
  selectedLanguage,
  translatedStory,
  isSpeaking,
  isPaused,
  showVoiceSettings,
  availableVoices,
  selectedVoice,
  speechRate,
  isGeneratingFlashcards,
  currentUser,
  currentLoadedStoryId,
  isSavingStory,
  handleSpeak,
  handleStopSpeaking,
  setShowVoiceSettings,
  setSelectedVoice,
  setSpeechRate,
  handleStartQuiz,
  handleGenerateFlashcards,
  handleDeleteStoryFromView,
  handleSaveStory,
  handleNewStory,
}: StoryViewProps) {
  return (
    <div className="w-full sm:max-w-5xl sm:mx-auto sm:px-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border-0 sm:border border-teal-500/20 rounded-none sm:rounded-2xl p-3 sm:p-6 md:p-8">
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
            <p key={idx} className="text-slate-200 text-base sm:text-lg leading-relaxed mb-6">
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
              className="flex-1 min-w-[200px] group bg-gradient-to-r from-green-600 to-blue-600 px-4 py-3.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/40 transition-all hover:scale-[1.02] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                <button 
                  onClick={handleDeleteStoryFromView}
                  className="group bg-slate-800 border border-red-500/30 hover:border-red-500 px-4 py-3.5 rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span className="font-semibold text-red-400 text-sm">Remove from Library</span>
                </button>
              ) : (
                <button 
                  onClick={handleSaveStory}
                  disabled={isSavingStory || !!currentLoadedStoryId}
                  className="group bg-slate-800 border border-emerald-500/30 hover:border-emerald-500 px-4 py-3.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  title={currentLoadedStoryId ? 'Already saved' : undefined}
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
  );
}
