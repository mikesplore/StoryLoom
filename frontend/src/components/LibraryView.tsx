import { Loader2, Library, Sparkles, BookOpen, Trash2 } from 'lucide-react';
import type { SavedStory } from '../types';

interface LibraryViewProps {
  isLoadingLibrary: boolean;
  savedStories: SavedStory[];
  handleNewStory: () => void;
  handleLoadSavedStory: (storyId: number) => void;
  handleDeleteStory: (storyId: number) => void;
}

export default function LibraryView({
  isLoadingLibrary,
  savedStories,
  handleNewStory,
  handleLoadSavedStory,
  handleDeleteStory,
}: LibraryViewProps) {
  return (
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
  );
}
