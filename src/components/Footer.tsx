export default function Footer() {
  return (
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
          <a
            href="https://huggingface.co/CompVis/stable-diffusion-v1-5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
          >
            Hugging Face Stable Diffusion
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
  );
}
