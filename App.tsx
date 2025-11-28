import React, { useState, useEffect, useCallback } from 'react';
import Setup from './components/Setup';
import Feed from './components/Feed';
import ProgressBar from './components/ProgressBar';
import ToastContainer from './components/Toast';
import BackgroundTracker from './components/BackgroundTracker';
import { ScrollState, ToastMessage, ToastType, AppMode, Platform } from './types';
import { STORAGE_KEY } from './constants';
import { Settings, X, Save, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [scrollState, setScrollState] = useState<ScrollState | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [editLimit, setEditLimit] = useState(50);

  // Load state from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: ScrollState = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        
        if (parsed.lastResetDate !== today) {
           setScrollState({
             count: 0,
             limit: parsed.limit,
             lastResetDate: today,
             mode: parsed.mode || 'SIMULATION',
             platform: parsed.platform || 'TIKTOK'
           });
        } else {
          setScrollState(parsed);
          setEditLimit(parsed.limit);
        }
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (scrollState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scrollState));
      document.title = `(${scrollState.count}/${scrollState.limit}) ScrollDiet`;
    }
  }, [scrollState]);

  const addToast = useCallback((message: string, type: ToastType = ToastType.INFO) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const sendSystemNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  const handleSetupComplete = (limit: number, mode: AppMode, platform: Platform) => {
    const today = new Date().toISOString().split('T')[0];
    setScrollState({
      count: 0,
      limit,
      lastResetDate: today,
      mode,
      platform
    });
    setEditLimit(limit);
    addToast(`Goal set: ${limit} ${platform === 'TIKTOK' ? 'TikToks' : 'Reels'}!`, ToastType.SUCCESS);
  };

  const handleAddScrolls = useCallback((amount: number) => {
    setScrollState(prev => {
      if (!prev) return null;
      if (prev.count >= prev.limit) return prev; 

      const currentCount = prev.count;
      const newCount = currentCount + amount;
      const limit = prev.limit;

      const half = Math.floor(limit * 0.5);
      if (currentCount < half && newCount >= half) {
         const msg = "Halfway there! 50% of your daily limit used.";
         addToast(msg, ToastType.WARNING);
         sendSystemNotification("ScrollDiet Alert", msg);
      }
      
      const eighty = Math.floor(limit * 0.8);
      if (currentCount < eighty && newCount >= eighty) {
         const msg = "Slow down! Only 20% scrolls remaining.";
         addToast(msg, ToastType.WARNING);
         sendSystemNotification("ScrollDiet Warning", msg);
      }

      if (currentCount < limit && newCount >= limit) {
         const msg = "That's it! You've reached your daily limit.";
         addToast(msg, ToastType.DANGER);
         sendSystemNotification("ScrollDiet Limit Reached", "Stop scrolling now!");
      }

      return { ...prev, count: newCount }; 
    });
  }, [addToast]);

  const saveSettings = () => {
    if (scrollState) {
      setScrollState({ ...scrollState, limit: editLimit });
      setShowSettings(false);
      addToast("Daily limit updated!", ToastType.SUCCESS);
    }
  };

  const manualReset = () => {
    if (confirm("Are you sure you want to reset your progress for today?")) {
       setScrollState(prev => prev ? ({ ...prev, count: 0 }) : null);
       setShowSettings(false);
       addToast("Progress reset.", ToastType.INFO);
    }
  };

  if (!scrollState) {
    return <Setup onComplete={handleSetupComplete} />;
  }

  const isLocked = scrollState.count >= scrollState.limit;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-sans">
      <ProgressBar current={scrollState.count} limit={scrollState.limit} />
      
      {/* Settings Button Overlay for Feed */}
      {scrollState.mode === 'SIMULATION' && !isLocked && (
        <button 
          onClick={() => setShowSettings(true)}
          className="fixed top-16 left-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-colors border border-white/10"
        >
          <Settings size={20} />
        </button>
      )}

      {scrollState.mode === 'SIMULATION' ? (
        <Feed 
          onAddScrolls={() => handleAddScrolls(1)} 
          count={scrollState.count}
          limit={scrollState.limit}
          isLocked={isLocked}
          platform={scrollState.platform}
        />
      ) : (
        <BackgroundTracker 
          count={scrollState.count} 
          limit={scrollState.limit} 
          platform={scrollState.platform}
          onAddScrolls={handleAddScrolls}
          isLocked={isLocked}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-gray-900 w-full max-w-sm rounded-3xl p-6 border border-gray-800 shadow-2xl relative">
             <button 
               onClick={() => setShowSettings(false)}
               className="absolute top-4 right-4 text-gray-400 hover:text-white"
             >
               <X size={24} />
             </button>
             
             <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <Settings size={20} className="text-gray-400" /> Settings
             </h2>

             <div className="space-y-6">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Edit Daily Budget</label>
                   <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-gray-700">
                      <button onClick={() => setEditLimit(Math.max(5, editLimit - 5))} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-xl font-bold hover:bg-gray-700">-</button>
                      <span className="text-2xl font-mono font-bold text-white">{editLimit}</span>
                      <button onClick={() => setEditLimit(editLimit + 5)} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-xl font-bold hover:bg-gray-700">+</button>
                   </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                   <button 
                     onClick={manualReset}
                     className="w-full py-3 bg-red-900/20 text-red-400 rounded-xl font-semibold border border-red-900/50 hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                   >
                     <RotateCcw size={18} /> Reset Today's Progress
                   </button>
                </div>

                <button 
                  onClick={saveSettings}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  <Save size={20} /> Save Changes
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;