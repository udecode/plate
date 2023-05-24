'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeProvider } from './ThemeProvider';

import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DndProvider backend={HTML5Backend}>
        <TooltipProvider
          disableHoverableContent
          delayDuration={500}
          skipDelayDuration={0}
        >
          {children}
        </TooltipProvider>
      </DndProvider>
    </ThemeProvider>
  );
}
