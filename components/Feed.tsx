import React, { useEffect, useState, useRef, useCallback } from 'react';
import { PostData, Platform } from '../types';
import { generatePosts } from '../services/geminiService';
import Post from './Post';
import { Lock, RefreshCw } from 'lucide-react';

interface FeedProps {
  onAddScrolls: () => void;
  count: number;
  limit: number;
  isLocked: boolean;
  platform: Platform;
}

const Feed: React.FC<FeedProps> = ({ onAddScrolls, count, limit, isLocked, platform }) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const viewedPostsRef = useRef<Set<string>>(new Set());

  // Initial Load
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      const newPosts = await generatePosts(5);
      setPosts(newPosts);
      setLoading(false);
    };
    loadInitial();
  }, []);

  // Load More Logic
  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const newPosts = await generatePosts(3);
    setPosts(prev => [...prev, ...newPosts]);
    setLoading(false);
  }, [loading]);

  // Scroll Tracking
  useEffect(() => {
    const options = {
      root: containerRef.current,
      threshold: 0.7, 
    };

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const postId = entry.target.getAttribute('data-post-id');
          if (postId && !viewedPostsRef.current.has(postId)) {
            viewedPostsRef.current.add(postId);
            onAddScrolls();
            
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            if (index >= posts.length - 2) {
              loadMore();
            }
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(callback, options);
    const elements = document.querySelectorAll('.feed-post');
    elements.forEach(el => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [posts, onAddScrolls, loadMore]);

  if (isLocked) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/95 text-center p-8 z-50 animate-in fade-in duration-500">
        <div className="p-6 bg-red-900/30 rounded-full mb-6 animate-pulse">
           <Lock size={64} className="text-red-500" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Daily Limit Reached</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-xs mx-auto leading-relaxed">
          You've viewed {limit} {platform === 'TIKTOK' ? 'TikToks' : 'Reels'}.<br/>
          Great job sticking to your budget.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-8 py-3 border border-gray-700 text-gray-300 rounded-full hover:bg-gray-800 active:scale-95 transition-all text-sm font-medium flex items-center gap-2"
        >
          <RefreshCw size={16} /> Reset Session
        </button>
      </div>
    );
  }

  // Live Count Bubble Color
  const getBubbleColor = () => {
    const ratio = count / limit;
    if (ratio >= 0.8) return 'bg-red-600/90 text-white animate-pulse shadow-red-900/50';
    if (ratio >= 0.5) return 'bg-orange-500/90 text-white shadow-orange-900/50';
    return platform === 'TIKTOK' 
      ? 'bg-[#00f2ea]/90 text-black shadow-[#00f2ea]/30' 
      : 'bg-white/90 text-black shadow-white/30';
  }

  return (
    <div className="relative h-screen w-full bg-black">
      {/* Live Counter Overlay - Positioned safely for mobile */}
      <div className={`fixed top-16 right-4 z-40 px-4 py-2 rounded-full font-bold shadow-lg backdrop-blur-md transition-all duration-300 border border-white/10 ${getBubbleColor()}`}>
        <span className="text-xs uppercase tracking-wider opacity-80 mr-2">Count</span>
        <span className="text-lg font-mono">{count}</span>
        <span className="text-xs opacity-75 ml-1">/ {limit}</span>
      </div>

      <div 
        ref={containerRef}
        className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-black"
      >
        {posts.map((post, index) => (
          <div 
            key={post.id} 
            data-post-id={post.id}
            data-index={index}
            className="feed-post h-screen w-full snap-start"
          >
            <Post post={post} isActive={true} />
          </div>
        ))}
        
        {loading && (
          <div className="h-screen w-full snap-start flex flex-col items-center justify-center bg-gray-900 text-gray-500 gap-4">
             <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-current"></div>
             <p className="text-xs font-medium tracking-widest uppercase">Curating Content</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;