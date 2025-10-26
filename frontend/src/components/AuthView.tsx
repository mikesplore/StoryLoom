import { LogIn, UserPlus, Key, X, Loader2 } from 'lucide-react';

interface AuthViewProps {
  activeView: 'login' | 'register';
  authError: string | null;
  loginUsername: string;
  loginPassword: string;
  registerUsername: string;
  registerEmail: string;
  registerPassword: string;
  isAuthenticating: boolean;
  showPasswordRecovery: boolean;
  recoveryEmail: string;
  isRecovering: boolean;
  setLoginUsername: (value: string) => void;
  setLoginPassword: (value: string) => void;
  setRegisterUsername: (value: string) => void;
  setRegisterEmail: (value: string) => void;
  setRegisterPassword: (value: string) => void;
  setShowPasswordRecovery: (show: boolean) => void;
  setRecoveryEmail: (value: string) => void;
  setActiveView: (view: 'login' | 'register' | 'home') => void;
  handleLogin: (e: React.FormEvent) => void;
  handleRegister: (e: React.FormEvent) => void;
  handlePasswordRecovery: (e: React.FormEvent) => void;
  handleNewStory: () => void;
}

export default function AuthView({
  activeView,
  authError,
  loginUsername,
  loginPassword,
  registerUsername,
  registerEmail,
  registerPassword,
  isAuthenticating,
  showPasswordRecovery,
  recoveryEmail,
  isRecovering,
  setLoginUsername,
  setLoginPassword,
  setRegisterUsername,
  setRegisterEmail,
  setRegisterPassword,
  setShowPasswordRecovery,
  setRecoveryEmail,
  setActiveView,
  handleLogin,
  handleRegister,
  handlePasswordRecovery,
  handleNewStory,
}: AuthViewProps) {
  if (activeView === 'login') {
    return (
      <>
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
      </>
    );
  }

  // Register View
  return (
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
  );
}
