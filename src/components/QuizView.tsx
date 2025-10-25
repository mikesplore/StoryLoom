import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import type { StoryWithQuiz } from '../types';

interface QuizViewProps {
  currentStory: StoryWithQuiz;
  currentQuestion: number;
  selectedAnswer: number | null;
  showResult: boolean;
  score: number;
  selectedLanguage: string;
  translatedQuiz: Array<{question: string, options: string[]}>;
  isResultsView: boolean;
  handleAnswerSelect: (index: number) => void;
  handleSubmitAnswer: () => void;
  handleNextQuestion: () => void;
  handleRetry: () => void;
  handleNewStory: () => void;
}

export default function QuizView({
  currentStory,
  currentQuestion,
  selectedAnswer,
  showResult,
  score,
  selectedLanguage,
  translatedQuiz,
  isResultsView,
  handleAnswerSelect,
  handleSubmitAnswer,
  handleNextQuestion,
  handleRetry,
  handleNewStory,
}: QuizViewProps) {
  if (isResultsView) {
    // Results View
    return (
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
    );
  }

  // Quiz View
  return (
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
  );
}
