import { BookOpen, Award, Library, Home, Sparkles, UserPlus } from 'lucide-react';
import type { User, UserStats, ViewType } from '../types';

interface ProfileViewProps {
  currentUser: User;
  userStats: UserStats;
  setActiveView: (view: ViewType) => void;
  handleLoadLibrary: () => void;
}

export default function ProfileView({
  currentUser,
  userStats,
  setActiveView,
  handleLoadLibrary,
}: ProfileViewProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg shadow-teal-500/30">
          <UserPlus className="w-10 h-10 text-slate-900" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-2">Welcome back, {currentUser.username}!</h2>
        <p className="text-slate-400 text-lg">{currentUser.email}</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stories Generated */}
        <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-6 border border-teal-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-teal-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{userStats.storiesGenerated}</div>
              <div className="text-sm text-slate-400">Stories</div>
            </div>
          </div>
          <div className="text-sm text-slate-300">Stories Generated</div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
            <div className="bg-gradient-to-r from-teal-400 to-cyan-400 h-2 rounded-full" style={{width: `${Math.min(100, (userStats.storiesGenerated / 50) * 100)}%`}}></div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl p-6 border border-orange-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{userStats.currentStreak}</div>
              <div className="text-sm text-slate-400">Days</div>
            </div>
          </div>
          <div className="text-sm text-slate-300">Current Streak</div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
            <div className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full" style={{width: `${Math.min(100, (userStats.currentStreak / 30) * 100)}%`}}></div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-md rounded-2xl p-6 border border-amber-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{userStats.longestStreak}</div>
              <div className="text-sm text-slate-400">Best</div>
            </div>
          </div>
          <div className="text-sm text-slate-300">Longest Streak</div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-400 h-2 rounded-full" style={{width: `${Math.min(100, (userStats.longestStreak / 100) * 100)}%`}}></div>
          </div>
        </div>

        {/* Saved Stories */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Library className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{userStats.totalStoriesSaved}</div>
              <div className="text-sm text-slate-400">Saved</div>
            </div>
          </div>
          <div className="text-sm text-slate-300">Stories Saved</div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full" style={{width: `${Math.min(100, (userStats.totalStoriesSaved / 20) * 100)}%`}}></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-teal-500/20 shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-teal-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 rounded-xl border border-teal-500/30 transition-all text-left"
          >
            <BookOpen className="w-5 h-5 text-teal-400" />
            <div>
              <div className="text-white font-semibold">Create Story</div>
              <div className="text-slate-400 text-sm">Generate a new AI story</div>
            </div>
          </button>
          <button 
            onClick={() => handleLoadLibrary()}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-xl border border-purple-500/30 transition-all text-left"
          >
            <Library className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-white font-semibold">My Library</div>
              <div className="text-slate-400 text-sm">View saved stories</div>
            </div>
          </button>
          <button 
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-500/20 to-slate-600/20 hover:from-slate-500/30 hover:to-slate-600/30 rounded-xl border border-slate-500/30 transition-all text-left"
          >
            <Home className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-white font-semibold">Back Home</div>
              <div className="text-slate-400 text-sm">Return to main page</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
