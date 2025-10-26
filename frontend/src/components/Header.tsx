import { BookOpen, Library, LogIn, LogOut, UserPlus, Menu, X, Languages, Loader2 } from 'lucide-react';
import type { User, StoryWithQuiz, ViewType } from '../types';

interface HeaderProps {
  currentUser: User | null;
  currentStory: StoryWithQuiz | null;
  selectedLanguage: string;
  availableLanguages: Record<string, string>;
  isTranslating: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  setActiveView: (view: ViewType) => void;
  handleNewStory: () => void;
  handleLoadLibrary: () => void;
  handleLogout: () => void;
  handleGlobalTranslation: (language: string) => void;
}

export default function Header({
  currentUser,
  currentStory,
  selectedLanguage,
  availableLanguages,
  isTranslating,
  menuOpen,
  setMenuOpen,
  setActiveView,
  handleNewStory,
  handleLoadLibrary,
  handleLogout,
  handleGlobalTranslation
}: HeaderProps) {
  return (
    <header className="bg-slate-900/50 backdrop-blur-md border-b border-teal-500/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-slate-900" />
            </div>
            <button
              onClick={handleNewStory}
              className="text-2xl font-bold text-white hover:text-teal-300 transition-colors focus:outline-none"
              style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
              aria-label="Go to Home"
            >
              StoryLoom
            </button>
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
              <div className="flex items-center gap-4">
                <span className="text-slate-300 text-sm font-medium">Hi, {currentUser.username}!</span>
                <button 
                  onClick={() => setActiveView('profile')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600 text-teal-300 hover:text-white rounded-lg transition-all text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all text-sm"
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
              <>
                <button onClick={() => {handleLoadLibrary(); setMenuOpen(false);}} className="text-teal-300 hover:text-teal-200 transition-colors text-left flex items-center gap-1">
                  <Library className="w-4 h-4" />
                  My Library
                </button>
                <button 
                  onClick={() => {setActiveView('profile'); setMenuOpen(false);}}
                  className="text-teal-300 hover:text-teal-200 transition-colors text-left flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  Profile
                </button>
              </>
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
  );
}
