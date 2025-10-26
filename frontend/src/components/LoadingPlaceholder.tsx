import { Sparkles, CheckCircle, Loader2 } from 'lucide-react';

interface LoadingPlaceholderProps {
  isGeneratingQuiz: boolean;
}

export default function LoadingPlaceholder({ isGeneratingQuiz }: LoadingPlaceholderProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border border-teal-500/20 rounded-3xl p-8 md:p-12 shadow-2xl">
      <div className="text-center space-y-8">
        {/* Animated Icon */}
        <div className="relative mx-auto w-24 h-24 md:w-32 md:h-32">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 md:w-14 md:h-14 text-teal-400 animate-pulse" />
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-3">
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            {isGeneratingQuiz ? 'Adding Quiz & Flashcards...' : 'Crafting Your Story...'}
          </h3>
          <p className="text-slate-400 text-base md:text-lg max-w-md mx-auto">
            {isGeneratingQuiz 
              ? 'Creating interactive learning materials for your story'
              : 'Our AI is weaving a magical tale just for you'}
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-3 max-w-sm mx-auto">
          <div className="flex items-center gap-3 text-sm md:text-base">
            <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <span className="text-slate-300">Story created</span>
          </div>
          {isGeneratingQuiz && (
            <div className="flex items-center gap-3 text-sm md:text-base">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin flex-shrink-0" />
              <span className="text-slate-300">Generating quiz questions...</span>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
