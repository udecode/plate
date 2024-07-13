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
          disableHoverableContent
          skipDelayDuration={0}
        >
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </JotaiProvider>
  );
}
