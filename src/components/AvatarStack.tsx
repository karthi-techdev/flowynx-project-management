
import React, { useState } from 'react';

interface AvatarItem {
  url: string;
  name: string;
}

interface AvatarStackProps {
  items: AvatarItem[];
  size?: 'sm' | 'md';
  limit?: number;
  activeAvatars?: string[];
  onAvatarClick?: (url: string) => void;
  renderBadge?: (count: number) => React.ReactNode;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({ 
  items, 
  size = 'md', 
  limit = 5,
  activeAvatars = [],
  onAvatarClick,
  renderBadge
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sizeClass = size === 'sm' ? 'w-6 h-6' : 'w-9 h-9';
  const visibleItems = items.slice(0, limit);
  const remainingCount = items.length - limit;

  return (
    <div className="flex -space-x-2 items-center">
      {visibleItems.map((item, i) => {
        const isActive = activeAvatars.includes(item.url);
        const isUnassigned = item.url.includes('initials/svg?seed=U');
        const isHovered = hoveredIndex === i;
        
        return (
          <div key={i} className="relative group">
            {/* Tooltip - positioned strictly at the bottom */}
            {isHovered && !isActive && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-gray-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap shadow-2xl pointer-events-none z-[60] animate-in fade-in slide-in-from-top-1 duration-200">
                {item.name}
                {/* Arrow at the top of the bubble pointing up to the trigger */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-gray-900" />
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAvatarClick?.(item.url);
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                relative transition-all duration-200 
                hover:z-30 hover:-translate-y-0.5
                ${isActive ? 'z-20' : 'z-0'} 
                focus:outline-none
              `}
            >
              {isUnassigned ? (
                <div className={`
                  ${sizeClass} rounded-full border-2 bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-300 transition-all 
                  ${isActive ? 'border-brand-500 ring-2 ring-brand-100 shadow-sm scale-105' : 'border-white shadow-sm'}
                `}>
                  U
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.name}
                  className={`
                    ${sizeClass} rounded-full border-2 object-cover transition-all 
                    ${isActive ? 'border-brand-500 ring-2 ring-brand-100 shadow-sm scale-105' : 'border-white shadow-sm group-hover:border-white/50'}
                  `}
                />
              )}
            </button>
          </div>
        );
      })}
      
      {remainingCount > 0 && renderBadge && (
        <div className="relative z-0 pl-1">
          {renderBadge(remainingCount)}
        </div>
      )}
      
      {remainingCount > 0 && !renderBadge && (
        <div className={`${sizeClass} rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 z-0 shadow-sm`}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
