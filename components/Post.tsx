import React, { useState, useEffect, useRef } from 'react';
import { PostData } from '../types';
import { Heart, MessageCircle, Share2, Music2, MoreHorizontal } from 'lucide-react';

interface PostProps {
  post: PostData;
  isActive: boolean;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

const Post: React.FC<PostProps> = ({ post, isActive }) => {
  const [liked, setLiked] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const lastClickTime = useRef<number>(0);

  // Reset state when post changes
  useEffect(() => {
    setLiked(false);
    setFloatingHearts([]);
  }, [post.id]);

  const triggerLike = () => {
    if (!liked) {
      setLiked(true);
      // Optional: Add haptic feedback if available in a real PWA context
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime.current;
    
    if (timeDiff < 300) {
      // Double tap detected
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newHeart = { id: Date.now(), x, y };
      setFloatingHearts(prev => [...prev, newHeart]);
      triggerLike();
      
      // Cleanup heart after animation
      setTimeout(() => {
        setFloatingHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 800);
    }
    
    lastClickTime.current = currentTime;
  };

  return (
    <div 
      className="relative w-full h-full snap-start flex-shrink-0 bg-gray-900 overflow-hidden select-none"
      onClick={handleInteraction}
    >
      {/* Background Image (Simulated Video) */}
      <div className="absolute inset-0">
        <img 
          src={post.imageUrl} 
          alt={post.caption}
          className="w-full h-full object-cover opacity-90"
          loading="lazy"
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* Floating Hearts Animation */}
      {floatingHearts.map(heart => (
        <div 
          key={heart.id}
          className="absolute animate-float-heart pointer-events-none z-30"
          style={{ left: heart.x, top: heart.y }}
        >
          <Heart size={80} className="fill-white text-white drop-shadow-lg" />
        </div>
      ))}

      {/* Right Sidebar Interactions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 z-20">
        <div className="flex flex-col items-center space-y-1">
          <div className="relative cursor-pointer transition-transform active:scale-90">
             <div className="w-12 h-12 rounded-full border-2 border-white p-0.5 overflow-hidden bg-black">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`} alt="avatar" className="w-full h-full object-cover" />
             </div>
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pink-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white">+</div>
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="flex flex-col items-center space-y-1 group active:scale-75 transition-transform"
        >
          <Heart 
            size={32} 
            className={`transition-all duration-300 drop-shadow-md ${liked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`} 
            strokeWidth={liked ? 0 : 2}
          />
          <span className="text-white text-xs font-semibold shadow-black drop-shadow-md">
            {new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(liked ? post.likes + 1 : post.likes)}
          </span>
        </button>

        <button className="flex flex-col items-center space-y-1 active:scale-75 transition-transform">
          <MessageCircle size={32} className="text-white drop-shadow-md" />
          <span className="text-white text-xs font-semibold shadow-black drop-shadow-md">
            {new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(post.comments)}
          </span>
        </button>

        <button className="flex flex-col items-center space-y-1 active:scale-75 transition-transform">
          <Share2 size={32} className="text-white drop-shadow-md" />
          <span className="text-white text-xs font-semibold shadow-black drop-shadow-md">Share</span>
        </button>

         <button className="flex flex-col items-center space-y-1 active:scale-75 transition-transform">
          <MoreHorizontal size={32} className="text-white drop-shadow-md" />
        </button>
      </div>

      {/* Bottom Content Info */}
      <div className="absolute left-4 bottom-6 right-16 z-20 text-white pointer-events-none">
        <div className="flex items-center space-x-2 mb-2">
          <h3 className="font-bold text-lg drop-shadow-md shadow-black">@{post.username}</h3>
          <span className="text-gray-300 text-sm shadow-black drop-shadow-sm">• 1d ago</span>
        </div>
        
        <p className="text-sm mb-3 leading-snug drop-shadow-md shadow-black line-clamp-3 font-medium">
          {post.caption}
        </p>

        <div className="flex items-center space-x-2">
          <div className="bg-white/20 p-1 rounded-full animate-spin-slow">
             <Music2 size={12} />
          </div>
          <div className="overflow-hidden w-40">
            <span className="text-xs font-medium whitespace-nowrap animate-marquee block">
              {post.musicTrack || 'Original Audio'} &nbsp; • &nbsp; {post.musicTrack || 'Original Audio'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;