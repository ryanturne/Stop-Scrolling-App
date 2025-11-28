import React, { useState, useEffect } from 'react';
import { DEFAULT_DAILY_LIMIT } from '../constants';
import { Smartphone, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import { AppMode, Platform } from '../types';

interface SetupProps {
  onComplete: (limit: number, mode: AppMode, platform: Platform) => void;
}

const Setup: React.FC<SetupProps> = ({ onComplete }) => {
  const [limit, setLimit] = useState(DEFAULT_DAILY_LIMIT);
  const [mode, setMode] = useState<AppMode>('SIMULATION');
  const [platform, setPlatform] = useState<Platform>('TIKTOK');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStart = async () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
    onComplete(limit, mode, platform);
  };

  return (
    <div className={`min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 text-center overflow-y-auto transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mb-6 p-6 bg-gray-900/50 rounded-full ring-1 ring-gray-800 shadow-2xl backdrop-blur-sm">
        <Smartphone size={56} className={`transition-colors duration-500 ${platform === 'TIKTOK' ? "text-cyan-400" : "text-pink-500"}`} />
      </div>
      
      <h1 className="text-4xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-600">
        ScrollDiet
      </h1>
      
      <p className="text-gray-400 mb-10 max-w-xs text-sm font-medium leading-relaxed">
        Regain control of your attention span. Set a budget, stick to it.
      </p>

      <div className="w-full max-w-sm bg-gray-900/40 p-6 rounded-3xl border border-gray-800/50 space-y-8 backdrop-blur-md shadow-xl">
        
        {/* Platform Selector */}
        <div className="space-y-3">
           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Choose Platform</label>
           <div className="flex bg-gray-800/50 p-1 rounded-xl">
              <button 
                onClick={() => setPlatform('TIKTOK')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${platform === 'TIKTOK' ? 'bg-[#2a2a2a] text-[#00f2ea] shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                TikTok
              </button>
              <button 
                onClick={() => setPlatform('INSTAGRAM')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${platform === 'INSTAGRAM' ? 'bg-[#2a2a2a] text-pink-500 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Instagram
              </button>
           </div>
        </div>

        {/* Limit Setter */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Daily Budget
          </label>
          <div className="flex items-center justify-between px-4 bg-black/20 rounded-2xl py-2">
            <button 
              onClick={() => setLimit(Math.max(5, limit - 5))}
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 flex items-center justify-center text-xl font-bold transition-colors"
            >
              -
            </button>
            <div className="flex flex-col items-center">
                <span className="text-3xl font-bold font-mono text-white">{limit}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Scrolls</span>
            </div>
            <button 
               onClick={() => setLimit(limit + 5)}
               className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-gray-600 flex items-center justify-center text-xl font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-3">
           <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Mode</label>
           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setMode('SIMULATION')}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${mode === 'SIMULATION' ? 'border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-gray-800 bg-gray-800/20 hover:bg-gray-800/40'}`}
              >
                <PlayCircle size={28} className={`transition-colors ${mode === 'SIMULATION' ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                <span className={`text-xs font-bold ${mode === 'SIMULATION' ? 'text-white' : 'text-gray-500'}`}>Simulator</span>
              </button>
              <button 
                onClick={() => setMode('TRACKER')}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group ${mode === 'TRACKER' ? 'border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'border-gray-800 bg-gray-800/20 hover:bg-gray-800/40'}`}
              >
                <Clock size={28} className={`transition-colors ${mode === 'TRACKER' ? 'text-green-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                <span className={`text-xs font-bold ${mode === 'TRACKER' ? 'text-white' : 'text-gray-500'}`}>Background</span>
              </button>
           </div>
        </div>

        <button 
          onClick={handleStart}
          className={`w-full py-4 rounded-2xl font-bold text-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg ${
            platform === 'TIKTOK' 
              ? 'bg-gradient-to-r from-[#00f2ea] to-[#ff0050] text-white shadow-[#00f2ea]/20' 
              : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-600 text-white shadow-orange-500/20'
          }`}
        >
          Start Diet <CheckCircle size={20} />
        </button>
      </div>
      
      <div className="mt-8 text-xs text-gray-600 font-medium">
        v1.0.0 • Production Ready
      </div>
    </div>
  );
};

export default Setup;