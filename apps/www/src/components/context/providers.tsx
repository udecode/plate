'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Provider as JotaiProvider } from 'jotai';

import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        enableSystem
      >
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      </ThemeProvider>
    </JotaiProvider>
  );
}
