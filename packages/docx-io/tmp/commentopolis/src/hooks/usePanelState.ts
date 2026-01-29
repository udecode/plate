import { useState, useCallback, useEffect } from 'react';
import type { PanelState, PanelStateManager } from '../types';

/**
 * Custom hook for managing three-panel layout state
 * Handles responsive behavior and state transitions
 */
export const usePanelState = (): PanelStateManager => {
  // Default to normal state for desktop
  const [leftPanel, setLeftPanel] = useState<PanelState>('normal');
  const [rightPanel, setRightPanel] = useState<PanelState>('normal');

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Mobile (< 768px): both panels minimized
      if (width < 768) {
        setLeftPanel('minimized');
        setRightPanel('minimized');
      }
      // Tablet (768px - 1023px): panels minimized by default
      else if (width < 1024) {
        if (leftPanel === 'focused' || rightPanel === 'focused') {
          // Keep one panel focused but minimize the other
          if (leftPanel === 'focused') {
            setRightPanel('minimized');
          } else if (rightPanel === 'focused') {
            setLeftPanel('minimized');
          }
        } else {
          setLeftPanel('minimized');
          setRightPanel('minimized');
        }
      }
      // Desktop (>= 1024px): both panels normal by default
      else {
        if (leftPanel === 'minimized' && rightPanel === 'minimized') {
          setLeftPanel('normal');
          setRightPanel('normal');
        }
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [leftPanel, rightPanel]);

  // Toggle functions for cycling through states
  const toggleLeftPanel = useCallback(() => {
    setLeftPanel(prev => {
      const states: PanelState[] = ['minimized', 'normal', 'focused'];
      const currentIndex = states.indexOf(prev);
      return states[(currentIndex + 1) % states.length];
    });
  }, []);

  const toggleRightPanel = useCallback(() => {
    setRightPanel(prev => {
      const states: PanelState[] = ['minimized', 'normal', 'focused'];
      const currentIndex = states.indexOf(prev);
      return states[(currentIndex + 1) % states.length];
    });
  }, []);

  return {
    leftPanel,
    rightPanel,
    setLeftPanel,
    setRightPanel,
    toggleLeftPanel,
    toggleRightPanel,
  };
};