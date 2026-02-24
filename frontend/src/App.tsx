import SimCanvas from './components/SimCanvas';
import Legend from './components/Legend';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1530 50%, #0a0f1e 100%)' }}>
      {/* Header */}
      <header className="flex-shrink-0 border-b border-white/5" style={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                <line x1="12" y1="12" x2="12" y2="16"/>
                <line x1="10" y1="14" x2="14" y2="14"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">SwarmBots</h1>
              <p className="text-xs text-gray-400 leading-none mt-0.5">Fleet Management Simulator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-gray-400">Live Simulation</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4">
        {/* Instructions */}
        <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-500 max-w-2xl">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded text-gray-400 border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>Left Click</kbd>
            Select / Set destination
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded text-gray-400 border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>Right Click</kbd>
            AGV actions
          </span>
        </div>

        {/* Canvas */}
        <SimCanvas />

        {/* Legend */}
        <Legend />
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-white/5 py-3">
        <p className="text-center text-xs text-gray-600">
          © 2024 SwarmBots ·{' '}
          <a href="https://swarmbots.herokuapp.com/" className="text-gray-500 hover:text-gray-400 transition-colors">
            swarmbots.herokuapp.com
          </a>
        </p>
      </footer>
    </div>
  );
}
