'use client';

import { Provider as JotaiProvider } from 'jotai';

import { TooltipProvider } from '@/components/ui/tooltip';

import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        enableColorScheme
        enableSystem
      >
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </ThemeProvider>
    </JotaiProvider>
  );
}
