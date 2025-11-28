import React, { useEffect, useRef, useState } from 'react';
import { ESTIMATED_SECONDS_PER_SCROLL } from '../constants';
import { ExternalLink, Pause, Play, AlertTriangle, Activity, Settings } from 'lucide-react';
import { Platform } from '../types';

interface BackgroundTrackerProps {
  count: number;
  limit: number;
  platform: Platform;
  onAddScrolls: (amount: number) => void;
  isLocked: boolean;
  onOpenSettings?: () => void;
}

const BackgroundTracker: React.FC<BackgroundTrackerProps> = ({ count, limit, platform, onAddScrolls, isLocked, onOpenSettings }) => {
  const [isRunning, setIsRunning] = useState(true);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    lastTickRef.current = Date.now();
  }, [isRunning, isLocked]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (isRunning && !isLocked) {
      interval = setInterval(() => {
        const now = Date.now();
        const msPerScroll = ESTIMATED_SECONDS_PER_SCROLL * 1000;
        const elapsed = now - lastTickRef.current;

        if (elapsed >= msPerScroll) {
          const scrollsToAdd = Math.floor(elapsed / msPerScroll);
          if (scrollsToAdd > 0) {
            onAddScrolls(scrollsToAdd);
            lastTickRef.current += (scrollsToAdd * msPerScroll);
          }
        }
      }, 1000); 
    }

    return () => clearInterval(interval);
  }, [isRunning, isLocked, onAddScrolls]);

  const percentage = Math.min((count / limit) * 100, 100);
  const remaining = Math.max(0, limit - count);

  const getPlatformColor = () => platform === 'TIKTOK' ? 'text-[#00f2ea]' : 'text-pink-500';
  const getPlatformBg = () => platform === 'TIKTOK' 
        ? 'bg-gradient-to-br from-[#111] to-[#050505] border-[#00f2ea]/20' 
        : 'bg-gradient-to-br from-[#1a0510] to-[#050505] border-pink-500/20';

  if (isLocked) {
      return (
          <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
              <div className="w-24 h-24 rounded-full bg-red-900/20 flex items-center justify-center mb-6 animate-pulse">
                  <AlertTriangle size={48} className="text-red-500" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Limit Reached</h1>
              <p className="text-gray-400 mb-8 max-w-xs mx-auto">You've hit your daily budget. Close {platform === 'TIKTOK' ? 'TikTok' : 'Instagram'} immediately.</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-gray-800 rounded-full font-medium hover:bg-gray-700 transition active:scale-95"
              >
                  Reset for Tomorrow
              </button>
          </div>
      )
  }

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className={`absolute top-0 left-0 w-full h-1 ${platform === 'TIKTOK' ? 'bg-gradient-to-r from-[#00f2ea] to-[#ff0050]' : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-purple-600'}`} />
      
      {/* Settings Button */}
      <button 
        onClick={onOpenSettings}
        className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
      >
        <Settings size={24} />
      </button>

      <div className={`w-full max-w-sm rounded-3xl border p-8 flex flex-col items-center relative z-10 shadow-2xl ${getPlatformBg()}`}>
        
        {/* Status Indicator */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
            <span className={`relative flex h-3 w-3`}>
              {isRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{isRunning ? 'Monitoring' : 'Paused'}</span>
        </div>

        <div className="mt-8 mb-8 relative">
             {/* Progress Circle SVG */}
            <svg className="w-56 h-56 -rotate-90 drop-shadow-2xl">
                <circle
                    className="text-gray-800/50"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="100"
                    cx="112"
                    cy="112"
                />
                <circle
                    className={getPlatformColor()}
                    strokeWidth="8"
                    strokeDasharray={628}
                    strokeDashoffset={628 - (628 * percentage) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="100"
                    cx="112"
                    cy="112"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-6xl font-bold block tracking-tighter">{count}</span>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Scrolls Used</span>
            </div>
        </div>

        <div className="flex flex-col items-center gap-1 mb-8">
            <div className="flex items-center gap-2 text-xl font-medium">
                <Activity size={20} className="text-gray-400" />
                <span>{remaining} left</span>
            </div>
            <p className="text-sm text-gray-500 font-mono">
                ~{(remaining * ESTIMATED_SECONDS_PER_SCROLL / 60).toFixed(1)}m screen time
            </p>
        </div>

        <div className="flex w-full gap-3">
            <button 
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 py-4 bg-gray-800 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700 active:scale-95 transition-all text-gray-200"
            >
                {isRunning ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Resume</>}
            </button>
            <a 
                href={platform === 'TIKTOK' ? 'https://www.tiktok.com' : 'https://www.instagram.com/reels'}
                target="_blank"
                rel="noreferrer"
                className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all text-black shadow-lg ${platform === 'TIKTOK' ? 'bg-[#00f2ea] shadow-[#00f2ea]/20' : 'bg-white shadow-white/20'}`}
            >
                Open App <ExternalLink size={20} />
            </a>
        </div>
      </div>
      
      <div className="mt-8 px-6 py-4 bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-sm max-w-sm text-center">
        <p className="text-xs text-gray-400 leading-relaxed">
           <strong className="text-gray-200">How it works:</strong> Keep this tab open in your browser background. We use a synchronized timer to track your usage while you scroll on the real app.
        </p>
      </div>
    </div>
  );
};

export default BackgroundTracker;