import React, { type ReactNode } from 'react';
import type { PanelState } from '../types';

interface PanelProps {
  state: PanelState;
  position: 'left' | 'right' | 'center';
  children: ReactNode;
  onToggle?: () => void;
}

/**
 * Base Panel component with responsive width management
 */
export const Panel: React.FC<PanelProps> = ({ state, position, children, onToggle }) => {
  // Get width classes based on state and position
  const getWidthClass = () => {
    if (position === 'center') {
      return 'flex-1 min-w-[300px]'; // Center panel takes remaining space with min width
    }

    switch (state) {
      case 'minimized':
        return 'w-16 md:w-16'; // 60px equivalent
      case 'normal':
        return 'w-80 md:w-96'; // 320-384px equivalent
      case 'focused':
        return 'w-[500px] md:w-[600px]'; // 500-600px equivalent
      default:
        return 'w-80';
    }
  };

  // Get background classes based on position
  const getBgClass = () => {
    switch (position) {
      case 'left':
        return 'bg-gray-100 border-r border-gray-200';
      case 'right':
        return 'bg-gray-100 border-l border-gray-200';
      case 'center':
        return 'bg-white';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div
      className={`
        ${getWidthClass()}
        ${getBgClass()}
        h-screen
        flex flex-col
        transition-all duration-300 ease-in-out
        overflow-hidden
      `}
    >
      {/* Toggle button for side panels */}
      {position !== 'center' && onToggle && (
        <div className="p-2 border-b border-gray-200">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded hover:bg-gray-200 transition-colors"
            title={`Toggle ${position} panel`}
          >
            <span className="text-lg">
              {position === 'left' ? '☰' : '⚙'}
            </span>
          </button>
        </div>
      )}
      
      {/* Panel content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};