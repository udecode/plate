'use client';

import { Provider as JotaiProvider } from 'jotai';

import { TooltipProvider } from '@/registry/default/plate-ui/tooltip';

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
        <TooltipProvider
          delayDuration={0}
          skipDelayDuration={0}
          disableHoverableContent
        >
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </JotaiProvider>
  );
}
