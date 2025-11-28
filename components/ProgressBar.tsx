import React from 'react';

interface ProgressBarProps {
  current: number;
  limit: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, limit }) => {
  const percentage = Math.min((current / limit) * 100, 100);
  
  let colorClass = "bg-green-500";
  if (percentage >= 50) colorClass = "bg-yellow-500";
  if (percentage >= 80) colorClass = "bg-orange-500";
  if (percentage >= 100) colorClass = "bg-red-600";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
      <div className="flex justify-between items-center mb-1 text-white text-xs font-bold uppercase tracking-wider">
        <span className="drop-shadow-md">Daily Scroll Budget</span>
        <span className="drop-shadow-md">{current} / {limit}</span>
      </div>
      <div className="w-full h-2 bg-gray-700/50 rounded-full backdrop-blur-sm overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;