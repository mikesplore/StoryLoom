import { FlipHorizontal } from 'lucide-react';
import type { Flashcard } from '../types';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  currentFlashcardIndex: number;
  showFlashcardAnswer: boolean;
  selectedLanguage: string;
  translatedFlashcards: Flashcard[];
  flipFlashcard: () => void;
  nextFlashcard: () => void;
  prevFlashcard: () => void;
  onBackToStory: () => void;
}

export default function FlashcardsView({
  flashcards,
  currentFlashcardIndex,
  showFlashcardAnswer,
  selectedLanguage,
  translatedFlashcards,
  flipFlashcard,
  nextFlashcard,
  prevFlashcard,
  onBackToStory,
}: FlashcardsViewProps) {
  if (flashcards.length === 0) {
    return null;
  }

  return (
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
          onClick={onBackToStory}
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
  );
}
